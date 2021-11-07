import {Args, Info, Mutation, Query, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {ThemeModel} from "./Theme.model";
import {ThemeService} from "./Theme.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ThemeEntity} from "./Theme.entity";
import {ItemSortArgs} from "../common/args/ItemSort.args";
import {PaginatedThemes} from "./PaginatedThemes.model";
import {ThemeNotFoundError} from "../common/errors/ThemeNotFound.error";
import {ListArgs} from "./dto/List.args";
import {SubmitThemesArgs} from "./dto/SubmitThemes.args";
import {SubmitPackWithThemesArgs} from "./dto/SubmitPathWithThemes.args";
import {CurrentUser} from "../Auth/decorators/CurrentUser.decorator";
import {UserEntity} from "../User/User.entity";
import {Auth} from "../Auth/decorators/Auth.decorator";
import {GraphQLResolveInfo} from "graphql";


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
        @Info() info: GraphQLResolveInfo,
        @Args("id") id: string,
    ): Promise<ThemeModel> {
        const theme = await this.themeService.findOne({id}, {info});
        if (!theme) {
            throw new ThemeNotFoundError();
        }
        return theme;
    }

    @Query(() => PaginatedThemes, {
        description: `Find multiple themes`,
    })
    async themes(
        @Info() info: GraphQLResolveInfo,
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedThemes> {
        const result = await this.themeService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        }, {info, rootField: "nodes"});

        return new PaginatedThemes(paginationArgs, result.count, result.result);
    }

    @Query(() => [ThemeModel], {
        description: `Fetch random themes`,
    })
    randomThemes(
        @Info() info: GraphQLResolveInfo,
        @Args() limitArg?: LimitArg,
        @Args("includeNSFW", {defaultValue: false}) includeNSFW: boolean = false,
        @Args("target", {nullable: true}) target?: Target,
    ): Promise<ThemeModel[]> {
        return this.themeService.findRandom({
            ...limitArg,
            includeNSFW,
            target,
        }, {info});
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