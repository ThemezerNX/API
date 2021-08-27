import {ArgsType, Field} from "@nestjs/graphql";
import {SortOrder} from "../enums/SortOrder";

@ArgsType()
export abstract class SortInterface {

    @Field(() => SortOrder, {nullable: true})
    order?: SortOrder = SortOrder.ASC;

}