import {Field, ObjectType} from "@nestjs/graphql";
import {PaginatedNodesInterface, Pagination} from "../common/interfaces/Paginated.model.interface";
import {UserModel} from "./User.model";

@ObjectType({implements: [Pagination]})
export class PaginatedUsers extends Pagination<UserModel> implements PaginatedNodesInterface<UserModel> {

    @Field(() => [UserModel])
    nodes: UserModel[];

}