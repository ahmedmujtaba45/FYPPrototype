import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { NotificationItem } from "@/components/feature/NotificationPanel";
import { typeConfig } from "@/components/feature/NotificationPanel";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "manager" | "hr" | "employee" | "admin";
  userName: string;
  userAvatar: string;
  userRole: string;
  userAge?: number;
  userEmail?: string;
  userDepartment?: string;
  activeItem?: string;
  onItemClick?: (label: string) => void;
  notifications?: NotificationItem[];
}

const navItems: Record<string, { label: string; path: string; icon: string }[]> = {
  manager: [
    { label: "Dashboard", path: "/manager", icon: "ri-dashboard-line" },
    { label: "Team Members", path: "/manager", icon: "ri-team-line" },
    { label: "KPI Evaluation", path: "/manager", icon: "ri-bar-chart-box-line" },
    { label: "Reports", path: "/reports", icon: "ri-file-chart-line" },
    { label: "Surveys", path: "/manager", icon: "ri-survey-line" },
  ],
  hr: [
    { label: "Employees", path: "/hr", icon: "ri-user-search-line" },
    { label: "Manage Employees", path: "/hr", icon: "ri-user-add-line" },
    { label: "Scoring", path: "/hr", icon: "ri-star-line" },
    { label: "Reports", path: "/hr", icon: "ri-file-chart-line" },
    { label: "Announcements", path: "/hr", icon: "ri-megaphone-line" },
    { label: "Surveys", path: "/hr", icon: "ri-survey-line" },
  ],
  employee: [
    { label: "Overview", path: "/employee", icon: "ri-dashboard-line" },
    { label: "Performance History", path: "/employee", icon: "ri-history-line" },
    { label: "AI Feedback", path: "/employee", icon: "ri-sparkling-line" },
    { label: "Announcements", path: "/employee", icon: "ri-megaphone-line" },
    { label: "Surveys", path: "/employee", icon: "ri-survey-line" },
  ],
  admin: [
    { label: "Overview", path: "/admin", icon: "ri-dashboard-line" },
    { label: "User Management", path: "/admin", icon: "ri-user-settings-line" },
    { label: "KPI Configuration", path: "/admin", icon: "ri-bar-chart-grouped-line" },
    { label: "AI Analytics", path: "/admin", icon: "ri-sparkling-line" },
    { label: "Reports", path: "/admin", icon: "ri-file-chart-line" },
    { label: "System Settings", path: "/admin", icon: "ri-settings-3-line" },
  ],
};

export default function DashboardLayout({
  children,
  role,
  userName,
  userAvatar,
  userRole,
  userAge,
  userEmail,
  userDepartment,
  activeItem,
  onItemClick,
  notifications = [],
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    navigate("/login");
  };

  const items = navItems[role] || [];

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderNotificationDropdown = () => (
    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          <p className="text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <span className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-2">
              <i className="ri-notification-off-line text-lg"></i>
            </span>
            <p className="text-xs text-slate-500">No notifications at this time.</p>
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
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
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
                          setNotifOpen(false);
                          if (notif.actionPath) {
                            navigate(notif.actionPath);
                          }
                          notif.actionOnClick?.();
                        }}
                        className="text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
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
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200">
          <img
            src="https://public.readdy.ai/ai/img_res/44e3cbfc-e6bc-4576-b6f6-75f6ba16381b.png"
            alt="Company Logo"
            className="h-10 w-10 object-contain"
          />
          {sidebarOpen && (
            <span className="ml-3 font-semibold text-slate-800 text-sm whitespace-nowrap">
              EvaluAI
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {items.map((item) => {
            const isCurrentPath = item.path === location.pathname;
            const isActive = activeItem ? activeItem === item.label : isCurrentPath;
            if (isCurrentPath && onItemClick) {
              return (
                <button
                  key={item.label}
                  onClick={() => onItemClick(item.label)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    <i className={item.icon}></i>
                  </span>
                  {sidebarOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                </button>
              );
            }
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <i className={item.icon}></i>
                </span>
                {sidebarOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-20 -right-3 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-slate-700 transition-colors"
        >
          <i className={sidebarOpen ? "ri-arrow-left-s-line" : "ri-arrow-right-s-line"}></i>
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-14 flex items-center px-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-8 h-8 flex items-center justify-center text-slate-600"
        >
          <i className="ri-menu-line text-lg"></i>
        </button>
        <img
          src="https://public.readdy.ai/ai/img_res/44e3cbfc-e6bc-4576-b6f6-75f6ba16381b.png"
          alt="Company Logo"
          className="h-8 w-8 object-contain ml-3"
        />
        <span className="ml-2 font-semibold text-slate-800 text-sm">EvaluAI</span>
        <div className="ml-auto flex items-center gap-2">
          {/* Mobile Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <i className="ri-notification-3-line text-lg"></i>
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="fixed left-2 right-2 top-14 max-w-md mx-auto">
                {renderNotificationDropdown()}
              </div>
            )}
          </div>
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500">{userRole}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 text-left"
                  >
                    <span className="w-4 h-4 flex items-center justify-center"><i className="ri-user-line"></i></span>
                    My Profile
                  </button>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                  >
                    <span className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-r-line"></i></span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="h-14 flex items-center px-4 border-b border-slate-200">
              <img
                src="https://public.readdy.ai/ai/img_res/44e3cbfc-e6bc-4576-b6f6-75f6ba16381b.png"
                alt="Company Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="ml-3 font-semibold text-slate-800 text-sm">EvaluAI</span>
            </div>
            <nav className="py-4 px-3 space-y-1">
              {items.map((item) => {
                const isCurrentPath = item.path === location.pathname;
                const isActive = activeItem ? activeItem === item.label : isCurrentPath;
                if (isCurrentPath && onItemClick) {
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        onItemClick(item.label);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-slate-800 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center">
                        <i className={item.icon}></i>
                      </span>
                      <span className="ml-3">{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center">
                      <i className={item.icon}></i>
                    </span>
                    <span className="ml-3">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Top Bar with Profile + Notification Dropdowns */}
        <div className="hidden lg:flex sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-6 py-3 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="capitalize font-medium text-slate-700">{role.replace("hr", "HR")} Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="relative w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <i className="ri-notification-3-line text-lg"></i>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && renderNotificationDropdown()}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-slate-700">{userName}</span>
                <span className="w-4 h-4 flex items-center justify-center text-slate-400">
                  <i className={profileOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
                </span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500">{userRole}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 text-left"
                    >
                      <span className="w-4 h-4 flex items-center justify-center"><i className="ri-user-line"></i></span>
                      My Profile
                    </button>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <span className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-r-line"></i></span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lg:pt-0 pt-14">
          {children}
        </div>
      </main>

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                  <i className="ri-user-line"></i>
                </span>
                <h3 className="text-sm font-semibold text-slate-900">My Profile</h3>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{userName}</h4>
                  <p className="text-xs text-slate-500">{userRole}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Age</p>
                    <p className="text-sm font-medium text-slate-900">{userAge ?? "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Role</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">{role.replace("hr", "HR")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Department</p>
                    <p className="text-sm font-medium text-slate-900">{userDepartment ?? "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Job Title</p>
                    <p className="text-sm font-medium text-slate-900">{userRole}</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-900">{userEmail ?? "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
