import {ArgsType, Field} from "@nestjs/graphql";
import {Target} from "../../common/enums/Target";

@ArgsType()
export class ListArgs {

    @Field(() => Target, {nullable: true})
    target?: Target;
    @Field({nullable: true})
    query?: string;
    @Field(() => [String], {nullable: true})
    creators?: string[];
    @Field(() => [String], {nullable: true})
    layouts?: string[];
    @Field({defaultValue: false})
    includeNSFW: boolean = false;

}