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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pixelart";

// Middleware
app.use(cors());
app.use(express.json());

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

// Health check
app.get("/", (req, res) => {
    res.send("API de PixelArt Studio funcionando");
});

// Start server
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});