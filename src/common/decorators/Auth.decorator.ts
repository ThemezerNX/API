import {applyDecorators, SetMetadata} from "@nestjs/common";

class AuthDecoratorConfig {
    /**
     * Whether only admins are allowed to access the query/mutation.
     */
    adminOnly?: boolean;
    /**
     * Whether only owners are allowed to access the query/mutation. Admins are also allowed.
     */
    ownerOnly?: boolean;
    /**
     * Which field the item's id is stored in. Used to determine if the user is the owner.
     */
    itemIdField?: string;
    /**
     * Whether the serialize metadata should be set based on user permissions.
     */
    defineSerializeMetadata?: boolean = true;
}

export function Auth(restrictions: AuthDecoratorConfig = new AuthDecoratorConfig()) {
    return applyDecorators(
        SetMetadata("checkAuth", true),
        SetMetadata("defineSerializeMetadata", restrictions?.defineSerializeMetadata),
        SetMetadata("restrictAdmin", restrictions?.adminOnly),
        SetMetadata("restrictOwner", restrictions?.ownerOnly),
        SetMetadata("itemIdField", restrictions?.itemIdField),
    );
}