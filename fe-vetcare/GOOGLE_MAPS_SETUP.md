# Configuración de Google Maps API

Para usar el mapa interactivo con búsqueda de direcciones reales en Vet Care, necesitas configurar una API Key de Google Maps.

## Pasos para obtener tu API Key (GRATIS)

### 1. Crear una cuenta en Google Cloud Console
- Visita [Google Cloud Console](https://console.cloud.google.com/)
- Inicia sesión con tu cuenta de Google
- Acepta los términos de servicio

### 2. Crear un nuevo proyecto
- Haz clic en "Seleccionar proyecto" en la parte superior
- Clic en "Nuevo proyecto"
- Dale un nombre (ej: "Vet Care App")
- Haz clic en "Crear"

### 3. Habilitar las APIs necesarias
- En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
- Busca y habilita las siguientes APIs:
  - **Maps JavaScript API** (obligatoria)
  - **Places API** (para autocompletado de direcciones)
  - **Geocoding API** (para búsqueda de direcciones)

### 4. Crear credenciales (API Key)
- Ve a "APIs y servicios" > "Credenciales"
- Haz clic en "+ CREAR CREDENCIALES"
- Selecciona "Clave de API"
- Copia la API Key generada

### 5. Configurar restricciones (IMPORTANTE para seguridad)
- Haz clic en tu API Key recién creada
- En "Restricciones de aplicación", selecciona "Referentes HTTP"
- Agrega tus dominios permitidos:
  ```
  localhost:*
  *.figma.site/*
  tu-dominio.com/*
  ```
- En "Restricciones de API", selecciona "Restringir clave"
- Marca solo las APIs que habilitaste en el paso 3
- Guarda los cambios

### 6. Configurar la API Key en la app
- Abre el archivo: `src/app/components/Map.tsx`
- En la línea 6, reemplaza:
  ```typescript
  const GOOGLE_MAPS_API_KEY = "YOUR_API_KEY_HERE";
  ```
  Por tu API Key real:
  ```typescript
  const GOOGLE_MAPS_API_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  ```

## Límites gratuitos de Google Maps

Google ofrece **$200 USD de crédito gratuito mensual**, que incluye:
- ~28,000 cargas de mapas
- ~40,000 solicitudes de geocodificación
- ~17,000 solicitudes de autocompletado

Para una app pequeña/mediana, esto es completamente GRATIS.

## Verificación

Una vez configurada tu API Key:
1. Guarda el archivo `Map.tsx`
2. Recarga la aplicación
3. El mapa de Google Maps debería cargarse correctamente
4. Prueba escribir una dirección en el buscador
5. Deberías ver sugerencias mientras escribes

## Solución de problemas

**Error: "This page can't load Google Maps correctly"**
- Verifica que hayas habilitado todas las APIs necesarias
- Revisa que tu API Key esté correctamente copiada
- Asegúrate de que no haya espacios extras en la clave

**No aparecen sugerencias al buscar**
- Verifica que Places API esté habilitada
- Revisa la consola del navegador para ver errores específicos

**El mapa no se centra en mi búsqueda**
- Verifica que Geocoding API esté habilitada
- Prueba con direcciones completas (calle, número, ciudad)

## Notas importantes

- ⚠️ NUNCA compartas tu API Key públicamente en GitHub o repositorios públicos
- ✅ Usa siempre restricciones de dominio para mayor seguridad
- 💰 Con el tier gratuito es suficiente para la mayoría de apps
- 🔒 Considera usar variables de entorno en producción

---

¿Necesitas ayuda? Revisa la [documentación oficial de Google Maps](https://developers.google.com/maps/documentation/javascript/get-api-key)
