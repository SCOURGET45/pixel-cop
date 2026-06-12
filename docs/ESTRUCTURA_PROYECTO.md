# Estructura del Proyecto - Pixel Art Studio

## Organización de Carpetas

```
/workspace
├── frontend/                 # Aplicación cliente (Vite + TypeScript)
│   ├── index.html           # Página principal del editor
│   ├── comunidad.html       # Galería comunitaria
│   ├── comunidad.css        # Estilos específicos de la galería
│   ├── package.json         # Dependencias del frontend
│   ├── tsconfig.json        # Configuración de TypeScript
│   ├── vite.config.js       # Configuración de Vite
│   ├── public/              # Archivos estáticos públicos
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/                 # Código fuente TypeScript/CSS
│       ├── main.ts          # Lógica principal del editor
│       ├── auth.ts          # Manejo de autenticación frontend
│       ├── tools.ts         # Herramientas de dibujo (pincel, goma, bote)
│       ├── layers.ts        # Sistema de capas múltiple
│       ├── comunidad.ts     # Lógica de la galería comunitaria
│       ├── style.css        # Estilos principales
│       ├── index.css        # Estilos base
│       └── assets/          # Recursos adicionales
│
├── backend/                  # Servidor API (Node.js + Express + TypeScript)
│   └── src/
│       ├── index.ts         # Punto de entrada del servidor
│       ├── .env             # Variables de entorno (no commitear)
│       ├── package.json     # Dependencias del backend
│       ├── tsconfig.json    # Configuración de TypeScript
│       ├── models/          # Modelos de Mongoose
│       │   ├── project.ts   # Modelo de proyectos/dibujos
│       │   ├── Inicio_sesion.ts  # Modelo de usuarios
│       │   ├── artWork.ts   # Modelo de obras de arte
│       │   ├── categoria.ts # Modelo de categorías
│       │   ├── comentario.ts# Modelo de comentarios
│       │   ├── imagen.ts    # Modelo de imágenes
│       │   ├── portafolio.ts# Modelo de portafolios
│       │   └── ...          # Otros modelos
│       ├── routers/         # Rutas de la API
│       │   ├── project.ts   # Rutas CRUD de proyectos
│       │   ├── inicio_sesion.ts  # Rutas de autenticación
│       │   ├── artWork.ts   # Rutas de obras
│       │   ├── portafolio.ts# Rutas de portafolio
│       │   └── ...          # Otras rutas
│       └── node_modules/    # Dependencias instaladas
│
├── database/                 # Scripts de base de datos
│   └── (scripts SQL/migraciones futuros)
│
├── docs/                     # Documentación del proyecto
│   ├── README_IMPLEMENTACION.md  # Guía de implementación original
│   └── ESTRUCTURA_PROYECTO.md    # Este archivo
│
├── README.md                 # Documentación principal (guía de instalación)
├── requirements.txt          # Dependencias Python (referencia futura)
└── .gitignore               # Archivos ignorados por Git
```

## Flujo de Trabajo

### 1. Desarrollo Frontend
```bash
cd frontend
npm run dev
# Abre http://localhost:5173
```

### 2. Desarrollo Backend
```bash
cd backend/src
npm run dev
# Servidor en http://localhost:3000
```

### 3. Base de Datos
Asegúrate de tener MongoDB corriendo:
```bash
# Local
mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Endpoints Principales

### Autenticación (`/api/inicio-sesion`)
- `POST /registro` - Crear usuario
- `POST /login` - Iniciar sesión

### Proyectos (`/api/projects`)
- `GET /` - Listar proyectos públicos
- `GET /my` - Mis proyectos (autenticado)
- `GET /:id` - Obtener proyecto
- `POST /` - Crear proyecto (autenticado)
- `PUT /:id` - Actualizar proyecto (autenticado)
- `DELETE /:id` - Eliminar proyecto (autenticado)

## Consideraciones de Seguridad

1. **Variables de Entorno**: El archivo `.env` nunca debe subirse al repositorio
2. **JWT Secret**: Cambiar el valor por defecto en producción
3. **CORS**: Configurar correctamente los orígenes permitidos
4. **Validación**: Validar todos los inputs del lado del servidor

## Próximos Pasos Sugeridos

1. Agregar tests unitarios y de integración
2. Implementar rate limiting en la API
3. Agregar paginación a la galería comunitaria
4. Implementar búsqueda y filtrado de proyectos
5. Agregar sistema de likes/comentarios
6. Optimizar almacenamiento de imágenes (usar CDN o S3)
