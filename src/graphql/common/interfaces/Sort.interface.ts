import {ArgsType, Field} from "@nestjs/graphql";
import {SortOrder} from "../enums/SortOrder";
import {IsOptional} from "class-validator";

@ArgsType()
export abstract class SortInterface {

    @Field(() => SortOrder, {nullable: true})
    @IsOptional()
    order?: SortOrder = SortOrder.ASC;

}