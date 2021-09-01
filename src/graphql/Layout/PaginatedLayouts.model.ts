import {Field, ObjectType} from "@nestjs/graphql";
import {PaginatedNodesInterface, Pagination} from "../common/interfaces/Paginated.model.interface";
import {LayoutModel} from "./Layout.model";

@ObjectType({implements: [Pagination]})
export class PaginatedLayouts extends Pagination<LayoutModel> implements PaginatedNodesInterface<LayoutModel> {

    @Field(() => [LayoutModel])
    nodes: LayoutModel[];

}