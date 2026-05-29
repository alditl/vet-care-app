import { useState } from "react";
import { Star, X, Send, ThumbsUp } from "lucide-react";

interface Review {
  id: number;
  vetId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface VetReviewsProps {
  vetId: number;
  vetName: string;
  onClose: () => void;
}

export default function VetReviews({ vetId, vetName, onClose }: VetReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      vetId: 1,
      userName: "María González",
      rating: 5,
      comment: "Excelente atención, el Dr. fue muy amable con mi perro Max. Instalaciones limpias y modernas.",
      date: "2026-04-15",
      helpful: 12,
    },
    {
      id: 2,
      vetId: 1,
      userName: "Carlos Rodríguez",
      rating: 4,
      comment: "Muy buena atención, aunque tuve que esperar un poco. El diagnóstico fue certero.",
      date: "2026-04-10",
      helpful: 8,
    },
    {
      id: 3,
      vetId: 2,
      userName: "Laura Fernández",
      rating: 5,
      comment: "Los veterinarios son muy profesionales. Mi gato se sintió cómodo durante toda la consulta.",
      date: "2026-04-12",
      helpful: 15,
    },
    {
      id: 4,
      vetId: 3,
      userName: "Juan Pérez",
      rating: 5,
      comment: "Servicio de emergencia 24hs impecable. Salvaron a mi mascota. Muy agradecido.",
      date: "2026-04-08",
      helpful: 20,
    },
  ]);

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });

  const [showForm, setShowForm] = useState(false);

  const vetReviews = reviews.filter((r) => r.vetId === vetId);
  const averageRating =
    vetReviews.length > 0
      ? vetReviews.reduce((acc, r) => acc + r.rating, 0) / vetReviews.length
      : 0;

  const handleSubmitReview = () => {
    if (newReview.rating === 0 || newReview.comment.trim() === "") {
      alert("Por favor completa la calificación y el comentario");
      return;
    }

    const review: Review = {
      id: reviews.length + 1,
      vetId: vetId,
      userName: "María González", // Usuario actual
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split("T")[0],
      helpful: 0,
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 0, comment: "" });
    setShowForm(false);
  };

  const renderStars = (rating: number, interactive: boolean = false, size: string = "w-5 h-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setNewReview({ ...newReview, rating: star })}
            disabled={!interactive}
            className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}
          >
            <Star
              className={`${size} ${
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    vetReviews.forEach((review) => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse();
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-primary text-white p-6 rounded-t-3xl sm:rounded-t-3xl z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Reseñas - {vetName}</h2>
            <button onClick={onClose} className="text-white hover:opacity-80">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(averageRating), false, "w-4 h-4")}
              <div className="text-sm text-white/80 mt-1">
                {vetReviews.length} {vetReviews.length === 1 ? "reseña" : "reseñas"}
              </div>
            </div>

            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((stars, idx) => (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-12">{stars} ⭐</span>
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2"
                      style={{
                        width: `${
                          vetReviews.length > 0
                            ? (ratingDistribution[idx] / vetReviews.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right">{ratingDistribution[idx]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-primary text-white py-3 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              Escribir una reseña
            </button>
          ) : (
            <div className="bg-secondary rounded-3xl p-6">
              <h3 className="text-foreground mb-4">Tu reseña</h3>

              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-2">
                  Calificación
                </label>
                {renderStars(newReview.rating, true, "w-8 h-8")}
              </div>

              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-2">
                  Cuéntanos tu experiencia
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  placeholder="Comparte detalles sobre la atención recibida, el trato al animal, las instalaciones..."
                  rows={5}
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setNewReview({ rating: 0, comment: "" });
                  }}
                  className="flex-1 bg-white border border-border text-foreground py-3 rounded-2xl hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 bg-primary text-white py-3 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Publicar
                </button>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-foreground mb-4">
              Todas las reseñas ({vetReviews.length})
            </h3>

            {vetReviews.length === 0 ? (
              <div className="bg-secondary rounded-2xl p-8 text-center">
                <p className="text-muted-foreground">
                  Sé el primero en dejar una reseña
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {vetReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-border rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-foreground font-medium">
                          {review.userName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      {renderStars(review.rating, false, "w-4 h-4")}
                    </div>

                    <p className="text-foreground mb-3">{review.comment}</p>

                    <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      Útil ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
