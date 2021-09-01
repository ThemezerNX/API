import {ObjectType} from "@nestjs/graphql";
import {PreviewsModelInterface} from "../../common/interfaces/Previews.model.interface";

@ObjectType("LayoutPreviews", {implements: [PreviewsModelInterface]})
export class LayoutPreviewsModel extends PreviewsModelInterface {

}