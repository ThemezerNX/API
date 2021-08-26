import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, Repository} from "typeorm";
import {ThemeEntity} from "./Theme.entity";

@Injectable()
export class ThemeService {

    constructor(@InjectRepository(ThemeEntity) private repository: Repository<ThemeEntity>) {
    }

    async findOne({id}): Promise<ThemeEntity> {
        return this.repository.findOne({
            where: {id},
        });
    }

    async findAll({
                      query,
                  }): Promise<ThemeEntity[]> {
        const findConditions: FindConditions<ThemeEntity> = {};

        if (query?.length > 0) {
            // findConditions. = StringContains(query);
        }

        return this.repository.find({
            where: findConditions,
        });
    }

}