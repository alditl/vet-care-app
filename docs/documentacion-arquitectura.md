# Documentación de Arquitectura — VetCare

## 1. Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Navegador)                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Frontend React + Vite + TypeScript               │  │
│  │                                                               │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────────┐   │  │
│  │  │  Login  │ │Register  │ │ Dashboard │ │ Layout (Nav)  │   │  │
│  │  └────┬────┘ └────┬─────┘ └─────┬─────┘ └───────┬───────┘   │  │
│  │       │           │             │               │           │  │
│  │  ┌────▼───────────▼─────────────▼───────────────▼───────┐   │  │
│  │  │              React Router (SPA)                       │   │  │
│  │  │  /home/pets | /home/book | /home/appointments | ...   │   │  │
│  │  └──────────────────────────┬────────────────────────────┘   │  │
│  │                             │                                 │  │
│  │                    ┌────────▼────────┐                       │  │
│  │                    │  fetch() + CSRF │                       │  │
│  │                    └────────┬────────┘                       │  │
│  └─────────────────────────────┼─────────────────────────────────┘  │
│                                │                                     │
│                    ┌───────────┴───────────┐                        │
│                    │   Vite Proxy (dev)    │                        │
│                    │  /api → localhost:8000│                        │
│                    └───────────┬───────────┘                        │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │ HTTP (JSON)
┌────────────────────────────────┼─────────────────────────────────────┐
│                      BACKEND   │   Django 5.2                        │
│                                ▼                                     │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     Django REST Framework                      │  │
│  │                                                               │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │                    Middleware                            │  │  │
│  │  │  CORS → Session → CSRF → Auth → ...                    │  │  │
│  │  └────────────────────────┬─────────────────────────────────┘  │  │
│  │                           │                                    │  │
│  │  ┌────────────────────────▼─────────────────────────────────┐  │  │
│  │  │                    URL Router (core/urls.py)             │  │  │
│  │  │  /admin/ → admin.site.urls                              │  │  │
│  │  │  /api/   → mascotas.urls                                │  │  │
│  │  └────────────────────────┬─────────────────────────────────┘  │  │
│  │                           │                                    │  │
│  │  ┌────────────────────────▼─────────────────────────────────┐  │  │
│  │  │              API Endpoints (mascotas/urls.py)            │  │  │
│  │  │                                                         │  │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐       │  │  │
│  │  │  │ Mascota    │  │Veterinaria │  │ Turno      │       │  │  │
│  │  │  │ ViewSet    │  │ViewSet     │  │ ViewSet    │       │  │  │
│  │  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘       │  │  │
│  │  │        │               │               │              │  │  │
│  │  │  ┌─────▼───────────────▼───────────────▼──────────┐   │  │  │
│  │  │  │        Serializers (mascotas/serializers.py)   │   │  │  │
│  │  │  └─────────────────────┬──────────────────────────┘   │  │  │
│  │  └────────────────────────┼──────────────────────────────┘  │  │
│  │                           │                                    │  │
│  │  ┌────────────────────────▼─────────────────────────────────┐  │  │
│  │  │                    Modelos (models.py)                   │  │  │
│  │  │  Perfil ← User ── Mascota ── Turno ── Veterinaria      │  │  │
│  │  └────────────────────────┬─────────────────────────────────┘  │  │
│  │                           │                                    │  │
│  │  ┌────────────────────────▼─────────────────────────────────┐  │  │
│  │  │            ORM Django (django.db.backends.postgresql)    │  │  │
│  │  └────────────────────────┬─────────────────────────────────┘  │  │
│  └───────────────────────────┼─────────────────────────────────────┘  │
│                              │                                        │
│                 ┌────────────▼────────────┐                           │
│                 │   PostgreSQL 18         │                           │
│                 │   Database: vetcare_bd  │                           │
│                 └─────────────────────────┘                           │
└───────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────┐
                              │   Google Maps API   │
                              │  (Integración       │
                              │   externa vía JS)   │
                              └─────────────────────┘
