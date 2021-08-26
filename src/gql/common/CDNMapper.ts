const cacheUrl = (path: string, cacheUUID: string) => {
    return process.env.CDN_ENDPOINT + "/" + path + "?" + cacheUUID;
};

const itemRoute = (itemType: string, itemId: string, itemProperty: string, fileName: string, extension: string, cacheUUID: string) => {
    return cacheUrl(`${itemType}/${itemId}/${itemProperty}/${fileName}.${extension}`, cacheUUID);
};

const itemRoutes = {
    previews: (itemType: string, itemId: string, fileName: string, extension: string, cacheUUID: string) => {
        return itemRoute(itemType, itemId, "previews", fileName, extension, cacheUUID);
    },
    assets: (itemType: string, itemId: string, fileName: string, extension: string, cacheUUID: string) => {
        return itemRoute(itemType, itemId, "assets", fileName, extension, cacheUUID);
    },
};

export const CDNMapper = {
    users: {
        banner: (userId: string, extension: string, cacheUUID: string) => {
            return cacheUrl(`users/${userId}/banner.${extension}`, cacheUUID);
        },
        avatar: (userId: string, extension: string, cacheUUID: string) => {
            return cacheUrl(`users/${userId}/avatar.${extension}`, cacheUUID);
        },
    },
    hbThemes: {
        previews: (hbThemeId: string, resolution: string, extension: string, cacheUUID: string) => {
            return itemRoutes.previews("hbthemes", hbThemeId, resolution, extension, cacheUUID);
        },
        assets: (hbThemeId: string, asset: string, extension: string, cacheUUID: string) => {
            return itemRoutes.assets("hbthemes", hbThemeId, asset, extension, cacheUUID);
        },
    },
    themes: {
        previews: (themeId: string, resolution: string, extension: string, cacheUUID: string) => {
            return itemRoutes.previews("themes", themeId, resolution, extension, cacheUUID);
        },
        assets: (themeId: string, asset: string, extension: string, cacheUUID: string) => {
            return itemRoutes.assets("themes", themeId, asset, extension, cacheUUID);
        },
    },
    layouts: {
        previews: (layoutId: string, resolution: string, extension: string, cacheUUID: string) => {
            return itemRoutes.previews("layouts", layoutId, resolution, extension, cacheUUID);
        },
        options: {
            previews: (layoutId: string, optionUuid: string, resolution: string, extension: string, cacheUUID: string) => {
                return itemRoutes.previews(`layouts/${layoutId}/options`, optionUuid, resolution, extension, cacheUUID);
            },
        },
    },
    packs: {
        previews: (packId: string, resolution: string, extension: string, cacheUUID: string) => {
            return itemRoutes.previews("packs", packId, resolution, extension, cacheUUID);
        },
    },
};