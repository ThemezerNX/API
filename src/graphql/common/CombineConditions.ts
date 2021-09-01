import {FindConditions} from "typeorm";
import {ThemeEntity} from "../Theme/Theme.entity";

export const combineConditions = (commonAndConditions: FindConditions<ThemeEntity>, orConditions: FindConditions<ThemeEntity>[]): FindConditions<ThemeEntity>[] => {
    return orConditions.map((condition) => {
        return {
            ...condition,
            ...commonAndConditions,
        };
    });
};