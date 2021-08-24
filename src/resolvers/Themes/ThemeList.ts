import {Args, Ctx, Info, Query, Resolver} from "type-graphql";
import {Theme} from "../../entities/Theme/Theme";
import {GraphQLResolveInfo} from "graphql";
import {ThemeListArgs} from "../args/ThemeListArgs";
import {PerchQueryBuilder} from "perch-query-builder";


@Resolver()
export class ThemeList {

    private static repository = Theme.getRepository();

    // @Query(() => [Theme])
    // async themeList(
    //     @Arg("limit", {nullable: true}) limit?: number,
    //     @Arg("page", {nullable: true}) page?: number,
    //     @Arg("target", () => Target, {nullable: true}) target?: Target,
    //     @Arg("query", {nullable: true}) query?: string,
    //     @Arg("sort", () => FilterSort, {nullable: true}) sort?: FilterSort,
    //     @Arg("order", () => FilterOrder, {nullable: true}) order?: FilterOrder,
    //     @Arg("creators", () => [String], {nullable: true}) creators?: string[],
    //     @Arg("layouts", () => [String], {nullable: true}) layouts?: string[],
    //     @Arg("nsfw"
    //         , {nullable: true}) nsfw?: boolean,
    // ): Promise<Theme[]> {
    //
    //     Theme.getRepository()
    //
    //     return Theme.find({
    //         select:
    //         where: {
    //             creator: creators ? {
    //                 id: In(creators),
    //             } : {},
    //             layout: layouts ? {
    //                 id: In(layouts),
    //             } : {},
    //             isNSFW: In([!!nsfw, false]),
    //         },
    //
    //     });
    // }

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