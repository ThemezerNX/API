import {Field, InputType} from "@nestjs/graphql";
import {CreateOverlayThemesArgs} from "./CreateOverlayThemes.args";

@InputType()
export class CreateOverlayThemesInput {

    @Field(() => CreateOverlayThemesArgs)
    createOverlayThemes: CreateOverlayThemesArgs;

}
