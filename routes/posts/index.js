import express from "express";
import { PrismaClient } from "@prisma/client";
import { expressjwt } from "express-jwt";
import postValidation from "./validation.js";
import upload from "../profil/multerConfig.js";
const router = express.Router();
const prisma = new PrismaClient();
const auth = expressjwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ["HS256"],
});

router.get("/api/medias", async (req, res) => {
  const medias = await prisma.media.findMany({
    orderBy: {
      priority: "desc",
    },
  });

  res.json(medias);
});

router.post(
  "/api/medias",
  auth,
  upload.single("url"),
  async (req, res) => {
    let data;
    try {
      data = postValidation.parse(req.body);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Une erreur est apparue. " });
    }

    try {
      const url = req.file ? req.file.path : null;
      await prisma.media.create({
        data: {
          url: url,
          title: data.title,
          description: data.description,
          userId: req.auth.id,
        },
      });
      return res.status(200).json({ message: "Publication réussie ! " });
    } catch (error) {
      console.log(error);
      return res.status(400).json("Une erreur est apparue. ");
    }
  }
);
router.delete("/api/medias/:id", auth, async (req, res) => {
    const mediaId = req.params.id; // Récupérer l'ID du média à partir des paramètres de l'URL
  
    try {
      // Vérifier si le média existe
      const media = await prisma.media.findUnique({
        where: {
          id: mediaId,
        },
      });
      console.log(mediaId)
      if (!media) {
        return res.status(404).json({ message: "Média introuvable." });
      }
  
      // Vérifier si l'utilisateur authentifié est bien le propriétaire du média
      if (media.userId !== req.auth.id) {
        return res.status(403).json({ message: "Action non autorisée." });
      }
  
      // Supprimer le média
      await prisma.media.delete({
        where: {
          id: mediaId,
        },
      });
  
      return res.status(200).json({ message: "Média supprimé avec succès." });
    } catch (error) {
        console.log(mediaId)
      console.log(error);
      return res.status(500).json({
        message: "Une erreur est survenue lors de la suppression du média.",
      });
    }
  });
  
export default router;
