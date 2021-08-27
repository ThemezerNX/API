import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, In, Repository} from "typeorm";
import {ThemeEntity} from "./Theme.entity";
import {PaginationArgs, paginationConditions} from "../common/args/Pagination.args";
import {Target} from "../common/enums/Target";
import {SortOrder} from "../common/enums/SortOrder";
import {combineConditions} from "../common/CombineConditions";
import {StringContains} from "../common/findOperators/StringContains";
import {ItemSort} from "../common/args/ItemSortArgs";

@Injectable()
export class ThemeService {

    constructor(@InjectRepository(ThemeEntity) private repository: Repository<ThemeEntity>) {
    }

    async findOne({id}): Promise<ThemeEntity> {
        return this.repository.findOne({
            where: {id},
        });
    }

    async findAll(
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
                includeNSFW?: boolean
            },
    ): Promise<ThemeEntity[]> {
        const commonAndConditions: FindConditions<ThemeEntity> = {};
        const orConditions: FindConditions<ThemeEntity>[] = [];

        if (packId) {
            commonAndConditions.packId = packId;
        }
        if (target) {
            commonAndConditions.target = target;
        }
        if (creators) {
            commonAndConditions.creator = {
                id: In(creators),
            };
        }
        if (layouts) {
            commonAndConditions.layout = {
                id: In(layouts),
            };
        }
        if (!includeNSFW) {
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

        return this.repository.find({
            where: combineConditions(commonAndConditions, orConditions),
            order: {
                [sort]: order,
            },
            ...paginationConditions(paginationArgs),
        });
    }

    async findRandom(
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

        if (target) {
            findConditions.target = target;
        }
        if (!includeNSFW) {
            findConditions.isNSFW = false;
        }

        const query = this.repository.createQueryBuilder()
            .where(findConditions)
            .orderBy("RANDOM()");

        if (limit) {
            query.limit(limit);
        }

        return query.getMany();
    }

}