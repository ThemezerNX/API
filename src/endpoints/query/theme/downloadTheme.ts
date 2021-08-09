import {getTheme} from "../../resolvers";
import {db} from "../../../util/db";

export default async (_parent, {id, piece_uuids}) => {
    return await getTheme(id.replace(/t/i, ""), piece_uuids);
}