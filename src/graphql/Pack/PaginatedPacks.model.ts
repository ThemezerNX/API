import {Field, ObjectType} from "@nestjs/graphql";
import {PaginatedNodesInterface, Pagination} from "../common/interfaces/Paginated.model.interface";
import {PackModel} from "./Pack.model";

@ObjectType({implements: [Pagination]})
export class PaginatedPacks extends Pagination<PackModel> implements PaginatedNodesInterface<PackModel> {

    @Field(() => [PackModel])
    nodes: PackModel[];

}