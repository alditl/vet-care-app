import { useState } from "react";
import { Star, TrendingUp, Users, MessageSquare, Calendar, ChevronLeft, Plus, X, Clock, Stethoscope, PawPrint } from "lucide-react";
import { useNavigate } from "react-router";

interface Appointment {
  id: number;
  petName: string;
  ownerName: string;
  service: string;
  vetName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed";
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export default function VetDashboard() {
  const navigate = useNavigate();

  const vetInfo = {
    name: "Veterinaria Palermo",
    rating: 4.5,
    totalReviews: 2,
  };

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, petName: "Max", ownerName: "María González", service: "Consulta general", vetName: "Dra. Ana López", date: "2026-05-19", time: "09:00", status: "pending" },
    { id: 2, petName: "Luna", ownerName: "Carlos Rodríguez", service: "Vacunación", vetName: "Dra. Ana López", date: "2026-05-19", time: "10:30", status: "pending" },
    { id: 3, petName: "Buddy", ownerName: "Sofia Martinez", service: "Control de rutina", vetName: "Dr. Pedro Gómez", date: "2026-05-20", time: "14:00", status: "pending" },
    { id: 4, petName: "Milo", ownerName: "Javier Torres", service: "Odontología", vetName: "Dra. Ana López", date: "2026-05-20", time: "16:30", status: "pending" },
  ]);

  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    petName: "",
    ownerName: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      userName: "María González",
      rating: 5,
      comment: "Excelente atención, el Dr. fue muy amable con mi perro Max. Instalaciones limpias y modernas.",
      date: "2026-04-15",
      helpful: 12,
    },
    {
      id: 2,
      userName: "Carlos Rodríguez",
      rating: 4,
      comment: "Muy buena atención, aunque tuve que esperar un poco. El diagnóstico fue certero.",
      date: "2026-04-10",
      helpful: 8,
    },
  ]);

  const pendingCount = appointments.filter(a => a.status === "pending").length;

  const handleAddAppointment = () => {
    if (newAppointment.petName && newAppointment.ownerName && newAppointment.service && newAppointment.date && newAppointment.time) {
      const appointment: Appointment = {
        id: appointments.length + 1,
        petName: newAppointment.petName,
        ownerName: newAppointment.ownerName,
        service: newAppointment.service,
        vetName: "Dra. Ana López",
        date: newAppointment.date,
        time: newAppointment.time,
        status: "pending",
      };
      setAppointments([...appointments, appointment]);
      setNewAppointment({ petName: "", ownerName: "", service: "", date: "", time: "", notes: "" });
      setShowAddAppointmentModal(false);
    }
  };

  const services = [
    "Consulta general",
    "Vacunación",
    "Cirugía",
    "Emergencia",
    "Control de rutina",
    "Odontología",
    "Análisis clínicos",
    "Nutrición",
  ];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const ratingDistribution = [
    { stars: 5, count: 1 },
    { stars: 4, count: 1 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ];

  const renderStars = (rating: number, size: string = "w-5 h-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-8">
      <div className="bg-primary text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <button onClick={() => navigate("/home")} className="mb-4 flex items-center gap-2 text-white/80 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>
        <h1 className="text-xl mb-2">{vetInfo.name}</h1>
        <p className="text-white/80 text-sm">Panel de administración</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white border-2 border-primary/30 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg text-foreground font-semibold">Turnos pendientes</h2>
                <p className="text-sm text-muted-foreground">{pendingCount} turno{pendingCount !== 1 ? 's' : ''} espera{pendingCount !== 1 ? 'n' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddAppointmentModal(true)}
              className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Agregar turno</span>
            </button>
          </div>

          <div className="space-y-3">
            {appointments.filter(a => a.status === "pending").map((appointment) => (
              <div key={appointment.id} className="bg-secondary rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-medium">{appointment.petName}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{appointment.service}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Dueño: {appointment.ownerName}</p>
                  <p className="text-sm text-muted-foreground">Veterinari@: {appointment.vetName}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-foreground font-medium">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {appointment.time}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(appointment.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Star className="w-5 h-5" />
              <span className="text-sm">Calificación</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{vetInfo.rating}</div>
            <div className="text-sm text-muted-foreground">de 5.0</div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">Reseñas</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{vetInfo.totalReviews}</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+2 este mes</span>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Visitas</span>
            </div>
            <div className="text-3xl font-bold text-foreground">48</div>
            <div className="text-sm text-muted-foreground">este mes</div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6">
          <h2 className="text-lg text-foreground mb-4">Distribución de calificaciones</h2>
          <div className="space-y-3">
            {ratingDistribution.map((item) => {
              const percentage =
                vetInfo.totalReviews > 0 ? (item.count / vetInfo.totalReviews) * 100 : 0;
              return (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-12">{item.stars} ⭐</span>
                  <div className="flex-1 bg-secondary rounded-full h-3">
                    <div
                      className="bg-primary rounded-full h-3 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg text-foreground mb-4">Reseñas recientes</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-foreground font-medium">{review.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {renderStars(review.rating, "w-4 h-4")}
                </div>

                <p className="text-foreground mb-3">{review.comment}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {review.helpful} personas encontraron esto útil
                  </span>
                  <button className="text-primary hover:underline">
                    Responder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-accent border-2 border-primary/20 rounded-2xl p-6 text-center">
          <Star className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-foreground mb-2">¡Sigue brindando excelente servicio!</h3>
          <p className="text-sm text-muted-foreground">
            Las reseñas positivas ayudan a más usuarios a encontrarte y confiar en tu servicio.
          </p>
        </div>
      </div>

      {showAddAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-foreground">Agregar nuevo turno</h2>
              <button
                onClick={() => setShowAddAppointmentModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Mascota
                </label>
                <input
                  type="text"
                  value={newAppointment.petName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, petName: e.target.value })}
                  placeholder="Nombre de la mascota"
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Dueño
                </label>
                <input
                  type="text"
                  value={newAppointment.ownerName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, ownerName: e.target.value })}
                  placeholder="Nombre del dueño"
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Servicio
                </label>
                <select
                  value={newAppointment.service}
                  onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Hora
                  </label>
                  <select
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Selecciona</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  placeholder="Detalles adicionales..."
                  rows={3}
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddAppointmentModal(false)}
                  className="flex-1 bg-secondary text-foreground py-3 rounded-2xl hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddAppointment}
                  disabled={!newAppointment.petName || !newAppointment.ownerName || !newAppointment.service || !newAppointment.date || !newAppointment.time}
                  className="flex-1 bg-primary text-white py-3 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear turno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}