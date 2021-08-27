import {Field, InterfaceType} from "@nestjs/graphql";
import {URLResolver} from "graphql-scalars";


@InterfaceType("PreviewsInterface")
export abstract class PreviewsModelInterface {

    @Field(() => URLResolver, {description: "WebP image, 1280x720"})
    image720Url: string;

    @Field(() => URLResolver, {description: "WebP image, 640x360"})
    image360Url: string;

    @Field(() => URLResolver, {description: "WebP image, 426x240"})
    image240Url: string;

    @Field(() => URLResolver, {description: "WebP image, 320x180"})
    image180Url: string;

    @Field(() => URLResolver, {description: "WebP image, 80x45"})
    imagePlaceholderUrl: string;

}