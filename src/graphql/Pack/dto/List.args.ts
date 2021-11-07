import {ArgsType, Field} from "@nestjs/graphql";
import {IsOptional} from "class-validator";

@ArgsType()
export class ListArgs {

    @Field({nullable: true})
    @IsOptional()
    query?: string;

    @Field(() => [String], {nullable: true})
    @IsOptional()
    creators?: string[];

    @Field({
        defaultValue: false,
        description: "Whether to include NSFW results. If false, a pack will be excluded if any of the themes is NSFW.",
    })
    @IsOptional()
    includeNSFW: boolean = false;

}