import {ArgsType, Field} from "@nestjs/graphql";
import {SortInterface} from "../../common/interfaces/Sort.interface";
import {MinLength} from "class-validator";

@ArgsType()
export class QueryArgs extends SortInterface {

    @Field()
    @MinLength(1)
    id: string;

}