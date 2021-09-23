const url = (path: string) => {
    return process.env.CDN_ENDPOINT + "/" + path;
};

const cacheUrl = (path: string, cacheId: number, alreadyHasQueryParameters: boolean = false) => {
    return url(path + (alreadyHasQueryParameters ? "&" : "?") + "cache=" + cacheId);
};

const itemRoute = (itemType: string, itemId: string, itemProperty: string, fileName: string, extension: string, cacheId: number) => {
    return cacheUrl(`${itemType}/${itemId}/${itemProperty}/${fileName}.${extension}`, cacheId);
};

const itemRoutes = {
    previews: (itemType: string, itemId: string, fileName: string, extension: string, cacheId: number) => {
        return itemRoute(itemType, itemId, "previews", fileName, extension, cacheId);
    },
    assets: (itemType: string, itemId: string, fileName: string, extension: string, cacheId: number) => {
        return itemRoute(itemType, itemId, "assets", fileName, extension, cacheId);
    },
    download: (itemType: string, itemId: string, asset?: string) => {
        return url(`${itemType}/${itemId}/download` + (asset ? `/${asset}` : ""));
    },
};

// /themes/id/download (uncached, increment download count)
//                     ^-- create:
//                                 - create random token when querying, save in db, check when visited: increment (bypass)
//                                 - create encrypted time token, if timedifference < 30s when visited: increment (bypass)
//                                 - create encrypted time + IP token, if timedifference <30s when visited: increment (bypass)
//                                 - create encrypted time based on hour + IP + item id + type + token, if timedifference <2h (must also be valid in the next hour) when visited -> if token not found in db> increment dl count and insert download into table
//                                 - require an express session token, also validate it. (curl issues, not stateless)
//                                 -> don't use any token at all, when visited: check db for entry with time, ip, id, type. If time < 2h, insert new row and increment count.
// -> 301
// /themes/id/download/file.nxtheme?cache=12 (cached)
/**
 * URLs currently in use:
 *
 * /resources
 *
 V /users/<id>/banner.webp?cache
 V /users/<id>/avatar.webp?cache
 *
 V /themes/<id>/previews/<filename>.<extension>?cache
 V /themes/<id>/assets/<filename>.<extension>?cache
 V /themes/<id>/download
 V /themes/<id>/download/theme.nxtheme?cache
 *
 V /hbthemes/<id>/previews/<filename>.<extension>?cache
 V /hbthemes/<id>/assets/<filename>.<extension>?cache
 V /hbthemes/<id>/download
 V /hbthemes/<id>/download/theme.romfs?cache
 *
 V /packs/<id>/previews/<filename>.<extension>?cache
 V /packs/<id>/download
 V /packs/<id>/download/pack.zip?cache
 *
 * /layouts/<id>/previews/<filename>.<extension>?cache
 * /layouts/<id>/download
 * /layouts/<id>/downloadCommon
 * /layouts/<id>/download/layout.json?cache
 * /layouts/<id>/downloadCommon/commonLayout.json?cache
 *
 * /layoutOptions/<option uuid>/previews/<filename>.<extension>?cache
 *
 */

export const CDNMapper = {
    users: {
        banner: (userId: string, extension: string, cacheId: number) => {
            return cacheUrl(`users/${userId}/banner.${extension}`, cacheId);
        },
        avatar: (userId: string, extension: string, cacheId: number) => {
            return cacheUrl(`users/${userId}/avatar.${extension}`, cacheId);
        },
    },
    themes: {
        previews: (themeId: string, resolution: string, extension: string, cacheId: number) => {
            return itemRoutes.previews("themes", themeId, resolution, extension, cacheId);
        },
        assets: (themeId: string, asset: string, extension: string, cacheId: number) => {
            return itemRoutes.assets("themes", themeId, asset, extension, cacheId);
        },
        download: (themeId: string) => {
            return itemRoutes.download("themes", themeId);
        },
    },
    hbthemes: {
        previews: (hbthemeId: string, resolution: string, extension: string, cacheId: number) => {
            return itemRoutes.previews("hbthemes", hbthemeId, resolution, extension, cacheId);
        },
        assets: (hbthemeId: string, asset: string, extension: string, cacheId: number) => {
            return itemRoutes.assets("hbthemes", hbthemeId, asset, extension, cacheId);
        },
        download: (hbthemeId: string) => {
            return itemRoutes.download("hbthemes", hbthemeId);
        },
    },
    packs: {
        previews: (packId: string, resolution: string, extension: string, cacheId: number) => {
            return itemRoutes.previews("packs", packId, resolution, extension, cacheId);
        },
        download: (packId: string) => {
            return itemRoutes.download("packs", packId);
        },
    },
    layouts: {
        previews: (layoutId: string, resolution: string, extension: string, cacheId: number) => {
            return itemRoutes.previews("layouts", layoutId, resolution, extension, cacheId);
        },
        download: (layoutId: string) => {
            return itemRoutes.download("layouts", layoutId, "layout");
        },
        downloadCommon: (layoutId: string) => {
            return itemRoutes.download("layouts", layoutId, "common");
        },
    },
    layoutOptions: {
        previews: (optionUUID: string, resolution: string, extension: string, cacheId: number) => {
            return itemRoutes.previews("layoutOptions", optionUUID, resolution, extension, cacheId);
        },
    },
};