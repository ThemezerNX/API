import {registerEnumType} from "@nestjs/graphql";

export enum LayoutOptionType {
    RADIO = "RADIO",
    CHECKBOX = "CHECKBOX",
    NUMBER = "NUMBER",
    RANGE = "RANGE",
    TEXT = "TEXT",
    COLOR = "COLOR",
}

registerEnumType(LayoutOptionType, {
    name: "LayoutOptionType",
});