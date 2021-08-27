import {ObjectType} from "@nestjs/graphql";
import {PreviewsModelInterface} from "../../common/interfaces/Previews.model.interface";

@ObjectType("LayoutPreviews", {implements: [PreviewsModelInterface]})
export class LayoutPreviewsModel extends PreviewsModelInterface {

    image720Url: string;

    image360Url: string;

    image240Url: string;

    image180Url: string;

    imagePlaceholderUrl: string;

}