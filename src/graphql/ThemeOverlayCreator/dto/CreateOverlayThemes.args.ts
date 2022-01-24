import {ArgsType, Field} from "@nestjs/graphql";
import {JSONResolver} from "graphql-scalars";
import {IsJSON} from "class-validator";

@ArgsType()
export class CreateOverlayThemesArgs {

    @Field(() => JSONResolver, {nullable: true})
    @IsJSON()
    layoutJson?: string;

    @Field(() => JSONResolver, {nullable: true})
    @IsJSON()
    pieceJson?: string;

    @Field(() => JSONResolver, {nullable: true})
    @IsJSON()
    commonLayoutJson?: string;

}
