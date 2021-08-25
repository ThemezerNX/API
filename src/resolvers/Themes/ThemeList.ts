import {Args, Ctx, Info, Query, Resolver} from "type-graphql";
import {Theme} from "../../entities/Theme/Theme";
import {GraphQLResolveInfo} from "graphql";
import {ThemeListArgs} from "../args/ThemeListArgs";
import {PerchQueryBuilder} from "perch-query-builder";


@Resolver()
export class ThemeList {

    private static repository = Theme.getRepository();

    @Query(() => [Theme], {
        name: `Theme`,
        description: `Generic Collection Query For Themes`,
        nullable: true,
    })
    async queryThemes(
        @Ctx() ctx,
        @Args() args: ThemeListArgs,
        @Info() info: GraphQLResolveInfo,
    ): Promise<Theme[]> {
        return await PerchQueryBuilder.find<Theme>(ThemeList.repository, info);
    }

}