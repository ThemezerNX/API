import {Injectable} from "@nestjs/common";
import {Args, ArgsType, Context, Field, Info, Query, Resolver} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {GraphQLResolveInfo} from "graphql";
import {Target} from "../common/enums/Target";
import {FilterOrder, FilterSort} from "../common/enums/SortOrder";
import {ThemeEntity} from "./Theme.entity";
import {ThemeModel} from "./Theme.model";

@Injectable()
@Resolver()
export class ThemeResolver {

    constructor(
        @InjectRepository(ThemeEntity) private themeEntityRepository: Repository<ThemeEntity>,
    ) {
    }

    // @Query(() => [ThemeModel], {
    //     description: `Generic Collection Query For Themes`,
    // })
    // async users(
    //     @Context() ctx,
    //     @Args() args: ThemeListArgs,
    //     @Info() info: GraphQLResolveInfo,
    // ): Promise<ThemeModel[]> {
    //     return this.themeEntityRepository.find();
    // }

}

@ArgsType()
class ThemeListArgs {

    @Field({nullable: true})
    limit?: number;
    @Field({nullable: true})
    page?: number;
    @Field(() => Target, {nullable: true})
    target?: Target;
    @Field({nullable: true})
    query?: string;
    @Field(() => FilterSort, {nullable: true})
    sort?: FilterSort;
    @Field(() => FilterOrder, {nullable: true})
    order?: FilterOrder;
    @Field(() => [String], {nullable: true})
    creators?: string[];
    @Field(() => [String], {nullable: true})
    layouts?: string[];
    @Field({nullable: true})
    nsfw?: boolean;

}