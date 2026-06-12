import express from "express";
import Project from "../models/project";

const router = express.Router();

/* ==========================================
   OBTENER TODOS LOS PROYECTOS (PÚBLICOS)
========================================== */
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ is_public: true })
      .populate("user_id", "Usuario Nombre")
      .sort({ created_at: -1 });

    res.status(200).json(projects);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener los proyectos públicos",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PROYECTOS DE UN USUARIO
========================================== */
router.get("/usuario/:userId", async (req, res) => {
  try {
    const projects = await Project.find({ user_id: req.params.userId })
      .populate("user_id", "Usuario Nombre")
      .sort({ created_at: -1 });

    res.status(200).json(projects);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener los proyectos del usuario",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER PROYECTO POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("user_id", "Usuario Nombre correo");

    if (!project) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado"
      });
    }

    res.status(200).json(project);

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al obtener el proyecto",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR PROYECTO (GUARDAR EN LA NUBE)
========================================== */
router.post("/", async (req, res) => {
  try {
    const { user_id, name, data, thumbnail, is_public } = req.body;

    if (!user_id || !name || !data) {
      return res.status(400).json({
        mensaje: "Faltan campos requeridos: user_id, name, data"
      });
    }

    const newProject = new Project({
      user_id,
      name,
      data,
      thumbnail: thumbnail || null,
      is_public: is_public || false
    });

    const savedProject = await newProject.save();

    res.status(201).json({
      mensaje: "Proyecto guardado correctamente",
      project: savedProject
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al guardar el proyecto",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR PROYECTO
========================================== */
router.put("/:id", async (req, res) => {
  try {
    const { name, data, thumbnail, is_public } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name: name || undefined,
        data: data || undefined,
        thumbnail: thumbnail || undefined,
        is_public: is_public !== undefined ? is_public : undefined,
        updated_at: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProject) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Proyecto actualizado correctamente",
      project: updatedProject
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al actualizar el proyecto",
      error: err.message
    });
  }
});

/* ==========================================
   ELIMINAR PROYECTO
========================================== */
router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({
        mensaje: "Proyecto no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Proyecto eliminado correctamente"
    });

  } catch (error) {
    const err = error as Error;

    res.status(500).json({
      mensaje: "Error al eliminar el proyecto",
      error: err.message
    });
  }
});

export default router;
