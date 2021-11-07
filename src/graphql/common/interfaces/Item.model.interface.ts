import {Field, ID, Int, InterfaceType} from "@nestjs/graphql";
import {URLResolver} from "graphql-scalars";
import {CreatorModel} from "../../User/Creator.model";


@InterfaceType("ItemInterface")
export abstract class ItemModelInterface {

    @Field(() => ID)
    id: string;

    @Field()
    creator: CreatorModel;

    @Field()
    name: string;

    @Field({nullable: true})
    description?: string;

    @Field()
    addedTimestamp: Date;

    @Field()
    updatedTimestamp: Date;

    @Field(() => Int)
    dlCount: number;

    @Field(() => URLResolver)
    downloadUrl: string;

}