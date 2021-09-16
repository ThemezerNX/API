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

    findValues({uuids}: { uuids: string[] }, relations: string[] = []): Promise<LayoutOptionValueEntity[]> {
        return this.valueRepository.createQueryBuilder("values")
            .where({uuid: In(uuids)})
            .leftJoin("value.layoutOption", "layoutOption")
            .orderBy({"layoutOption.order": "ASC"}) // NULLs must be last! (global has NULL)
            .getMany();
    }

    findAll({layoutId}: { layoutId: string }, relations: string[] = []): Promise<LayoutOptionEntity[]> {
        return this.repository.find({
            where: {layoutId},
            relations,
        });
    }

}