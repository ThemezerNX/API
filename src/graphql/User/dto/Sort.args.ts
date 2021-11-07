import {ArgsType, Field, registerEnumType} from "@nestjs/graphql";
import {SortInterface} from "../../common/interfaces/Sort.interface";
import {IsOptional} from "class-validator";

@ArgsType()
export class SortArgs extends SortInterface {

    @Field(() => UserSort, {nullable: true})
    @IsOptional()
    sort?: UserSort = UserSort.ID;

}

export enum UserSort {
    ID = "id",
    USERNAME = "username",
    JOINED = "joinedTimestamp"
}

registerEnumType(UserSort, {
    name: "UserSort",
});
