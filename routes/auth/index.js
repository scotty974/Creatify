import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import loginSchema from "./validation.js";
import { generateAccessToken, generateRefreshToken } from "./token-gestion.js";
import argon2 from "argon2";
import jwt from 'jsonwebtoken'
dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

// route pour faire un utilisateur normal donc un créateur de contenu
router.post("/api/register", async (req, res) => {
  let data;
  try {
    data = loginSchema.parse(req.body);
  } catch (error) {
    return res.status(400).send(error);
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });
  if (existingUser) {
    return res.status(400).json({ message: "Un compte existe déjà !" });
  }

  const passwordHash = await argon2.hash(data.password);

  await prisma.user.create({
    data: {
      email: data.email,
      password: passwordHash,
    },
  });

  return res.status(200).json({
    message: "Votre compte est bien enregistré ! ",
  });
});

router.post("/api/login", async (req, res) => {
  let data;
  try {
    data = loginSchema.parse(req.body);
  } catch (error) {
    return res.status(400).json(error);
  }

  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });
  if (!user) {
    return res.json(400).json({ message: "Utilisateur introuvable ! " });
  }

  const verifyPassword = argon2.verify(user.password, data.password);

  if (!verifyPassword) {
    return res
      .json(400)
      .json({ message: "Mot de passe ou Email incorrect ! " });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.user.update({
    where: {
      email: data.email,
    },
    data: {
      refreshToken: refreshToken,
      accessToken: accessToken,
    },
  });

  res.send({ accessToken: accessToken, refreshToken: refreshToken });
});

router.post("/api/client-register", async (req, res) => {
  let data;
  try {
    data = loginSchema.parse(req.body);
  } catch (error) {
    return res.status(400).send(error);
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });
  if (existingUser) {
    return res.status(400).json({ message: "Un compte existe déjà !" });
  }

  const passwordHash = await argon2.hash(data.password);

  await prisma.user.create({
    data: {
      email: data.email,
      password: passwordHash,
      role: "CLIENT",
    },
  });

  return res.status(200).json({
    message: "Votre compte est bien enregistré ! ",
  });
});

router.post("/api/refreshToken", async (req, res) => {
  // Récupérer le token du header Authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Vérification si le token est manquant
  if (!token) return res.status(401).json({ message: "No token provided" });

  // Vérifier et décoder le refresh token
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decodedToken) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    try {
      // Récupérer l'utilisateur à partir de l'ID contenu dans le token
      const existingUser = await prisma.user.findUnique({
        where: {
          id: decodedToken.id, // Assurez-vous que votre token contient "userId"
        },
      });

      // Vérifier si l'utilisateur existe
      if (!existingUser) {
        return res.status(403).json({ message: "User not found" });
      }

      // Vérifier si le refresh token en base correspond au token fourni
      if (existingUser.refreshToken !== token) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      // Générer de nouveaux tokens
      const newAccessToken = generateAccessToken(existingUser);
      const newRefreshToken = generateRefreshToken(existingUser);

      // Mettre à jour les tokens en base de données
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });

      // Renvoyer les nouveaux tokens
      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
});
export default router;
