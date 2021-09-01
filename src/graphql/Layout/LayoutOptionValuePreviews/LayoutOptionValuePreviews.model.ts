import {ObjectType} from "@nestjs/graphql";
import {PreviewsModelInterface} from "../../common/interfaces/Previews.model.interface";

@ObjectType("LayoutOptionValuePreviews", {implements: [PreviewsModelInterface]})
export class LayoutOptionValuePreviewsModel extends PreviewsModelInterface {

}