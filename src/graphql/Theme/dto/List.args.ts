import {ArgsType, Field} from "@nestjs/graphql";
import {Target} from "../../common/enums/Target";
import {IsOptional} from "class-validator";

@ArgsType()
export class ListArgs {

    @Field(() => Target, {nullable: true})
    @IsOptional()
    target?: Target;

    @Field({nullable: true})
    @IsOptional()
    query?: string;

    @Field(() => [String], {nullable: true})
    @IsOptional()
    creators?: string[];

    @Field(() => [String], {nullable: true})
    @IsOptional()
    layouts?: string[];

    @Field({defaultValue: false})
    includeNSFW: boolean = false;

}
