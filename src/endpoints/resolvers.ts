import downloadPack from "./query/pack/downloadPack";
import {db, pgp} from "../db/db";
import {errorName} from "../util/errorTypes";
import GraphQLJSON from "graphql-type-json";

import me from "./query/me";
import creator from "./query/creator";
import categories from "./query/categories";
import layout from "./query/layout/layout";
import randomLayoutIDs from "./query/layout/randomLayoutIDs";
import theme from "./query/theme/theme";
import randomThemeIDs from "./query/theme/randomThemeIDs";
import pack from "./query/pack/pack";
import randomPackIDs from "./query/pack/randomPackIDs";
import list from "./query/list";
import nxinstaller from "./query/nxinstaller";
import downloadLayout from "./query/layout/downloadLayout";
import downloadCommonLayout from "./query/layout/downloadCommonLayout";
import createOverlay from "./query/createOverlay/createOverlay";
import createOverlayNXThemes from "./query/createOverlay/createOverlayNXThemes";
import deleteTheme from "./mutation/theme/deleteTheme";
import updateAuth from "./mutation/creator/updateAuth";
import uploadSingleOrZip from "./mutation/submitting/uploadSingleOrZip";
import submitThemes from "./mutation/submitting/submitThemes";
import updateProfile from "./mutation/creator/updateProfile";
import setLike from "./mutation/setLike";
import restoreAccount from "./mutation/creator/restoreAccount";
import reportURL from "./mutation/reportURL";
import deletePack from "./mutation/pack/deletePack";
import fs from "fs";
import updatePack from "./mutation/pack/updatePack";
import updateTheme from "./mutation/theme/updateTheme";
import downloadTheme from "./query/theme/downloadTheme";
import CacheableTheme from "../filetypes/CacheableTheme";
import CacheablePack from "../filetypes/CacheablePack";

const graphqlFields = require("graphql-fields");
const MiniSearch = require("minisearch");

const {
    createWriteStream,
    unlink,
} = fs;

export const joinMonsterOptions: any = {dialect: "pg"};
export const storagePath = `${__dirname}/../../../cdn`;

