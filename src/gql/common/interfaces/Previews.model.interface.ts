import {Field, InterfaceType} from "@nestjs/graphql";
import {URLResolver} from "graphql-scalars";


@InterfaceType()
export class PreviewsModelInterface {

    @Field(() => URLResolver, {description: "WebP image, 1280x720"})
    image720: string;

    @Field(() => URLResolver, {description: "WebP image, 640x360"})
    image360: string;

    @Field(() => URLResolver, {description: "JPG image, 426x240"})
    image240: string;

    @Field(() => URLResolver, {description: "WebP image, 320x180"})
    image180: string;

    @Field(() => URLResolver, {description: "WebP image, 80x45"})
    imagePlaceholder: string;

}