import {ObjectType} from "@nestjs/graphql";
import {PreviewsModelInterface} from "../../common/interfaces/Previews.model.interface";

@ObjectType("HBThemePreviews", {implements: [PreviewsModelInterface]})
export class HBThemePreviewsModel extends PreviewsModelInterface {

}