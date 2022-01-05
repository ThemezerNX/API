import {ThemeTagEntity} from "../../ThemeTag/ThemeTag.entity";
import {titleCase} from "title-case";

export const selectTags = (newTags: string[], existingTags: ThemeTagEntity[]) => {
    return newTags.map((tag) => {
        const tileCaseTag = titleCase(tag);
        return existingTags.find((t) => t.name === tileCaseTag) || new ThemeTagEntity(tileCaseTag);
    });
};

