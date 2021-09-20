import {Args, ArgsType, Field, InputType, Parent, Query, ResolveField, Resolver} from "@nestjs/graphql";
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
import {IsDecimal, IsHexColor, IsInt, IsNotEmpty, IsUUID, Length} from "class-validator";


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

    constructor(private layoutService: LayoutService, private layoutOptionService: LayoutOptionService, private userService: UserService) {
    }

    @ResolveField(() => UserModel)
    creator(@Parent() layout: LayoutEntity): Promise<UserModel> {
        return this.userService.findOne({id: layout.creatorId});
    }

    @ResolveField(() => [LayoutOptionModel])
    options(@Parent() layout: LayoutEntity): Promise<LayoutOptionModel[]> {
        // this loads all options by priority asc, instead of randomly (typeorm relation can't be ordered by)
        return this.layoutOptionService.findAllOptions({layoutId: layout.id});
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
