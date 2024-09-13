import {z} from 'zod'



const profileValidation = z.object({
    avatar : z.string().optional(),
    banner : z.string().optional(),
    username : z.string(),
    bio : z.string(),
})



export default profileValidation