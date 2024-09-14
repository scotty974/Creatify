import { z } from "zod";

const postValidation = z.object({
  url: z.string().optional(),
  description: z.string().max(240).optional(),
  title: z.string()
});


export default postValidation