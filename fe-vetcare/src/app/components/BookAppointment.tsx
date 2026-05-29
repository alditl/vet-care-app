import { useState } from "react";
import { ChevronLeft, MapPin, Calendar as CalendarIcon, Clock, CheckCircle, Star, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";

interface VetLocation {
  name: string;
  rating: number;
  reviews: number;
  address: string;
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const locations: VetLocation[] = [
    { name: "Veterinaria Palermo", rating: 4.8, reviews: 124, address: "Av. Santa Fe 3950" },
    { name: "Clínica Veterinaria Belgrano", rating: 4.6, reviews: 89, address: "Av. Libertador 5200" },
    { name: "Vet Care Recoleta", rating: 4.9, reviews: 201, address: "Av. Las Heras 2102" },
    { name: "Veterinaria Animals", rating: 4.5, reviews: 67, address: "Av. Corrientes 3200" },
    { name: "Clínica Pet Wellness", rating: 4.7, reviews: 156, address: "Av. Palermo 1500" },
    { name: "Vet Express Caballito", rating: 4.4, reviews: 42, address: "Av. Rivadavia 4500" },
    { name: "Centro Veterinario Núñez", rating: 4.8, reviews: 183, address: "Av. Monroe 2800" },
    { name: "Pet Care Villa Urquiza", rating: 4.3, reviews: 31, address: "Av. prac. 5800" },
  ];

  const reasons = [
    "Consulta general",
    "Vacunación",
    "Control de rutina",
    "Emergencia",
  ];

  const dates = [
    { day: "Lun", date: "21", month: "Abr" },
    { day: "Mar", date: "22", month: "Abr" },
    { day: "Mié", date: "23", month: "Abr" },
    { day: "Jue", date: "24", month: "Abr" },
    { day: "Vie", date: "25", month: "Abr" },
  ];

  const times = [
    "09:00",
    "10:30",
    "12:00",
    "14:00",
    "15:30",
    "17:00",
    "18:30",
    "20:00",
  ];

  const handleConfirm = () => {
    setStep(3);
    setTimeout(() => {
      navigate("/home/appointments");
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="bg-primary text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate("/home"))}
          className="mb-4"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl mb-2">Reserva de turno</h1>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full ${
                s <= step ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-foreground mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              Selecciona una veterinaria
            </label>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-4 pr-12 rounded-2xl border-2 border-border bg-white appearance-none focus:outline-none focus:border-primary"
              >
                <option value="">Seleccionar...</option>
                {locations.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>

            {selectedLocation && (
              <div className="mt-3 bg-secondary rounded-2xl p-4">
                {locations
                  .filter((loc) => loc.name === selectedLocation)
                  .map((loc) => (
                    <div key={loc.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{loc.address}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-foreground">{loc.rating}</span>
                          <span className="text-xs text-muted-foreground">({loc.reviews} reseñas)</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-foreground mb-3">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Motivo de la consulta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedReason === reason
                      ? "border-primary bg-secondary"
                      : "border-border bg-white"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!selectedLocation || !selectedReason}
            className="w-full bg-primary text-white py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-md"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-foreground mb-3">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Selecciona una fecha
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(`${d.day} ${d.date} ${d.month}`)}
                  className={`flex-shrink-0 w-20 p-3 rounded-2xl border-2 transition-all ${
                    selectedDate === `${d.day} ${d.date} ${d.month}`
                      ? "border-primary bg-secondary"
                      : "border-border bg-white"
                  }`}
                >
                  <div className="text-sm text-muted-foreground">{d.day}</div>
                  <div className="text-xl text-foreground">{d.date}</div>
                  <div className="text-xs text-muted-foreground">{d.month}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-foreground mb-3">
              <Clock className="w-5 h-5 text-primary" />
              Selecciona un horario
            </label>
            <div className="grid grid-cols-3 gap-2">
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-2xl border-2 transition-all ${
                    selectedTime === time
                      ? "border-primary bg-secondary"
                      : "border-border bg-white"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-primary text-white py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-md"
          >
            Confirmar turno
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-16rem)]">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-xl text-foreground mb-2">¡Turno confirmado!</h2>
          <p className="text-muted-foreground text-center mb-6">
            Tu turno ha sido reservado exitosamente
          </p>
          <div className="bg-secondary rounded-2xl p-6 w-full max-w-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Veterinaria:</span>
              <span className="text-foreground">{selectedLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Motivo:</span>
              <span className="text-foreground">{selectedReason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="text-foreground">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora:</span>
              <span className="text-foreground">{selectedTime}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
