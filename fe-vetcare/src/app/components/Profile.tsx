import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Dog, Bell, Shield, LogOut, Plus, X, Pencil, Trash2, Lock, Eye, FileKey } from "lucide-react";
import { useNavigate } from "react-router";

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight?: number;
  furType?: string;
  furColor?: string;
}

interface ClientData {
  email: string;
  phone: string;
  address: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    furType: "",
    furColor: "",
  });

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showEditDataModal, setShowEditDataModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [clientData, setClientData] = useState<ClientData>({
    email: "",
    phone: "",
    address: "",
  });
  const [userName, setUserName] = useState<string>('');
  const [editForm, setEditForm] = useState<ClientData>({ ...clientData });

  const handleLogout = async () => {
    try {
      // Obtener csrftoken desde la cookie y enviarlo en la cabecera X-CSRFToken
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()!.split(';').shift() || '';
        return '';
      };

      const csrftoken = getCookie('csrftoken');

      await fetch("/api/logout/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
        credentials: "include",
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    localStorage.removeItem("vetcare_userName");
    navigate("/login");
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/me/', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setClientData({ email: data.email || '', phone: data.phone || '', address: '' });
          setUserName(data.first_name || data.email || 'Usuario');
          // Obtener mascotas del usuario
          try {
            const petsRes = await fetch('/api/mascotas/', { credentials: 'include' });
            if (petsRes.ok) {
              const petsData = await petsRes.json();
              // mapear campos del backend a Pet
              const mapped = petsData.map((m: any, idx: number) => ({
                id: m.id || idx + 1,
                name: m.nombre || 'Mascota',
                species: m.especie || '',
                breed: m.raza || '',
                age: m.edad || 0,
              }));
              setPets(mapped);
            }
          } catch (err) {
            console.error('Error al obtener mascotas:', err);
          }
        } else if (res.status === 401 || res.status === 403) {
          // no autenticado: redirigir al login
          navigate('/login');
        }
      } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
      }
    };

    fetchMe();
  }, [navigate]);

  const handleAddPet = async () => {
    if (!newPet.name || !newPet.species || !newPet.breed || !newPet.age) {
      return;
    }

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()!.split(';').shift() || '';
      return '';
    };

    const csrftoken = getCookie('csrftoken');

    try {
      const response = await fetch('/api/mascotas/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
          nombre: newPet.name,
          especie: newPet.species,
          raza: newPet.breed,
          edad: parseInt(newPet.age) || 0,
          peso: 0,
          tipo_pelo: 'No especificado',
          color_pelo: 'No especificado',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Error al guardar mascota:', response.status, data);
        return;
      }

      const pet: Pet = {
        id: data.id,
        name: data.nombre,
        species: data.especie,
        breed: data.raza,
        age: data.edad,
      };
      setPets([...pets, pet]);
      setNewPet({ name: '', species: '', breed: '', age: '', weight: '', furType: '', furColor: '' });
      setShowAddPetModal(false);
    } catch (error) {
      console.error('Error al guardar mascota:', error);
    }
  };

  const handleOpenEditData = () => {
    setEditForm({ ...clientData });
    setShowEditDataModal(true);
  };

  const handleSaveEditData = async () => {
    try {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()!.split(';').shift() || '';
        return '';
      };

      const csrftoken = getCookie('csrftoken');

      const response = await fetch('/api/perfil/modificar/', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClientData({
          email: data.email || editForm.email,
          phone: data.phone || editForm.phone,
          address: data.address || editForm.address,
        });
        setShowEditDataModal(false);
      } else {
        console.error('Error en el backend al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error de red al actualizar el perfil:', error);
    }
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
          <h1 className="text-xl text-foreground">{userName || 'Usuario'}</h1>
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

              {/* action buttons relocated to modal footer below extra fields */}
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-muted-foreground">
                  Peso (kg)
                  <input
                    type="number"
                    step="0.1"
                    value={newPet.weight}
                    onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
                    placeholder="ej. 12.5"
                    className="w-full mt-2 border border-border rounded-xl p-3 text-foreground bg-input-background"
                  />
                </label>

                <label className="block text-sm text-muted-foreground">
                  Tipo de pelaje
                  <input
                    type="text"
                    value={newPet.furType}
                    onChange={(e) => setNewPet({ ...newPet, furType: e.target.value })}
                    placeholder="ej. Corto"
                    className="w-full mt-2 border border-border rounded-xl p-3 text-foreground bg-input-background"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground">
                  Color de pelaje
                  <input
                    type="text"
                    value={newPet.furColor}
                    onChange={(e) => setNewPet({ ...newPet, furColor: e.target.value })}
                    placeholder="ej. Dorado"
                    className="w-full mt-2 border border-border rounded-xl p-3 text-foreground bg-input-background"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
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
