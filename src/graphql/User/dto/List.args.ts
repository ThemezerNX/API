import {ArgsType, Field} from "@nestjs/graphql";
import {IsOptional} from "class-validator";

@ArgsType()
export class ListArgs {

    @Field({nullable: true})
    @IsOptional()
    query?: string;

    @Field({nullable: true})
    @IsOptional()
    isAdmin?: boolean;

}