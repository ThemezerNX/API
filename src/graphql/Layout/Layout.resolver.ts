import {Args, ArgsType, Field, Parent, Query, ResolveField, Resolver} from "@nestjs/graphql";
import {Target} from "../common/enums/Target";
import {LayoutModel} from "./Layout.model";
import {LayoutService} from "./Layout.service";
import {LimitArg, PaginationArgs} from "../common/args/Pagination.args";
import {UserService} from "../User/User.service";
import {UserModel} from "../User/User.model";
import {LayoutEntity} from "./Layout.entity";
import {ItemSortArgs} from "../common/args/ItemSortArgs";
import {PaginatedLayouts} from "./PaginatedLayouts.model";
import {LayoutOptionModel} from "../LayoutOption/LayoutOption.model";
import {LayoutOptionService} from "../LayoutOption/LayoutOption.service";
import {FileModel} from "../common/models/File.model";
import {IsDecimal, IsHexColor, IsInt, IsNumber, IsUUID} from "class-validator";


@ArgsType()
class ListArgs {

    @Field(() => Target, {nullable: true})
    target?: Target;
    @Field({nullable: true})
    query?: string;
    @Field(() => [String], {nullable: true})
    creators?: string[];

}

@ArgsType()
export class ChosenLayoutOption {

    @Field({nullable: true})
    @IsUUID()
    uuid: string;

    @Field({nullable: true})
    stringValue?: string;

    @Field({nullable: true})
    @IsHexColor()
    colorValue?: string;

    @Field({nullable: true})
    @IsInt()
    integerValue?: number;

    @Field({nullable: true})
    @IsDecimal()
    decimalValue?: number;

    @Field({nullable: true})
    booleanValue?: boolean;

}

@Resolver(LayoutModel)
export class LayoutResolver {

    constructor(private layoutService: LayoutService, private layoutOptionService: LayoutOptionService, private userService: UserService) {
    }

    @ResolveField(() => UserModel)
    creator(@Parent() layout: LayoutEntity): Promise<UserModel> {
        const id = layout.creatorId;
        return this.userService.findOne({id});
    }

    @ResolveField(() => [LayoutOptionModel])
    options(@Parent() layout: LayoutEntity): Promise<LayoutOptionModel[]> {
        return this.layoutOptionService.findAll({layoutId: layout.id});
    }

    @ResolveField(() => [LayoutOptionModel])
    globalOptions(): Promise<LayoutOptionModel[]> {
        return this.layoutOptionService.findAll({layoutId: null});
    }

    @Query(() => LayoutModel, {
        description: `Find a single layout`,
    })
    layout(
        @Args("id") id: string,
    ): Promise<LayoutModel> {
        return this.layoutService.findOne({id});
    }

    @Query(() => PaginatedLayouts, {
        description: `Find multiple layouts`,
    })
    async layouts(
        @Args() paginationArgs: PaginationArgs,
        @Args() itemSortArgs: ItemSortArgs,
        @Args() listArgs?: ListArgs,
    ): Promise<PaginatedLayouts> {
        const result = await this.layoutService.findAll({
            paginationArgs,
            ...itemSortArgs,
            ...listArgs,
        });

        return new PaginatedLayouts(paginationArgs, result[1], result[0]);
    }

    @Query(() => [LayoutModel], {
        description: `Fetch random layouts`,
    })
    randomLayouts(
        @Args() limitArg?: LimitArg,
    ): Promise<LayoutModel[]> {
        return this.layoutService.findRandom({
            ...limitArg,
        });
    }

    @Query(() => FileModel, {
        description: `Combine a layout with options`,
    })
    buildLayout(
        @Args("id") id: string,
        @Args("options") options: ChosenLayoutOption[],
    ): Promise<FileModel> {
        return this.layoutService.buildOne({id}, options);
    }

}
