import { useState, useEffect } from "react";
import { Calendar, ListChecks, Clock, Dog, Star, Building2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router";

interface Review {
  id: number;
  vetId: number;
  vetName: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface VeterinariaApi {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  horarios?: string;
  latitud: number | string;
  longitud: number | string;
}

const ALL_REVIEWS: Review[] = [
  { id: 1, vetId: 0, vetName: "", userName: "María González", rating: 5, comment: "Excelente atención, el Dr. fue muy amable con mi perro Max. Instalaciones limpias y modernas.", date: "2026-04-15", helpful: 12 },
  { id: 2, vetId: 0, vetName: "", userName: "Carlos Rodríguez", rating: 4, comment: "Muy buena atención, aunque tuve que esperar un poco. El diagnóstico fue certero.", date: "2026-04-10", helpful: 8 },
  { id: 3, vetId: 0, vetName: "", userName: "Laura Fernández", rating: 5, comment: "Los veterinarios son muy profesionales. Mi gato se sintió cómodo durante toda la consulta.", date: "2026-04-12", helpful: 15 },
  { id: 4, vetId: 0, vetName: "", userName: "Juan Pérez", rating: 5, comment: "Servicio de emergencia 24hs impecable. Salvaron a mi mascota. Muy agradecido.", date: "2026-04-08", helpful: 20 },
  { id: 5, vetId: 0, vetName: "", userName: "Ana Martínez", rating: 4, comment: "Buenos precios y atención personalizada. Volvería sin dudas.", date: "2026-03-28", helpful: 6 },
];

const MY_REVIEWS: Review[] = [
  { id: 10, vetId: 0, vetName: "", userName: "Tu", rating: 5, comment: "Excelente servicio y atención. Mi perro salió contento y bien cuidado. Recomiendo totalmente.", date: "2026-05-10", helpful: 3 },
  { id: 11, vetId: 0, vetName: "", userName: "Tu", rating: 4, comment: "Muy buena experiencia. El veterinario explicó todo claramente y el tratamiento funcionó perfecto.", date: "2026-04-20", helpful: 1 },
];

function renderStars(rating: number, size = "w-4 h-4") {
  return (
    <div className="flex gap-0.5">
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
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem("vetcare_userName") || "");
  const [vets, setVets] = useState<VeterinariaApi[]>([]);
  const [reviewTab, setReviewTab] = useState<"general" | "mis">("general");

  useEffect(() => {
    fetch("/api/veterinarias/")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setVets(Array.isArray(data) ? data : []))
      .catch(() => setVets([]));
  }, []);

  const vetReviews = ALL_REVIEWS.map((r, i) => ({
    ...r,
    vetName: vets[i % (vets.length || 1)]?.nombre || "Veterinaria",
  }));

  const myReviews = MY_REVIEWS.map((r, i) => ({
    ...r,
    vetName: vets[i % (vets.length || 1)]?.nombre || "Veterinaria",
  }));

  const menuItems = [
    {
      title: "Reserva de turnos",
      icon: Calendar,
      path: "/home/book",
      color: "bg-[#a78763]",
    },
    {
      title: "Mis turnos",
      icon: ListChecks,
      path: "/home/appointments",
      color: "bg-[#b89976]",
    },
    {
      title: "Mis mascotas",
      icon: Dog,
      path: "/home/pets",
      color: "bg-[#d4b895]",
    },
    {
      title: "Historial de visitas",
      icon: Clock,
      path: "/home/history",
      color: "bg-[#c9ab89]",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col p-6 space-y-8">
      <div className="flex items-center gap-4">
        <img
          src="/logo.jpg"
          alt="Vet Care"
          className="w-16 h-16 object-contain"
        />
        <div>
          <h1 className="text-2xl text-foreground mb-1">
            ¡Hola{userName ? `, ${userName}` : "!"}!
          </h1>
          <p className="text-muted-foreground">¿Qué necesitas hoy?</p>
        </div>
      </div>

      {/* Menú de Botones */}
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`${item.color} text-white rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg hover:scale-105 transition-transform active:scale-95`}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8" strokeWidth={2} />
              </div>
              <span className="text-center leading-tight">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Reseñas - cuadro de doble entrada */}
      <div className="bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="flex border-b border-border">
          <button
            onClick={() => setReviewTab("general")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              reviewTab === "general"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Reseñas de Veterinarias
          </button>
          <button
            onClick={() => setReviewTab("mis")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              reviewTab === "mis"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="w-4 h-4" />
            Mis Reseñas
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {reviewTab === "general" ? (
            vetReviews.length > 0 ? (
              vetReviews.map((review) => (
                <div key={review.id} className="bg-secondary/50 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-primary">{review.vetName}</p>
                      <p className="text-xs text-muted-foreground">{review.userName}</p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-foreground mb-2">{review.comment}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(review.date).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}</span>
                    <span>{review.helpful} personas encontraron útil</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hay reseñas disponibles.</p>
            )
          ) : (
            myReviews.length > 0 ? (
              myReviews.map((review) => (
                <div key={review.id} className="bg-secondary/50 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-primary">{review.vetName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-foreground">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Todavía no escribiste reseñas.</p>
            )
          )}
        </div>
      </div>

    </div>
  );
}