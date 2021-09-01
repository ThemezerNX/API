const cacheUrl = (path: string, cacheID: number) => {
    return process.env.CDN_ENDPOINT + "/" + path + "?" + cacheID;
};

const itemRoute = (itemType: string, itemId: string, itemProperty: string, fileName: string, extension: string, cacheID: number) => {
    return cacheUrl(`${itemType}/${itemId}/${itemProperty}/${fileName}.${extension}`, cacheID);
};

const itemRoutes = {
    previews: (itemType: string, itemId: string, fileName: string, extension: string, cacheID: number) => {
        return itemRoute(itemType, itemId, "previews", fileName, extension, cacheID);
    },
    assets: (itemType: string, itemId: string, fileName: string, extension: string, cacheID: number) => {
        return itemRoute(itemType, itemId, "assets", fileName, extension, cacheID);
    },
};

export const CDNMapper = {
    users: {
        banner: (userId: string, extension: string, cacheID: number) => {
            return cacheUrl(`users/${userId}/banner.${extension}`, cacheID);
        },
        avatar: (userId: string, extension: string, cacheID: number) => {
            return cacheUrl(`users/${userId}/avatar.${extension}`, cacheID);
        },
    },
    hbThemes: {
        previews: (hbThemeId: string, resolution: string, extension: string, cacheID: number) => {
            return itemRoutes.previews("hbthemes", hbThemeId, resolution, extension, cacheID);
        },
        assets: (hbThemeId: string, asset: string, extension: string, cacheID: number) => {
            return itemRoutes.assets("hbthemes", hbThemeId, asset, extension, cacheID);
        },
    },
    themes: {
        previews: (themeId: string, resolution: string, extension: string, cacheID: number) => {
            return itemRoutes.previews("themes", themeId, resolution, extension, cacheID);
        },
        assets: (themeId: string, asset: string, extension: string, cacheID: number) => {
            return itemRoutes.assets("themes", themeId, asset, extension, cacheID);
        },
    },
    layouts: {
        previews: (layoutId: string, resolution: string, extension: string, cacheID: number) => {
            return itemRoutes.previews("layouts", layoutId, resolution, extension, cacheID);
        },
        options: {
            previews: (layoutId: string, optionUuid: string, resolution: string, extension: string, cacheID: number) => {
                return itemRoutes.previews(`layouts/${layoutId}/options`, optionUuid, resolution, extension, cacheID);
            },
        },
    },
    packs: {
        previews: (packId: string, resolution: string, extension: string, cacheID: number) => {
            return itemRoutes.previews("packs", packId, resolution, extension, cacheID);
        },
    },
};