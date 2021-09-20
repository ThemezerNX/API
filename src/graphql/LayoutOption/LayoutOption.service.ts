import {In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {LayoutOptionValueEntity} from "./OptionValue/LayoutOptionValue.entity";
import {LayoutOptionEntity} from "./LayoutOption.entity";

@Injectable()
export class LayoutOptionService {

    constructor(
        @InjectRepository(LayoutOptionEntity) private repository: Repository<LayoutOptionEntity>,
        @InjectRepository(LayoutOptionValueEntity) private valueRepository: Repository<LayoutOptionValueEntity>,
    ) {
    }

    findValue({uuid}: { uuid: string }, relations: string[] = []): Promise<LayoutOptionValueEntity> {
        return this.valueRepository.findOne({
            where: {uuid},
            relations,
        });
    }

    findValues({uuids}: { uuids: string[] }): Promise<LayoutOptionValueEntity[]> {
        return this.valueRepository.createQueryBuilder("values")
            .where({uuid: In(uuids)})
            .leftJoinAndSelect("value.layoutOption", "layoutOption")
            .orderBy({"layoutOption.priority": "ASC"}) // Order by priority; <= 99: layout-specific, >=100 global
            .getMany();
    }

    findOption({
                   id,
               }: { id: number }, relations: string[] = []): Promise<LayoutOptionEntity> {
        return this.repository.findOne({
            where: {id},
            relations,
        });
    }

    findAllOptions({layoutId}: { layoutId: string }): Promise<LayoutOptionEntity[]> {
        return this.repository.createQueryBuilder("options")
            .where({layoutId})
            .orderBy({"priority": "ASC"}) // Order by priority; <= 99: layout-specific, >=100 global
            .getMany();
    }

}