import express from "express";
import PaletaColores from "../models/Paleta_Colores";

const router = express.Router();

/* ==========================================
   OBTENER TODAS LAS PALETAS
========================================== */
router.get("/", async (req, res) => {
  try {

    const paletas = await PaletaColores.find()
      .populate("Usuario", "Nombre Usuario correo")
      .sort({ createdAt: -1 });

    res.status(200).json(paletas);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las paletas",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PALETA POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {

    const paleta = await PaletaColores.findById(req.params.id)
      .populate("Usuario", "Nombre Usuario correo");

    if (!paleta) {
      return res.status(404).json({
        mensaje: "Paleta no encontrada"
      });
    }

    res.status(200).json(paleta);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener la paleta",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR PALETA
========================================== */
router.post("/", async (req, res) => {
  try {

    const nuevaPaleta = new PaletaColores({
      name: req.body.name,
      description: req.body.description,
      colors: req.body.colors,
      Usuario: req.body.Usuario,
      isPublic: req.body.isPublic
    });

    const paletaGuardada = await nuevaPaleta.save();

    res.status(201).json({
      mensaje: "Paleta creada correctamente",
      paleta: paletaGuardada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al crear la paleta",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR PALETA
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const paletaActualizada = await PaletaColores.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        colors: req.body.colors,
        Usuario: req.body.Usuario,
        isPublic: req.body.isPublic
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!paletaActualizada) {
      return res.status(404).json({
        mensaje: "Paleta no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Paleta actualizada correctamente",
      paleta: paletaActualizada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar la paleta",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR PALETA
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const paletaEliminada = await PaletaColores.findByIdAndDelete(
      req.params.id
    );

    if (!paletaEliminada) {
      return res.status(404).json({
        mensaje: "Paleta no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Paleta eliminada correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar la paleta",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PALETAS PÚBLICAS
========================================== */
router.get("/public/list", async (req, res) => {
  try {

    const paletas = await PaletaColores.find({
      isPublic: true
    })
      .populate("Usuario", "Nombre Usuario")
      .sort({ createdAt: -1 });

    res.status(200).json(paletas);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las paletas públicas",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PALETAS DE UN USUARIO
========================================== */
router.get("/usuario/:usuarioId", async (req, res) => {
  try {

    const paletas = await PaletaColores.find({
      Usuario: req.params.usuarioId
    })
      .sort({ createdAt: -1 });

    res.status(200).json(paletas);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las paletas del usuario",
      error: err.message
    });
  }
});

export default router;