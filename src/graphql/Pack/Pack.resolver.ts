import {Args, ArgsType, Field, Info, Query, Resolver} from "@nestjs/graphql";
import {PackService} from "./Pack.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSortArgs} from "../common/args/ItemSortArgs";
import {PackModel} from "./Pack.model";
import {PaginatedPacks} from "./PaginatedPacks.model";
import {PackNotFoundError} from "../common/errors/PackNotFound.error";
import {GraphQLResolveInfo} from "graphql";


@ArgsType()
class ListArgs {

    @Field({nullable: true})
    query?: string;
    @Field(() => [String], {nullable: true})
    creators?: string[];
    @Field({
        defaultValue: false,
        description: "Whether to include NSFW results. If false, a pack will be excluded if any of the themes is NSFW.",
    })
    includeNSFW?: boolean = false;

}

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
        @Args("id") id: string,
    ): Promise<PackModel> {
        const pack = await this.packService.findOne({id}, {info});
        if (!pack) {
            throw new PackNotFoundError();
        }
        return pack;
    }

    @Query(() => PaginatedPacks, {
        description: `Find multiple packs`,
    })
    async packs(
        @Info() info: GraphQLResolveInfo,
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedPacks> {
        const result = await this.packService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        }, {info});

        return new PaginatedPacks(paginationArgs, result.count, result.result);
    }

    @Query(() => [PackModel], {
        description: `Fetch random packs`,
    })
    randomPacks(
        @Info() info: GraphQLResolveInfo,
        @Args() limitArg?: LimitArg,
        @Args("includeNSFW", {defaultValue: false}) includeNSFW: boolean = false,
    ): Promise<PackModel[]> {
        return this.packService.findRandom({
            ...limitArg,
            includeNSFW,
        }, {info});
    }

}
