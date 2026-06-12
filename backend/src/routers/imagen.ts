import express from "express";
import Imagen from "../models/imagen";

const router = express.Router();

/* ==========================================
   OBTENER TODAS LAS IMÁGENES
========================================== */
router.get("/", async (req, res) => {
  try {

    const imagenes = await Imagen.find()
      .populate("Proyecto", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(imagenes);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las imágenes",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER IMAGEN POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {

    const imagen = await Imagen.findById(req.params.id)
      .populate("Proyecto", "title");

    if (!imagen) {
      return res.status(404).json({
        mensaje: "Imagen no encontrada"
      });
    }

    res.status(200).json(imagen);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener la imagen",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR IMAGEN
========================================== */
router.post("/", async (req, res) => {
  try {

    const nuevaImagen = new Imagen({
      Proyecto: req.body.Proyecto,
      url: req.body.url,
      nombre: req.body.nombre
    });

    const imagenGuardada = await nuevaImagen.save();

    res.status(201).json({
      mensaje: "Imagen creada correctamente",
      imagen: imagenGuardada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al crear la imagen",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR IMAGEN
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const imagenActualizada = await Imagen.findByIdAndUpdate(
      req.params.id,
      {
        Proyecto: req.body.Proyecto,
        url: req.body.url,
        nombre: req.body.nombre
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!imagenActualizada) {
      return res.status(404).json({
        mensaje: "Imagen no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Imagen actualizada correctamente",
      imagen: imagenActualizada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar la imagen",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR IMAGEN
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const imagenEliminada = await Imagen.findByIdAndDelete(
      req.params.id
    );

    if (!imagenEliminada) {
      return res.status(404).json({
        mensaje: "Imagen no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Imagen eliminada correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar la imagen",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER IMÁGENES POR PROYECTO
========================================== */
router.get("/proyecto/:proyectoId", async (req, res) => {
  try {

    const imagenes = await Imagen.find({
      Proyecto: req.params.proyectoId
    })
      .populate("Proyecto", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(imagenes);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las imágenes del proyecto",
      error: err.message
    });
  }
});

export default router;