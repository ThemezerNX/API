import {Args, ArgsType, Field, Mutation, Query, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {ThemeModel} from "./Theme.model";
import {ThemeService} from "./Theme.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {UserService} from "../User/User.service";
import {ThemeEntity} from "./Theme.entity";
import {ItemSortArgs} from "../common/args/ItemSortArgs";
import {PaginatedThemes} from "./PaginatedThemes.model";
import {FileUpload, GraphQLUpload} from "graphql-upload";
import {ThemeOptionService} from "./ThemeOptions/ThemeOption.service";
import {ThemeNotFoundError} from "../common/errors/ThemeNotFound.error";


@ArgsType()
class ListArgs {

    @Field(() => Target, {nullable: true})
    target?: Target;
    @Field({nullable: true})
    query?: string;
    @Field(() => [String], {nullable: true})
    creators?: string[];
    @Field(() => [String], {nullable: true})
    layouts?: string[];
    @Field({defaultValue: false})
    includeNSFW?: boolean = false;

}

@Resolver(ThemeModel)
export class ThemeResolver {

    constructor(private themeService: ThemeService, private userService: UserService, private optionService: ThemeOptionService) {
    }

    // @ResolveField(() => [ThemeOptionModel])
    // options(@Parent() theme: ThemeEntity): Promise<ThemeOptionModel[]> {
    //     return this.optionService.findAll({themeId: theme.id});
    // }

    @Query(() => ThemeModel, {
        description: `Find a single theme`,
    })
    async theme(
        @Args("id") id: string,
    ): Promise<ThemeModel> {
        const theme = await this.themeService.findOne({id}, ["previews"]);
        if (!theme) {
            throw new ThemeNotFoundError();
        }
        return theme;
    }

    @Query(() => PaginatedThemes, {
        description: `Find multiple themes`,
    })
    async themes(
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedThemes> {
        const result = await this.themeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        });

        return new PaginatedThemes(paginationArgs, result.count, result.result);
    }

    @Query(() => [ThemeModel], {
        description: `Fetch random themes`,
    })
    randomThemes(
        @Args() limitArg?: LimitArg,
        @Args("includeNSFW", {defaultValue: false}) includeNSFW: boolean = false,
        @Args("target", {nullable: true}) target?: Target,
    ): Promise<ThemeModel[]> {
        return this.themeService.findRandom({
            ...limitArg,
            includeNSFW,
            target,
        });
    }

    @Mutation(() => Boolean)
    async uploadThemes(@Args("files", {type: () => [GraphQLUpload]}) files: Promise<FileUpload>[]): Promise<boolean> {
        let zipCount = 0;
        let nxthemeCount = 0;
        const filteredFiles = (await Promise.all(files)).filter(({mimetype}) => {
            if (mimetype == "application/zip") {
                zipCount++;
                return true;
            } else if (mimetype == "application/nxtheme") {
                nxthemeCount++;
                return true;
            } else return false;
        });

        if (zipCount == 1 && nxthemeCount == 0) {
            // Process as zip

        } else if (zipCount == 0 && nxthemeCount > 0) {
            // Process as nxtheme
        } else throw Error("HELLO");

        return true;
    }

    @Mutation(() => Boolean)
    createTheme(): boolean {
        const theme = ThemeEntity.create();
        theme.target = Target.ResidentMenu;
        console.log(theme);
        // todo
        return true;
    }

}
