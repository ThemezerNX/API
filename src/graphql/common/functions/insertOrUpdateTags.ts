import {EntityManager} from "typeorm";
import {ThemeTagEntity} from "../../ThemeTag/ThemeTag.entity";

export const insertOrUpdateTags = async (entityManager: EntityManager, insertedTags: ThemeTagEntity[]) => {
    // because of a bug in typeorm tags are only saved in the first relation, not in all
    await entityManager
        .createQueryBuilder()
        .insert()
        .into(ThemeTagEntity)
        .values(insertedTags)
        .orUpdate(["name"], ["name"])
        .execute();
};