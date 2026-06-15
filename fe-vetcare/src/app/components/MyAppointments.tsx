import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Calendar, MapPin, Clock, X, FileText, Upload, Paperclip, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { getCsrfToken } from "@/app/lib/csrf";

interface Study {
  id: number;
  name: string;
  date: string;
  fileUrl?: string;
  fileName?: string;
}

interface Appointment {
  id: number;
  location: string;
  reason: string;
  date: string;
  time: string;
  status: string;
  pet: string;
  notes: string;
  studies: Study[];
}

interface TurnoApi {
  id: number;
  mascota_nombre: string;
  veterinaria_nombre: string;
  fecha_hora: string;
  motivo: string;
}

function formatTurno(t: TurnoApi): Appointment {
  const dt = new Date(t.fecha_hora);
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const day = days[dt.getDay()];
  const date = dt.getDate();
  const month = months[dt.getMonth()];
  const hours = String(dt.getHours()).padStart(2, "0");
  const minutes = String(dt.getMinutes()).padStart(2, "0");
  return {
    id: t.id,
    location: t.veterinaria_nombre,
    reason: t.motivo,
    date: `${day} ${date} ${month}`,
    time: `${hours}:${minutes}`,
    status: dt > new Date() ? "Próximo" : "Realizado",
    pet: t.mascota_nombre,
    notes: "",
    studies: [],
  };
}

export default function MyAppointments() {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/turnos/", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener turnos");
        return res.json();
      })
      .then((data: TurnoApi[]) => setAppointments(data.map(formatTurno)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/turnos/${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": getCsrfToken() },
        credentials: "include",
      });
      if (res.ok || res.status === 204) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Error al cancelar turno:", err);
    }
  };

  const [editingNotes, setEditingNotes] = useState("");
  const [newStudyName, setNewStudyName] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDetails = (id: number) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      setSelectedAppointment(id);
      setEditingNotes(apt.notes);
    }
  };

  const handleSaveNotes = () => {
    if (selectedAppointment) {
      setAppointments(appointments.map(apt =>
        apt.id === selectedAppointment
          ? { ...apt, notes: editingNotes }
          : apt
      ));
    }
  };

  const handleAddStudy = () => {
    if (selectedAppointment && newStudyName.trim()) {
      setAppointments(appointments.map(apt =>
        apt.id === selectedAppointment
          ? {
              ...apt,
              studies: [
                ...apt.studies,
                {
                  id: apt.studies.length + 1,
                  name: newStudyName,
                  date: new Date().toLocaleDateString('es-AR'),
                }
              ]
            }
          : apt
      ));
      setNewStudyName("");
    }
  };

  const handleRemoveStudy = (studyId: number) => {
    if (selectedAppointment) {
      setAppointments(appointments.map(apt =>
        apt.id === selectedAppointment
          ? { ...apt, studies: apt.studies.filter(s => s.id !== studyId) }
          : apt
      ));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedAppointment) {
      setUploadingFile(true);
      const fileUrl = URL.createObjectURL(file);
      
      setTimeout(() => {
        setAppointments(appointments.map(apt =>
          apt.id === selectedAppointment
            ? {
                ...apt,
                studies: [
                  ...apt.studies,
                  {
                    id: apt.studies.length + 1,
                    name: newStudyName || file.name.replace(/\.[^/.]+$/, "") || "Estudio cargado",
                    date: new Date().toLocaleDateString('es-AR'),
                    fileUrl: fileUrl,
                    fileName: file.name
                  }
                ]
              }
            : apt
        ));
        setUploadingFile(false);
        setNewStudyName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 500);
    }
  };

  const selectedApt = appointments.find(a => a.id === selectedAppointment);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="bg-primary text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <button onClick={() => navigate("/home")} className="mb-4">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl">Mis turnos</h1>
        <p className="text-white/80 text-sm mt-1">
          Tienes {appointments.length} turnos programados
        </p>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No tienes turnos programados
          </div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white border border-border rounded-3xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        apt.status === "Próximo"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {apt.status}
                    </span>
                    {(apt.notes || apt.studies.length > 0) && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Info agregada
                      </span>
                    )}
                  </div>
                  <h3 className="text-foreground mb-1">{apt.reason}</h3>
                  <p className="text-sm text-muted-foreground">Mascota: {apt.pet}</p>
                </div>
                <button
                  onClick={() => handleDelete(apt.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{apt.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm">{apt.date}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">{apt.time}</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenDetails(apt.id)}
                className="w-full mt-4 bg-secondary text-foreground py-3 rounded-2xl hover:bg-accent transition-colors"
              >
                Ver detalles
              </button>
            </div>
          ))
        )}

        <button
          onClick={() => navigate("/home/book")}
          className="w-full bg-primary text-white py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Reservar nuevo turno
        </button>
      </div>

      {selectedAppointment && selectedApt && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-primary text-white p-6 rounded-t-3xl sm:rounded-t-3xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl">Detalles del turno</h2>
                <button
                  onClick={() => {
                    setSelectedAppointment(null);
                    setEditingNotes("");
                    setNewStudyName("");
                  }}
                  className="text-white hover:opacity-80"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-white/80 text-sm">{selectedApt.reason}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-secondary rounded-2xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Veterinaria:</span>
                  <span className="text-foreground">{selectedApt.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mascota:</span>
                  <span className="text-foreground">{selectedApt.pet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="text-foreground">{selectedApt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="text-foreground">{selectedApt.time}</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-foreground mb-3">
                  <Paperclip className="w-5 h-5 text-primary" />
                  Estudios adjuntos
                </label>
                <div className="space-y-2 mb-3">
                  {selectedApt.studies.map((study) => (
                    <div
                      key={study.id}
                      className="bg-accent rounded-2xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {study.fileUrl ? (
                          <a
                            href={study.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:opacity-80"
                          >
                            <FileText className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm text-foreground font-medium">{study.name}</p>
                              <p className="text-xs text-muted-foreground">{study.date}</p>
                            </div>
                          </a>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm text-foreground">{study.name}</p>
                              <p className="text-xs text-muted-foreground">{study.date}</p>
                            </div>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveStudy(study.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={newStudyName}
                    onChange={(e) => setNewStudyName(e.target.value)}
                    placeholder="Nombre del estudio (ej: Análisis de sangre)"
                    className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="w-full bg-secondary text-foreground py-3 rounded-2xl hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Upload className={`w-5 h-5 ${uploadingFile ? "animate-bounce" : ""}`} />
                    {uploadingFile ? "Subiendo..." : "Subir archivo (PDF, imagen)"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Agrega los estudios realizados para que el veterinario pueda revisarlos
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-foreground mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  Comentarios para el veterinario
                </label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Describe síntomas, comportamiento o cualquier información relevante para la consulta..."
                  rows={5}
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Esta información será visible para el veterinario antes de la consulta
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedAppointment(null);
                    setEditingNotes("");
                    setNewStudyName("");
                  }}
                  className="flex-1 bg-secondary text-foreground py-3 rounded-2xl hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleSaveNotes();
                    setSelectedAppointment(null);
                    setNewStudyName("");
                  }}
                  className="flex-1 bg-primary text-white py-3 rounded-2xl hover:opacity-90 transition-opacity"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
