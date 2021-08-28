import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, Repository} from "typeorm";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {SortOrder} from "../common/enums/SortOrder";
import {StringContains} from "../common/findOperators/StringContains";
import {ThemeTagEntity} from "./ThemeTag.entity";
import {TagSort} from "./ThemeTag.resolver";

@Injectable()
export class ThemeTagService {

    constructor(@InjectRepository(ThemeTagEntity) private repository: Repository<ThemeTagEntity>) {
    }

    findOne({id}): Promise<ThemeTagEntity> {
        return this.repository.findOne({
            where: {id},
        });
    }

    findAll(
        {
            paginationArgs,
            sort = TagSort.NAME,
            order = SortOrder.ASC,
            query,
        }:
            {
                paginationArgs?: PaginationArgs,
                sort?: TagSort,
                order?: SortOrder,
                query?: string,
            },
    ): Promise<[ThemeTagEntity[], number]> {
        const findConditions: FindConditions<ThemeTagEntity> = {};

        if (query?.length > 0) {
            findConditions.name = StringContains(query);
        }

        return executeAndPaginate(paginationArgs,
            this.repository.createQueryBuilder()
                .where(findConditions)
                .orderBy({[sort]: order}),
        );
    }

}