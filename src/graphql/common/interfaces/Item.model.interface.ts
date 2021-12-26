import {Field, ID, Int, InterfaceType} from "@nestjs/graphql";
import {URLResolver} from "graphql-scalars";
import {CreatorModel} from "../../User/Creator.model";
import {RootModelAbstract} from "./Root.model.abstract";


@InterfaceType("ItemInterface")
export abstract class ItemModelInterface extends RootModelAbstract {

    @Field(() => ID)
    id: string;

    @Field()
    slug: string;

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
    downloadCount: number;

    @Field(() => URLResolver)
    downloadUrl: string;

}