const url = (path: string) => {
    return process.env.WEBSITE_ENDPOINT + "/" + path;
};

export const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
};

export const WebsiteMappings = {
    user: (userId: string) => {
        return url(`creators/${userId}`);
    },
    theme: (themeId: string, slug: string = "") => {
        return url(`themes/${slug}-${themeId}`);
    },
    hbtheme: (hbthemeId: string, slug: string = "") => {
        return url(`hbthemes/${slug}-${hbthemeId}`);
    },
    pack: (packId: string, slug: string = "") => {
        return url(`packs/${slug}-${packId}`);
    },
    layout: (layoutId: string, slug: string = "") => {
        return url(`layouts/${slug}-${layoutId}`);
    },
};