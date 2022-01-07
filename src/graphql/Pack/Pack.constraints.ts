import {EntityManager} from "typeorm";
import {PackEntity} from "./Pack.entity";
import {ThemeEntity} from "../Theme/Theme.entity";
import {HBThemeEntity} from "../HBTheme/HBTheme.entity";
import {PackPreviewsEntity} from "./Previews/PackPreviews.entity";


// I have to do this in a separate file because there are circular dependencies, well, according to nestjs.
// There aren't any circular dependencies at all, but I've been struggling with this for a while, so I'm just gonna do it in a separate file.
// These would otherwise have been in PackService as static methods.

export async function regeneratePreview(entityManager: EntityManager, packId: string) {
    const pack: PackEntity = await this.repository.findOne({
        where: {id: packId},
        relations: [
            "creator",
            "previews",
            "themes",
            "hbthemes",
            "themes.previews",
            "themes.assets",
            "hbthemes.previews",
            "hbthemes.assets",
        ],
    });
    await pack.previews.generateCollage(pack.themes, pack.hbthemes);
    await entityManager.save(PackPreviewsEntity, pack.previews);
}

export async function recomputeNSFW(entityManager: EntityManager, {
    packId,
    pack,
}: { packId?: string, pack?: PackEntity }) {
    if (packId || pack) {
        const id = packId || pack.id;
        // TODO: run in same transaction as update, insert, remove
        // UPDATE: ^ this is done by default, however, the selects in the update still select the old values
        // This query is not nice, but it works.

        await entityManager.createQueryBuilder()
            .update(PackEntity)
            .set({
                isNSFW: () =>
                    `(EXISTS (${
                        entityManager.createQueryBuilder().select("1")
                            .from(ThemeEntity, "theme")
                            .where("theme.\"packId\" = :packId")
                            .andWhere("theme.\"isNSFW\" = true", {packId: id})
                            .getQuery()
                    })` + " OR " +
                    `EXISTS (${
                        entityManager.createQueryBuilder().select("1")
                            .from(HBThemeEntity, "hbtheme")
                            .where("hbtheme.\"packId\" = :packId", {packId: id})
                            .andWhere("hbtheme.\"isNSFW\" = true")
                            .getQuery()
                    }))`,
            })
            .where("id = :packId", {packId: id})
            .execute();
    }
}

export async function deleteIfEmpty(entityManager: EntityManager, packId: string) {
    let wasDeleted = false;
    if (packId) {
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
        if ((themeCount) + (hbthemeCount) < 2) {
            // set packId = null for all themes and hbthemes
            if (themeCount > 0) {
                await entityManager.createQueryBuilder()
                    .update(ThemeEntity)
                    .set({packId: null})
                    .where("\"packId\" = :packId", {packId})
                    .execute();
            } else if (hbthemeCount > 0) {
                await entityManager.createQueryBuilder()
                    .update(HBThemeEntity)
                    .set({packId: null})
                    .where("\"packId\" = :packId", {packId})
                    .execute();
            }
            await entityManager.createQueryBuilder()
                .delete()
                .from(PackEntity)
                .where("id = :packId", {packId})
                .execute();
            wasDeleted = true;
        }
    }
    return wasDeleted;
}