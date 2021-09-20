import {Query, Resolver} from "@nestjs/graphql";
import {LayoutOptionService} from "./LayoutOption.service";
import {LayoutOptionModel} from "./LayoutOption.model";


@Resolver(LayoutOptionModel)
export class LayoutOptionResolver {

    constructor(private layoutOptionService: LayoutOptionService) {
    }

    @Query(() => [LayoutOptionModel])
    globalLayoutOptions(): Promise<LayoutOptionModel[]> {
        return this.layoutOptionService.findAllOptions({layoutId: null});
    }

}
