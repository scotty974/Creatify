import {z} from 'zod'


const tagsValidation = z.object({
    name : z.string()
})

export default tagsValidation