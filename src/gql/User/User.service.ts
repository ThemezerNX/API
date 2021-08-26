import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, Repository} from "typeorm";
import {UserEntity} from "./User.entity";
import {StringContains} from "../common/findOperators/StringContains";

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private repository: Repository<UserEntity>) {
    }

    async findOne({id}): Promise<UserEntity> {
        return this.repository.findOne({
            where: {id},
        });
    }

    async findAll({
                      query,
                  }): Promise<UserEntity[]> {
        const findConditions: FindConditions<UserEntity> = {};

        if (query?.length > 0) {
            findConditions.username = StringContains(query);
        }

        return this.repository.find({
            where: findConditions,
        });
    }

}