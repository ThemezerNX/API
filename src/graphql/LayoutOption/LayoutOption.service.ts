import {Repository} from "typeorm";
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

    findAll({layoutId}: { layoutId: string }, relations: string[] = []): Promise<LayoutOptionEntity[]> {
        return this.repository.find({
            where: {layoutId},
            relations,
        });
    }

}