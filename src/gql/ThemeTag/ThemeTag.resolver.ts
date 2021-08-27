import {Args, ArgsType, Field, Query, registerEnumType, Resolver} from "@nestjs/graphql";
import {ThemeTagService} from "./ThemeTag.service";
import {PaginationArgs} from "../common/args/Pagination.args";
import {ThemeTagModel} from "./ThemeTag.model";
import {SortInterface} from "../common/interfaces/Sort.interface";


export enum TagSort {
    ID = "id",
    NAME = "name",
}

registerEnumType(TagSort, {
    name: "TagSort",
});

@ArgsType()
class SortArgs extends SortInterface {

    @Field(() => TagSort, {nullable: true})
    sort?: TagSort = TagSort.ID;

}

@ArgsType()
class ListArgs {

    @Field({nullable: true})
    query?: string;

}

@Resolver(ThemeTagModel)
export class ThemeTagResolver {

    constructor(private tagService: ThemeTagService) {
    }

    @Query(() => ThemeTagModel, {
        description: `Find a single themeTag`,
    })
    async themeTag(
        @Args("id", {nullable: false}) id: string,
    ): Promise<ThemeTagModel> {
        return this.tagService.findOne({id});
    }

    @Query(() => [ThemeTagModel], {
        description: `Find multiple themeTags`,
    })
    async themeTags(
        @Args() paginationArgs: PaginationArgs,
        @Args() sortArgs: SortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<ThemeTagModel[]> {
        return this.tagService.findAll({
            paginationArgs,
            ...sortArgs,
            ...listArgs,
        });
    }

}
