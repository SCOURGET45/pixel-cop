import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import routers
import inicioSesionRouter from "./routers/inicio_sesion";
import portafolioRouter from "./routers/portafolio";
import projectRouter from "./routers/project";
import artWorkRouter from "./routers/artWork";
import categoriaRouter from "./routers/categoria";
import comentarioRouter from "./routers/comentario";
import imagenRouter from "./routers/imagen";
import passwordRRouter from "./routers/passwordR";
import publicacionRouter from "./routers/publicacion";
import reaccionRouter from "./routers/reaccion";
import paletaColoresRouter from "./routers/Paleta_Colores";
import pixelCopRouter from "./routers/pixel-cop";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pixelart";

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.0.123:5173',
    'http://192.168.0.123:5174',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    /http:\/\/192\.168\.\d+\.\d+:\d+/, // Cualquier IP en la red local 192.168.x.x
    /http:\/\/10\.\d+\.\d+\.\d+:\d+/   // Cualquier IP en la red local 10.x.x.x
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Manejador de errores personalizado para body-parser ANTES de las rutas
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === 'entity.too.large' || err.message?.includes('too large')) {
    console.warn('⚠️ Payload demasiado grande:', err);
    return res.status(413).json({ 
      error: 'La imagen es demasiado grande', 
      message: 'Intenta reducir el tamaño del lienzo o usar menos capas',
      suggestion: 'Usa la herramienta "Redimensionar lienzo" para disminuir las dimensiones'
    });
  }
  next(err);
});

// Aumentamos el límite para permitir imágenes base64 grandes (hasta 200MB)
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Manejo de errores global para asegurar respuestas JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error global:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'La imagen es demasiado grande. Intenta reducir el tamaño del lienzo.' });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Database connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error al conectar MongoDB:", err));

// Routes
app.use("/api/inicio-sesion", inicioSesionRouter);
app.use("/api/portafolio", portafolioRouter);
app.use("/api/projects", projectRouter);
app.use("/api/artwork", artWorkRouter);
app.use("/api/categoria", categoriaRouter);
app.use("/api/comentario", comentarioRouter);
app.use("/api/imagen", imagenRouter);
app.use("/api/password-r", passwordRRouter);
app.use("/api/publicacion", publicacionRouter);
app.use("/api/reaccion", reaccionRouter);
app.use("/api/paleta-colores", paletaColoresRouter);
app.use("/api/pixel-cop", pixelCopRouter);

// Health check
app.get("/", (req, res) => {
    res.send("API de Error404 Studio funcionando");
});

// Start server
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});