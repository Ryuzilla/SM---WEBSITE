import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile, canManageData } from "@/lib/auth";
import { useSampleData } from "@/lib/env";
import { invalidateSalesCache } from "@/lib/data";
import type { SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
// Allow the batched loop room to run before the platform kills the function.
export const maxDuration = 60;

// Columns that may be used as a delete filter (allowlist guards against
// arbitrary column injection from the request body).
const FILTERABLE_COLUMNS = new Set([
  "salesperson",
  "customer_name",
  "company_name",
  "category",
  "product_code",
  "product_name",
  "province",
  "invoice_no",
]);

interface DeleteFilter {
  dateFrom: string | null;
  dateTo: string | null;
  column: string | null;
  value: string | null;
}

/** Select up to `limit` ids of rows matching the filter (no filter = any row). */
async function selectMatchingIds(
  supabase: SupabaseClient,
  f: DeleteFilter,
  limit: number,
): Promise<string[]> {
  let q = supabase.from("sales").select("id").limit(limit);
  if (f.dateFrom) q = q.gte("date", f.dateFrom);
  if (f.dateTo) q = q.lte("date", f.dateTo);
  if (f.column && f.value) q = q.eq(f.column, f.value);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => (r as { id: string }).id);
}

/**
 * DELETE /api/sales/delete
 * Body (optional): { ids?, dateFrom?, dateTo?, column?, value?, deleteAll? }
 * - ids[]              → delete exactly those rows (from the browse table)
 * - No filters         → delete ALL rows (requires deleteAll:true)
 * - dateFrom / dateTo  → restrict to an inclusive date range
 * - column + value     → restrict to rows where <column> = <value>
 *
 * Large deletes run in id-keyed batches so a single statement never scans the
 * whole table and times out. The response carries `done`: when false, the
 * client should call again to continue where this request left off.
 * Admin only.
 */
export async function DELETE(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageData(profile.role))
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  if (useSampleData)
    return NextResponse.json({ deleted: true, count: 0, done: true, demo: true });

  const body = await request.json().catch(() => ({}));
  const ids: string[] | null = Array.isArray(body.ids) ? body.ids : null;
  const filter: DeleteFilter = {
    dateFrom: body.dateFrom ?? null,
    dateTo: body.dateTo ?? null,
    column: body.column ?? null,
    value: body.value ?? null,
  };

  const supabase = createAdminClient();

  // Delete specific rows selected in the browse table (already a small set).
  if (ids && ids.length > 0) {
    const { error } = await supabase.from("sales").delete().in("id", ids);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    invalidateSalesCache();
    return NextResponse.json({ deleted: true, count: ids.length, done: true });
  }

  if (filter.column && !FILTERABLE_COLUMNS.has(filter.column))
    return NextResponse.json(
      { error: `Invalid column: ${filter.column}` },
      { status: 400 },
    );

  const hasFilter = Boolean(
    filter.dateFrom || filter.dateTo || (filter.column && filter.value),
  );

  // Safety net: a full wipe must be explicitly requested with deleteAll:true,
  // so an empty/partial body can never accidentally clear the whole table.
  if (!hasFilter && body.deleteAll !== true)
    return NextResponse.json(
      { error: "ต้องระบุเงื่อนไข หรือส่ง deleteAll:true เพื่อยืนยันการลบทั้งหมด" },
      { status: 400 },
    );

  // Delete in id-keyed batches. Each DELETE hits the primary-key index and
  // stays well under the statement timeout. Stop before the function deadline
  // and report `done: false` so the client can resume.
  const BATCH = 1000;
  const deadline = Date.now() + 45_000;
  let count = 0;
  let done = false;

  try {
    while (true) {
      const batchIds = await selectMatchingIds(supabase, filter, BATCH);
      if (batchIds.length === 0) {
        done = true;
        break;
      }
      const { error } = await supabase.from("sales").delete().in("id", batchIds);
      if (error)
        return NextResponse.json(
          { error: error.message, count },
          { status: 500 },
        );
      count += batchIds.length;

      if (batchIds.length < BATCH) {
        done = true;
        break;
      }
      if (Date.now() > deadline) {
        done = false; // more may remain — client should call again
        break;
      }
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed", count },
      { status: 500 },
    );
  }

  invalidateSalesCache();
  return NextResponse.json({ deleted: true, count, done });
}
