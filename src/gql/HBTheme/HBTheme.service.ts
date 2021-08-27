import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FindConditions, In, Repository} from "typeorm";
import {PaginationArgs, paginationConditions} from "../common/args/Pagination.args";
import {FilterOrder, FilterSort} from "../common/enums/SortOrder";
import {combineConditions} from "../common/CombineConditions";
import {StringContains} from "../common/findOperators/StringContains";
import {HBThemeEntity} from "./HBTheme.entity";

@Injectable()
export class HBThemeService {

    constructor(@InjectRepository(HBThemeEntity) private repository: Repository<HBThemeEntity>) {
    }

    async findOne({id}): Promise<HBThemeEntity> {
        return this.repository.findOne({
            where: {id},
        });
    }

    async findAll(
        {
            packId,
            paginationArgs,
            sort,
            order,
            query,
            creators,
            includeNSFW = false,
        }:
            {
                packId?: string,
                paginationArgs?: PaginationArgs,
                sort?: FilterSort,
                order?: FilterOrder,
                query?: string,
                creators?: string[],
                includeNSFW?: boolean
            },
    ): Promise<HBThemeEntity[]> {
        const commonAndConditions: FindConditions<HBThemeEntity> = {};
        const orConditions: FindConditions<HBThemeEntity>[] = [];

        if (packId) {
            commonAndConditions.packId = packId;
        }
        if (creators) {
            commonAndConditions.creator = {
                id: In(creators),
            };
        }
        if (includeNSFW) {
            commonAndConditions.isNSFW = In([includeNSFW, false]);
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

        return this.repository.find({
            where: combineConditions(commonAndConditions, orConditions),
            order: {
                [sort]: order,
            },
            ...paginationConditions(paginationArgs),
        });
    }

}