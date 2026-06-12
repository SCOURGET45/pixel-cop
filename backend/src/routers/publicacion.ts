import express from "express";
import Publicacion from "../models/publicacion";

const router = express.Router();

/* ==========================================
   OBTENER TODAS LAS PUBLICACIONES
========================================== */
router.get("/", async (req, res) => {
  try {

    const publicaciones = await Publicacion.find()
      .populate("Usuario", "Nombre Usuario correo")
      .populate("Proyecto", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(publicaciones);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las publicaciones",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PUBLICACIÓN POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {

    const publicacion = await Publicacion.findById(req.params.id)
      .populate("Usuario", "Nombre Usuario correo")
      .populate("Proyecto", "title");

    if (!publicacion) {
      return res.status(404).json({
        mensaje: "Publicación no encontrada"
      });
    }

    res.status(200).json(publicacion);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener la publicación",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR PUBLICACIÓN
========================================== */
router.post("/", async (req, res) => {
  try {

    const nuevaPublicacion = new Publicacion({
      Proyecto: req.body.Proyecto,
      Usuario: req.body.Usuario,
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      estado: req.body.estado
    });

    const publicacionGuardada = await nuevaPublicacion.save();

    res.status(201).json({
      mensaje: "Publicación creada correctamente",
      publicacion: publicacionGuardada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al crear la publicación",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR PUBLICACIÓN
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const publicacionActualizada = await Publicacion.findByIdAndUpdate(
      req.params.id,
      {
        Proyecto: req.body.Proyecto,
        Usuario: req.body.Usuario,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        estado: req.body.estado
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!publicacionActualizada) {
      return res.status(404).json({
        mensaje: "Publicación no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Publicación actualizada correctamente",
      publicacion: publicacionActualizada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar la publicación",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR PUBLICACIÓN
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const publicacionEliminada = await Publicacion.findByIdAndDelete(
      req.params.id
    );

    if (!publicacionEliminada) {
      return res.status(404).json({
        mensaje: "Publicación no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Publicación eliminada correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar la publicación",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PUBLICACIONES PUBLICADAS
========================================== */
router.get("/estado/publicado", async (req, res) => {
  try {

    const publicaciones = await Publicacion.find({
      estado: "publicado"
    })
      .populate("Usuario", "Nombre Usuario")
      .populate("Proyecto", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(publicaciones);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las publicaciones publicadas",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PUBLICACIONES DE UN USUARIO
========================================== */
router.get("/usuario/:usuarioId", async (req, res) => {
  try {

    const publicaciones = await Publicacion.find({
      Usuario: req.params.usuarioId
    })
      .populate("Proyecto", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(publicaciones);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las publicaciones del usuario",
      error: err.message
    });
  }
});

/* ==========================================
   CAMBIAR ESTADO DE PUBLICACIÓN
========================================== */
router.patch("/:id/estado", async (req, res) => {
  try {

    const publicacion = await Publicacion.findByIdAndUpdate(
      req.params.id,
      {
        estado: req.body.estado
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!publicacion) {
      return res.status(404).json({
        mensaje: "Publicación no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Estado actualizado correctamente",
      publicacion
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar el estado",
      error: err.message
    });
  }
});

export default router;