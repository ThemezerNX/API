import {createJson} from "../../resolvers";

export default async (_parent, {id}, _context, _info) => {
    try {
        return await new Promise(async (resolve, _reject) => {
            const json = await createJson(id, null, true)
            resolve(json)
        })
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}