import { useState, useEffect } from "react";
import { ChevronLeft, MapPin, Calendar as CalendarIcon, Clock, CheckCircle, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { getCsrfToken } from "@/app/lib/csrf";

interface PetApi {
  id: number;
  nombre: string;
  especie: string;
}

interface VetApi {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

interface DateOption {
  day: string;
  date: string;
  month: string;
  iso: string;
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const REASONS = ["Consulta general", "Vacunación", "Control de rutina", "Emergencia"];
const TIMES = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30", "20:00"];

function generateDates(daysAhead = 7): DateOption[] {
  const result: DateOption[] = [];
  const today = new Date();
  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      day: DAYS[d.getDay()],
      date: String(d.getDate()),
      month: MONTHS[d.getMonth()],
      iso: d.toISOString().slice(0, 10),
    });
  }
  return result;
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const statePetId = (location.state as any)?.petId;
  const statePetName = (location.state as any)?.petName;

  const [step, setStep] = useState(1);
  const [pets, setPets] = useState<PetApi[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetApi | null>(
    statePetId && statePetName ? { id: statePetId, nombre: statePetName, especie: "" } : null
  );
  const [selectedVetId, setSelectedVetId] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedDate, setSelectedDate] = useState<DateOption | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [vets, setVets] = useState<VetApi[]>([]);
  const [loadingVets, setLoadingVets] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dates = generateDates();

  useEffect(() => {
    fetch("/api/mascotas/", { credentials: "include" })
      .then((res) => { if (!res.ok) throw new Error("Error al cargar mascotas"); return res.json(); })
      .then((data: any[]) => setPets(data.map((p: any) => ({ id: p.id, nombre: p.nombre, especie: p.especie }))))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch("/api/veterinarias/", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: VetApi[]) => {
        setVets(data);
        if (data.length === 0) setError("No hay veterinarias disponibles");
      })
      .catch((err) => {
        console.error("Error al cargar veterinarias:", err);
        setError("No se pudieron cargar las veterinarias");
      })
      .finally(() => setLoadingVets(false));
  }, []);

  const handleConfirm = async () => {
    if (!selectedPet || !selectedVetId || !selectedDate || !selectedTime || !selectedReason) {
      setError("Falta seleccionar mascota, veterinaria, fecha u horario");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const fecha_hora = `${selectedDate.iso}T${selectedTime}:00`;
      const res = await fetch("/api/turnos/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        credentials: "include",
        body: JSON.stringify({
          mascota: selectedPet.id,
          veterinaria: selectedVetId,
          fecha_hora,
          motivo: selectedReason,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || body.detail || "Error al crear el turno");
      }

      setStep(3);
      setTimeout(() => navigate("/home/appointments"), 2500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
              <span className="text-lg">🐾</span>
              Selecciona una mascota
            </label>
            <div className="relative">
              <select
                value={selectedPet?.id ?? ""}
                onChange={(e) => {
                  const pet = pets.find((p) => p.id === Number(e.target.value));
                  setSelectedPet(pet ?? null);
                }}
                className="w-full p-4 pr-12 rounded-2xl border-2 border-border bg-white appearance-none focus:outline-none focus:border-primary"
              >
                <option value="">Seleccionar...</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.nombre} ({pet.especie})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-foreground mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              Selecciona una veterinaria
            </label>
            <div className="relative">
              <select
                value={selectedVetId ?? ""}
                onChange={(e) => setSelectedVetId(Number(e.target.value))}
                className="w-full p-4 pr-12 rounded-2xl border-2 border-border bg-white appearance-none focus:outline-none focus:border-primary"
              >
                <option value="">Seleccionar...</option>
                {vets.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>

            {loadingVets && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando veterinarias...
              </p>
            )}

            {!loadingVets && vets.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                {error || "No hay veterinarias disponibles. Agregá algunas desde el panel admin."}
              </p>
            )}

            {selectedVetId && (
              <div className="mt-3 bg-secondary rounded-2xl p-4">
                {vets
                  .filter((v) => v.id === selectedVetId)
                  .map((vet) => (
                    <div key={vet.id} className="space-y-1">
                      <span className="text-sm text-muted-foreground">{vet.direccion}</span>
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
              {REASONS.map((reason) => (
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
            disabled={!selectedPet || !selectedVetId || !selectedReason}
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
                  key={d.iso}
                  onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 w-20 p-3 rounded-2xl border-2 transition-all ${
                    selectedDate?.iso === d.iso
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
              {TIMES.map((time) => (
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || loading}
            className="w-full bg-primary text-white py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Reservando..." : "Confirmar turno"}
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
              <span className="text-muted-foreground">Mascota:</span>
              <span className="text-foreground">{selectedPet?.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Veterinaria:</span>
              <span className="text-foreground">{vets.find((v) => v.id === selectedVetId)?.nombre ?? ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Motivo:</span>
              <span className="text-foreground">{selectedReason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="text-foreground">{selectedDate ? `${selectedDate.day} ${selectedDate.date} ${selectedDate.month}` : ""}</span>
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