```

---

## 2. Patrón Arquitectónico

**Frontend**: Single Page Application (SPA) con React Router del lado del cliente.

**Backend**: API REST monolítica con Django + Django REST Framework.

**Comunicación**: HTTP/JSON con autenticación por sesión (Session-based auth).

---

## 3. Flujo de Datos — Reserva de Turno

```
Usuario                    Frontend                    Backend                  PostgreSQL
   │                          │                          │                        │
   │  1. Login (email+pass)   │  2. POST /api/login/     │                        │
   │─────────────────────────►│─────────────────────────►│                        │
   │                          │                          │  3. autenticar user     │
   │                          │                          │───────────────────────►│
   │                          │                          │◄───────────────────────│
   │                          │◄─── session cookie ──────│                        │
   │◄─── redirect /home ──────│                          │                        │
   │                          │                          │                        │
   │  4. Selecciona mascota   │  5. GET /api/mascotas/   │                        │
   │─────────────────────────►│─────────────────────────►│  6. SELECT * FROM      │
   │                          │                          │     mascotas           │
   │                          │                          │     WHERE dueño_id=X   │
   │                          │                          │───────────────────────►│
   │                          │◄─── JSON[mascotas] ──────│◄───────────────────────│
   │◄─── lista mascotas ──────│                          │                        │
   │                          │                          │                        │
   │  7. Selecciona veterinaria│ 8. GET /api/veterinarias/│                       │
   │─────────────────────────►│─────────────────────────►│  9. SELECT * FROM      │
   │                          │                          │     veterinarias       │
   │                          │                          │───────────────────────►│
   │                          │◄─── JSON[veterinarias] ──│◄───────────────────────│
   │◄─── lista vets ──────────│                          │                        │
   │                          │                          │                        │
   │  10. Fecha + hora + mot. │ 11. POST /api/turnos/   │                        │
   │─────────────────────────►│─────────────────────────►│ 12. INSERT INTO turno  │
   │                          │                          │───────────────────────►│
   │                          │                          │◄───── OK ─────────────│
   │                          │◄─── 201 Created ─────────│                        │
   │◄─── pantalla éxito ──────│                          │                        │
```

---

## 4. Flujo de Autenticación

```
Frontend                          Backend
   │                                │
   │  POST /api/login/              │
   │  { email, password }           │
   │───────────────────────────────►│
   │                                │ authenticate(username=email, password)
   │                                │ login(request, user) → crea sesión
   │◄─── 200 OK + Set-Cookie ───────│
   │    { sessionid, csrftoken }    │
   │                                │
   │  (siguientes requests)         │
   │  GET /api/mascotas/            │
   │  Cookie: sessionid=abc123      │
   │  X-CSRFToken: xyz789           │
   │───────────────────────────────►│
   │                                │ SessionMiddleware recupera usuario
   │                                │ CsrfViewMiddleware valida token
   │◄─── 200 OK (JSON) ─────────────│
```

---

## 5. Diagrama de Componentes Frontend

```
App.tsx
  └── BrowserRouter
       ├── /login          → Login.tsx
       ├── /register       → Register.tsx
       └── /home           → Layout.tsx (shell con BottomNav)
            ├── index      → Dashboard.tsx          (menú 2×2)
            ├── map        → Map.tsx                (Google Maps)
            ├── pets       → MisMascotas.tsx        (carrusel + ficha)
            ├── profile    → Profile.tsx            (datos + CRUD mascota)
            ├── book       → BookAppointment.tsx    (wizard 3 pasos)
            ├── appointments → MyAppointments.tsx   (lista + detalle)
            ├── history    → History.tsx            (mock)
            ├── guard      → VirtualGuard.tsx       (emergencia)
            ├── vet-dashboard → VetDashboard.tsx    (panel vet, mock)
            └── notifications → Notifications.tsx   (mock)
```

---

## 6. Entidades y Relaciones (DER Lógico)

```
┌─────────────┐       ┌──────────────┐
│    User     │       │   Perfil     │
│  (Django)   │1────1│              │
│ username    │       │  telefono    │
│ email       │       └──────────────┘
│ first_name  │
│ password    │1
└─────────────┘ │
                │
                │
         ┌──────┘
         │
         ▼
  ┌──────────────┐       ┌────────────────┐       ┌────────────────┐
  │   Mascota    │       │    Turno       │       │  Veterinaria   │
  ├──────────────┤       ├────────────────┤       ├────────────────┤
  │ nombre       │       │ fecha_hora     │       │ nombre         │
  │ especie      │N──────│ motivo         │──────N│ direccion      │
  │ raza         │       │ (unique_tog.)  │       │ telefono       │
  │ edad         │       └────────────────┘       └────────────────┘
  │ peso         │
  │ tipo_pelo    │
  │ color_pelo   │
  │ dueño (FK)───│──User
  └──────────────┘
```

---

## 7. Decisiones Técnicas

| Decisión | Alternativa | Motivo |
|---|---|---|
| **Session auth** vs JWT | JWT es más común en SPA | Simplicidad: Django tiene session auth built-in, sin librerías extra |
| **Vite proxy** vs CORS separado | Proxy en producción | Para desarrollo, evita configurar CORS con credenciales complejas |
| **ModelViewSet** vs APIView | APIView da más control | DRF ViewSet provee CRUD completo con 4 líneas de código |
| **PostgreSQL** vs SQLite | SQLite más simple | Requerimiento de PostgreSQL como motor de base de datos |
| **Radix UI** vs Material UI | MUI más completo | Radix es headless, permite diseño 100% personalizado con Tailwind |
| **csplit** `/api/` | Sin proxy | Necesario para evitar CORS en desarrollo con cookies de sesión |

---

## 8. Seguridad

- **CSRF**: Token doble (cookie + header) en todas las mutaciones
- **XSS**: React escapa HTML por defecto
- **Contraseñas**: Hash PBKDF2 + salt (Django default)
- **CORS**: Orígenes restringidos a localhost:5173
- **Sesión**: Cookie `sessionid` con `httponly` (no accesible desde JS)
