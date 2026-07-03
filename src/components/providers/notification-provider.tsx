"use client";

import * as React from "react";

export type NotificationType =
  | "upload_success"
  | "upload_error"
  | "delete_success"
  | "delete_error";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function addNotification(n: Omit<AppNotification, "id" | "timestamp" | "read">) {
    const next: AppNotification = {
      ...n,
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [next, ...prev].slice(0, 50));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]);
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAllRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
