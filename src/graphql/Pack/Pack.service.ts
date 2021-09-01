import {PackEntity} from "./Pack.entity";
import {FindConditions, In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {combineConditions} from "../common/CombineConditions";
import {Target} from "../common/enums/Target";
import {InjectRepository} from "@nestjs/typeorm";
import {SortOrder} from "../common/enums/SortOrder";
import {StringContains} from "../common/findOperators/StringContains";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSort} from "../common/args/ItemSortArgs";
import {ThemeService} from "../Theme/Theme.service";

@Injectable()
export class PackService {

    constructor(
        @InjectRepository(PackEntity) private repository: Repository<PackEntity>,
        private themeService: ThemeService,
    ) {
    }

    async isNSFW(packId: string): Promise<boolean> {
        return !!await this.themeService.findOne({
            packId,
            isNSFW: true,
        });
    }

    findOne({id}: { id: string }, relations: string[] = []): Promise<PackEntity> {
        return this.repository.findOne({
            where: {id},
            relations,
        });
    }

    findAll(
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
    ): Promise<[PackEntity[], number]> {
        const commonAndConditions: FindConditions<PackEntity> = {};
        const orConditions: FindConditions<PackEntity>[] = [];

        if (creators?.length > 0) {
            commonAndConditions.creator = {
                id: In(creators),
            };
        }
        if (includeNSFW != true) {
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

        return executeAndPaginate(paginationArgs,
            this.repository.createQueryBuilder("pack")
                .where(combineConditions(commonAndConditions, orConditions))
                .leftJoinAndSelect("pack.previews", "previews")
                .orderBy({[sort]: order}),
        );
    }

    findRandom(
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

        if (includeNSFW != true) {
            findConditions.themes = [{
                isNSFW: false,
            }];
        }

        const query = this.repository.createQueryBuilder()
            .where(findConditions)
            .orderBy("RANDOM()");

        if (limit != undefined) {
            query.limit(limit);
        }

        return query.getMany();
    }

}