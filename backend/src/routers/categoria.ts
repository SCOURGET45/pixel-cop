import express from "express";
import Categoria from "../models/categoria";

const router = express.Router();

/* ==========================================
   OBTENER TODAS LAS CATEGORÍAS
========================================== */
router.get("/", async (req, res) => {
  try {

    const categorias = await Categoria.find()
      .sort({ nombre: 1 });

    res.status(200).json(categorias);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener las categorías",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER CATEGORÍA POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {

    const categoria = await Categoria.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({
        mensaje: "Categoría no encontrada"
      });
    }

    res.status(200).json(categoria);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener la categoría",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR CATEGORÍA
========================================== */
router.post("/", async (req, res) => {
  try {

    const categoriaExistente = await Categoria.findOne({
      nombre: req.body.nombre
    });

    if (categoriaExistente) {
      return res.status(400).json({
        mensaje: "La categoría ya existe"
      });
    }

    const nuevaCategoria = new Categoria({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion
    });

    const categoriaGuardada = await nuevaCategoria.save();

    res.status(201).json({
      mensaje: "Categoría creada correctamente",
      categoria: categoriaGuardada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al crear la categoría",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR CATEGORÍA
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const categoriaActualizada = await Categoria.findByIdAndUpdate(
      req.params.id,
      {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!categoriaActualizada) {
      return res.status(404).json({
        mensaje: "Categoría no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Categoría actualizada correctamente",
      categoria: categoriaActualizada
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar la categoría",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR CATEGORÍA
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const categoriaEliminada = await Categoria.findByIdAndDelete(
      req.params.id
    );

    if (!categoriaEliminada) {
      return res.status(404).json({
        mensaje: "Categoría no encontrada"
      });
    }

    res.status(200).json({
      mensaje: "Categoría eliminada correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar la categoría",
      error: err.message
    });
  }
});

export default router;