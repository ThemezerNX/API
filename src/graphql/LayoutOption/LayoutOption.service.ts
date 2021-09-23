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

    findValue({uuid}: { uuid: string }, relations: string[] = [], selectImageFiles: boolean = false): Promise<LayoutOptionValueEntity> {
        const queryBuilder = this.valueRepository.createQueryBuilder("value")
            .where({uuid})
            .leftJoinAndSelect("value.previews", "previews");

        for (const relation of relations) {
            queryBuilder.leftJoinAndSelect("value." + relation, relation);
        }

        if (selectImageFiles) {
            queryBuilder.addSelect([
                "previews.image720File",
                "previews.image360File",
                "previews.image240File",
                "previews.image180File",
                "previews.imagePlaceholderFile",
            ]);
        }

        return queryBuilder.getOne();
    }

    findValues({uuids}: { uuids: string[] }): Promise<LayoutOptionValueEntity[]> {
        return this.valueRepository.createQueryBuilder("value")
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
        return this.repository.createQueryBuilder("option")
            .where({layoutId})
            .leftJoinAndSelect("option.values", "values")
            .orderBy({"priority": "ASC"}) // Order by priority; <= 99: layout-specific, >=100 global
            .getMany();
    }

}