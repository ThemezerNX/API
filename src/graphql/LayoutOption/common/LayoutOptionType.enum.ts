import {registerEnumType} from "@nestjs/graphql";

export enum LayoutOptionType {
    TOGGLE = "TOGGLE",
    SELECT = "SELECT",
    INTEGER = "INTEGER",
    DECIMAL = "DECIMAL",
    STRING = "STRING",
    COLOR = "COLOR",
}

registerEnumType(LayoutOptionType, {
    name: "LayoutOptionType",
});