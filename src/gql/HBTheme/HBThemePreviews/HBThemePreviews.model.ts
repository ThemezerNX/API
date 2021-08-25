import {ObjectType} from "@nestjs/graphql";
import {PreviewsModelInterface} from "../../common/interfaces/Previews.model.interface";

@ObjectType({implements: [PreviewsModelInterface]})
export class HBThemePreviewsModel extends PreviewsModelInterface {

    image720: string;

    image360: string;

    image240: string;

    image180: string;

    imagePlaceholder: string;

}