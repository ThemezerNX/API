import {Connection, Index, ViewColumn, ViewEntity} from "typeorm";
import {UserEntity} from "../../User/User.entity";
import {ThemeEntity} from "../../Theme/Theme.entity";
import {ThemeAssetsEntity} from "../../Theme/Assets/ThemeAssets.entity";
import {ThemeOptionEntity} from "../../Theme/ThemeOptions/ThemeOption.entity";
import {LayoutOptionValueEntity} from "../../LayoutOption/OptionValue/LayoutOptionValue.entity";
import {LayoutEntity} from "../../Layout/Layout.entity";
import {ItemHashEntityInterface} from "../ItemHash.entity.interface";
import {LayoutOptionEntity} from "../../LayoutOption/LayoutOption.entity";


@ViewEntity({
    expression: (connection: Connection) => connection.createQueryBuilder()
        .select(`
            sha256(array_to_string(array_agg(concat(
                (t.id, t.name, t."isNSFW", t.target)::TEXT,
                (tu.username)::TEXT,
                (ta."customLayoutJson", ta."customCommonLayoutJson", ta."imageHash", ta."albumIconHash", ta."newsIconHash", ta."shopIconHash", ta."controllerIconHash", ta."settingsIconHash", ta."powerIconHash", ta."homeIconHash")::TEXT,
                ("to".variable)::TEXT,
                (tolov.name, tolov.json)::TEXT,
                (lov.type, lov.priority)::TEXT,
                (tl.id, tl.name, tl.target, tl.json, tl."commonJson")::TEXT,
                (lu.username)::TEXT
            )), '')::BYTEA)
        `, "hash")
        .addSelect("t.id", "themeId")
        .addSelect("t.\"packId\"", "packId")
        .from(ThemeEntity, "t")
        .leftJoin(UserEntity, "tu", "t.\"creatorId\" = tu.id")
        .leftJoin(ThemeAssetsEntity, "ta", "t.id = ta.\"themeId\"")
        .leftJoin(ThemeOptionEntity, "to", "t.id = \"to\".\"themeId\"")
        .leftJoin(LayoutOptionValueEntity, "tolov", "\"to\".\"layoutOptionValueUUID\" = tolov.uuid")
        .leftJoin(LayoutOptionEntity, "lov", "tolov.\"layoutOptionId\" = lov.id")
        .leftJoin(LayoutEntity, "tl", "t.\"layoutId\" = tl.id")
        .leftJoin(UserEntity, "lu", "tl.\"creatorId\" = lu.id")
        .groupBy("t.id"),
})
export class ThemeHashEntity extends ItemHashEntityInterface {

    @ViewColumn()
    @Index()
    packId: string;

    @ViewColumn()
    @Index()
    themeId: string;

}