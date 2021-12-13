import {getConnection} from "typeorm";
import {PackEntity} from "./Pack.entity";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";


// I have to do this in a separate file because there are circular dependencies, well, according to nestjs.
// There aren't any circular dependencies at all, but I've been struggling with this for a while, so I'm just gonna do it in a separate file.
// These would otherwise have been in PackService as static methods.

export async function recomputeNSFW(packId: string) {
    if (packId) {
        // TODO: run in same transaction as update, insert, remove
        // This query is not nice, but it works.
        await getConnection().createQueryBuilder()
            .update(PackEntity)
            .set({isNSFW: true})
            .where("id = :packId", {packId})
            .andWhere((qb) =>
                `(EXISTS (${
                    qb.createQueryBuilder().select("1")
                        .from(ThemeEntity, "theme")
                        .where("theme.\"packId\" = :packId")
                        .andWhere("theme.\"isNSFW\" = true")
                        .getQuery()
                })` + " OR " +
                `EXISTS (${
                    qb.createQueryBuilder().select("1")
                        .from(HBThemeEntity, "hbtheme")
                        .where("hbtheme.\"packId\" = :packId")
                        .andWhere("hbtheme.\"isNSFW\" = true")
                        .getQuery()
                }))`,
            )
            .execute();
    }
}

export async function deleteIfEmpty(packId: string) {
    let wasDeleted = false;
    if (packId) {
        await getConnection().manager.transaction(async entityManager => {
            const [themeCount, hbthemeCount] = await Promise.all([
                await entityManager.createQueryBuilder()
                    .from(ThemeEntity, "theme")
                    .where("theme.\"packId\" = :packId", {packId})
                    .getCount(),
                await entityManager.createQueryBuilder()
                    .from(HBThemeEntity, "hbtheme")
                    .where("hbtheme.\"packId\" = :packId", {packId})
                    .getCount(),
            ]);
            if ((themeCount || 0) + (hbthemeCount || 0) < 2) {
                // set packId = null for all themes and hbthemes
                await entityManager.createQueryBuilder()
                    .update(ThemeEntity)
                    .set({packId: null})
                    .where("\"packId\" = :packId", {packId})
                    .execute();
                await entityManager.createQueryBuilder()
                    .update(HBThemeEntity)
                    .set({packId: null})
                    .where("\"packId\" = :packId", {packId})
                    .execute();
                await entityManager.createQueryBuilder()
                    .delete()
                    .from(PackEntity)
                    .where("id = :packId", {packId})
                    .execute();
                wasDeleted = true;
            }
        });
    }
    return wasDeleted;
}