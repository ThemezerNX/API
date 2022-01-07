import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, Repository} from "typeorm";
import {UserEntity} from "./User.entity";
import {StringContains} from "../common/findOperators/StringContains";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {SortOrder} from "../common/enums/SortOrder";
import {UserConnectionsEntity} from "./Connections/UserConnections.entity";
import {UserProfileEntity} from "./Profile/UserProfile.entity";
import {EmailAlreadyRegisteredError} from "../common/errors/auth/EmailAlreadyRegistered.error";
import {UnknownError} from "../common/errors/Unknown.error";
import {UserPreferencesEntity} from "./Preferences/UserPreferences.entity";
import {UserSort} from "./dto/Sort.args";
import {IsOwner} from "../common/interfaces/IsOwner.interface";
import {createInfoSelectQueryBuilder} from "../common/functions/createInfoSelectQueryBuilder";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";
import {LayoutService} from "../Layout/Layout.service";
import {UpdateUserDataInput} from "./dto/UpdateUserData.input";
import {UserNotFoundError} from "../common/errors/auth/UserNotFound.error";
import {UpdateUserProfileArgs} from "./dto/UpdateUserPreferences.args";

@Injectable()
export class UserService implements IsOwner {

    constructor(
        @InjectRepository(UserEntity) private repository: Repository<UserEntity>,
        private layoutService: LayoutService,
    ) {
    }

    findOne({
                id,
                email,
                isVerified = true,
            }: {
                id?: string,
                email?: string,
                isVerified?: boolean,
            },
            options?: ServiceFindOptionsParameter<UserEntity>,
    ): Promise<UserEntity> {
        // infoselect builder
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository);
        const findConditions: FindConditions<UserEntity> = {};

        if (isVerified) {
            findConditions.isVerified = true;
        }

        if (id != undefined) {
            findConditions.id = id;
        }
        if (email != undefined) {
            findConditions.email = email;
        }

        queryBuilder
            .where(findConditions);

        return queryBuilder.getOne();
    }

    findAll(
        {
            paginationArgs,
            sort = UserSort.USERNAME,
            order = SortOrder.ASC,
            query,
            isAdmin,
            activatedOnly = true,
        }:
            {
                paginationArgs?: PaginationArgs
                sort?: UserSort,
                order?: SortOrder,
                query?: string
                isAdmin?: boolean
                activatedOnly?: boolean,
            },
        options,
    ) {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository);
        const findConditions: FindConditions<UserEntity> = {};

        if (activatedOnly) {
            findConditions.hasAccepted = true;
            findConditions.isVerified = true;
        }

        if (query?.length > 0) {
            findConditions.username = StringContains(query);
        }
        if (isAdmin != undefined) {
            findConditions.isAdmin = isAdmin;
        }

        queryBuilder
            .where(findConditions)
            .orderBy({[`"${queryBuilder.alias}"."${sort}"`]: order});

        return executeAndPaginate(queryBuilder, paginationArgs);
    }

    async create(email: string, password: string, username: string): Promise<UserEntity> {
        try {
            const user = UserEntity.create({
                email,
                password,
                username,
                connections: new UserConnectionsEntity(),
                preferences: new UserPreferencesEntity(),
                profile: new UserProfileEntity(),
                isVerified: process.env.NODE_ENV === "development",
            });
            await user.save();
            return user;
        } catch (err) {
            if (err.message.includes("UQ")) {
                throw new EmailAlreadyRegisteredError();
            } else throw new UnknownError(err.message);
        }
    }

    async isOwner(userId: string, ownUserId: string): Promise<boolean> {
        return userId == ownUserId;
    }

    async delete(id: string) {
        await this.repository.manager.transaction(async () => {
            // transfer layouts to user 'unknown' with id '0'
            await this.layoutService.transfer(id, "0");
            // delete user and cascade with all related entities
            await this.repository.delete({id});
        });
    }

    async update(id: string, data: UpdateUserDataInput) {
        const user = await this.repository.findOne({
            where: {id},
            relations: ["profile", "preferences", "connections"],
        });
        if (!user) {
            throw new UserNotFoundError();
        }
        if (data.username !== undefined) {
            user.username = data.username;
        }
        if (data.profile !== undefined) {
            if (data.profile.bio !== undefined) {
                user.profile.bio = data.profile.bio;
            }
            if (data.profile.color !== undefined) {
                user.profile.color = data.profile.color;
            }

            if (data.profile.avatar === null) {
                user.profile.avatarFile = null;
            } else if (data.profile.avatar !== undefined) {
                await user.profile.setAvatar((await data.profile.avatar).createReadStream);
            }
            if (data.profile.banner === null) {
                user.profile.bannerFile = null;
            } else if (data.profile.banner !== undefined) {
                await user.profile.setBanner((await data.profile.banner).createReadStream);
            }
        }

        await user.save();
    }

    async updatePreferences(id: string, data: UpdateUserProfileArgs) {
        const user = await this.repository.findOne({
            where: {id},
            relations: ["preferences"],
        });

        if (!user) {
            throw new UserNotFoundError();
        }
        if (data.showNSFW !== undefined) {
            user.preferences.showNSFW = data.showNSFW;
        }
        if (data.promotionEmails !== undefined) {
            user.preferences.promotionEmails = data.promotionEmails;
        }
        if (data.notificationEmails !== undefined) {
            user.preferences.notificationEmails = data.notificationEmails;
        }

        await user.save();
    }

    setHasAccepted(id: string, value: boolean) {
        return this.repository.update({id}, {hasAccepted: value});
    }

    setIsBlocked(id: string, value: boolean) {
        return this.repository.update({id}, {isBlocked: value});
    }

}