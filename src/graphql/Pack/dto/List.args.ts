import {ArgsType, Field} from "@nestjs/graphql";

@ArgsType()
export class ListArgs {

    @Field({nullable: true})
    query?: string;
    @Field(() => [String], {nullable: true})
    creators?: string[];
    @Field({
        defaultValue: false,
        description: "Whether to include NSFW results. If false, a pack will be excluded if any of the themes is NSFW.",
    })
    includeNSFW?: boolean = false;

}