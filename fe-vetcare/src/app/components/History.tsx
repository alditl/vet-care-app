import { useState, useEffect } from "react";
import { ChevronLeft, Calendar, FileText, Dog, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

interface TurnoApi {
  id: number;
  mascota: number;
  mascota_nombre: string;
  veterinaria: number;
  veterinaria_nombre: string;
  fecha_hora: string;
  motivo: string;
}

interface Visit {
  id: number;
  date: string;
  location: string;
  reason: string;
  pet: string;
  notes: string;
}

function formatDate(iso: string): string {
  const dt = new Date(iso);
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${String(dt.getDate()).padStart(2, "0")} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

function turnoToVisit(t: TurnoApi): Visit {
  return {
    id: t.id,
    date: formatDate(t.fecha_hora),
    location: t.veterinaria_nombre,
    reason: t.motivo,
    pet: t.mascota_nombre,
    notes: "",
  };
}

export default function History() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/turnos/", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener turnos");
        return res.json();
      })
      .then((data: TurnoApi[]) => {
        const now = new Date();
        const past = data
          .filter((t) => new Date(t.fecha_hora) < now)
          .map(turnoToVisit)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setVisits(past);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="bg-primary text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <button onClick={() => navigate("/home")} className="mb-4">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl">Historial de visitas</h1>
        <p className="text-white/80 text-sm mt-1">
          Registro completo de atenciones
        </p>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay visitas registradas
          </div>
        ) : (
          visits.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-border rounded-3xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{item.date}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  <Dog className="w-4 h-4" />
                  <span>{item.pet}</span>
                </div>
              </div>

              <h3 className="text-foreground mb-2">{item.reason}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.location}</p>

              {item.notes && (
                <div className="bg-secondary rounded-2xl p-3 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{item.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
