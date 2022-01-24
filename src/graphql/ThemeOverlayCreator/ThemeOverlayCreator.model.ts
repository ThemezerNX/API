import {Field, ID, ObjectType} from "@nestjs/graphql";
import {RootModelAbstract} from "../common/interfaces/Root.model.abstract";

@ObjectType("ThemeTag")
export class ThemeOverlayCreatorModel extends RootModelAbstract {

    @Field(() => ID)
    id: number;

    @Field()
    name: string;

}