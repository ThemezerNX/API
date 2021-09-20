import {Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ThemeOptionEntity} from "./ThemeOption.entity";

@Injectable()
export class ThemeOptionService {

    constructor(
        @InjectRepository(ThemeOptionEntity) private repository: Repository<ThemeOptionEntity>,
    ) {
    }

    findAll({themeId}: { themeId: string }): Promise<ThemeOptionEntity[]> {
        // TODO, does this join ALL items, or use a
        return this.repository.createQueryBuilder("options")
            .where({themeId})
            .leftJoinAndSelect("options.layoutOptionValue", "layoutOptionValue")
            .leftJoin("layoutOptionValue.layoutOption", "layoutOption")
            .orderBy({"layoutOption.priority": "ASC"}) // Order by priority; <= 99: layout-specific, >=100 global
            .getMany();
    }

}