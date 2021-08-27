import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, Repository} from "typeorm";
import {UserEntity} from "./User.entity";
import {StringContains} from "../common/findOperators/StringContains";
import {PaginationArgs, paginationConditions} from "../common/args/Pagination.args";
import {SortOrder} from "../common/enums/SortOrder";
import {UserSort} from "./User.resolver";

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private repository: Repository<UserEntity>) {
    }

    async findOne({id}): Promise<UserEntity> {
        return this.repository.findOne({
            where: {id},
        });
    }

    async findAll(
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
    ): Promise<UserEntity[]> {
        const findConditions: FindConditions<UserEntity> = {};

        if (query?.length > 0) {
            findConditions.username = StringContains(query);
        }
        if (isAdmin) {
            findConditions.isAdmin = isAdmin;
        }

        return this.repository.find({
            where: findConditions,
            order: {
                [sort]: order,
            },
            ...paginationConditions(paginationArgs),
        });
    }

}