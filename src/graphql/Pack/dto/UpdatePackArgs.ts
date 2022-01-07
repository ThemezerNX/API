import {ArgsType, Field} from "@nestjs/graphql";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {UpdatePackDataInput} from "./UpdatePackData.input";
import {IsHexadecimal} from "class-validator";

@ArgsType()
export class UpdatePackArgs {

    @Field()
    @IsHexadecimal()
    id: string;

    @Field(() => UpdatePackDataInput)
    @ValidateChild(() => UpdatePackDataInput)
    data: UpdatePackDataInput;

}
