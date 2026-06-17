import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Dog,
  Cat,
  Plus,
  ChevronLeft,
  Calendar,
  Weight,
  Ruler,
  Palette,
  Bell,
  FileText,
  Trash2, // <-- Sumamos el icono de tacho de basura
} from "lucide-react";

// --- DECLARACIÓN DE INTERFACES PARA TYPESCRIPT ---
interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  furType: string;
  furColor: string;
}

interface Reminder {
  id: number;
  petId: number;
  type: string;
  description: string;
  date: string;
  daysUntil: number;
  priority: "high" | "medium" | "low";
}

interface Visit {
  id: number;
  petId: number;
  date: string;
  location: string;
  reason: string;
  notes: string;
}

export default function MisMascotas() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<boolean>(false);

  // Estados tipados para la consistencia de TypeScript
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const [newPet, setNewPet] = useState({
    name: "",
    species: "Perro",
    breed: "",
    age: "",
    weight: "",
    furType: "",
    furColor: "",
  });

  // --- TRAER MASCOTAS DE LA BASE DE DATOS (DJANGO) ---
  const cargarMascotas = () => {
    fetch("/api/mascotas/", { credentials: 'include' })
      .then((response) => response.json())
      .then((data: any[]) => {
        const mappedPets: Pet[] = data.map((mascota) => ({
          id: mascota.id,
          name: mascota.nombre,
          species: mascota.especie,
          breed: mascota.raza,
          age: mascota.edad,
          weight: mascota.peso,
          furType: mascota.tipo_pelo,
          furColor: mascota.color_pelo,
        }));
        setPets(mappedPets);

        if (mappedPets.length > 0) {
          // Buscamos mantener la seleccionada o poner la primera
          setSelectedPet((prev) => {
            if (prev && mappedPets.some(p => p.id === prev.id)) {
              return mappedPets.find(p => p.id === prev.id) || mappedPets[0];
            }
            return mappedPets[0];
          });
        } else {
          setSelectedPet(null);
        }
      })
      .catch((error) => console.error("Error al traer mascotas:", error));
  };

  useEffect(() => {
    cargarMascotas();
  }, []);

  // --- FUNCIÓN PARA ELIMINAR MASCOTA DE LA BASE DE DATOS ---
  const handleEliminarMascota = async (id: number) => {
    if (!window.confirm("¿Estás segura de que quieres eliminar esta mascota?")) return;

    try {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()!.split(';').shift() || '';
        return '';
      };

      const csrftoken = getCookie('csrftoken');

      const response = await fetch(`/api/mascotas/${id}/`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });

      if (response.ok) {
        alert("Mascota eliminada correctamente.");
        cargarMascotas(); // Recarga la lista real de la BBDD
      } else {
        alert("No se pudo eliminar la mascota del servidor.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Hubo un error al intentar borrar el registro.");
    }
  };

  // --- ESTADOS MOCK DE RECORDATORIOS Y VISITAS ---
  const [reminders] = useState<Reminder[]>([
    {
      id: 1,
      petId: 1,
      type: "Análisis de sangre",
      description: "Control...",
      date: "2026-05-26",
      daysUntil: 30,
      priority: "high",
    },
    {
      id: 2,
      petId: 1,
      type: "Vacuna antirrábica",
      description: "Refuerzo...",
      date: "2026-09-15",
      daysUntil: 142,
      priority: "medium",
    },
    {
      id: 3,
      petId: 1,
      type: "Desparasitación",
      description: "Interna...",
      date: "2026-05-10",
      daysUntil: 14,
      priority: "high",
    },
  ]);

  const [visits] = useState<Visit[]>([
    {
      id: 1,
      petId: 1,
      date: "15 Abr 2026",
      location: "Vet Care Recoleta",
      reason: "Control",
      notes: "Excelente.",
    },
  ]);

  const getPriorityColor = (priority: "high" | "medium" | "low"): string => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const petReminders = selectedPet
    ? reminders
        .filter((r) => r.petId === selectedPet.id)
        .sort((a, b) => a.daysUntil - b.daysUntil)
    : [];

  const petVisits = selectedPet
    ? visits.filter((v) => v.petId === selectedPet.id)
    : [];

  // --- VISTA SIN MASCOTAS ---
  if (!selectedPet) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center p-6">
        <header className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <Dog className="w-12 h-12 text-primary" />
        </header>
        <section className="text-center mb-6">
          <h2 className="text-xl text-foreground mb-2">
            No tienes mascotas registradas
          </h2>
          <p className="text-muted-foreground">
            Agrega tu primera mascota para comenzar a llevar su historial
          </p>
        </section>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Agregar mascota
        </button>

        {showModal && renderModal()}
      </main>
    );
  }

  const SpeciesIcon = selectedPet.species === "Gato" ? Cat : Dog;

  // --- INTERFAZ PRINCIPAL COMPUESTA ---
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background pb-8">
      {/* Cabecera Principal */}
      <header className="bg-primary text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <button onClick={() => navigate(-1)} className="mb-4 block">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <section className="flex items-center gap-2 mb-4">
          <h1 className="text-xl font-medium">Mis mascotas</h1>
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </section>

        {/* Carrusel horizontal de botones */}
        {pets.length > 1 && (
          <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedPet?.id === pet.id
                    ? "bg-white text-primary shadow-sm"
                    : "bg-white/20 text-white"
                }`}
              >
                {pet.name}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Contenedor de la Ficha Técnica */}
      <article className="p-6 space-y-6">
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-border">
          <header className="flex items-start gap-4 mb-4">
            <figure className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center shadow-inner">
              <SpeciesIcon className="w-10 h-10" />
            </figure>
            <hgroup className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {selectedPet.name}
                </h2>
                {/* BOTÓN DE ELIMINAR LIBRE PARA CUALQUIER USUARIO */}
                <button
                  onClick={() => handleEliminarMascota(selectedPet.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-colors"
                  title="Eliminar Mascota"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-muted-foreground">{selectedPet.breed}</p>
            </hgroup>
          </header>

          {/* Grilla de Datos Técnicos */}
          <ul className="grid grid-cols-2 gap-4 list-none p-0 m-0">
            <li className="bg-secondary rounded-2xl p-4">
              <span className="flex items-center gap-2 text-primary mb-2 text-sm">
                <Calendar className="w-4 h-4" /> Edad
              </span>
              <p className="text-foreground text-lg font-medium">
                {selectedPet.age} años
              </p>
            </li>
            <li className="bg-secondary rounded-2xl p-4">
              <span className="flex items-center gap-2 text-primary mb-2 text-sm">
                <Weight className="w-4 h-4" /> Peso
              </span>
              <p className="text-foreground text-lg font-medium">
                {selectedPet.weight} kg
              </p>
            </li>
            <li className="bg-secondary rounded-2xl p-4">
              <span className="flex items-center gap-2 text-primary mb-2 text-sm">
                <Ruler className="w-4 h-4" /> Pelaje
              </span>
              <p className="text-foreground text-lg font-medium">
                {selectedPet.furType}
              </p>
            </li>
            <li className="bg-secondary rounded-2xl p-4">
              <span className="flex items-center gap-2 text-primary mb-2 text-sm">
                <Palette className="w-4 h-4" /> Color
              </span>
              <p className="text-foreground text-lg font-medium">
                {selectedPet.furColor}
              </p>
            </li>
          </ul>
        </section>

        {/* Sección de Recordatorios */}
        <section>
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-foreground font-medium flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Recordatorios
            </h3>
          </header>

          {petReminders.length === 0 ? (
            <p className="bg-secondary rounded-2xl p-6 text-center text-muted-foreground">
              No hay pendientes
            </p>
          ) : (
            <>
              {petReminders.slice(0, 1).map((reminder) => (
                <article
                  key={reminder.id}
                  className={`rounded-2xl p-4 border-2 ${getPriorityColor(reminder.priority)}`}
                >
                  <h4 className="font-semibold">{reminder.type}</h4>
                  <p className="text-sm opacity-80 mb-2">
                    {reminder.description}
                  </p>
                  <footer className="text-sm border-t border-black/5 pt-2 flex justify-between">
                    <span>📅 {reminder.date}</span>
                    <span>En {reminder.daysUntil} días</span>
                  </footer>
                </article>
              ))}
            </>
          )}
        </section>

        {/* Historial Clínico */}
        <section>
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-foreground font-medium flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Historial de visitas
            </h3>
          </header>

          {petVisits.length === 0 ? (
            <p className="bg-secondary rounded-2xl p-6 text-center text-muted-foreground">
              Sin registros
            </p>
          ) : (
            <>
              {petVisits.slice(0, 1).map((visit) => (
                <article
                  key={visit.id}
                  className="bg-white border border-border rounded-2xl p-4 shadow-sm"
                >
                  <h4 className="text-foreground font-semibold">
                    {visit.reason}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {visit.location}
                  </p>
                  <blockquote className="bg-secondary rounded-xl p-3 text-sm m-0">
                    {visit.notes}
                  </blockquote>
                </article>
              ))}
            </>
          )}
        </section>

        <button
          onClick={() => navigate("/home/book", { state: { petId: selectedPet.id, petName: selectedPet.name } })}
          className="w-full bg-primary text-white py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2 font-medium"
        >
          <Calendar className="w-5 h-5" />
          Reservar turno para {selectedPet.name}
        </button>
      </article>

      {showModal && renderModal()}
    </main>
  );

  // --- SUB-COMPONENTE MODAL ---
  function renderModal() {
    return (
      <dialog
        className="fixed inset-0 bg-black/50 w-full h-full flex items-end justify-center z-50 border-none p-0 m-0 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
      >
        <form
          className="bg-white w-full max-w-lg rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xl text-foreground font-bold">
              Agregar nueva mascota
            </h2>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="text-muted-foreground hover:text-foreground text-lg p-1"
            >
              ✕
            </button>
          </header>

          <fieldset className="border-none p-0 m-0 flex flex-col gap-4">
            <label className="block text-sm font-medium text-foreground">
              Nombre
              <input
                type="text"
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                className="w-full mt-2 border border-border rounded-xl p-3 text-foreground bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Nombre de tu mascota"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Tipo de mascota
              <span className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setNewPet({ ...newPet, species: "Perro" })}
                  className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                    newPet.species === "Perro"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Dog className="w-5 h-5" /> Perro
                </button>
                <button
                  type="button"
                  onClick={() => setNewPet({ ...newPet, species: "Gato" })}
                  className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                    newPet.species === "Gato"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Cat className="w-5 h-5" /> Gato
                </button>
              </span>
            </label>

            <label className="block text-sm font-medium text-foreground">
              Raza
              <input
                type="text"
                value={newPet.breed}
                onChange={(e) =>
                  setNewPet({ ...newPet, breed: e.target.value })
                }
                className="w-full mt-2 border border-border rounded-xl p-3 text-foreground bg-input-background"
                placeholder="ej. Golden Retriever"
              />
            </label>

            <section className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-foreground">
                Edad (años)
                <input
                  type="number"
                  value={newPet.age}
                  onChange={(e) =>
                    setNewPet({ ...newPet, age: e.target.value })
                  }
                  className="w-full mt-2 border border-border rounded-xl p-3 text-foreground bg-input-background"
                  placeholder="ej. 3"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Peso (kg)
                <input
                  type="number"
                  step="0.1"
                  value={newPet.weight}
                  onChange={(e) =>
                    setNewPet({ ...newPet, weight: e.target.value })
                  }
                  className="w-full mt-2 border border-border rounded-xl p-3 text-foreground bg-input-background"
                  placeholder="ej. 25.4"
                />
              </label>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-foreground">
                Tipo de pelaje
                <input
                  type="text"
                  value={newPet.furType}
                  onChange={(e) =>
                    setNewPet({ ...newPet, furType: e.target.value })
                  }
                  className="w-full mt-2 border border-border rounded-xl p-3 text-foreground bg-input-background"
                  placeholder="ej. Largo"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Color de pelaje
                <input
                  type="text"
                  value={newPet.furColor}
                  onChange={(e) =>
                    setNewPet({ ...newPet, furColor: e.target.value })
                  }
                  className="w-full mt-2 border border-border rounded-xl p-3 text-foreground bg-input-background"
                  placeholder="ej. Dorado"
                />
              </label>
            </section>
          </fieldset>

          <button
            type="button"
            onClick={async () => {
              if (!newPet.name || !newPet.breed) return;

              try {
                const getCookie = (name: string) => {
                  const value = `; ${document.cookie}`;
                  const parts = value.split(`; ${name}=`);
                  if (parts.length === 2) return parts.pop()!.split(';').shift() || '';
                  return '';
                };

                const csrftoken = getCookie('csrftoken');
                
                const response = await fetch("/api/mascotas/", {
                  method: "POST",
                  credentials: 'include',
                  headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken,
                  },
                  body: JSON.stringify({
                    nombre: newPet.name,
                    especie: newPet.species,
                    raza: newPet.breed,
                    edad: parseInt(newPet.age) || 0,
                    peso: parseFloat(newPet.weight) || 0,
                    tipo_pelo: newPet.furType || "No especificado",
                    color_pelo: newPet.furColor || "No especificado",
                  }),
                });

                const responseText = await response.text();
                let nuevaMascotaBBDD: any;
                try {
                  nuevaMascotaBBDD = JSON.parse(responseText);
                } catch {
                  nuevaMascotaBBDD = responseText;
                }

                if (!response.ok) {
                  throw new Error("Error en el guardado.");
                }

                const petFormateada: Pet = {
                  id: nuevaMascotaBBDD.id,
                  name: nuevaMascotaBBDD.nombre,
                  species: nuevaMascotaBBDD.especie,
                  breed: nuevaMascotaBBDD.raza,
                  age: nuevaMascotaBBDD.edad,
                  weight: nuevaMascotaBBDD.peso,
                  furType: nuevaMascotaBBDD.tipo_pelo,
                  furColor: nuevaMascotaBBDD.color_pelo,
                };

                setPets([...pets, petFormateada]);
                setSelectedPet(petFormateada);
                setShowModal(false);
                setNewPet({
                  name: "",
                  species: "Perro",
                  breed: "",
                  age: "",
                  weight: "",
                  furType: "",
                  furColor: "",
                });
              } catch (error) {
                console.error("Error al registrar:", error);
                alert("Hubo un problema al guardar en el servidor.");
              }
            }}
            className="w-full bg-primary text-white py-4 rounded-2xl hover:opacity-90 transition-opacity font-medium shadow-md mt-2"
          >
            Agregar mascota
          </button>
        </form>
      </dialog>
    );
  }
}