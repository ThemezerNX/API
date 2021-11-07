import {ArgsType, Field} from "@nestjs/graphql";
import {SortInterface} from "../../common/interfaces/Sort.interface";
import {IsNotEmpty} from "class-validator";

@ArgsType()
export class NXInstallerQueryArgs extends SortInterface {

    @Field()
    @IsNotEmpty()
    id: string;

}