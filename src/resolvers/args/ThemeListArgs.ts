import {ArgsType, Field, InputType} from "type-graphql";
import {Target} from "../../../../API-rewrite-rewrite/api/src/api/Target";
import {FilterOrder, FilterSort} from "../../../../API-rewrite-rewrite/api/src/api/SortOrder";

@ArgsType()
export class ThemeListArgs {

    @Field({nullable: true})
    limit?: number;
    @Field({nullable: true})
    page?: number;
    @Field(() => Target, {nullable: true})
    target?: Target;
    @Field({nullable: true})
    query?: string;
    @Field(() => FilterSort, {nullable: true})
    sort?: FilterSort;
    @Field(() => FilterOrder, {nullable: true})
    order?: FilterOrder;
    @Field(() => [String], {nullable: true})
    creators?: string[];
    @Field(() => [String], {nullable: true})
    layouts?: string[];
    @Field({nullable: true})
    nsfw?: boolean;

}