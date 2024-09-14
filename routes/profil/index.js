import express from "express";
import { PrismaClient } from "@prisma/client";
import { expressjwt } from "express-jwt";
import profileValidation from "./validation.js";
import socialValidation from "./socialValidation.js";
import upload from "./multerConfig.js";
const router = express.Router();
const prisma = new PrismaClient();
const auth = expressjwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ["HS256"],
});

router.post(
  "/api/profil",
  auth,
  upload.fields([{ name: "avatar" }, { name: "banner" }]),
  async (req, res) => {
    let data;
    try {
      // Vérifier que l'utilisateur existe
      const existingUser = await prisma.user.findFirst({
        where: {
          id: req.auth.id,
        },
      });

      if (!existingUser) {
        return res.status(403).json({ message: "Utilisateur Introuvable !" });
      }

      // Valider le reste des données du profil avec Zod ou une autre validation
      data = profileValidation.parse(req.body);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Erreur de validation", error: error.message });
    }

    try {
      const avatarPath = req.files.avatar ? req.files.avatar[0].path : null;
      const bannerPath = req.files.banner ? req.files.banner[0].path : null;
      await prisma.profil.create({
        data: {
          username: data.username,
          bio: data.bio,
          avatar: avatarPath,
          banner: bannerPath,
          userId: req.auth.id,
        },
      });

      return res
        .status(200)
        .json({ message: "Votre profil est bien enregistrer. " });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Une erreur est survenue" });
    }
  }
);

router.patch(
  "/api/profil",
  auth,
  upload.fields([{ name: "avatar" }, { name: "banner" }]),
  async (req, res) => {
    let data;
    try {
      // Vérifier que l'utilisateur existe
      const existingUser = await prisma.user.findFirst({
        where: {
          id: req.auth.id,
        },
      });

      if (!existingUser) {
        return res.status(403).json({ message: "Utilisateur Introuvable !" });
      }

      // Valider les nouvelles données du profil avec Zod ou une autre validation
      data = profileValidation.parse(req.body);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Erreur de validation", error: error.message });
    }

    try {
      // Récupérer les nouveaux fichiers (avatar et banner) si fournis
      const avatarPath = req.files.avatar ? req.files.avatar[0].path : null;
      const bannerPath = req.files.banner ? req.files.banner[0].path : null;

      // Créer un objet contenant uniquement les champs à mettre à jour
      const updateData = {
        username: data.username,
        bio: data.bio,
      };

      if (avatarPath) updateData.avatar = avatarPath;
      if (bannerPath) updateData.banner = bannerPath;

      // Mettre à jour le profil de l'utilisateur
      await prisma.profil.update({
        where: {
          userId: req.auth.id,
        },
        data: updateData,
      });

      return res
        .status(200)
        .json({ message: "Votre profil a été mis à jour avec succès." });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Une erreur est survenue lors de la mise à jour du profil.",
      });
    }
  }
);

router.get("/api/profil", auth, async (req, res) => {
  const userId = req.auth.id;

  const profil = await prisma.profil.findFirst({
    where: {
      userId: userId,
    },
    select: {
      avatar: true,
      banner: true,
      bio: true,
      username: true,
      created_at: true,
      user: {
        select: {
          social: true,
        },
      },
    },
  });
  if (!profil) return res.status(403).json({ message: "Profile introuvable" });
  res.json(profil);
});

router.post("/api/social", auth, async (req, res) => {
  let data;
  try {
    data = socialValidation.parse(req.body);
  } catch (error) {
    return res.status(400).json({ message: "Une erreur est survenue. " });
  }
  try {
    await prisma.social.create({
      data: {
        name: data.name,
        link: data.link,
        userId: req.auth.id,
      },
    });
    return res.status(200).json({message : "Ajout d'un lien social."})
  } catch (error) {
    return res.status(400).json({ message: "Une erreur est survenue." });
  }
});
export default router;
