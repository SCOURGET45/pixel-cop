import express from "express";
import Reaccion from "../models/reaccion";

const router = express.Router();

/* ==========================================
   OBTENER TODAS LAS REACCIONES
========================================== */
router.get("/", async (req, res) => {
  try {

    const reacciones = await Reaccion.find()
      .populate("Usuario", "Nombre Usuario correo")
      .populate("Proyecto", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(reacciones);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las reacciones",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER REACCIÓN POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {

    const reaccion = await Reaccion.findById(req.params.id)
      .populate("Usuario", "Nombre Usuario correo")
      .populate("Proyecto", "title");

    if (!reaccion) {
      return res.status(404).json({
        mensaje: "Reacción no encontrada"
      });
    }

    res.status(200).json(reaccion);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener la reacción",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR REACCIÓN
========================================== */
router.post("/", async (req, res) => {
  try {

    const reaccionExistente = await Reaccion.findOne({
      Usuario: req.body.Usuario,
      Proyecto: req.body.Proyecto,
      tipo: req.body.tipo
    });

    if (reaccionExistente) {
      return res.status(400).json({
        mensaje: "La reacción ya existe"
      });
    }

    const nuevaReaccion = new Reaccion({
      Usuario: req.body.Usuario,
      Proyecto: req.body.Proyecto,
      tipo: req.body.tipo
    });

    const reaccionGuardada = await nuevaReaccion.save();

    res.status(201).json({
      mensaje: "Reacción creada correctamente",
      reaccion: reaccionGuardada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al crear la reacción",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR REACCIÓN
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const reaccionActualizada = await Reaccion.findByIdAndUpdate(
      req.params.id,
      {
        Usuario: req.body.Usuario,
        Proyecto: req.body.Proyecto,
        tipo: req.body.tipo
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!reaccionActualizada) {
      return res.status(404).json({
        mensaje: "Reacción no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Reacción actualizada correctamente",
      reaccion: reaccionActualizada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar la reacción",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR REACCIÓN
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const reaccionEliminada = await Reaccion.findByIdAndDelete(
      req.params.id
    );

    if (!reaccionEliminada) {
      return res.status(404).json({
        mensaje: "Reacción no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Reacción eliminada correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar la reacción",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER REACCIONES DE UN PROYECTO
========================================== */
router.get("/proyecto/:proyectoId", async (req, res) => {
  try {

    const reacciones = await Reaccion.find({
      Proyecto: req.params.proyectoId
    })
      .populate("Usuario", "Nombre Usuario");

    res.status(200).json(reacciones);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las reacciones del proyecto",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER REACCIONES DE UN USUARIO
========================================== */
router.get("/usuario/:usuarioId", async (req, res) => {
  try {

    const reacciones = await Reaccion.find({
      Usuario: req.params.usuarioId
    })
      .populate("Proyecto", "title");

    res.status(200).json(reacciones);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las reacciones del usuario",
      error: err.message
    });
  }
});

/* ==========================================
   CONTAR LIKES DE UN PROYECTO
========================================== */
router.get("/proyecto/:proyectoId/likes", async (req, res) => {
  try {

    const totalLikes = await Reaccion.countDocuments({
      Proyecto: req.params.proyectoId,
      tipo: "like"
    });

    res.status(200).json({
      totalLikes
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al contar los likes",
      error: err.message
    });
  }
});

/* ==========================================
   CONTAR FAVORITOS DE UN PROYECTO
========================================== */
router.get("/proyecto/:proyectoId/favoritos", async (req, res) => {
  try {

    const totalFavoritos = await Reaccion.countDocuments({
      Proyecto: req.params.proyectoId,
      tipo: "favorito"
    });

    res.status(200).json({
      totalFavoritos
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al contar los favoritos",
      error: err.message
    });
  }
});

export default router;