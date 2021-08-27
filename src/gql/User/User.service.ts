import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, Repository} from "typeorm";
import {UserEntity} from "./User.entity";
import {StringContains} from "../common/findOperators/StringContains";
import {PaginationArgs, paginationConditions} from "../common/args/Pagination.args";

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
            query,
        }:
            {
                paginationArgs?: PaginationArgs,
                query?: string
            },
    ): Promise<UserEntity[]> {
        const findConditions: FindConditions<UserEntity> = {};

        if (query?.length > 0) {
            findConditions.username = StringContains(query);
        }

        return this.repository.find({
            where: findConditions,
            ...paginationConditions(paginationArgs),
        });
    }

}