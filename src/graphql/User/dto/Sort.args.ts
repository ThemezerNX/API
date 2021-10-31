import {ArgsType, Field, registerEnumType} from "@nestjs/graphql";
import {SortInterface} from "../../common/interfaces/Sort.interface";

@ArgsType()
export class SortArgs extends SortInterface {

    @Field(() => UserSort, {nullable: true})
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
