import {Args, ArgsType, Field, Info, InputType, Query, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {LayoutModel} from "./Layout.model";
import {LayoutService} from "./Layout.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSortArgs} from "../common/args/ItemSortArgs";
import {PaginatedLayouts} from "./PaginatedLayouts.model";
import {FileModel} from "../common/models/File.model";
import {IsDecimal, IsHexColor, IsInt, IsNotEmpty, IsUUID, Length} from "class-validator";
import {GraphQLResolveInfo} from "graphql";
import {LayoutNotFoundError} from "../common/errors/LayoutNotFound.error";


@ArgsType()
class ListArgs {

    @Field(() => Target, {nullable: true})
    target?: Target;
    @Field({nullable: true})
    query?: string;
    @Field(() => [String], {nullable: true})
    creators?: string[];

}

@InputType()
export class ChosenLayoutOptionValue {

    @Field({nullable: true})
    @IsUUID()
    uuid: string;

    @Field({nullable: true, description: "Only one of the value fields is required."})
    @IsInt()
    integerValue?: number;

    @Field({nullable: true, description: "Only one of the value fields is required."})
    @IsDecimal()
    decimalValue?: number;

    @Field({nullable: true, description: "Only one of the value fields is required."})
    @IsNotEmpty()
    stringValue?: string;

    @Field({nullable: true, description: "Only one of the value fields is required."})
    @IsHexColor()
    @Length(8, 8) // TODO: check if this works
    colorValue?: string;

}

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
        return layout;
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
        }, {info});

        return new PaginatedLayouts(paginationArgs, result.count, result.result);
    }

    @Query(() => [LayoutModel], {
        description: `Fetch random layouts`,
    })
    randomLayouts(
        @Args() limitArg?: LimitArg,
        @Args("target", {nullable: true}) target?: Target,
    ): Promise<LayoutModel[]> {
        return this.layoutService.findRandom({
            ...limitArg,
            target,
        });
    }

    @Query(() => FileModel, {
        description: `Combine a layout with options`,
    })
    buildLayout(
        @Args("id") id: string,
        @Args({name: "options", type: () => [ChosenLayoutOptionValue]}) options: ChosenLayoutOptionValue[],
    ): Promise<FileModel> {
        return this.layoutService.buildOne(id, options);
    }

}
