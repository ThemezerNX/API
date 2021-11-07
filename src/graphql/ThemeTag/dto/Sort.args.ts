import {ArgsType, Field, registerEnumType} from "@nestjs/graphql";
import {SortInterface} from "../../common/interfaces/Sort.interface";
import {IsOptional} from "class-validator";

@ArgsType()
export class SortArgs extends SortInterface {

    @Field(() => TagSort, {nullable: true})
    @IsOptional()
    sort?: TagSort = TagSort.ID;

}

export enum TagSort {
    ID = "id",
    NAME = "name",
}

registerEnumType(TagSort, {
    name: "TagSort",
});
