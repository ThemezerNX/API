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