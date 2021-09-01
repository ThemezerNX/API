import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, Repository} from "typeorm";
import {UserEntity} from "./User.entity";
import {StringContains} from "../common/findOperators/StringContains";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {SortOrder} from "../common/enums/SortOrder";
import {UserSort} from "./User.resolver";

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private repository: Repository<UserEntity>) {
    }

    findOne({id}: { id: string }, relations: string[] = []): Promise<UserEntity> {
        return this.repository.findOne({
            where: {id},
            relations,
        });
    }

    findOneByEmail(email: string, relations: string[] = []): Promise<UserEntity> {
        return this.repository.findOne({
            where: {email},
            relations,
        });
    }

    findAll(
        {
            paginationArgs,
            sort = UserSort.USERNAME,
            order = SortOrder.ASC,
            query,
            isAdmin,
        }:
            {
                paginationArgs?: PaginationArgs
                sort?: UserSort,
                order?: SortOrder,
                query?: string
                isAdmin?: boolean
            },
    ): Promise<[UserEntity[], number]> {
        const findConditions: FindConditions<UserEntity> = {};

        if (query?.length > 0) {
            findConditions.username = StringContains(query);
        }
        if (isAdmin != undefined) {
            findConditions.isAdmin = isAdmin;
        }

        return executeAndPaginate(paginationArgs,
            this.repository.createQueryBuilder("user")
                .where(findConditions)
                .leftJoinAndSelect("user.profile", "profile")
                .leftJoinAndSelect("user.preferences", "preferences")
                .leftJoinAndSelect("user.connections", "connections")
                .orderBy({[sort]: order}),
        );
    }

    create(email: string, password: string, username: string): UserEntity {
        const newUser = UserEntity.create({email, password, username});
        const savedUser = newUser.save()
        console.log(newUser, savedUser)

        return newUser;
    }

}