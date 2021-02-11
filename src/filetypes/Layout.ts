import InjectorLayout from "./InjectorLayout";
import {db} from "../db/db";
import {parseThemeID, stringifyThemeID} from "@themezernx/layout-id-parser/index";
import {errorName} from "../util/errorTypes";
import {isHex} from "../endpoints/resolvers";
import {uuid} from "uuidv4";

const {
    promises: {writeFile},
} = require("fs");

export default class Layout {
    private name: string;
    private author: string;
    private target: string;
    private id: string;
    private service: string;
    private isCommon: boolean = false;
    private pieceUUIDs: Array<string> = [];
    private pieces: Array<any> = [];
    private layout: InjectorLayout;

    constructor(isCommon?: boolean) {
        this.isCommon = isCommon;
    }

    get getId(): string {
        return this.id;
    }

    get getName(): string {
        return this.name;
    }

    get getAuthor(): string {
        return this.author;
    }

    get getService(): string {
        return this.service;
    }

    get getLayout(): InjectorLayout {
        return this.layout;
    }

    get getTarget(): string {
        return this.target;
    }

    addPiece = (json) => {
        this.pieces.push({json});
    };

    saveTo = (folderPath: string) => {
        return writeFile(`${folderPath}/${this.isCommon ? "common" : "layout"}.json`, this.toJSON());
    };

    loadId = async (id, pieceUUIDs?) => {
        this.id = id;
        if (pieceUUIDs) {
            this.pieceUUIDs = pieceUUIDs;
        }

        if (!this.isCommon) {
            const dbData = await db.one(
                `
                    SELECT baselayout,
                           uuid,
                           details ->> 'name' as name,
                           target,
                           (
                               SELECT coalesce(custom_username, discord_user ->> 'username')
                               FROM creators
                               WHERE id = mt.creator_id
                               LIMIT 1
                           )                  as creator_name,
                           (
                               SELECT array_agg(row_to_json(pcs)) AS pieces
                               FROM (
                                        SELECT unnest(pieces) ->> 'name'                       as name,
                                               json_array_elements(unnest(pieces) -> 'values') as value
                                        FROM layouts
                                        WHERE id = mt.id
                                    ) as pcs
                               WHERE value ->> 'uuid' = ANY ($2::text[])
                           )

                    FROM layouts as mt
                    WHERE mt.id = hex_to_int('$1^')
                    LIMIT 1
                `,
                [this.id, this.pieceUUIDs],
            );
            this.name = dbData.name;
            this.author = dbData.creator_name;
            this.target = dbData.target;

            // Create an array with all used pieces
            if (this.pieceUUIDs?.length > 0 && this.pieceUUIDs.length !== dbData.pieces?.length) {
                throw errorName.PIECE_NOT_FOUND;
            }

            if (dbData.pieces?.length > 0) {
                dbData.pieces.forEach((p) => {
                    this.pieces.push({
                        uuid: p.value.uuid,
                        json: p.value.json,
                    });
                });
            }

            // If the layout is readable from the database. This is not the case when the layout.json is already in the folder.
            this.layout = new InjectorLayout(this.name, this.author, this.target);
            if (dbData.baselayout) {
                this.layout.readJSON(dbData.baselayout);
            }
        } else {
            const dbData = await db.one(
                `
                    SELECT commonlayout
                    FROM layouts
                    WHERE id = hex_to_int('$1^')
                    LIMIT 1
                `,
                [this.id],
            );

            this.layout = new InjectorLayout(undefined, undefined, "common");
            if (dbData.commonlayout) {
                this.layout.readJSON(dbData.commonlayout);
            }
        }
    };

    toJSON = (): string => {
        const id = stringifyThemeID({
            service: "Themezer",
            id: this.id ? (this.id + (this.isCommon ? "-common" : "")) : (uuid() + "-temp"),
            piece_uuids: this.pieces.map((p) => p.uuid),
        });
        !this.isCommon && this.layout.applyPieces(this.pieces);
        return this.layout.toJSON(id);
    };

    readFile = async (filePath: string, loadFromDB = true) => {
        this.layout = new InjectorLayout();
        await this.layout.readFile(filePath);
        await this.fromInjectorLayout(this.layout, loadFromDB);
    };

    fromInjectorLayout = async (injectorLayout: InjectorLayout, findInDB) => {
        this.name = injectorLayout.getName;
        this.author = injectorLayout.getAuthor;
        this.target = injectorLayout.getTarget;
        this.isCommon = injectorLayout.getTarget === "common.szs";

        // If the layout has an ID, this can be not the case for example using a layout taken from the DB
        if (!!injectorLayout.getId && findInDB) {
            const {service, id, piece_uuids} = parseThemeID(injectorLayout.getId);
            this.service = service;
            if (id && isHex(id)) {
                this.isCommon = this.isCommon || id.endsWith("-common");
                if (service === "Themezer" && !this.isCommon) {
                    await this.loadId(id, piece_uuids);
                } else {
                    this.id = id;
                }
            }
        }
    };

}