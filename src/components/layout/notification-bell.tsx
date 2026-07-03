"use client";

import * as React from "react";
import { Bell, CheckCircle2, Trash2, XCircle } from "lucide-react";
import {
  useNotifications,
  type AppNotification,
} from "@/components/providers/notification-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function timeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_ICON: Record<AppNotification["type"], React.ElementType> = {
  upload_success: CheckCircle2,
  upload_error: XCircle,
  delete_success: Trash2,
  delete_error: XCircle,
};

const TYPE_TONE: Record<AppNotification["type"], string> = {
  upload_success: "text-emerald-500",
  upload_error: "text-red-500",
  delete_success: "text-blue-400",
  delete_error: "text-red-500",
};

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = React.useState(false);

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (v && unreadCount > 0) {
      setTimeout(markAllRead, 350);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border bg-secondary/40 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">การแจ้งเตือน</p>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[380px] overflow-y-auto scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = TYPE_ICON[n.type];
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 border-b border-border/50 px-4 py-3 last:border-0 transition-colors",
                    !n.read && "bg-primary/5",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      TYPE_TONE[n.type],
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-snug">{n.title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                      {timeAgo(n.timestamp)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
