import { useState } from "react";

export interface NotificationItem {
  id: string;
  type: "deadline" | "alert" | "info" | "success" | "warning" | "ai";
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
  actionOnClick?: () => void;
  actionPath?: string;
}

interface NotificationPanelProps {
  title: string;
  iconClass: string;
  notifications: NotificationItem[];
  emptyMessage?: string;
}

export const typeConfig: Record<
  NotificationItem["type"],
  {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    icon: string;
    badgeText: string;
    badgeBg: string;
  }
> = {
  deadline: {
    bg: "bg-amber-50/70",
    border: "border-amber-100",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    icon: "ri-calendar-todo-line",
    badgeText: "text-amber-700",
    badgeBg: "bg-amber-100",
  },
  alert: {
    bg: "bg-red-50/70",
    border: "border-red-100",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    icon: "ri-alarm-warning-line",
    badgeText: "text-red-700",
    badgeBg: "bg-red-100",
  },
  info: {
    bg: "bg-sky-50/70",
    border: "border-sky-100",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    icon: "ri-information-line",
    badgeText: "text-sky-700",
    badgeBg: "bg-sky-100",
  },
  success: {
    bg: "bg-emerald-50/70",
    border: "border-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    icon: "ri-checkbox-circle-line",
    badgeText: "text-emerald-700",
    badgeBg: "bg-emerald-100",
  },
  warning: {
    bg: "bg-amber-50/70",
    border: "border-amber-100",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    icon: "ri-error-warning-line",
    badgeText: "text-amber-700",
    badgeBg: "bg-amber-100",
  },
  ai: {
    bg: "bg-violet-50/70",
    border: "border-violet-100",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    icon: "ri-sparkling-line",
    badgeText: "text-violet-700",
    badgeBg: "bg-violet-100",
  },
};

export default function NotificationPanel({
  title,
  iconClass,
  notifications: initialNotifications,
  emptyMessage = "No notifications at this time.",
}: NotificationPanelProps) {
  const [notifications] = useState(initialNotifications);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(true);

  const markRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
            <i className={iconClass}></i>
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <i className={expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <span className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-2">
                <i className="ri-notification-off-line text-lg"></i>
              </span>
              <p className="text-xs text-slate-500">{emptyMessage}</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const config = typeConfig[notif.type];
              const isUnread = !readIds.has(notif.id);
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                    isUnread ? config.bg + " hover:bg-opacity-100" : "hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-9 h-9 flex items-center justify-center ${config.iconBg} rounded-lg ${config.iconColor} flex-shrink-0`}
                  >
                    <i className={config.icon}></i>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 leading-snug">
                        {notif.title}
                        {isUnread && (
                          <span className="inline-block w-2 h-2 rounded-full bg-sky-500 ml-1.5 align-middle"></span>
                        )}
                      </p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${config.badgeBg} ${config.badgeText} whitespace-nowrap flex-shrink-0 capitalize`}>
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <i className="ri-time-line"></i>
                        {notif.timestamp}
                      </span>
                      {notif.actionLabel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notif.actionOnClick?.();
                          }}
                          className="text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                          {notif.actionLabel} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}