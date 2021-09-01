import {Field, ObjectType} from "@nestjs/graphql";
import {PaginatedNodesInterface, Pagination} from "../common/interfaces/Paginated.model.interface";
import {ThemeModel} from "./Theme.model";

@ObjectType({implements: [Pagination]})
export class PaginatedThemes extends Pagination<ThemeModel> implements PaginatedNodesInterface<ThemeModel> {

    @Field(() => [ThemeModel])
    nodes: ThemeModel[];

}