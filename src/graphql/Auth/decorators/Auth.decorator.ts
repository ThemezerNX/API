import {applyDecorators, SetMetadata} from "@nestjs/common";

type AuthDecoratorConfig = {
    /**
     * Whether only admins are allowed to access the query/mutation.
     */
    adminOnly?: boolean,
    /**
     * Whether only owners are allowed to access the query/mutation. Admins are also allowed.
     */
    ownerOnly?: boolean,
    /**
     * Which field the item's id is stored in. Used to determine if the user is the owner.
     */
    itemIdField?: string,
}

export function Auth(restrictions?: AuthDecoratorConfig) {
    return applyDecorators(
        SetMetadata("checkAuth", true),
        SetMetadata("restrictAdmin", restrictions?.adminOnly),
        SetMetadata("restrictOwner", restrictions?.ownerOnly),
        SetMetadata("itemIdField", restrictions?.itemIdField),
    );
}