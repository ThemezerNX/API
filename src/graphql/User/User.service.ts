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
import {createInfoSelectQueryBuilder} from "../common/functions/CreateInfoSelectQueryBuilder";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";

@Injectable()
export class UserService implements IsOwner {

    constructor(@InjectRepository(UserEntity) private repository: Repository<UserEntity>) {
    }

    findOne({
                id,
                email,
                activatedOnly = true,
            }: {
                id?: string,
                email?: string,
                activatedOnly?: boolean,
            },
            options?: ServiceFindOptionsParameter<UserEntity>,
    ): Promise<UserEntity> {
        // infoselect builder
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository);
        const findConditions: FindConditions<UserEntity> = {};

        if (activatedOnly) {
            findConditions.hasAccepted = true;
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
            .orderBy({[queryBuilder.alias + `."${sort}"`]: order})

        return executeAndPaginate(queryBuilder, paginationArgs);
    }

    async create(email: string, password: string, username: string): Promise<UserEntity> {
        try {
            const user = UserEntity.create({email, password, username});
            user.connections = new UserConnectionsEntity();
            user.preferences = new UserPreferencesEntity();
            user.profile = new UserProfileEntity();
            return user.save();
        } catch (err) {
            if (err.message.includes("UQ")) {
                throw new EmailAlreadyRegisteredError();
            } else throw new UnknownError();
        }
    }

    async isOwner(userId: string, ownUserId: string): Promise<boolean> {
        return userId == ownUserId;
    }

}