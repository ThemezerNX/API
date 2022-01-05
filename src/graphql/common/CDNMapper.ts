const url = (path: string) => {
    return process.env.CDN_ENDPOINT + "/" + path;
};

const cacheUrl = (path: string, hash: Buffer, alreadyHasQueryParameters: boolean = false) => {
    return url(path + (alreadyHasQueryParameters ? "&" : "?") + "hash=" + (hash ? hash.toString("hex") : "false"));
};

const itemRoute = (itemType: string, itemId: string, itemProperty: string, fileName: string, extension: string, hash: Buffer) => {
    return cacheUrl(`${itemType}/${itemId}/${itemProperty}/${fileName}${extension ? "." + extension : ""}`, hash);
};

const itemRoutes = {
    previews: (itemType: string, itemId: string, fileName: string, hash?: Buffer) => {
        return itemRoute(itemType, itemId, "previews", fileName, null, hash);
    },
    assets: (itemType: string, itemId: string, fileName: string, hash?: Buffer) => {
        return itemRoute(itemType, itemId, "assets", fileName, null, hash);
    },
    download: (itemType: string, itemId: string, asset?: string) => {
        return url(`${itemType}/${itemId}/download` + (asset ? `/${asset}` : "") + "?cache=false");
    },
};

export const CDNMapper = {
    users: {
        assets: (userId: string, fileName: string, hash: Buffer) => {
            return cacheUrl(`users/${userId}/${fileName}`, hash);
        },
    },
    themes: {
        previews: (themeId: string, resolution: string, hash: Buffer) => {
            return itemRoutes.previews("themes", themeId, resolution, hash);
        },
        assets: (themeId: string, asset: string, hash: Buffer) => {
            return itemRoutes.assets("themes", themeId, asset, hash);
        },
        download: (themeId: string) => {
            return itemRoutes.download("themes", themeId);
        },
    },
    hbthemes: {
        previews: (hbthemeId: string, resolution: string, hash: Buffer) => {
            return itemRoutes.previews("hbthemes", hbthemeId, resolution, hash);
        },
        assets: (hbthemeId: string, asset: string, hash: Buffer) => {
            return itemRoutes.assets("hbthemes", hbthemeId, asset, hash);
        },
        download: (hbthemeId: string) => {
            return itemRoutes.download("hbthemes", hbthemeId);
        },
    },
    packs: {
        previews: (packId: string, resolution: string, hash: Buffer) => {
            return itemRoutes.previews("packs", packId, resolution, hash);
        },
        download: (packId: string) => {
            return itemRoutes.download("packs", packId);
        },
    },
    layouts: {
        previews: (layoutId: string, resolution: string, hash: Buffer) => {
            return itemRoutes.previews("layouts", layoutId, resolution, hash);
        },
        download: (layoutId: string) => {
            return itemRoutes.download("layouts", layoutId, "layout");
        },
        downloadCommon: (layoutId: string) => {
            return itemRoutes.download("layouts", layoutId, "common");
        },
    },
    layoutOptions: {
        previews: (optionUUID: string, resolution: string, hash: Buffer) => {
            return itemRoutes.previews("layoutOptions", optionUUID, resolution, hash);
        },
    },
};