import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, MapPin, User, Stethoscope, Bell } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/home", icon: Home, label: "Inicio" },
    { path: "/home/map", icon: MapPin, label: "Mapa" },
    { path: "/home/profile", icon: User, label: "Perfil" },
  ];

  const isGuardActive = location.pathname === "/home/guard";
  const isNotifActive = location.pathname === "/home/notifications";

  const unreadCount = 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-auto pb-20">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
          {navItems.slice(0, 2).map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors"
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => navigate("/home/guard")}
            className={`relative -top-3 flex flex-col items-center justify-center gap-0.5 px-2 rounded-2xl transition-all ${
              isGuardActive
                ? "bg-red-100 shadow-md"
                : "bg-[#fff5f5] shadow-md hover:bg-red-50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isGuardActive ? "bg-red-200" : "bg-[#fecaca]"
              }`}
            >
              <Stethoscope
                className={`w-5 h-5 ${
                  isGuardActive ? "text-red-600" : "text-[#dc2626]"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${
                isGuardActive ? "text-red-600" : "text-[#dc2626]"
              }`}
            >
              Guardia
            </span>
          </button>

          {navItems.slice(2).map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors"
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => navigate("/home/notifications")}
            className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors"
          >
            <div className="relative">
              <Bell
                className={`w-5 h-5 ${
                  isNotifActive ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={isNotifActive ? 2.5 : 2}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <span
              className={`text-xs ${
                isNotifActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Notificaciones
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
