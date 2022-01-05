import {ArgsType, Field} from "@nestjs/graphql";
import {ValidateChild} from "../../common/decorators/ValidateNested.decorator";
import {UpdateUserDataInput} from "./UpdateUserData.input";
import {IsUserId} from "../../common/decorators/validators/IsUserId";

@ArgsType()
export class UpdateUserArgs {

    @Field()
    @IsUserId()
    id: string;

    @Field(() => UpdateUserDataInput)
    @ValidateChild(() => UpdateUserDataInput)
    data: UpdateUserDataInput;

}
