import {Connection, ViewEntity} from "typeorm";
import {UserEntity} from "../../User/User.entity";
import {PackEntity} from "../../Pack/Pack.entity";
import {HBThemeHashEntity} from "../HBTheme/HBThemeHash.entity";
import {ThemeHashEntity} from "../Theme/ThemeHash.entity";
import {ItemHashEntityInterface} from "../ItemHash.entity.interface";


@ViewEntity({
    expression: (connection: Connection) => connection.createQueryBuilder()
        .select(`
           sha256(array_to_string(array_agg(concat(
                (p.id, p.name)::TEXT,
                (u.username)::TEXT,
                encode(th.hash, 'hex')::TEXT,
                encode(hbth.hash, 'hex')::TEXT
            )), '')::BYTEA)
        `, "hash")
        .addSelect("p.id", "id")
        .from(PackEntity, "p")
        .leftJoin(UserEntity, "u", "p.\"creatorId\" = u.id")
        .leftJoin(ThemeHashEntity, "th", "p.id = th.\"packId\"")
        .leftJoin(HBThemeHashEntity, "hbth", "p.id = hbth.\"packId\"")
        .groupBy("p.id"),
})
export class PackHashEntity extends ItemHashEntityInterface {
}