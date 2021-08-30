import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, In, Repository} from "typeorm";
import {ThemeEntity} from "./Theme.entity";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {Target} from "../common/enums/Target";
import {SortOrder} from "../common/enums/SortOrder";
import {combineConditions} from "../common/CombineConditions";
import {StringContains} from "../common/findOperators/StringContains";
import {ItemSort} from "../common/args/ItemSortArgs";

@Injectable()
export class ThemeService {

    constructor(@InjectRepository(ThemeEntity) private repository: Repository<ThemeEntity>) {
    }

    findOne({
                id,
                isNSFW,
                packId,
            }: { id?: string, isNSFW?: boolean, packId?: string }, relations: string[] = []): Promise<ThemeEntity> {
        const findConditions: FindConditions<ThemeEntity> = {};

        if (id != undefined) {
            findConditions.id = packId;
        }
        if (isNSFW != undefined) {
            findConditions.isNSFW = false;
        }
        if (packId != undefined) {
            findConditions.packId = packId;
        }

        return this.repository.findOne({
            where: findConditions,
            relations,
        });
    }

    findAll(
        {
            packId,
            paginationArgs,
            sort = ItemSort.ADDED,
            order = SortOrder.DESC,
            target,
            query,
            creators,
            layouts,
            includeNSFW,
        }:
            {
                packId?: string,
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                target?: Target,
                creators?: string[],
                layouts?: string[],
                includeNSFW?: Boolean
            },
    ): Promise<[ThemeEntity[], number]> {
        const commonAndConditions: FindConditions<ThemeEntity> = {};
        const orConditions: FindConditions<ThemeEntity>[] = [];

        if (packId != undefined) {
            commonAndConditions.packId = packId;
        }
        if (target != undefined) {
            commonAndConditions.target = target;
        }
        if (creators?.length > 0) {
            commonAndConditions.creator = {
                id: In(creators),
            };
        }
        if (layouts?.length > 0) {
            commonAndConditions.layout = {
                id: In(layouts),
            };
        }
        if (includeNSFW != true) {
            commonAndConditions.isNSFW = false;
        }
        if (query?.length > 0) {
            orConditions.push({
                name: StringContains(query),
            });
            orConditions.push({
                description: StringContains(query),
            });
            // orConditions.push({
            //     tags: [{
            //         name: StringContains(query),
            //     }] as FindConditions<ThemeTagEntity>[],
            // });
        }

        return executeAndPaginate(paginationArgs,
            this.repository.createQueryBuilder("theme")
                .where(combineConditions(commonAndConditions, orConditions))
                .leftJoinAndSelect("theme.previews", "previews")
                .leftJoinAndSelect("theme.assets", "assets")
                .orderBy({[sort]: order}),
        );
    }

    findRandom(
        {
            limit,
            target,
            includeNSFW,
        }:
            {
                limit?: number,
                target?: Target,
                includeNSFW?: boolean
            },
    ): Promise<ThemeEntity[]> {
        const findConditions: FindConditions<ThemeEntity> = {};

        if (target != undefined) {
            findConditions.target = target;
        }
        if (includeNSFW != true) {
            findConditions.isNSFW = false;
        }

        const query = this.repository.createQueryBuilder("theme")
            .where(findConditions)
            .leftJoinAndSelect("theme.previews", "previews")
            .leftJoinAndSelect("theme.assets", "assets")
            .orderBy("RANDOM()");

        if (limit != undefined) {
            query.limit(limit);
        }

        return query.getMany();
    }

}