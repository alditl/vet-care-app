# Documento de Instalación — VetCare

## Requisitos del Sistema

- **Python** 3.12 o superior
- **Node.js** 18+ y npm (o pnpm)
- **PostgreSQL** 18 instalado y corriendo
- **Git**

---

## 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd vet-care-app
```

---

## 2. Base de Datos (PostgreSQL)

### 2.1. Iniciar PostgreSQL

Abrir **pgAdmin** o terminal y asegurarse de que el servicio de PostgreSQL esté corriendo.

### 2.2. Crear la Base de Datos

```sql
CREATE DATABASE vetcare_bd;
```

### 2.3. Configurar Usuario

Por defecto la aplicación usa:

| Parámetro | Valor |
|---|---|
| Host | `127.0.0.1` |
| Puerto | `5432` |
| Usuario | `postgres` |
| Contraseña | `cachetes` |
| Base de datos | `vetcare_bd` |

Si tu PostgreSQL tiene otra contraseña, editá el archivo `VetCareFinal/core/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'vetcare_bd',
        'USER': 'postgres',
        'PASSWORD': 'tu_contraseña',  # <-- cambiá acá
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}
```

---

## 3. Backend (Django)

### 3.1. Crear y Activar Entorno Virtual

```bash
python -m venv VetCareFinal/env
```

**PowerShell:**
```powershell
VetCareFinal\env\Scripts\Activate.ps1
```

**CMD:**
```cmd
VetCareFinal\env\Scripts\activate.bat
```

**Git Bash / Linux:**
```bash
source VetCareFinal/env/bin/activate
```

### 3.2. Instalar Dependencias

```bash
pip install django djangorestframework django-cors-headers psycopg2-binary
```

### 3.3. Ejecutar Migraciones

```bash
python VetCareFinal/manage.py makemigrations
python VetCareFinal/manage.py migrate
```

### 3.4. (Opcional) Sembrar Datos de Prueba

```bash
python VetCareFinal/manage.py seed_data
```

Esto crea:
- **8 veterinarias** en CABA
- **1 usuario demo**: `macarena@test.com` / contraseña `123456`
- **1 mascota demo**: Galia (Perro, Caniche, 3 años)

### 3.5. Iniciar el Servidor

```bash
python VetCareFinal/manage.py runserver
```

El backend queda disponible en `http://localhost:8000/`.

---

## 4. Frontend (React + Vite)

### 4.1. Instalar Dependencias

```bash
cd fe-vetcare
npm install
```

### 4.2. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El frontend queda disponible en `http://localhost:5173/`.

El proxy de Vite redirige las llamadas a `/api/*` hacia `http://localhost:8000` (backend Django).

---

## 5. Acceder a la Aplicación

| URL | Descripción |
|---|---|
| `http://localhost:5173/` | Frontend (redirige a login) |
| `http://localhost:8000/admin/` | Panel admin de Django |
| `http://localhost:8000/api/` | API REST (navegable) |

### Usuarios

| Tipo | Email | Contraseña |
|---|---|---|
| Demo | `macarena@test.com` | `123456` |
| Admin | Crear con `createsuperuser` | — |

### Crear Usuario Admin (opcional)

```bash
python VetCareFinal/manage.py createsuperuser
```

---

## 6. Script Rápido (todo en uno)

**PowerShell:**
```powershell
# Backend
python -m venv VetCareFinal/env
VetCareFinal\env\Scripts\Activate.ps1
pip install django djangorestframework django-cors-headers psycopg2-binary
python VetCareFinal/manage.py migrate
python VetCareFinal/manage.py seed_data
Start-Process powershell -ArgumentList "python VetCareFinal/manage.py runserver"

# Frontend
cd fe-vetcare
npm install
npm run dev
```

---

## 7. Solución de Problemas

### Error: `connection to server at "127.0.0.1", port 5432 failed`
→ PostgreSQL no está corriendo. Iniciar el servicio de PostgreSQL.

### Error: `database "vetcare_bd" does not exist`
→ Crear la base de datos con `CREATE DATABASE vetcare_bd;`.

### Error: `ModuleNotFoundError: No module named 'rest_framework'`
→ Faltó instalar dependencias: `pip install djangorestframework django-cors-headers`.

### Error CORS en el navegador
→ Verificar que el backend esté en `localhost:8000` y el frontend en `localhost:5173`.
→ El proxy de Vite (`vite.config.ts`) debe estar configurado correctamente.

### Error CSRF: `403 Forbidden`
→ Asegurarse de que el frontend envíe el header `X-CSRFToken` y `credentials: 'include'`.
→ La cookie `csrftoken` se setea automáticamente al cargar cualquier página del backend.

### Error: `Role "postgres" does not exist`
→ En Windows, el usuario por defecto suele ser el nombre de usuario de la sesión. Crear el rol o cambiar el `USER` en `settings.py`.
