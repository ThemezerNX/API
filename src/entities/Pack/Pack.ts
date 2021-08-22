import {Column, Entity, JoinColumn} from "typeorm";
import {createUnionType, Field, ObjectType} from "type-graphql";
import {Item} from "../Item";
import {Theme} from "../Theme/Theme";
import {HBTheme} from "../Theme/HBTheme";

const PackEntriesUnion = createUnionType({
    name: "PackEntries",
    types: () => [Theme, HBTheme] as const,
});

@ObjectType()
@Entity()
export class Pack extends Item {

    @Field()
    @Column()
    isNSFW: boolean;

    @Field(() => [PackEntriesUnion])
    @JoinColumn()
    themes: typeof PackEntriesUnion[];

}