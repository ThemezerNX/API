import {Args, ArgsType, Field, Parent, Query, ResolveField, Resolver} from "@nestjs/graphql";
import {PackService} from "./Pack.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {UserService} from "../User/User.service";
import {UserModel} from "../User/User.model";
import {ItemSortArgs} from "../common/args/ItemSortArgs";
import {PackEntriesUnion, PackModel} from "./Pack.model";
import {PackEntity} from "./Pack.entity";
import {ThemeService} from "../Theme/Theme.service";
import {HBThemeService} from "../HBTheme/HBTheme.service";
import {PaginatedPacks} from "./PaginatedPacks.model";


@ArgsType()
class ListArgs {

    @Field({nullable: true})
    query?: string;
    @Field(() => [String], {nullable: true})
    creators?: string[];

}

@Resolver(PackModel)
export class PackResolver {

    constructor(
        private packService: PackService,
        private userService: UserService,
        private themeService: ThemeService,
        private hbThemeService: HBThemeService,
    ) {
    }

    @ResolveField(() => UserModel)
    creator(@Parent() pack: PackEntity): Promise<UserModel> {
        const id = pack.creatorId;
        return this.userService.findOne({id});
    }

    @ResolveField()
    isNSFW(@Parent() pack: PackEntity): Promise<boolean> {
        return this.packService.isNSFW(pack.id);
    }

    @ResolveField()
    async entries(@Parent() pack: PackEntity): Promise<Array<typeof PackEntriesUnion>> {
        const themes = await this.themeService.findAll({packId: pack.id});
        const hbThemes = await this.hbThemeService.findAll({packId: pack.id});

        return [...themes[0], ...hbThemes[0]];
    }

    @Query(() => PackModel, {
        description: `Find a single pack`,
    })
    pack(
        @Args("id", {nullable: false}) id: string,
    ): Promise<PackModel> {
        return this.packService.findOne({id});
    }

    @Query(() => PaginatedPacks, {
        description: `Find multiple packs`,
    })
    async packs(
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedPacks> {
        const result = await this.packService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        });

        return new PaginatedPacks(paginationArgs, result[1], result[0]);
    }

    @Query(() => [PackModel], {
        description: `Fetch random packs`,
    })
    async randomPacks(
        @Args() limitArg?: LimitArg,
        @Args("includeNSFW", {nullable: true}) includeNSFW: boolean = false,
    ): Promise<PackModel[]> {
        return this.packService.findRandom({
            ...limitArg,
            includeNSFW,
        });
    }

}
