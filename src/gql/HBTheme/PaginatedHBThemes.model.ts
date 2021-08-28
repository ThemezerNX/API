import {Field, ObjectType} from "@nestjs/graphql";
import {PaginatedNodesInterface, Pagination} from "../common/interfaces/Paginated.model.interface";
import {HBThemeModel} from "./HBTheme.model";

@ObjectType({implements: [Pagination]})
export class PaginatedHBThemes extends Pagination<HBThemeModel> implements PaginatedNodesInterface<HBThemeModel> {

    @Field(() => [HBThemeModel])
    nodes: HBThemeModel[];

}