import {Info, Query, Resolver} from "@nestjs/graphql";
import {LayoutOptionService} from "./LayoutOption.service";
import {LayoutOptionModel} from "./LayoutOption.model";
import {GraphQLResolveInfo} from "graphql";


@Resolver(LayoutOptionModel)
export class LayoutOptionResolver {

    constructor(private layoutOptionService: LayoutOptionService) {
    }

    @Query(() => [LayoutOptionModel])
    async globalLayoutOptions(@Info() info: GraphQLResolveInfo): Promise<LayoutOptionModel[]> {
        return (
            await this.layoutOptionService.findAllOptions({layoutId: null}, {info})
        ).map((u) => new LayoutOptionModel(u));
    }

}