export const urlNameREGEX = /[^a-zA-Z0-9_.]+/gm;
// const noSpecialCharsREGEX = /[^a-z\d\-]+/gi
export const themeHexREGEX = /^t[0-9a-f]+$/;
export const packHexREGEX = /^p[0-9a-f]+$/;
export const invalidFilenameCharsREGEX = /[\\~#*{}\/:<>?|"]/gm;

export const isHex = (h) => {
    const a = parseInt(h, 16);
    return (a.toString(16) === h);
};

export const avatar = (id, user): string => {
    if (user.avatar) {
        return `https://cdn.discordapp.com/avatars/${id}/${user.avatar}`;
    } else {
        return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
    }
};

// https://stackoverflow.com/questions/40697330/skip-update-columns-with-pg-promise
export function str(column) {
    return {
        name: column,
        skip: (c) => !c.exists,
    };
}

export function bool(column) {
    return {
        name: column,
        skip: (c) => !c.exists,
    };
}

// function int(column) {
// 	return {
// 		name: column,
// 		skip: (c) => !c.exists,
// 		init: (c) => +c.value
// 	}
// }

export const themesCS = new pgp.helpers.ColumnSet(
    [
        {name: "layout_id", cast: "int"},
        {name: "piece_uuids", cast: "uuid[]"},
        "target",
        {name: "last_updated", cast: "timestamp without time zone"},
        {name: "categories", cast: "varchar[]"},
        {name: "pack_id", cast: "int"},
        {name: "creator_id", cast: "varchar"},
        {name: "details", cast: "json"},
        {name: "bg_type", cast: "varchar (3)"},
    ],
    {
        table: "themes",
    },
);

export const packsCS = new pgp.helpers.ColumnSet(
    [
        {name: "last_updated", cast: "timestamp without time zone"},
        {name: "creator_id", cast: "varchar"},
        {name: "details", cast: "json"},
    ],
    {
        table: "packs",
    },
);

export const updateCreatorCS = new pgp.helpers.ColumnSet(
    [
        str("custom_username"),
        str("bio"),
        str("banner_image"),
        str("logo_image"),
        str("profile_color"),
        bool("is_blocked"),
    ],
    {
        table: "creators",
    },
);

export const sortOptions = [
    {
        id: "downloads",
        column: "dl_count",
    },
    {
        id: "likes",
        column: "like_count",
    },
    {
        id: "updated",
        column: "last_updated",
    },
    {
        id: "id",
        column: "id",
    },
];

export const saveFiles = (files) =>
    files.map(
        ({file, savename, path}) =>
            new Promise<any>(async (resolve, reject) => {
                let {createReadStream, filename} = await file.promise;
                const stream = createReadStream();

                // Add file extension if none to prevent errors with matching file and directory names
                const FILE_EXTENSION_REGEX = /\.[^\/.]+$/;
                if (!FILE_EXTENSION_REGEX.test(filename)) {
                    filename = `${savename || filename}.file`;
                } else if (savename) {
                    filename = savename + FILE_EXTENSION_REGEX.exec(filename);
                }

                const writeStream = createWriteStream(`${path}/${filename}`);

                writeStream.on("finish", () => {
                    resolve(`${filename}`);
                });

                writeStream.on("error", (error) => {
                    unlink(path, () => {
                        // If the uploaded file's size is too big return specific error
                        if (error.message.includes("exceeds") && error.message.includes("size limit")) {
                            reject(errorName.FILE_TOO_BIG);
                        } else {
                            console.error(error);
                            reject(errorName.FILE_SAVE_ERROR);
                        }
                    });
                });

                stream.on("error", (error) => writeStream.destroy(error));

                stream.pipe(writeStream);
            }),
    );

export const getTheme = (id, piece_uuids) => {
    return new Promise(async (resolve, reject) => {
        const theme = new CacheableTheme();
        const resolved = await theme.loadId(id, piece_uuids);

        resolve({
            ...resolved,
            url: `${process.env.API_ENDPOINT}/cdn/cache/themes/${resolved.localfilename}`,
        });

        // Increase download count by 1
        await db.none(
            `
                UPDATE themes
                SET dl_count = dl_count + 1
                WHERE id = hex_to_int('$1^');
            `,
            [id],
        );
    });
};

export const downloadPackSeperate = (id) => {
    return new Promise(async (resolve, reject) => {
        const pack = new CacheablePack();
        await pack.loadId(id);

        // Map the NXThemes
        const shouldResolve = pack.getThemes.map((t) => {
            return {
                name: t.name,
                pack_name: pack.getName,
                target: t.target,
                preview: t.preview,
                thumbnail: t.thumbnail,
                filename: t.filename,
                id: t.id,
                url: `${process.env.API_ENDPOINT}/cdn/cache/themes/${t.localfilename}`,
                mimetype: t.mimetype,
            };
        });

        resolve(shouldResolve);

        // Increase download count by 1
        await db.none(
            `
                UPDATE packs
                SET dl_count = dl_count + 1
                WHERE id = hex_to_int('$1^');
            `,
            [id],
        );
    });
};

export const paginateData = (items, info, {page = 1, limit}) => {
    if (items?.length > 0) {
        const item_count = items.length;

        let page_count = 1;
        if (limit) {
            page_count = Math.ceil(item_count / limit);
        }

        const start = (page - 1) * limit;
        const end = start + limit;

        return {
            items: limit ? items.slice(start, end) : items,
            pagination: {
                page: page || 1,
                limit,
                page_count,
                item_count,
            },
        };
    } else {
        return {
            items: [],
            pagination: {
                page,
                limit,
                page_count: 0,
                item_count: 0,
            },
        };
    }
};

// noinspection ES6ShorthandObjectProperty
export default {
    JSON: GraphQLJSON,
    Query: {
        me,

        creator,

        categories,

        layout,
        theme,
        pack,

        randomLayoutIDs,
        randomThemeIDs,
        randomPackIDs,

        layoutList: list,
        themeList: list,
        packList: list,

        downloadLayout,
        downloadCommonLayout,
        downloadTheme,
        downloadPack,

        nxinstaller,

        createOverlayNXThemes,
        createOverlay,
    },
    Mutation: {
        updateAuth,
        restoreAccount,
        updateProfile,

        uploadSingleOrZip,
        submitThemes,

        setLike,

        deleteTheme,
        updateTheme,
        deletePack,
        updatePack,

        reportURL,
    },
};
