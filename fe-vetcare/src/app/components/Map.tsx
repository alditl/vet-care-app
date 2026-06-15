import { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Clock, Search, Navigation, Loader2, Star, MessageSquare } from "lucide-react";
import VetReviews from "./VetReviews";

// Declaración de tipos para Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

// IMPORTANTE: Reemplaza esta clave con tu propia API Key de Google Maps
// Obtén una gratis en: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = "AIzaSyDcbOPTf0-0MaKokc9GZEvEndBINpNTp8c";

interface Veterinaria {
  id: number;
  name: string;
  address: string;
  distance: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
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

export default function Map() {
  const [searchAddress, setSearchAddress] = useState("");
  const [selectedVet, setSelectedVet] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -34.6037, lng: -58.3816 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showReviews, setShowReviews] = useState<{ vetId: number; vetName: string } | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [isAutocompleteReady, setIsAutocompleteReady] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingVets, setIsLoadingVets] = useState(true);
  const [vetsError, setVetsError] = useState("");

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);

  const [fetchedVeterinarias, setFetchedVeterinarias] = useState<Veterinaria[]>([]);
  const [veterinarias, setVeterinarias] = useState<Veterinaria[]>([]);

  // Calcular distancia entre dos puntos geográficos usando fórmula de Haversine
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchVeterinarias = async () => {
      setIsLoadingVets(true);
      setVetsError("");

      try {
        const response = await fetch("/api/veterinarias/", { credentials: "include" });
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const data: VeterinariaApi[] = await response.json();
        const mappedVeterinarias = data
          .map((vet) => ({
            id: vet.id,
            name: vet.nombre,
            address: vet.direccion,
            distance: "Calculando...",
            phone: vet.telefono,
            hours: vet.horarios || "Horario no informado",
            lat: Number(vet.latitud),
            lng: Number(vet.longitud),
            rating: 0,
            reviewCount: 0,
          }))
          .filter((vet) => Number.isFinite(vet.lat) && Number.isFinite(vet.lng));

        if (!cancelled) {
          setFetchedVeterinarias(mappedVeterinarias);
          setVeterinarias(mappedVeterinarias);
        }
      } catch (error) {
        console.error("Error cargando veterinarias:", error);
        if (!cancelled) setVetsError("No se pudieron cargar las veterinarias");
      } finally {
        if (!cancelled) setIsLoadingVets(false);
      }
    };

    fetchVeterinarias();

    return () => {
      cancelled = true;
    };
  }, []);

  // Obtener ubicación automáticamente al cargar
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newCenter);
          setIsLoadingLocation(false);

          // Agregar marcador de ubicación del dispositivo
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(newCenter);
            googleMapRef.current.setZoom(14);

            // Crear marcador de ubicación del usuario
            if (userMarkerRef.current) {
              userMarkerRef.current.setMap(null);
            }

            userMarkerRef.current = new window.google.maps.Marker({
              position: newCenter,
              map: googleMapRef.current,
              title: "Tu ubicación",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3,
              },
            });
          }
        },
        () => {
          setIsLoadingLocation(false);
          console.log("No se pudo obtener ubicación automática");
        }
      );
    }
  }, []);

  // Actualizar distancias cuando cambie la ubicación del usuario
  useEffect(() => {
    if (userLocation) {
      setIsCalculatingDistance(true);
      setTimeout(() => {
        const updatedVeterinarias = fetchedVeterinarias.map(vet => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            vet.lat,
            vet.lng
          );
          return {
            ...vet,
            distance: distance < 1
              ? `${Math.round(distance * 1000)} m`
              : `${distance.toFixed(1)} km`
          };
        });

        updatedVeterinarias.sort((a, b) => {
          const distA = parseFloat(a.distance);
          const distB = parseFloat(b.distance);
          return distA - distB;
        });

        setVeterinarias(updatedVeterinarias);
        setIsCalculatingDistance(false);
      }, 300);
    } else {
      setVeterinarias(fetchedVeterinarias);
    }
  }, [fetchedVeterinarias, userLocation]);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      // Si no hay API key configurada, mostrar advertencia
      if (GOOGLE_MAPS_API_KEY === "YOUR_API_KEY_HERE") {
        console.warn("⚠️ Google Maps API Key no configurada. Por favor configura tu API Key en src/app/components/Map.tsx");
        return;
      }

      try {
        // Cargar el script de Google Maps con la nueva API
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`;
          script.async = true;
          script.defer = true;

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Error cargando Google Maps"));
            document.head.appendChild(script);
          });
        }

        // Verificar que google esté disponible
        if (!window.google || !window.google.maps) {
          console.error("Google Maps no está disponible");
          return;
        }

        // Inicializar mapa
        const map = new window.google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 13,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        googleMapRef.current = map;

        // Inicializar servicios
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
        
        console.log("Autocomplete service inicializado");
        setIsAutocompleteReady(true);
        setIsMapReady(true);

      } catch (error) {
        console.error("Error cargando Google Maps:", error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    const map = googleMapRef.current;
    if (!isMapReady || !map || !window.google) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    veterinarias.forEach((vet) => {
      const marker = new window.google.maps.Marker({
        position: { lat: vet.lat, lng: vet.lng },
        map,
        title: vet.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#a78763",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #3d3d3d;">${vet.name}</h3>
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #8a8a8a;">${vet.address}</p>
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #8a8a8a;">Tel: ${vet.phone}</p>
            <p style="margin: 0; font-size: 11px; color: #8a8a8a;">Horario: ${vet.hours}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        setSelectedVet(vet.id);
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [isMapReady, veterinarias]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchAddress(value);

    if (value.length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = value.toLowerCase();
    
    // Buscar primero en veterinarias locales
    const localMatches = fetchedVeterinarias
      .filter(v => 
        v.name.toLowerCase().includes(searchTerm) || 
        v.address.toLowerCase().includes(searchTerm)
      )
      .map(v => v.address);

    // Si tenemos resultados locales, mostrarlos
    if (localMatches.length > 0) {
      setSuggestions(localMatches);
      setShowSuggestions(true);
      return;
    }

    // Intentar con Geocoding API (alternativa a Places)
    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { address: searchTerm + ", Buenos Aires, Argentina" },
        (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            const suggestionsList = results.slice(0, 5).map(r => r.formatted_address);
            setSuggestions(suggestionsList);
            setShowSuggestions(true);
          } else {
            // Si no hay resultados, mostrar mensaje de ejemplo
            setSuggestions([
              `Av. ${searchTerm}, Buenos Aires, Argentina`,
              `Calle ${searchTerm}, Buenos Aires, Argentina`,
            ].slice(0, 2));
            setShowSuggestions(true);
          }
        }
      );
    }
  };

  const handleSelectSuggestion = async (address: string) => {
    setSearchAddress(address);
    setShowSuggestions(false);
    await geocodeAddress(address);
  };

  const geocodeAddress = async (address: string) => {
    if (!geocoderRef.current || !googleMapRef.current) {
      console.warn("Servicios de Google Maps no disponibles");
      return;
    }

    setIsSearching(true);

    try {
      const result = await geocoderRef.current.geocode({
        address: address,
        componentRestrictions: { country: "AR" }
      });

      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        const newCenter = { lat: location.lat(), lng: location.lng() };

        setMapCenter(newCenter);
        setUserLocation(newCenter);

        googleMapRef.current.setCenter(newCenter);
        googleMapRef.current.setZoom(15);

        // Eliminar marcador anterior del usuario si existe
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }

        // Agregar marcador de ubicación del usuario
        userMarkerRef.current = new window.google.maps.Marker({
          position: newCenter,
          map: googleMapRef.current,
          title: "Tu ubicación",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });
      }
    } catch (error) {
      console.error("Error en geocodificación:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(newCenter);
          setUserLocation(newCenter);

          if (googleMapRef.current) {
            googleMapRef.current.setCenter(newCenter);
            googleMapRef.current.setZoom(15);

            // Eliminar marcador anterior del usuario si existe
            if (userMarkerRef.current) {
              userMarkerRef.current.setMap(null);
            }

            // Agregar marcador de ubicación del usuario
            userMarkerRef.current = new window.google.maps.Marker({
              position: newCenter,
              map: googleMapRef.current,
              title: "Tu ubicación",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3,
              },
            });
          }
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener tu ubicación. Por favor verifica los permisos.");
        }
      );
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white rounded-2xl shadow-lg p-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 relative" ref={searchInputRef}>
              <input
                type="text"
                placeholder={isAutocompleteReady ? (isLoadingLocation ? "Detectando tu ubicación..." : "Buscá una dirección en AMBA...") : "Cargando mapa..."}
                value={searchAddress}
                onChange={(e) => {
                  console.log("Input:", e.target.value);
                  handleSearchChange(e.target.value);
                }}
                onKeyPress={(e) => e.key === 'Enter' && geocodeAddress(searchAddress)}
                disabled={!isAutocompleteReady}
                className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-border max-h-60 overflow-y-auto z-20">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors text-sm text-foreground border-b border-border last:border-b-0 flex items-start gap-2"
                    >
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isSearching || isLoadingLocation ? (
              <div className="p-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            ) : (
              <button
                onClick={handleGetCurrentLocation}
                className="p-2 bg-primary rounded-xl text-white hover:opacity-90 transition-opacity"
                title="Usar mi ubicación actual"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        ref={mapRef}
        className="relative flex-1 bg-gradient-to-br from-secondary via-accent to-muted"
      >
        {GOOGLE_MAPS_API_KEY === "YOUR_API_KEY_HERE" && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 backdrop-blur-sm z-10">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg text-foreground mb-3">API Key requerida</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para usar el mapa interactivo, necesitas configurar tu Google Maps API Key.
              </p>
              <ol className="text-xs text-left text-muted-foreground space-y-2 mb-4 bg-secondary rounded-xl p-4">
                <li>1. Visita <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                <li>2. Crea un proyecto y habilita Maps JavaScript API</li>
                <li>3. Genera una API Key</li>
                <li>4. Reemplaza la clave en <code className="bg-accent px-1 rounded">src/app/components/Map.tsx</code></li>
              </ol>
              <p className="text-xs text-muted-foreground">
                Por ahora, puedes ver las veterinarias en la lista de abajo.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-t-3xl shadow-2xl max-h-[45%] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg text-foreground">Veterinarias cercanas</h2>
              {userLocation && !isCalculatingDistance && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {isLoadingLocation ? "Ubicación detectada" : "Ordenadas por distancia"}
                </p>
              )}
              {isCalculatingDistance && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Calculando distancias...
                </p>
              )}
            </div>
            {selectedVet && (
              <button
                onClick={() => setSelectedVet(null)}
                className="text-sm text-primary hover:underline"
              >
                Ver todas
              </button>
            )}
          </div>
          {isLoadingVets && (
            <div className="bg-secondary rounded-2xl p-4 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando veterinarias...
            </div>
          )}
          {!isLoadingVets && vetsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
              {vetsError}
            </div>
          )}
          {!isLoadingVets && !vetsError && veterinarias.length === 0 && (
            <div className="bg-secondary rounded-2xl p-4 text-sm text-muted-foreground">
              No hay veterinarias disponibles.
            </div>
          )}
          {veterinarias.map((vet) => (
            <div
              key={vet.id}
              className={`rounded-2xl p-4 space-y-3 transition-all ${
                selectedVet === vet.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-secondary'
              }`}
            >
              <div
                onClick={() => {
                  setSelectedVet(vet.id);
                  if (googleMapRef.current) {
                    googleMapRef.current.setCenter({ lat: vet.lat, lng: vet.lng });
                    googleMapRef.current.setZoom(16);
                  }
                }}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <MapPin className={`w-5 h-5 flex-shrink-0 ${selectedVet === vet.id ? 'text-white' : 'text-primary'}`} />
                    <h3 className={selectedVet === vet.id ? 'text-white' : 'text-foreground'}>{vet.name}</h3>
                  </div>
                  <span className={`text-sm ${selectedVet === vet.id ? 'text-white/90' : 'text-primary'}`}>
                    {vet.distance}
                  </span>
                </div>

                {vet.rating > 0 && (
                  <div className={`flex items-center gap-2 pl-7 mb-2`}>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(vet.rating)
                              ? selectedVet === vet.id
                                ? "fill-white text-white"
                                : "fill-yellow-400 text-yellow-400"
                              : selectedVet === vet.id
                              ? "text-white/30"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-sm ${selectedVet === vet.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {vet.rating.toFixed(1)} ({vet.reviewCount})
                    </span>
                  </div>
                )}

                <p className={`text-sm pl-7 ${selectedVet === vet.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {vet.address}
                </p>
                <div className={`flex items-center gap-4 text-sm pl-7 ${selectedVet === vet.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{vet.phone}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm pl-7 ${selectedVet === vet.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                  <Clock className="w-4 h-4" />
                  <span>{vet.hours}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReviews({ vetId: vet.id, vetName: vet.name });
                }}
                className={`w-full py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  selectedVet === vet.id
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-white border border-border hover:bg-accent text-foreground'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">
                  {vet.reviewCount > 0 ? 'Ver reseñas' : 'Escribir reseña'}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {showReviews && (
        <VetReviews
          vetId={showReviews.vetId}
          vetName={showReviews.vetName}
          onClose={() => setShowReviews(null)}
        />
      )}
    </div>
  );
}
