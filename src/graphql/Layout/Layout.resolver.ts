import {Args, Info, Query, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {LayoutModel} from "./Layout.model";
import {LayoutService} from "./Layout.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSortArgs} from "../common/args/ItemSort.args";
import {PaginatedLayouts} from "./PaginatedLayouts.model";
import {FileModel} from "../common/models/File.model";
import {GraphQLResolveInfo} from "graphql";
import {LayoutNotFoundError} from "../common/errors/LayoutNotFound.error";
import {ListArgs} from "./dto/List.args";
import {ChosenLayoutOptionValue} from "./dto/ChosenLayoutOptionValue.input";


@Resolver(LayoutModel)
export class LayoutResolver {

    constructor(private layoutService: LayoutService) {
    }

    @Query(() => LayoutModel, {
        description: `Find a single layout`,
    })
    async layout(
        @Info() info: GraphQLResolveInfo,
        @Args("id") id: string,
    ): Promise<LayoutModel> {
        const layout = await this.layoutService.findOne({id}, {info});
        if (!layout) {
            throw new LayoutNotFoundError();
        }
        return new LayoutModel(layout);
    }

    @Query(() => PaginatedLayouts, {
        description: `Find multiple layouts`,
    })
    async layouts(
        @Info() info: GraphQLResolveInfo,
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedLayouts> {
        const result = await this.layoutService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        }, {info, rootField: "nodes"});

        return new PaginatedLayouts(
            paginationArgs,
            result.count,
            result.result.map((u) => new LayoutModel(u)),
        );
    }

    @Query(() => [LayoutModel], {
        description: `Fetch random layouts`,
    })
    async randomLayouts(
        @Info() info: GraphQLResolveInfo,
        @Args() limitArg?: LimitArg,
        @Args("target", {nullable: true}) target?: Target,
    ): Promise<LayoutModel[]> {
        return (
            await this.layoutService.findRandom({
                ...limitArg,
                target,
            }, {info})
        ).map((u) => new LayoutModel(u));
    }

    @Query(() => FileModel, {
        description: `Combine a layout with options`,
    })
    async buildLayout(
        @Args("id") id: string,
        @Args({name: "options", type: () => [ChosenLayoutOptionValue]}) options: ChosenLayoutOptionValue[],
    ): Promise<FileModel> {
        const {fileName, data, mimetype} = await this.layoutService.buildOne(id, options);
        return new FileModel(fileName, data.toString("base64"), mimetype);
    }

}
