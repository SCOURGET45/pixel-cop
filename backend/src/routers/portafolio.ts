import express from "express";
import Portafolio from "../models/portafolio";

const router = express.Router();

/* ==========================================
   OBTENER TODOS LOS PORTAFOLIOS
========================================== */
router.get("/", async (req, res) => {
  try {

    const portafolios = await Portafolio.find()
      .populate("Usuario", "Nombre Usuario correo");

    res.status(200).json(portafolios);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener los portafolios",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PORTAFOLIO POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {

    const portafolio = await Portafolio.findById(req.params.id)
      .populate("Usuario", "Nombre Usuario correo");

    if (!portafolio) {
      return res.status(404).json({
        mensaje: "Portafolio no encontrado"
      });
    }

    res.status(200).json(portafolio);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener el portafolio",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR PORTAFOLIO
========================================== */
router.post("/", async (req, res) => {
  try {

    const nuevoPortafolio = new Portafolio({
      Usuario: req.body.Usuario,
      descripcion: req.body.descripcion
    });

    const portafolioGuardado = await nuevoPortafolio.save();

    res.status(201).json({
      mensaje: "Portafolio creado correctamente",
      portafolio: portafolioGuardado
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al crear el portafolio",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR PORTAFOLIO
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const portafolioActualizado = await Portafolio.findByIdAndUpdate(
      req.params.id,
      {
        Usuario: req.body.Usuario,
        descripcion: req.body.descripcion
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!portafolioActualizado) {
      return res.status(404).json({
        mensaje: "Portafolio no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Portafolio actualizado correctamente",
      portafolio: portafolioActualizado
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar el portafolio",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR PORTAFOLIO
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const portafolioEliminado = await Portafolio.findByIdAndDelete(
      req.params.id
    );

    if (!portafolioEliminado) {
      return res.status(404).json({
        mensaje: "Portafolio no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Portafolio eliminado correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar el portafolio",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PORTAFOLIO POR USUARIO
========================================== */
router.get("/usuario/:usuarioId", async (req, res) => {
  try {

    const portafolio = await Portafolio.findOne({
      Usuario: req.params.usuarioId
    }).populate("Usuario", "Nombre Usuario correo");

    if (!portafolio) {
      return res.status(404).json({
        mensaje: "Portafolio no encontrado para este usuario"
      });
    }

    res.status(200).json(portafolio);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener el portafolio del usuario",
      error: err.message
    });
  }
});

export default router;