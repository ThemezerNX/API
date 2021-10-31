import {ArgsType, Field} from "@nestjs/graphql";

@ArgsType()
export class ListArgs {

    @Field({nullable: true})
    query?: string;

}