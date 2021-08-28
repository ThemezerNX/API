import {LayoutEntity} from "./Layout.entity";
import {FindConditions, In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {combineConditions} from "../common/CombineConditions";
import {Target} from "../common/enums/Target";
import {InjectRepository} from "@nestjs/typeorm";
import {SortOrder} from "../common/enums/SortOrder";
import {StringContains} from "../common/findOperators/StringContains";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSort} from "../common/args/ItemSortArgs";

@Injectable()
export class LayoutService {

    constructor(@InjectRepository(LayoutEntity) private repository: Repository<LayoutEntity>) {
    }

    findOne({id}, relations: string[] = []): Promise<LayoutEntity> {
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
            target,
            query,
            creators,
        }:
            {
                paginationArgs?: PaginationArgs,
                sort?: ItemSort,
                order?: SortOrder,
                query?: string,
                target?: Target,
                creators?: string[],
            },
    ): Promise<[LayoutEntity[], number]> {
        const commonAndConditions: FindConditions<LayoutEntity> = {};
        const orConditions: FindConditions<LayoutEntity>[] = [];

        if (target) {
            commonAndConditions.target = target;
        }
        if (creators) {
            commonAndConditions.creator = {
                id: In(creators),
            };
        }
        if (query?.length > 0) {
            orConditions.push({
                name: StringContains(query),
            });
            orConditions.push({
                description: StringContains(query),
            });
        }

        return executeAndPaginate(paginationArgs,
            this.repository.createQueryBuilder("layout")
                .where(combineConditions(commonAndConditions, orConditions))
                .leftJoinAndSelect("layout.previews", "previews")
                .leftJoinAndSelect("layout.assets", "assets")
                .orderBy({[sort]: order}),
        );
    }

    findRandom(
        {
            limit,
        }:
            {
                limit?: number,
            },
    ): Promise<LayoutEntity[]> {
        const query = this.repository.createQueryBuilder()
            .orderBy("RANDOM()");

        if (limit) {
            query.limit(limit);
        }

        return query.getMany();
    }

}