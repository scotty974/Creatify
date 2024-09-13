import express from "express";
import { PrismaClient } from "@prisma/client";
import { expressjwt } from "express-jwt";
import profileValidation from "./validation.js";
import upload from "./multerConfig.js";
const router = express.Router();
const prisma = new PrismaClient();
const auth = expressjwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ["HS256"],
});

router.post("/api/profil", auth, upload.fields([{ name: "avatar" }, { name: "banner" }]), async (req, res) => {
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
    console.log(error)
    res.status(500).json({ message: "Une erreur est survenue" });
  }
});

export default router;
