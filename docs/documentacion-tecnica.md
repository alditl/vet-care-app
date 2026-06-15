# Documentación Técnica — VetCare

## 1. Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|---|---|---|
| Python | 3.12 | Lenguaje de programación |
| Django | 5.2 | Framework web |
| Django REST Framework | — | API REST |
| django-cors-headers | — | Middleware CORS |
| psycopg2-binary | — | Driver PostgreSQL |
| PostgreSQL | 18 | Base de datos |

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.3.1 | Biblioteca UI |
| TypeScript | — | Tipado estático |
| Vite | 6.3.5 | Bundler / dev server |
| React Router | 7.13.0 | Enrutamiento SPA |
| Tailwind CSS | 4.1.12 | Estilos utilitarios |
| Radix UI | — | Componentes accesibles headless |
| Lucide React | — | Iconos |
| Recharts | — | Gráficos |
| Google Maps API | — | Mapas y geolocalización |

---

## 2. Estructura del Proyecto

```
vet-care-app/
├── VetCareFinal/                  # Backend Django
│   ├── core/                      # Configuración del proyecto
│   │   ├── settings.py            # Settings (BD, CORS, apps, etc.)
│   │   ├── urls.py                # Rutas raíz (/admin/, /api/)
│   │   ├── wsgi.py / asgi.py      # Entry points de servidores
│   │   └── __init__.py
│   ├── mascotas/                  # App principal
│   │   ├── models.py              # Modelos: Perfil, Mascota, Veterinaria, Turno
│   │   ├── serializers.py         # DRF serializers
│   │   ├── views.py               # ViewSets + vistas de autenticación
│   │   ├── urls.py                # Rutas de la API
│   │   ├── admin.py               # Registro en admin de Django
│   │   ├── management/commands/
│   │   │   └── seed_data.py       # Comando para sembrar datos demo
│   │   └── migrations/            # Migraciones de base de datos
│   ├── manage.py                  # CLI de Django
│   └── env/                       # Entorno virtual (no versionado)
│
├── fe-vetcare/                    # Frontend React
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx            # Componente raíz
│   │   │   ├── main.tsx           # Entry point
│   │   │   ├── routes.tsx         # Configuración de rutas
│   │   │   ├── components/        # Componentes de página
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Layout.tsx     # Shell con bottom nav
│   │   │   │   ├── Profile.tsx
│   │   │   │   ├── MisMascotas.tsx
│   │   │   │   ├── BookAppointment.tsx
│   │   │   │   ├── MyAppointments.tsx
│   │   │   │   ├── History.tsx
│   │   │   │   ├── Map.tsx
│   │   │   │   ├── VetReviews.tsx
│   │   │   │   ├── VetDashboard.tsx
│   │   │   │   ├── VirtualGuard.tsx
│   │   │   │   ├── Notifications.tsx
│   │   │   │   └── figma/ImageWithFallback.tsx
│   │   │   └── lib/
│   │   │       └── csrf.ts        # Helper para token CSRF
│   │   └── styles/                # Hojas de estilo
│   ├── package.json
│   └── vite.config.ts             # Proxy /api -> localhost:8000
│
├── docs/                          # Documentación
└── .gitignore
```

---

## 3. Modelos de Datos

### Perfil
| Campo | Tipo | Detalle |
|---|---|---|
| user | OneToOneField(User) | Relación 1:1 con usuario Django |
| telefono | CharField(20) | Opcional |

### Mascota
| Campo | Tipo | Detalle |
|---|---|---|
| nombre | CharField(100) | |
| especie | CharField(100) | Perro, Gato, etc. |
| raza | CharField(100) | |
| edad | IntegerField | Años |
| peso | FloatField | kg |
| tipo_pelo | CharField(100) | |
| color_pelo | CharField(100) | |
| dueño | ForeignKey(User) | Dueño de la mascota |

### Veterinaria
| Campo | Tipo | Detalle |
|---|---|---|
| nombre | CharField(200) | |
| direccion | CharField(255) | |
| telefono | CharField(20) | |

