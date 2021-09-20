import {Parent, ResolveField, Resolver} from "@nestjs/graphql";
import {LayoutOptionModel} from "../LayoutOption.model";
import {LayoutOptionValueEntity} from "./LayoutOptionValue.entity";
import {LayoutOptionService} from "../LayoutOption.service";
import {LayoutOptionValueModel} from "./LayoutOptionValue.model";


@Resolver(LayoutOptionValueModel)
export class LayoutOptionValueResolver {

    constructor(private layoutOptionService: LayoutOptionService) {
    }

    @ResolveField(() => LayoutOptionModel)
    layoutOption(@Parent() layoutOptionValue: LayoutOptionValueEntity): Promise<LayoutOptionModel> {
        return this.layoutOptionService.findOption({id: layoutOptionValue.layoutOptionId});
    }

}
