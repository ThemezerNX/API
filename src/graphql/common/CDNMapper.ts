const url = (path: string) => {
    return process.env.CDN_ENDPOINT + "/" + path;
};

const cacheUrl = (path: string, hash: Buffer, alreadyHasQueryParameters: boolean = false) => {
    return url(path + (alreadyHasQueryParameters ? "&" : "?") + "hash=" + hash.toString("hex"));
};

const itemRoute = (itemType: string, itemId: string, itemProperty: string, fileName: string, extension: string, hash: Buffer) => {
    return cacheUrl(`${itemType}/${itemId}/${itemProperty}/${fileName}.${extension}`, hash);
};

const itemRoutes = {
    previews: (itemType: string, itemId: string, fileName: string, extension: string, hash: Buffer) => {
        return itemRoute(itemType, itemId, "previews", fileName, extension, hash);
    },
    assets: (itemType: string, itemId: string, fileName: string, extension: string, hash: Buffer) => {
        return itemRoute(itemType, itemId, "assets", fileName, extension, hash);
    },
    download: (itemType: string, itemId: string, asset?: string) => {
        return url(`${itemType}/${itemId}/download` + (asset ? `/${asset}` : ""));
    },
};

export const CDNMapper = {
    users: {
        banner: (userId: string, extension: string, hash: Buffer) => {
            return cacheUrl(`users/${userId}/banner.${extension}`, hash);
        },
        avatar: (userId: string, extension: string, hash: Buffer) => {
            return cacheUrl(`users/${userId}/avatar.${extension}`, hash);
        },
    },
    themes: {
        previews: (themeId: string, resolution: string, extension: string, hash: Buffer) => {
            return itemRoutes.previews("themes", themeId, resolution, extension, hash);
        },
        assets: (themeId: string, asset: string, extension: string, hash: Buffer) => {
            return itemRoutes.assets("themes", themeId, asset, extension, hash);
        },
        download: (themeId: string) => {
            return itemRoutes.download("themes", themeId);
        },
    },
    hbthemes: {
        previews: (hbthemeId: string, resolution: string, extension: string, hash: Buffer) => {
            return itemRoutes.previews("hbthemes", hbthemeId, resolution, extension, hash);
        },
        assets: (hbthemeId: string, asset: string, extension: string, hash: Buffer) => {
            return itemRoutes.assets("hbthemes", hbthemeId, asset, extension, hash);
        },
        download: (hbthemeId: string) => {
            return itemRoutes.download("hbthemes", hbthemeId);
        },
    },
    packs: {
        previews: (packId: string, resolution: string, extension: string, hash: Buffer) => {
            return itemRoutes.previews("packs", packId, resolution, extension, hash);
        },
        download: (packId: string) => {
            return itemRoutes.download("packs", packId);
        },
    },
    layouts: {
        previews: (layoutId: string, resolution: string, extension: string, hash: Buffer) => {
            return itemRoutes.previews("layouts", layoutId, resolution, extension, hash);
        },
        download: (layoutId: string) => {
            return itemRoutes.download("layouts", layoutId, "layout");
        },
        downloadCommon: (layoutId: string) => {
            return itemRoutes.download("layouts", layoutId, "common");
        },
    },
    layoutOptions: {
        previews: (optionUUID: string, resolution: string, extension: string, hash: Buffer) => {
            return itemRoutes.previews("layoutOptions", optionUUID, resolution, extension, hash);
        },
    },
};