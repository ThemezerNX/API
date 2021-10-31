import {applyDecorators, SetMetadata} from "@nestjs/common";

type AuthDecoratorConfig = {
    admin?: boolean,
    owner?: boolean,
    itemIdParam?: boolean,
}

export function Auth(restrictions?: AuthDecoratorConfig) {
    return applyDecorators(
        SetMetadata("checkAuth", true),
        SetMetadata("restrictAdmin", restrictions?.admin),
        SetMetadata("restrictOwner", restrictions?.owner),
        SetMetadata("itemIdField", restrictions?.itemIdParam),
    );
}