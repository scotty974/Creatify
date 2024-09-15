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

router.post('/api/tags', auth, async(req, res)=>{
    let data;
    try {
        data = tagsValidation.parse(req.body)
    } catch (error) {
        return res.status(403).json({message : 'Une erreur est survenue'})
    }

    await prisma.tags.create({
        data : {
            name : data.name
        }
    })
    return res.status(200).json({message : 'Tag bien enregistré'})
})


export default router;
