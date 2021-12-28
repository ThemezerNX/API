const url = (path: string) => {
    return process.env.WEBSITE_ENDPOINT + "/" + path;
};

export const slugify = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[\s\-]+/g, "-") // Replace spaces with -, // Replace multiple - with single -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/^-+|-+$/g, "") // Trim - from start and end of text
};

export const WebsiteMappings = {
    user: (userId: string) => {
        return url(`creators/${userId}`);
    },
    theme: (themeId: string, name: string = "") => {
        return url(`themes/${slugify(name)}-${themeId}`);
    },
    hbtheme: (hbthemeId: string, name: string = "") => {
        return url(`hbthemes/${slugify(name)}-${hbthemeId}`);
    },
    pack: (packId: string, name: string = "") => {
        return url(`packs/${slugify(name)}-${packId}`);
    },
    layout: (layoutId: string, name: string = "") => {
        return url(`layouts/${slugify(name)}-${layoutId}`);
    },
};