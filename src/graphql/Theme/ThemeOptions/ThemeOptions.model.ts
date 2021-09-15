import {Field, ObjectType} from "@nestjs/graphql";
import {PreviewsModelInterface} from "../../common/interfaces/Previews.model.interface";
import {URLResolver} from "graphql-scalars";

@ObjectType("ThemePreviews", {implements: [PreviewsModelInterface]})
export class ThemeOptionsModel extends PreviewsModelInterface {

    @Field(() => URLResolver, {description: "JPG image, 426x240"})
    image240Url: string;

}