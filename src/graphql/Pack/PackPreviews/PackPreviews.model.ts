import {ObjectType} from "@nestjs/graphql";
import {PreviewsModelInterface} from "../../common/interfaces/Previews.model.interface";

@ObjectType("PackPreviews", {implements: [PreviewsModelInterface]})
export class PackPreviewsModel extends PreviewsModelInterface {

}