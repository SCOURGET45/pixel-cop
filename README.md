# Pixel Art Studio - Documentación del Proyecto

## Descripción
Pixel Art Studio es una aplicación web para crear arte pixelado con soporte para capas, herramientas avanzadas (lápiz, goma, bote de pintura), autenticación de usuarios, guardado en la nube y una galería comunitaria.

## Stack Tecnológico
- **Frontend**: HTML5, CSS3, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)

## Estructura de Carpetas

```
/workspace
├── frontend/                 # Aplicación cliente
│   ├── index.html           # Página principal del editor
│   ├── comunidad.html       # Galería comunitaria
│   ├── comunidad.css        # Estilos de la galería
│   ├── src/
│   │   ├── main.ts          # Lógica principal del editor
│   │   ├── auth.ts          # Autenticación frontend
│   │   ├── tools.ts         # Herramientas de dibujo
│   │   ├── layers.ts        # Sistema de capas
│   │   ├── comunidad.ts     # Lógica de la galería
│   │   ├── style.css        # Estilos principales
│   │   └── assets/          # Recursos estáticos
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.js
│
├── backend/                  # Servidor API
│   └── src/
│       ├── index.ts         # Punto de entrada del servidor
│       ├── models/
│       │   ├── user.ts      # Modelo de usuario
│       │   └── project.ts   # Modelo de proyectos/dibujos
│       ├── routers/
│       │   ├── auth.ts      # Rutas de autenticación
│       │   └── project.ts   # Rutas de proyectos
│       ├── .env             # Variables de entorno
│       ├── package.json
│       └── tsconfig.json
│
├── database/                 # Scripts de base de datos
│   └── (scripts de migración si son necesarios)
│
├── docs/                     # Documentación
│   └── README_IMPLEMENTACION.md
│
└── README.md                 # Este archivo
```

## Instalación

### Requisitos Previos
- Node.js >= 18.x
- MongoDB (local o Atlas)
- npm o yarn

### Paso 1: Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd pixel-art-studio
```

### Paso 2: Configurar el Backend

```bash
cd backend/src
npm install
```

Crear archivo `.env` en `backend/src/`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pixelart
JWT_SECRET=tu_secreto_muy_seguro
FRONTEND_URL=http://localhost:5173
```

### Paso 3: Configurar el Frontend

```bash
cd ../../frontend
npm install
```

### Paso 4: Iniciar MongoDB
Asegúrate de tener MongoDB corriendo:
```bash
# Linux/Mac
mongod

# O usa Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Ejecución

### Terminal 1: Backend
```bash
cd backend/src
npm run dev
# El servidor correrá en http://localhost:3000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# La aplicación correrá en http://localhost:5173
```

## Características

### Editor de Pixel Art
- 🎨 Lienzo basado en Canvas API para alto rendimiento
- 🖌️ Herramientas: Lápiz, Goma, Bote de Pintura (Flood Fill)
- 📑 Sistema de capas múltiple
- 🎯 Selector de colores RGB/HEX
- 💾 Exportar como PNG

### Autenticación
- Registro e inicio de sesión de usuarios
- Tokens JWT para sesiones seguras
- Persistencia de sesión

### Guardado en la Nube
- Guardar proyectos en MongoDB
- Almacenamiento de imágenes en Base64
- Generación automática de thumbnails
- Proyectos públicos/privados

### Galería Comunitaria
- Explorar dibujos públicos de otros usuarios
- Vista detallada con modal
- Descarga de obras
- Tarjetas responsive con información del autor

## Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Proyectos
- `GET /api/projects` - Obtener todos los proyectos públicos
- `GET /api/projects/my` - Obtener mis proyectos (autenticado)
- `GET /api/projects/:id` - Obtener proyecto por ID
- `POST /api/projects` - Crear nuevo proyecto (autenticado)
- `PUT /api/projects/:id` - Actualizar proyecto (autenticado)
- `DELETE /api/projects/:id` - Eliminar proyecto (autenticado)

## Desarrollo

### Agregar nuevas herramientas
Editar `frontend/src/tools.ts` para implementar nuevas funcionalidades de dibujo.

### Modificar el esquema de datos
Actualizar modelos en `backend/src/models/` y ejecutar migraciones si es necesario.

### Cambiar estilos
Los archivos CSS están en `frontend/src/style.css` y `frontend/comunidad.css`.

## Solución de Problemas

### Error de conexión a MongoDB
- Verifica que MongoDB esté corriendo
- Revisa la URI en `.env`
- Comprueba credenciales si usas MongoDB Atlas

### Error de CORS
- Asegúrate de que `FRONTEND_URL` en `.env` coincida con la URL del frontend
- Verifica la configuración de CORS en `backend/src/index.ts`

### Errores de compilación TypeScript
- Ejecuta `npm install` en ambos directorios
- Verifica la versión de TypeScript en `tsconfig.json`

## Licencia
MIT License - Ver archivo LICENSE si existe.

## Contribución
1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

---
**Equipo de Desarrollo** - Pixel Art Studio © 2024
