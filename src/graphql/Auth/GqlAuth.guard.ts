import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {UnauthenticatedError} from "../common/errors/auth/Unauthenticated.error";
import {UserEntity} from "../User/User.entity";
import {ThemeResolver} from "../Theme/Theme.resolver";
import {HBThemeResolver} from "../HBTheme/HBTheme.resolver";
import {PackResolver} from "../Pack/Pack.resolver";
import {LayoutResolver} from "../Layout/Layout.resolver";
import {UnauthorizedError} from "../common/errors/auth/Unauthorized.error";
import {Reflector} from "@nestjs/core";
import {ThemeService} from "../Theme/Theme.service";
import {HBThemeService} from "../HBTheme/HBTheme.service";
import {PackService} from "../Pack/Pack.service";
import {LayoutService} from "../Layout/Layout.service";
import * as assert from "assert";

@Injectable()
export class GqlAuthGuard implements CanActivate {

    constructor(
        private reflector: Reflector,
        private themeService: ThemeService,
        private hbthemeService: HBThemeService,
        private packService: PackService,
        private layoutService: LayoutService,
    ) {
    }

    canActivate(context: ExecutionContext) {
        const checkAuth = this.reflector.get<boolean>("checkAuth", context.getHandler());
        if (!checkAuth) return true;

        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;
        const user = req.user as UserEntity;

        if (req.isAuthenticated()) {
            // Allow admin all rights, without any further restrictions
            if (user.isAdmin) return true;

            // If admin is required, the current user will be rejected
            const restrictAdmin = this.reflector.get<boolean>("restrictAdmin", context.getHandler());
            if (restrictAdmin) {
                throw new UnauthorizedError("Restricted to admins");
            }

            // If the operation should only be allowed by the owner
            const restrictOwner = this.reflector.get<boolean>("restrictOwner", context.getHandler());
            if (restrictOwner) {
                let service;
                switch (ctx.getClass()) {
                    case ThemeResolver:
                        service = this.themeService;
                        break;
                    case HBThemeResolver:
                        service = this.hbthemeService;
                        break;
                    case PackResolver:
                        service = this.packService;
                        break;
                    case LayoutResolver:
                        service = this.layoutService;
                        break;
                }

                const itemIdField = this.reflector.get<string>("itemIdField", context.getHandler()) || "id";
                const args = ctx.getArgs();
                assert(Object.keys(args).includes(itemIdField));
                if (!service || service.isOwner(args[itemIdField], user.id)) {
                    throw new UnauthorizedError("Restricted to the owner");
                }
            }

            // otherwise session passed all checks: user is authorized
            return true;
        } else throw new UnauthenticatedError("User not logged in");
    }

}