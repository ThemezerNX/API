import {PackEntity} from "./Pack.entity";
import {FindConditions, In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {combineConditions} from "../common/CombineConditions";
import {Target} from "../common/enums/Target";
import {InjectRepository} from "@nestjs/typeorm";
import {SortOrder} from "../common/enums/SortOrder";
import {StringContains} from "../common/findOperators/StringContains";
import {PaginationArgs, paginationConditions} from "../common/args/Pagination.args";
import {ThemeEntity} from "../Theme/Theme.entity";
import {ItemSort} from "../common/args/ItemSortArgs";

@Injectable()
export class PackService {

    constructor(
        @InjectRepository(PackEntity) private repository: Repository<PackEntity>,
        @InjectRepository(ThemeEntity) private themeRepository: Repository<ThemeEntity>,
    ) {
    }

    async isNSFW(packId: string): Promise<boolean> {
        return !!await this.themeRepository.findOne({
            where: {
                packId,
                isNSFW: true,
            },
        });
    }

    async findOne({id}): Promise<PackEntity> {
        return this.repository.findOne({
            where: {id},
        });
    }

    async findAll(
        {
            paginationArgs,
            sort = ItemSort.ADDED,
            order = SortOrder.DESC,
            query,
            creators,
            includeNSFW,
        }:
            {
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                target?: Target,
                creators?: string[],
                includeNSFW?: boolean
            },
    ): Promise<PackEntity[]> {
        const commonAndConditions: FindConditions<PackEntity> = {};
        const orConditions: FindConditions<PackEntity>[] = [];

        if (creators) {
            commonAndConditions.creator = {
                id: In(creators),
            };
        }
        if (!includeNSFW)  {
            commonAndConditions.themes = [{
                isNSFW: false,
            }];
        }
        if (query?.length > 0) {
            orConditions.push({
                name: StringContains(query),
            });
            orConditions.push({
                description: StringContains(query),
            });
            // orConditions.push({
            //     themes: {
            //         tags: [{
            //             name: StringContains(query),
            //         }] as FindConditions<ThemeTagEntity>[],
            //     } as FindConditions<ThemeEntity>,
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
            includeNSFW,
        }:
            {
                limit?: number,
                includeNSFW?: boolean
            },
    ): Promise<PackEntity[]> {
        const findConditions: FindConditions<PackEntity> = {};

        if (!includeNSFW){
            findConditions.themes = [{
                isNSFW: false,
            }];
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