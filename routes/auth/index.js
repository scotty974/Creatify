import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import loginSchema from "./validation.js";
import { generateAccessToken, generateRefreshToken } from "./token-gestion.js";
import argon2 from "argon2";
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
export default router;
