import { useState } from "react";
import { User, Mail, Phone, MapPin, Dog, Bell, Shield, LogOut, Plus, X, Pencil, Trash2, Lock, Eye, FileKey } from "lucide-react";
import { useNavigate } from "react-router";

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
}

interface ClientData {
  email: string;
  phone: string;
  address: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([
    { id: 1, name: "Max", species: "Perro", breed: "Golden Retriever", age: 3 },
  ]);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
  });

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showEditDataModal, setShowEditDataModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [clientData, setClientData] = useState<ClientData>({
    email: "maria.gonzalez@email.com",
    phone: "+54 11 5555-1234",
    address: "Av. Corrientes 1234, CABA",
  });
  const [editForm, setEditForm] = useState<ClientData>({ ...clientData });

  const handleLogout = () => {
    navigate("/login");
  };

  const handleAddPet = () => {
    if (newPet.name && newPet.species && newPet.breed && newPet.age) {
      const pet: Pet = {
        id: pets.length + 1,
        name: newPet.name,
        species: newPet.species,
        breed: newPet.breed,
        age: parseInt(newPet.age),
      };
      setPets([...pets, pet]);
      setNewPet({ name: "", species: "", breed: "", age: "" });
      setShowAddPetModal(false);
    }
  };

  const handleOpenEditData = () => {
    setEditForm({ ...clientData });
    setShowEditDataModal(true);
  };

  const handleSaveEditData = () => {
    setClientData({ ...editForm });
    setShowEditDataModal(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirmModal(false);
    navigate("/login");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
            <User className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-xl text-foreground">María González</h1>
          <p className="text-muted-foreground text-sm">Cliente desde 2023</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-secondary rounded-2xl p-4 flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-foreground">{clientData.email}</p>
            </div>
          </div>

          <div className="bg-secondary rounded-2xl p-4 flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="text-foreground">{clientData.phone}</p>
            </div>
          </div>

          <div className="bg-secondary rounded-2xl p-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Dirección</p>
              <p className="text-foreground">{clientData.address}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-foreground">Mis mascotas</h2>
            <button
              onClick={() => setShowAddPetModal(true)}
              className="bg-primary text-white p-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-accent rounded-2xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Dog className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground">{pet.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {pet.breed} • {pet.age} {pet.age === 1 ? 'año' : 'años'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <button className="w-full bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-foreground">Notificaciones</span>
          </button>

          <button 
            onClick={() => setShowPrivacyModal(true)}
            className="w-full bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:bg-secondary transition-colors"
          >
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-foreground">Privacidad y seguridad</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-destructive text-destructive-foreground rounded-2xl p-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {showAddPetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-foreground">Agregar mascota</h2>
              <button
                onClick={() => setShowAddPetModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  placeholder="Ej: Max"
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Especie
                </label>
                <select
                  value={newPet.species}
                  onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecciona una especie</option>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Conejo">Conejo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Raza
                </label>
                <input
                  type="text"
                  value={newPet.breed}
                  onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                  placeholder="Ej: Golden Retriever"
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Edad (años)
                </label>
                <input
                  type="number"
                  value={newPet.age}
                  onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                  placeholder="Ej: 3"
                  min="0"
                  max="30"
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddPetModal(false)}
                  className="flex-1 bg-secondary text-foreground py-3 rounded-2xl hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPet}
                  disabled={!newPet.name || !newPet.species || !newPet.breed || !newPet.age}
                  className="flex-1 bg-primary text-white py-3 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-foreground">Privacidad y seguridad</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-secondary rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="text-foreground font-medium">Protección de datos</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tu información personal está protegida con encriptación de nivel bancario. 
                  Nunca compartiremos tus datos con terceros sin tu consentimiento explícito.
                </p>
              </div>

              <div className="bg-secondary rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <h3 className="text-foreground font-medium">Visibilidad</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Controla qué información es visible para otros usuarios y 
                  profesionales veterinarios en la plataforma.
                </p>
              </div>

              <div className="bg-secondary rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FileKey className="w-5 h-5 text-primary" />
                  <h3 className="text-foreground font-medium">Historial seguro</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tu historial de mascotas y citas médicas se almacena de forma segura 
                  y solo tú puedes acceder a él.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleOpenEditData}
                className="w-full bg-primary text-white rounded-2xl p-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Pencil className="w-5 h-5" />
                <span>Editar mis datos</span>
              </button>

              <button 
                onClick={() => setShowDeleteConfirmModal(true)}
                className="w-full bg-destructive/10 text-destructive rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span>Eliminar mi cuenta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditDataModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-foreground">Editar datos</h2>
              <button
                onClick={() => setShowEditDataModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditDataModal(false)}
                  className="flex-1 bg-secondary text-foreground py-3 rounded-2xl hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEditData}
                  className="flex-1 bg-primary text-white py-3 rounded-2xl hover:opacity-90 transition-opacity"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-foreground">Eliminar cuenta</h2>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-foreground text-center mb-2">
                ¿Estás seguro de que quieres eliminar tu cuenta?
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Esta acción no se puede deshacer. Perderás acceso a todos tus datos, 
                historial de mascotas y citas.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 bg-secondary text-foreground py-3 rounded-2xl hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-destructive text-destructive-foreground py-3 rounded-2xl hover:opacity-90 transition-opacity"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
