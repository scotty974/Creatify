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
    return res.status(400).send("Utilisateur existant");
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

export default router;
