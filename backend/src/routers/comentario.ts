import express from "express";
import Comentario from "../models/comentario";

const router = express.Router();

/* ==========================================
   OBTENER TODOS LOS COMENTARIOS
========================================== */
router.get("/", async (req, res) => {
  try {

    const comentarios = await Comentario.find()
      .populate("Usuario", "Nombre Correo")
      .populate("Proyecto", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(comentarios);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener los comentarios",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER COMENTARIO POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {

    const comentario = await Comentario.findById(req.params.id)
      .populate("Usuario", "Nombre Correo")
      .populate("Proyecto", "title");

    if (!comentario) {
      return res.status(404).json({
        mensaje: "Comentario no encontrado"
      });
    }

    res.status(200).json(comentario);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener el comentario",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR COMENTARIO
========================================== */
router.post("/", async (req, res) => {
  try {

    const nuevoComentario = new Comentario({
      Usuario: req.body.Usuario,
      Proyecto: req.body.Proyecto,
      comentario: req.body.comentario
    });

    const comentarioGuardado = await nuevoComentario.save();

    res.status(201).json({
      mensaje: "Comentario creado correctamente",
      comentario: comentarioGuardado
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al crear el comentario",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR COMENTARIO
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const comentarioActualizado = await Comentario.findByIdAndUpdate(
      req.params.id,
      {
        Usuario: req.body.Usuario,
        Proyecto: req.body.Proyecto,
        comentario: req.body.comentario
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!comentarioActualizado) {
      return res.status(404).json({
        mensaje: "Comentario no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Comentario actualizado correctamente",
      comentario: comentarioActualizado
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar el comentario",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR COMENTARIO
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const comentarioEliminado = await Comentario.findByIdAndDelete(
      req.params.id
    );

    if (!comentarioEliminado) {
      return res.status(404).json({
        mensaje: "Comentario no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Comentario eliminado correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar el comentario",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER COMENTARIOS POR PROYECTO
========================================== */
router.get("/proyecto/:proyectoId", async (req, res) => {
  try {

    const comentarios = await Comentario.find({
      Proyecto: req.params.proyectoId
    })
      .populate("Usuario", "Nombre Correo")
      .sort({ createdAt: -1 });

    res.status(200).json(comentarios);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener los comentarios del proyecto",
      error: err.message
    });
  }
});

export default router;