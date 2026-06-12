import express from "express";
import InicioSesion from "../models/Inicio_sesion";

const router = express.Router();

/* ==========================================
   OBTENER TODOS LOS USUARIOS
========================================== */
router.get("/", async (req, res) => {
  try {

    const usuarios = await InicioSesion.find()
      .sort({ createdAt: -1 });

    res.status(200).json(usuarios);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener los usuarios",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER USUARIO POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {

    const usuario = await InicioSesion.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.status(200).json(usuario);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener el usuario",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR USUARIO
========================================== */
router.post("/", async (req, res) => {
  try {

    const usuarioExistente = await InicioSesion.findOne({
      $or: [
        { Usuario: req.body.Usuario },
        { correo: req.body.correo }
      ]
    });

    if (usuarioExistente) {
      return res.status(400).json({
        mensaje: "El usuario o correo ya existe"
      });
    }

    const nuevoUsuario = new InicioSesion({
      idUsuario: req.body.idUsuario,
      Nombre: req.body.Nombre,
      Usuario: req.body.Usuario,
      password: req.body.password,
      correo: req.body.correo,
      imgPerfil: req.body.imgPerfil
    });

    const usuarioGuardado = await nuevoUsuario.save();

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: usuarioGuardado
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al crear el usuario",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR USUARIO
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const usuarioActualizado = await InicioSesion.findByIdAndUpdate(
      req.params.id,
      {
        idUsuario: req.body.idUsuario,
        Nombre: req.body.Nombre,
        Usuario: req.body.Usuario,
        password: req.body.password,
        correo: req.body.correo,
        imgPerfil: req.body.imgPerfil
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Usuario actualizado correctamente",
      usuario: usuarioActualizado
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar el usuario",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR USUARIO
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const usuarioEliminado = await InicioSesion.findByIdAndDelete(
      req.params.id
    );

    if (!usuarioEliminado) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Usuario eliminado correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar el usuario",
      error: err.message
    });
  }
});

/* ==========================================
   LOGIN
========================================== */
router.post("/login", async (req, res) => {
  try {

    const usuario = await InicioSesion.findOne({
      Usuario: req.body.Usuario,
      password: req.body.password
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Usuario o contraseña incorrectos"
      });
    }

    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al iniciar sesión",
      error: err.message
    });
  }
});

export default router;