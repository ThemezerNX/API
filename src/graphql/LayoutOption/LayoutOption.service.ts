import {In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {LayoutOptionValueEntity} from "./OptionValue/LayoutOptionValue.entity";
import {LayoutOptionEntity} from "./LayoutOption.entity";
import {PerchQueryBuilder} from "perch-query-builder";
import {LayoutOptionValuePreviewsEntity} from "./OptionValuePreviews/LayoutOptionValuePreviews.entity";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";
import {joinAndSelectRelations, selectPreviews} from "../common/functions/ServiceFunctions.js";

@Injectable()
export class LayoutOptionService {

    constructor(
        @InjectRepository(LayoutOptionEntity) private repository: Repository<LayoutOptionEntity>,
        @InjectRepository(LayoutOptionValueEntity) private valueRepository: Repository<LayoutOptionValueEntity>,
    ) {
    }

    findValue(
        {uuid}: { uuid: string },
        options?: ServiceFindOptionsParameter<LayoutOptionValueEntity, LayoutOptionValuePreviewsEntity>,
    ): Promise<LayoutOptionValueEntity> {
        let queryBuilder;
        if (options?.info) {
            queryBuilder = PerchQueryBuilder.generateQueryBuilder(this.repository, options.info);
        } else {
            queryBuilder = this.valueRepository.createQueryBuilder();

            selectPreviews(queryBuilder, options);
            joinAndSelectRelations(queryBuilder, options); // always last
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

    findAllOptions(
        {layoutId}: { layoutId: string },
        options?: ServiceFindOptionsParameter<LayoutOptionValueEntity, LayoutOptionValuePreviewsEntity>,
    ): Promise<LayoutOptionEntity[]> {
        let queryBuilder;
        if (options?.info) {
            queryBuilder = PerchQueryBuilder.generateQueryBuilder(this.repository, options.info);
        } else {
            queryBuilder = this.valueRepository.createQueryBuilder();

            joinAndSelectRelations(queryBuilder, options); // always last
        }

        queryBuilder.where({layoutId});

        return queryBuilder.getMany();
    }

}