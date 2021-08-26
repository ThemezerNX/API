import {Field, ObjectType} from "@nestjs/graphql";
import {PreviewsModelInterface} from "../../common/interfaces/Previews.model.interface";
import {URLResolver} from "graphql-scalars";

@ObjectType({implements: [PreviewsModelInterface]})
export class ThemePreviewsModel extends PreviewsModelInterface {

    image720Url: string;

    image360Url: string;

    @Field(() => URLResolver, {description: "JPG image, 426x240"})
    image240Url: string;

    image180Url: string;

    imagePlaceholderUrl: string;

}