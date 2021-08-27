import {Field, ID, ObjectType} from "@nestjs/graphql";

@ObjectType("ThemeTag")
export class ThemeTagModel {

    @Field(() => ID)
    id: number;

    @Field()
    name: string;

}