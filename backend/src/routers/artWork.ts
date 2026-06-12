import express from "express";
import ArtWork from "../models/artWork";

const router = express.Router();

/* ==========================================
   OBTENER TODOS LOS ARTWORKS
========================================== */
router.get("/", async (req, res) => {
  try {
    const artworks = await ArtWork.find()
      .populate("Usuario", "Nombre Correo")
      .sort({ createdAt: -1 });

    res.status(200).json(artworks);
  } catch (error) {
      const err = error as Error;
    res.status(500).json({
      mensaje: "Error al obtener los artworks",
      error: err.message
    });
  }
});

/* ==========================================
   OBTENER ARTWORK POR ID
========================================== */
router.get("/:id", async (req, res) => {
  try {
    const artwork = await ArtWork.findById(req.params.id)
      .populate("Usuario", "Nombre Correo");

    if (!artwork) {
      return res.status(404).json({
        mensaje: "Artwork no encontrado"
      });
    }

    res.status(200).json(artwork);
  } catch (error) {
      const err = error as Error;
    res.status(500).json({
      mensaje: "Error al obtener los artworks",
      error: err.message
    });
  }
});

/* ==========================================
   CREAR ARTWORK
========================================== */
router.post("/", async (req, res) => {
  try {
    const nuevoArtwork = new ArtWork({
      Usuario: req.body.Usuario,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags,
      width: req.body.width,
      height: req.body.height,
      thumbnailUrl: req.body.thumbnailUrl,
      editorDataUrl: req.body.editorDataUrl,
      isPublic: req.body.isPublic,
      featureArtworkid: req.body.featureArtworkid
    });

    const artworkGuardado = await nuevoArtwork.save();

    res.status(201).json({
      mensaje: "Artwork creado correctamente",
      artwork: artworkGuardado
    });

  } catch (error) {
      const err = error as Error;
    res.status(500).json({
      mensaje: "Error al crear el artworks",
      error: err.message
    });
  }
});

/* ==========================================
   ACTUALIZAR ARTWORK
========================================== */
router.put("/:id", async (req, res) => {
  try {

    const artworkActualizado = await ArtWork.findByIdAndUpdate(
      req.params.id,
      {
        Usuario: req.body.Usuario,
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        width: req.body.width,
        height: req.body.height,
        thumbnailUrl: req.body.thumbnailUrl,
        editorDataUrl: req.body.editorDataUrl,
        isPublic: req.body.isPublic,
        featureArtworkid: req.body.featureArtworkid
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!artworkActualizado) {
      return res.status(404).json({
        mensaje: "Artwork no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Artwork actualizado correctamente",
      artwork: artworkActualizado
    });

  } catch (error) {
      const err = error as Error;
    res.status(500).json({
      mensaje: "Error al actualizar",
      error: err.message
    });
  }
});
/* ==========================================
   ELIMINAR ARTWORK
========================================== */
router.delete("/:id", async (req, res) => {
  try {

    const artworkEliminado = await ArtWork.findByIdAndDelete(req.params.id);

    if (!artworkEliminado) {
      return res.status(404).json({
        mensaje: "Artwork no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Artwork eliminado correctamente"
    });

  } catch (error) {
      const err = error as Error;
    res.status(500).json({
      mensaje: "Error al eliminar el artworks",
      error: err.message
    });
  }
});
/* ==========================================
   OBTENER ARTWORKS PÚBLICOS
========================================== */
router.get("/public/list", async (req, res) => {
  try {

    const artworks = await ArtWork.find({
      isPublic: true
    })
      .populate("Usuario")
      .sort({ views: -1 });

    res.status(200).json(artworks);

  } catch (error) {
      const err = error as Error;
    res.status(500).json({
      mensaje: "Error al obtener los artworks publicos",
      error: err.message
    });
  }
});

/* ==========================================
   AUMENTAR VISITAS
========================================== */
router.patch("/:id/view", async (req, res) => {
  try {

    const artwork = await ArtWork.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { views: 1 }
      },
      {
        new: true
      }
    );

    if (!artwork) {
      return res.status(404).json({
        mensaje: "Artwork no encontrado"
      });
    }

    res.status(200).json(artwork);

  } catch (error) {
      const err = error as Error;
    res.status(500).json({
      mensaje: "Error al obtener las vistas del artworks",
      error: err.message
    });
  }
});

export default router;