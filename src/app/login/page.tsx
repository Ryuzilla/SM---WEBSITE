import { BarChart3, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured } from "@/lib/env";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const demoMode = !isSupabaseConfigured;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* ── Brand / value panel ── */}
      <div className="login-hero relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        {/* Ambient navy glow */}
        <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/25 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />

        <div className="relative flex items-center gap-2.5">
          <div className="glow-primary flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            SM<span className="text-primary"> / </span>ANALYTICS
          </span>
        </div>

        <div className="relative max-w-lg space-y-7">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/70">
            Executive Sales Intelligence
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
            Every sale, customer and target — in one clear view.
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-white/55">
            Real-time KPIs, revenue forecasting, salesperson performance and
            one-click executive reporting in a single premium dashboard.
          </p>
          <div className="grid gap-3 pt-1">
            <Feature icon={<TrendingUp className="h-4 w-4" />} text="Revenue trends & forecasting" />
            <Feature icon={<Zap className="h-4 w-4" />} text="Instant Excel import & live updates" />
            <Feature icon={<ShieldCheck className="h-4 w-4" />} text="Role-based access control" />
          </div>
        </div>

        <p className="relative text-xs text-white/35">
          © {new Date().getFullYear()} SM Sales Analytics. All rights reserved.
        </p>
      </div>

      {/* ── Auth panel ── */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-in space-y-8">
          {/* Compact brand mark for mobile */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="glow-primary flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              SM<span className="text-primary"> / </span>ANALYTICS
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access your executive dashboard.
            </p>
            {demoMode && (
              <Badge variant="warning" className="w-fit">
                Demo mode — Supabase not configured
              </Badge>
            )}
          </div>

          <Card className="surface border-border/60">
            <CardContent className="p-6">
              <LoginForm redirectTo={redirect ?? "/dashboard"} demoMode={demoMode} />
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Protected by role-based access control.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/80">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary">
        {icon}
      </span>
      {text}
    </div>
  );
}