### Turno
| Campo | Tipo | Detalle |
|---|---|---|
| mascota | ForeignKey(Mascota) | Mascota asociada |
| veterinaria | ForeignKey(Veterinaria) | Veterinaria asociada |
| fecha_hora | DateTimeField | Fecha y hora del turno |
| motivo | CharField(255) | Motivo de consulta |
| **Meta: unique_together** | (veterinaria, fecha_hora) | Evita doble reserva |

---

## 4. API REST — Endpoints

### Autenticación (sesión Django)
| Método | URL | Permiso | Descripción |
|---|---|---|---|
| POST | `/api/register/` | AllowAny | Registro de usuario |
| POST | `/api/login/` | AllowAny | Inicio de sesión |
| POST | `/api/logout/` | IsAuthenticated | Cierre de sesión |
| GET | `/api/me/` | IsAuthenticated | Datos del usuario actual |

### CRUD Mascotas
| Método | URL | Descripción |
|---|---|---|
| GET | `/api/mascotas/` | Lista mascotas del usuario |
| POST | `/api/mascotas/` | Crear mascota |
| GET | `/api/mascotas/{id}/` | Detalle de mascota |
| PUT | `/api/mascotas/{id}/` | Actualizar mascota |
| PATCH | `/api/mascotas/{id}/` | Actualización parcial |
| DELETE | `/api/mascotas/{id}/` | Eliminar mascota |

### CRUD Veterinarias
| Método | URL | Descripción |
|---|---|---|
| GET | `/api/veterinarias/` | Lista todas |
| POST | `/api/veterinarias/` | Crear |
| GET | `/api/veterinarias/{id}/` | Detalle |
| PUT | `/api/veterinarias/{id}/` | Actualizar |
| DELETE | `/api/veterinarias/{id}/` | Eliminar |

### CRUD Turnos
| Método | URL | Descripción |
|---|---|---|
| GET | `/api/turnos/` | Lista todos |
| POST | `/api/turnos/` | Crear |
| GET | `/api/turnos/{id}/` | Detalle |
| DELETE | `/api/turnos/{id}/` | Cancelar |

---

## 5. Frontend — Routing

| Ruta | Componente | Descripción |
|---|---|---|
| `/login` | Login | Inicio de sesión |
| `/register` | Register | Registro de usuario |
| `/home` | Dashboard | Panel principal con 4 accesos directos |
| `/home/map` | Map | Mapa con veterinarias (Google Maps) |
| `/home/pets` | MisMascotas | Detalle y carrusel de mascotas |
| `/home/profile` | Profile | Perfil del usuario + agregar mascota |
| `/home/book` | BookAppointment | Wizard de reserva de turno (3 pasos) |
| `/home/appointments` | MyAppointments | Lista de turnos + detalle |
| `/home/history` | History | Historial de visitas (mock) |
| `/home/guard` | VirtualGuard | Página de emergencia / guardia |
| `/home/vet-dashboard` | VetDashboard | Panel de veterinaria (mock) |
| `/home/notifications` | Notifications | Notificaciones (mock) |

---

## 6. Autenticación y Seguridad

- **Autenticación por sesión**: Django `SessionMiddleware` + `login()`/`logout()`
- **CSRF**: El frontend lee el token de la cookie `csrftoken` y lo envía en el header `X-CSRFToken`
- **CORS**: Solo `localhost:5173` y `127.0.0.1:5173` permitidos con `credentials: true`
- **Contraseñas**: Hasheadas con `set_password()` de Django (PBKDF2)
- **Permisos**: `IsAuthenticated` en mascotas y turnos; `AllowAny` en register/login

---

## 7. Integraciones

| Integración | Tipo | Detalle |
|---|---|---|
| Google Maps JavaScript API | Externa | Mapa con ubicaciones de veterinarias, geolocalización del usuario, autocompletado de direcciones |
| PostgreSQL 18 | Base de datos | Persistencia de datos |
