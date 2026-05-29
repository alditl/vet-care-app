import { useState } from "react";
import { useNavigate } from "react-router";
import { Bell, ChevronLeft, Check, Clock, AlertCircle } from "lucide-react";

interface Notification {
  id: number;
  type: "reminder" | "alert" | "info";
  title: string;
  message: string;
  petName: string;
  date: string;
  time: string;
  read: boolean;
}

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: "reminder",
      title: "Desparasitación pendiente",
      message: "Es momento de desparasitar a tu mascota",
      petName: "Max",
      date: "17 May",
      time: "09:00",
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "Turno confirmado",
      message: "Tu turno para control de rutina está confirmado",
      petName: "Max",
      date: "15 May",
      time: "14:30",
      read: true,
    },
    {
      id: 3,
      type: "alert",
      title: "Recordatorio de vacunas",
      message: "La vacuna antirrábica vence en 2 meses",
      petName: "Max",
      date: "10 May",
      time: "10:00",
      read: true,
    },
  ]);

  

  const getIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Clock className="w-5 h-5" />;
      case "alert":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string, read: boolean) => {
    if (read) return "text-muted-foreground bg-secondary";
    switch (type) {
      case "reminder":
        return "text-amber-600 bg-amber-100";
      case "alert":
        return "text-red-600 bg-red-100";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-8">
      <div className="bg-primary text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Notificaciones</h1>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tienes notificaciones</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-2xl p-4 border ${
                notif.read
                  ? "bg-white border-border"
                  : "bg-[#f5efe6] border-primary/30 shadow-md"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(
                    notif.type,
                    notif.read
                  )}`}
                >
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-foreground font-medium">{notif.title}</h3>
                    {notif.read && (
                      <Check className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary font-medium">
                      {notif.petName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {notif.date} • {notif.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}