import express from "express";
import { PrismaClient } from "@prisma/client";
import { expressjwt } from "express-jwt";
import tagsValidation from "./validation.js";
const router = express.Router();
const prisma = new PrismaClient();
const auth = expressjwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ["HS256"],
});

router.post("/api/tags", auth, async (req, res) => {
  let data;

  try {
    // Valider les données
    data = tagsValidation.parse(req.body);
  } catch (error) {
    return res.status(403).json({ message: "Données invalides" });
  }

  try {
    // Récupérer le profil de l'utilisateur connecté
    const profil = await prisma.profil.findUnique({
      where: {
        userId: req.auth.id, // userId est la référence de l'utilisateur dans le modèle Profil
      },
    });

    // Vérifier si le profil existe
    if (!profil) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    // Créer un tag avec le profilId récupéré
    await prisma.tags.create({
      data: {
        name: data.name,
        profilId: profil.id, // Utiliser le profilId récupéré
      },
    });

    return res.status(200).json({ message: "Tag bien enregistré" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Une erreur est survenue lors de la création du tag" });
  }
});

router.get("/api/tags/:name", auth, async (req, res) => {
  const name = req.params.name;
  try {
    const tags = await prisma.tags.findMany({
      where: {
        name: {
          contains: name
        },
      },
      include: {
        profil: true,
      },
    });
    if (tags.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun profil trouvé pour ce tag" });
    }

    // Extraire les profils des tags
    const profiles = tags.map((tag) => tag.profil);

    return res.status(200).json(profiles);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Une erreur est survenue" });
  }
});
export default router;
