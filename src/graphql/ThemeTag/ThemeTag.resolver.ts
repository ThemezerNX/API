import {Args, Query, Resolver} from "@nestjs/graphql";
import {ThemeTagService} from "./ThemeTag.service";
import {PaginationArgs} from "../common/args/Pagination.args";
import {ThemeTagModel} from "./ThemeTag.model";
import {PaginatedThemeTags} from "./PaginatedThemeTags.model";
import {ThemeTagNotFoundError} from "../common/errors/ThemeTagNotFound.error";
import {SortArgs} from "./dto/Sort.args";
import {ListArgs} from "./dto/List.args";


@Resolver(ThemeTagModel)
export class ThemeTagResolver {

    constructor(private tagService: ThemeTagService) {
    }

    @Query(() => ThemeTagModel, {
        description: `Find a single themeTag`,
    })
    async themeTag(
        @Args("id") id: string,
    ): Promise<ThemeTagModel> {
        const themeTag = await this.tagService.findOne({id});
        if (!themeTag) {
            throw new ThemeTagNotFoundError();
        }
        return themeTag;
    }

    @Query(() => PaginatedThemeTags, {
        description: `Find multiple themeTags`,
    })
    async themeTags(
        @Args() paginationArgs: PaginationArgs,
        @Args() sortArgs: SortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedThemeTags> {
        const result = await this.tagService.findAll({
            paginationArgs,
            ...sortArgs,
            ...listArgs,
        });

        return new PaginatedThemeTags(paginationArgs, result.count, result.result);
    }

}
