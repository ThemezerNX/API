import {ObjectType} from "@nestjs/graphql";
import {PreviewsModelInterface} from "../../common/interfaces/Previews.model.interface";

@ObjectType("HBThemePreviews", {implements: [PreviewsModelInterface]})
export class HBThemePreviewsModel extends PreviewsModelInterface {

    image720Url: string;

    image360Url: string;

    image240Url: string;

    image180Url: string;

    imagePlaceholderUrl: string;

}