import {Args, Info, Mutation, Query, Resolver} from "@nestjs/graphql";
import {PackService} from "./Pack.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSortArgs} from "../common/args/ItemSort.args";
import {PackModel} from "./Pack.model";
import {PaginatedPacks} from "./PaginatedPacks.model";
import {PackNotFoundError} from "../common/errors/PackNotFound.error";
import {GraphQLResolveInfo} from "graphql";
import {ListArgs} from "./dto/List.args";
import {Auth} from "../../common/decorators/Auth.decorator";
import {CurrentUser} from "../../common/decorators/CurrentUser.decorator";
import {UserEntity} from "../User/User.entity";
import {checkAccessPermissions} from "../common/functions/checkAccessPermissions";
import {ModifyPackContentsArgs} from "./dto/ModifyPackContents.args";


@Resolver(PackModel)
export class PackResolver {

    constructor(
        private packService: PackService,
    ) {
    }

    @Query(() => PackModel, {
        description: `Find a single pack`,
    })
    async pack(
        @Info() info: GraphQLResolveInfo,
        @CurrentUser() user: UserEntity,
        @Args("id") id: string,
    ): Promise<PackModel> {
        const pack = await this.packService.findOne({id}, {info});
        if (!pack) {
            throw new PackNotFoundError();
        }
        checkAccessPermissions(pack, user);
        return new PackModel(pack);
    }

    @Query(() => PaginatedPacks, {
        description: `Find multiple packs`,
    })
    async packs(
        @Info() info: GraphQLResolveInfo,
        @CurrentUser() user: UserEntity,
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedPacks> {
        const result = await this.packService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
            visibility: {currentUserId: user?.id, forceSelect: user?.isAdmin},
        }, {info, rootField: "nodes"});

        return new PaginatedPacks(
            paginationArgs,
            result.count,
            result.result.map((u) => new PackModel(u)),
        );
    }

    @Query(() => [PackModel], {
        description: `Fetch random packs. Does not include private items.`,
    })
    async randomPacks(
        @Info() info: GraphQLResolveInfo,
        @Args() limitArg?: LimitArg,
        @Args("includeNSFW", {defaultValue: false}) includeNSFW: boolean = false,
    ): Promise<PackModel[]> {
        return (
            await this.packService.findRandom({
                ...limitArg,
                includeNSFW,
            }, {info})
        ).map((u) => new PackModel(u));
    }

    @Mutation(() => Boolean, {
        description: "Delete a pack and all of its themes.",
    })
    @Auth({ownerOnly: true})
    async deletePack(@Args("id") id: string): Promise<boolean> {
        await this.packService.delete([id]);
        return true;
    }

    @Mutation(() => Boolean, {
        description: "Make a pack and all of its themes private/public. The creator is sent an email with the reason.",
    })
    @Auth({ownerOnly: true})
    async setPackVisibility(@Args("id") id: string, @Args("makePrivate") makePrivate: boolean, @Args("reason") reason: string): Promise<boolean> {
        await this.packService.setVisibility(id, makePrivate, reason);
        return true;
    }

    @Mutation(() => Boolean, {
        description: "Add themes to a pack.",
    })
    @Auth({ownerOnly: true})
    async addToPack(@CurrentUser() user: UserEntity, @Args() {
        id,
        themeIds,
        hbthemeIds,
    }: ModifyPackContentsArgs): Promise<boolean> {
        await this.packService.addToPack(id, themeIds, hbthemeIds, user);
        return true;
    }

    @Mutation(() => Boolean, {
        description: "Remove themes from a pack.",
    })
    @Auth({ownerOnly: true})
    async removeFromPack(@CurrentUser() user: UserEntity, @Args() {
        id,
        themeIds,
        hbthemeIds,
    }: ModifyPackContentsArgs): Promise<boolean> {
        await this.packService.removeFromPack(id, themeIds, hbthemeIds, user);
        return true;
    }

}
