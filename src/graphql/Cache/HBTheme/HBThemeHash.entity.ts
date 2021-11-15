import {Connection, Index, ViewColumn, ViewEntity} from "typeorm";
import {HBThemeEntity} from "../../HBTheme/HBTheme.entity";
import {UserEntity} from "../../User/User.entity";
import {HBThemeAssetsEntity} from "../../HBTheme/Assets/HBThemeAssets.entity";
import {ItemHashEntityInterface} from "../ItemHash.entity.interface";


@ViewEntity({
    expression: (connection: Connection) => connection.createQueryBuilder()
        .select(`
            sha256(array_to_string(array_agg(concat(
                (hbt.id, hbt.name, hbt."isNSFW")::TEXT,
                (hbtu.username)::TEXT,
                (hbta."backgroundImageHash", hbta."chargingIconHash", hbta."folderIconHash", hbta."invalidIconHash", hbta."themeIconDarkHash", hbta."themeIconLightHash", hbta."airplaneIconHash", hbta."wifiNoneIconHash", hbta."wifi1IconHash", hbta."wifi2IconHash", hbta."wifi3IconHash", hbta."ethIconHash", hbta."backgroundImageFile")::TEXT
            )), '')::BYTEA)
        `, "hash")
        .addSelect("hbt.id", "hbthemeId")
        .addSelect("hbt.\"packId\"", "packId")
        .from(HBThemeEntity, "hbt")
        .leftJoin(UserEntity, "hbtu", "hbt.\"creatorId\" = hbtu.id")
        .leftJoin(HBThemeAssetsEntity, "hbta", "hbt.id = hbta.\"hbthemeId\"")
        .groupBy("hbt.id"),
})
export class HBThemeHashEntity extends ItemHashEntityInterface {

    @ViewColumn()
    @Index()
    hbthemeId: string;

    @ViewColumn()
    @Index()
    packId: string;

}