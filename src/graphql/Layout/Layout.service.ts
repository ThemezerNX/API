import {LayoutEntity} from "./Layout.entity";
import {FindConditions, In, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {Target} from "../common/enums/Target";
import {InjectRepository} from "@nestjs/typeorm";
import {SortOrder} from "../common/enums/SortOrder";
import {executeAndPaginate, PaginationArgs} from "../common/args/Pagination.args";
import {ItemSort} from "../common/args/ItemSortArgs";
import {toTsQuery} from "../common/TsQueryCreator";
import {FileModel} from "../common/models/File.model";
import {stringifyID} from "@themezernx/layout-id-parser/dist";
import {patch} from "@themezernx/json-merger";
import {ChosenLayoutOption} from "./Layout.resolver";
import {LayoutOptionService} from "../LayoutOption/LayoutOption.service";
import {Parser} from "expr-eval";

function reverseHex(s: string) {
    return s.match(/.{2}/g).reverse().join("");
}

class LoadedLayoutOption extends ChosenLayoutOption {

    json: string;

}

class InjectorLayout {

    PatchName: string = "";
    AuthorName: string = "";
    TargetName: string;
    ID: string;
    HideOnlineBtn = true;
    Files: Array<any>;
    Anims: Array<any>;

    private evaluate(piece: LoadedLayoutOption): string {
        const json = piece.json;

        if (piece.stringValue != null) {
            return json.replace(/\?\?string\?\?/gmi, piece.stringValue);
        } else if (piece.colorValue != null) {
            return json.replace(/\?\?color\?\?/gmi, reverseHex(piece.colorValue.replace(/#/g, "")));
        } else if (piece.integerValue != null || piece.decimalValue != null) {
            return json.replace(/"?\?\?(.*?{(integer|decimal)}.*?)\?\?"?/gmi,
                (whole, expression: string, type: string) => {
                    // if the only thing in this string is the expression, try to parse it as number
                    const isOnlyExpression = whole.startsWith("\"") && whole.endsWith("\"");
                    const isInteger = type.toLowerCase() == "integer";
                    const evaluated = Parser.evaluate(expression, {
                        value: isInteger ?
                            piece.integerValue : piece.decimalValue,
                    });

                    const computed = evaluated.toPrecision(6);
                    const number = isInteger ? parseInt(computed) : parseFloat(computed);
                    if (isOnlyExpression) {
                        return number.toString();
                    } else {
                        return (whole.startsWith("\"") ? "\"" : "") +
                            number +
                            (whole.endsWith("\"") ? "\"" : "");
                    }
                });
        }

        return json;
    }

    applyOptions = (pieces: LoadedLayoutOption[]) => {
        for (const piece of pieces) {
            const parsed = JSON.parse(piece.json);

            if (parsed.HideOnlineBtn == true || parsed.HideOnlineBtn == false) {
                this.HideOnlineBtn = parsed.HideOnlineBtn;
            }

            // Merge files patches
            if (Array.isArray(this.Files)) {
                this.Files = patch(this.Files, parsed.Files, [
                    "FileName",
                    "PaneName",
                    "PropName",
                    "GroupName",
                    "name",
                    "MaterialName",
                    "unknown",
                ]);
            }

            // Merge animation files patches
            if (Array.isArray(this.Anims)) {
                this.Anims = patch(this.Anims, parsed.Anims, [
                    "FileName",
                ]);
            }
        }
    };

}

@Injectable()
export class LayoutService {

    constructor(
        @InjectRepository(LayoutEntity) private repository: Repository<LayoutEntity>,
        private layoutOptionService: LayoutOptionService,
    ) {
    }

    findOne({id}: { id: string }, relations: string[] = []): Promise<LayoutEntity> {
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
        const findConditions: FindConditions<LayoutEntity> = {};

        if (target != undefined) {
            findConditions.target = target;
        }
        if (creators?.length > 0) {
            findConditions.creator = {
                id: In(creators),
            };
        }

        const queryBuilder = this.repository.createQueryBuilder("layout")
            .where(findConditions)
            .leftJoinAndSelect("layout.previews", "previews")
            .orderBy({["layout." + sort]: order});

        if (query?.length > 0) {
            queryBuilder.andWhere(`to_tsquery(:query) @@ (
                setweight(to_tsvector('pg_catalog.english', coalesce(layout.name, '')), 'A') ||
                setweight(to_tsvector('pg_catalog.english', coalesce(layout.description, '')), 'C')
            )`, {query: toTsQuery(query)});
        }

        return executeAndPaginate(paginationArgs, queryBuilder);
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

        if (limit != undefined) {
            query.limit(limit);
        }

        return query.getMany();
    }

    async buildOne(id: string, options: ChosenLayoutOption[]): Promise<FileModel> {
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
        injectorLayout.ID = stringifyID({
            service: "Themezer",
            id: layout.id,
            optionUuids: options,
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

        // Get all options and map the jsons to LoadedLayoutOption[]
        const optionJsons = await this.layoutOptionService.findValues({
            uuids: options.map((o) => o.uuid),
        });

        const loadedOptions = options.map((o) => {
            const json = optionJsons.find((j) => j.uuid == o.uuid).json;
            const l = o as LoadedLayoutOption;
            l.json = json;
            return l;
        });

        injectorLayout.applyOptions(loadedOptions);

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

}