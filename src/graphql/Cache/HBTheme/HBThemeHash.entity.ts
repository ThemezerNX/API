import {Connection, Index, ViewColumn, ViewEntity} from "typeorm";
import {HBThemeEntity} from "../../HBTheme/HBTheme.entity";
import {UserEntity} from "../../User/User.entity";
import {HBThemeAssetsEntity} from "../../HBTheme/Assets/HBThemeAssets.entity";
import {ItemHashEntityInterface} from "../ItemHash.entity.interface";
import {HBThemeLightColorSchemeEntity} from "../../HBTheme/ColorScheme/HBThemeLightColorScheme.entity";
import {HBThemeDarkColorSchemeEntity} from "../../HBTheme/ColorScheme/HBThemeDarkColorScheme.entity";

@ViewEntity({
    expression: (connection: Connection) => connection.createQueryBuilder()
        .select(`
            sha256(array_to_string(array_agg(concat(
                (hbt.id, hbt.name, hbt."isNSFW")::TEXT,
                (hbtu.username)::TEXT,
                (
                    hbta."layout",
                    hbta."iconHash",
                    hbta."batteryIconHash",
                    hbta."chargingIconHash",
                    hbta."folderIconHash",
                    hbta."invalidIconHash",
                    hbta."themeIconDarkHash",
                    hbta."themeIconLightHash",
                    hbta."airplaneIconHash",
                    hbta."wifiNoneIconHash",
                    hbta."wifi1IconHash",
                    hbta."wifi2IconHash",
                    hbta."wifi3IconHash",
                    hbta."ethIconHash",
                    hbta."ethNoneIconHash",
                    hbta."backgroundImageHash"
                )::TEXT,
                (hbtcsl.*)::TEXT,
                (hbtcsd.*)::TEXT
            )), '')::BYTEA)
        `, "hash")
        .addSelect("hbt.id", "id")
        .addSelect("hbt.\"packId\"", "packId")
        .from(HBThemeEntity, "hbt")
        .leftJoin(UserEntity, "hbtu", "hbt.\"creatorId\" = hbtu.id")
        .leftJoin(HBThemeAssetsEntity, "hbta", "hbt.id = hbta.\"hbthemeId\"")
        .leftJoin(HBThemeLightColorSchemeEntity, "hbtcsl", "hbt.id = hbtcsl.\"hbthemeId\"")
        .leftJoin(HBThemeDarkColorSchemeEntity, "hbtcsd", "hbt.id = hbtcsd.\"hbthemeId\"")
        .groupBy("hbt.id"),
})
@Index(["packId", "id"], {unique: true})
export class HBThemeHashEntity extends ItemHashEntityInterface {

    @ViewColumn()
    packId: string;

}