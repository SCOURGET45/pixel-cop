import express from "express";
import TokenRecuperacion from "../models/passwordR";

const router = express.Router();

/* ==========================================
   OBTENER TODOS LOS TOKENS
========================================== */
router.get("/", async (req, res) => {
  try {

    const tokens = await TokenRecuperacion.find()
      .populate("Usuario", "Nombre Usuario correo");

    res.status(200).json(tokens);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener los tokens",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER TOKEN POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {

    const token = await TokenRecuperacion.findById(req.params.id)
      .populate("Usuario", "Nombre Usuario correo");

    if (!token) {
      return res.status(404).json({
        mensaje: "Token no encontrado"
      });
    }

    res.status(200).json(token);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener el token",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR TOKEN
========================================== */
router.post("/", async (req, res) => {
  try {

    const nuevoToken = new TokenRecuperacion({
      Usuario: req.body.Usuario,
      token: req.body.token,
      expiracion: req.body.expiracion
    });

    const tokenGuardado = await nuevoToken.save();

    res.status(201).json({
      mensaje: "Token creado correctamente",
      token: tokenGuardado
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al crear el token",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR TOKEN
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const tokenActualizado = await TokenRecuperacion.findByIdAndUpdate(
      req.params.id,
      {
        Usuario: req.body.Usuario,
        token: req.body.token,
        expiracion: req.body.expiracion
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!tokenActualizado) {
      return res.status(404).json({
        mensaje: "Token no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Token actualizado correctamente",
      token: tokenActualizado
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar el token",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR TOKEN
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const tokenEliminado = await TokenRecuperacion.findByIdAndDelete(
      req.params.id
    );

    if (!tokenEliminado) {
      return res.status(404).json({
        mensaje: "Token no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Token eliminado correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar el token",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER TOKENS DE UN USUARIO
========================================== */
router.get("/usuario/:usuarioId", async (req, res) => {
  try {

    const tokens = await TokenRecuperacion.find({
      Usuario: req.params.usuarioId
    });

    res.status(200).json(tokens);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener los tokens del usuario",
      error: err.message
    });
  }
});

/* ==========================================
   BUSCAR TOKEN POR VALOR
========================================== */
router.get("/valor/:token", async (req, res) => {
  try {

    const tokenEncontrado = await TokenRecuperacion.findOne({
      token: req.params.token
    }).populate("Usuario", "Nombre Usuario correo");

    if (!tokenEncontrado) {
      return res.status(404).json({
        mensaje: "Token no encontrado"
      });
    }

    res.status(200).json(tokenEncontrado);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al buscar el token",
      error: err.message
    });
  }
});

export default router;