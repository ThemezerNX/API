import {LayoutEntity} from "./Layout.entity";
import {FindConditions, In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {Target} from "../common/enums/Target";
import {InjectRepository} from "@nestjs/typeorm";
import {SortOrder} from "../common/enums/SortOrder";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSort} from "../common/args/ItemSort.args";
import {toTsQuery} from "../common/TsQueryCreator";
import {FileModel} from "../common/models/File.model";
import {stringifyID} from "@themezernx/layout-id-parser/dist";
import {LayoutOptionService} from "../LayoutOption/LayoutOption.service";
import {LayoutOptionType} from "../LayoutOption/common/LayoutOptionType.enum";
import {InjectorLayout, LoadedLayoutOption} from "./common/InjectorLayout";
import {ServiceFindOptionsParameter} from "../common/interfaces/ServiceFindOptions.parameter";
import {LayoutPreviewsEntity} from "./Previews/LayoutPreviews.entity";
import {IsOwner} from "../common/interfaces/IsOwner.interface";
import {Exists} from "../common/findOperators/Exists";
import {ChosenLayoutOptionValue} from "./dto/ChosenLayoutOptionValue.input";
import {createInfoSelectQueryBuilder} from "../common/functions/CreateInfoSelectQueryBuilder";

@Injectable()
export class LayoutService implements IsOwner {

    constructor(
        @InjectRepository(LayoutEntity) private repository: Repository<LayoutEntity>,
        private layoutOptionService: LayoutOptionService,
    ) {
    }


    findOne(
        {
            id,
        }: {
            id: string
        },
        options?: ServiceFindOptionsParameter<LayoutEntity, LayoutPreviewsEntity>,
    ): Promise<LayoutEntity> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository, {hasPreviews: true});
        const findConditions: FindConditions<LayoutEntity> = {};

        if (id != undefined) {
            findConditions.id = id;
        }

        return queryBuilder.where(findConditions).getOne();
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
        options?: ServiceFindOptionsParameter<LayoutEntity>,
    ): Promise<{ result: LayoutEntity[], count: number }> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository, {hasPreviews: true});
        const findConditions: FindConditions<LayoutEntity> = {};

        if (target != undefined) {
            findConditions.target = target;
        }
        if (creators?.length > 0) {
            findConditions.creator = {
                id: In(creators),
            };
        }

        queryBuilder.where(findConditions)
            .orderBy({[queryBuilder.alias + "." + sort]: order});

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce(${queryBuilder.alias}.name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce(${queryBuilder.alias}.description, '')), 'C')
            )`, {query: toTsQuery(query)});
        }

        return executeAndPaginate(queryBuilder, paginationArgs);
    }

    findRandom(
        {
            limit,
            target,
        }:
            {
                limit?: number,
                target?: Target,
            },
        options?: ServiceFindOptionsParameter<LayoutEntity>,
    ): Promise<LayoutEntity[]> {
        let queryBuilder = createInfoSelectQueryBuilder(options, this.repository, {hasPreviews: true});
        const findConditions: FindConditions<LayoutEntity> = {};

        if (target != undefined) {
            findConditions.target = target;
        }

        queryBuilder
            .where(findConditions)
            .orderBy("RANDOM()");

        if (limit != undefined) {
            queryBuilder.limit(limit);
        }

        return queryBuilder.getMany();
    }

    private static getOptionValueVariable(option: LoadedLayoutOption) {
        switch (option.type) {
            case LayoutOptionType.INTEGER:
                return option.integerValue.toString();
            case LayoutOptionType.DECIMAL:
                return option.decimalValue.toPrecision(8);
            case LayoutOptionType.STRING:
                return option.stringValue;
            case LayoutOptionType.COLOR:
                return option.colorValue;
        }
    }

    async buildOne(id: string, options: ChosenLayoutOptionValue[] = []): Promise<FileModel> {
        const layout = await this.repository.findOne({
            where: {id},
            relations: ["creator"],
        });

        if (!layout) {
            return;
        }

        const parsedJson = JSON.parse(layout.json);
        const injectorLayout = new InjectorLayout();

        injectorLayout.PatchName = layout.name;
        injectorLayout.AuthorName = layout.creator.username;
        injectorLayout.TargetName = layout.target + ".szs";

        if (parsedJson.HideOnlineBtn == true || parsedJson.HideOnlineBtn == false) {
            injectorLayout.HideOnlineBtn = parsedJson.HideOnlineBtn;
        }
        if (!!parsedJson.Files) {
            injectorLayout.Files = parsedJson.Files;
        }
        if (!!parsedJson.Anims) {
            injectorLayout.Anims = parsedJson.Anims;
        }

        // Get all options and map the jsons to LoadedLayoutOption[]
        const optionJsons = await this.layoutOptionService.findValues({
            uuids: options.map((o) => o.uuid),
        });

        const loadedOptions = options.map((o) => {
            const value = optionJsons.find((j) => j.uuid == o.uuid);
            const l = o as LoadedLayoutOption;
            l.json = value.json;
            l.type = value.layoutOption.type;
            return l;
        });

        injectorLayout.applyOptions(loadedOptions);

        injectorLayout.ID = stringifyID({
            service: "Themezer",
            id: layout.id,
            options: loadedOptions.map((o) => {
                return {
                    uuid: o.uuid,
                    variable: LayoutService.getOptionValueVariable(o),
                };
            }),
        });

        return new FileModel(
            layout.name + ".json",
            Buffer.from(JSON.stringify(injectorLayout)),
            "application/json",
        );
    }

    async buildCommon(id: string): Promise<FileModel> {
        const layout = await this.repository.findOne({
            where: {id},
            relations: ["creator"],
        });

        if (!layout) {
            return;
        }

        const parsedJson = JSON.parse(layout.commonJson);
        const injectorLayout = new InjectorLayout();

        injectorLayout.PatchName = parsedJson.PatchName;
        injectorLayout.AuthorName = parsedJson.AuthorName;
        injectorLayout.TargetName = "common.szs";
        injectorLayout.ID = stringifyID({
            service: "Themezer",
            id: layout.id + "-common",
        });

        if (parsedJson.HideOnlineBtn == true || parsedJson.HideOnlineBtn == false) {
            injectorLayout.HideOnlineBtn = parsedJson.HideOnlineBtn;
        }
        if (!!parsedJson.Files) {
            injectorLayout.Files = parsedJson.Files;
        }
        if (!!parsedJson.Anims) {
            injectorLayout.Anims = parsedJson.Anims;
        }

        return new FileModel(
            layout.name + ".json",
            Buffer.from(JSON.stringify(injectorLayout)),
            "application/json",
        );
    }

    async isOwner(layoutId: string, userId: string): Promise<boolean> {
        return !!(await Exists(
            this.repository.createQueryBuilder()
                .where({id: layoutId, creatorId: userId}),
        ));
    }

}