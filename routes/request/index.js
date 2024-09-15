import express from "express";
import { PrismaClient } from "@prisma/client";
import { expressjwt } from "express-jwt";
import requestValidation from "./createvalidation.js";
const prisma = new PrismaClient();
const router = express.Router();
const auth = expressjwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ["HS256"],
});

router.post("/api/project-requests", auth, async (req, res) => {
  let data;
  try {
    data = requestValidation.parse(req.body);
  } catch (error) {
    return res.status(400).json({ message: "Une erreur est surenue" });
  }
  try {
    const clientUser = req.auth.role;
    if (clientUser === "CLIENT") {
      await prisma.projetRequest.create({
        data: {
          clientId: req.auth.id,
          description: data.description,
          creatorId: data.creatorId,
        },
      });
      return res.status(200).json({
        message: "Votre demande a bien été envoyée",
      });
    } else {
      return res.status(403).json({
        message: "Vous n'avez pas les droits pour effectuer cette action",
      });
    }
  } catch (error) {
    return res.status(403).json("Une erreur est survenue");
  }
});

export default router;
