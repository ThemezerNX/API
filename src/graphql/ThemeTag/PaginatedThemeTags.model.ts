import {PaginatedNodesInterface, Pagination} from "../common/interfaces/Paginated.model.interface";
import {ThemeTagModel} from "./ThemeTag.model";
import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType({implements: [Pagination]})
export class PaginatedThemeTags extends Pagination<ThemeTagModel> implements PaginatedNodesInterface<ThemeTagModel> {

    @Field(() => [ThemeTagModel])
    nodes: ThemeTagModel[];

}