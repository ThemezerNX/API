import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, In, Repository} from "typeorm";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {SortOrder} from "../common/enums/SortOrder";
import {combineConditions} from "../common/CombineConditions";
import {StringContains} from "../common/findOperators/StringContains";
import {HBThemeEntity} from "./HBTheme.entity";
import {ItemSort} from "../common/args/ItemSortArgs";

@Injectable()
export class HBThemeService {

    constructor(@InjectRepository(HBThemeEntity) private repository: Repository<HBThemeEntity>) {
    }

    findOne({id}: { id: string }, relations: string[] = []): Promise<HBThemeEntity> {
        return this.repository.findOne({
            where: {id},
            relations,
        });
    }

    findAll(
        {
            packId,
            paginationArgs,
            sort = ItemSort.ADDED,
            order = SortOrder.DESC,
            query,
            creators,
            includeNSFW,
        }:
            {
                packId?: string,
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                creators?: string[],
                includeNSFW?: boolean
            },
    ): Promise<[HBThemeEntity[], number]> {
        const commonAndConditions: FindConditions<HBThemeEntity> = {};
        const orConditions: FindConditions<HBThemeEntity>[] = [];

        if (packId != undefined) {
            commonAndConditions.packId = packId;
        }
        if (creators?.length > 0) {
            commonAndConditions.creator = {
                id: In(creators),
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
            //     }] as FindConditions<HBThemeTagEntity>[],
            // });
        }

        return executeAndPaginate(paginationArgs,
            this.repository.createQueryBuilder("hbTheme")
                .where(combineConditions(commonAndConditions, orConditions))
                .leftJoinAndSelect("hbTheme.previews", "previews")
                .leftJoinAndSelect("hbTheme.assets", "assets")
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
    ): Promise<HBThemeEntity[]> {
        const findConditions: FindConditions<HBThemeEntity> = {};

        if (includeNSFW != true) {
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