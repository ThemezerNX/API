import {getTheme} from "../../resolvers";

export default async (_parent, {id, piece_uuids}) => {
    try {
        return await getTheme(id.replace(/t/i, ''), piece_uuids)
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}