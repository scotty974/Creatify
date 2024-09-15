import { z } from "zod";

const requestValidation = z.object({
  description: z.string().max(250),
  creatorId : z.string()
});


export default requestValidation