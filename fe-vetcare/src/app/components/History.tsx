import { ChevronLeft, Calendar, FileText, Dog } from "lucide-react";
import { useNavigate } from "react-router";

export default function History() {
  const navigate = useNavigate();

  const history = [
    {
      id: 1,
      date: "15 Abr 2026",
      location: "Vet Care Recoleta",
      reason: "Control de rutina",
      pet: "Max",
      notes: "Peso: 28kg. Estado general: excelente. Próxima vacuna: septiembre.",
    },
    {
      id: 2,
      date: "02 Mar 2026",
      location: "Veterinaria Palermo",
      reason: "Vacunación antirrábica",
      pet: "Max",
      notes: "Aplicación de vacuna antirrábica. Próxima dosis en 1 año.",
    },
    {
      id: 3,
      date: "18 Ene 2026",
      location: "Clínica Veterinaria Belgrano",
      reason: "Consulta general",
      pet: "Max",
      notes: "Revisión de piel y pelaje. Todo en orden.",
    },
  ];

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
        {history.map((item) => (
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

            <div className="bg-secondary rounded-2xl p-3 flex items-start gap-2">
              <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{item.notes}</p>
            </div>

            <button className="w-full mt-3 text-primary text-sm hover:underline">
              Ver detalles completos
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
