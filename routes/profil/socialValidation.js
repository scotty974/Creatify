import {z } from "zod";

const socialValidation = z.object({
  name: z.string(),
  link: z.string(),
});

export default socialValidation;
