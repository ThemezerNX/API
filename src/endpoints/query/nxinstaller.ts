import {graphql} from "graphql";
import {errorName} from "../../util/errorTypes";
import {downloadPackSeperate, getTheme, packHexREGEX, themeHexREGEX} from "../resolvers";

export default async (_parent, {id}, context, info) => {
    return await new Promise(async (resolve, reject) => {
        const idLower = id.toLowerCase();
        // Use rexhex :verycool:
        if (themeHexREGEX.exec(idLower)) {
            // Theme Download

            resolve({
                themes: [await getTheme(idLower.replace("t", ""), undefined)],
            });
        } else if (packHexREGEX.exec(idLower)) {
            // Pack Download

            const themes = await downloadPackSeperate(idLower.replace("p", ""));
            // hacky but idc cuz it saves an extra call and allows the function response to remain the same basically
            resolve({
                groupname: themes[0].pack_name,
                themes,
            });
        } else if (idLower === "__special_random") {
            try {
                const {data} = await graphql({
                    schema: info.schema,
                    variableValues: {
                        limit: 3,
                    },
                    contextValue: context,
                    rootValue: info.rootValue,
                    source: `
									query randomThemeIDs($limit: Int!) {
										randomThemeIDs(limit: $limit)
									}
								`,
                });
                if (data?.randomThemeIDs) {
                    const promises = data.randomThemeIDs.map((id) => getTheme(id, undefined));
                    resolve({
                        themes: await Promise.all(promises),
                    });
                } else reject(errorName.UNKNOWN);
            } catch (e) {
                console.error(e);
                reject(e);
            }
        } else if (idLower === "__special_recent") {
            try {
                const {data} = await graphql({
                    schema: info.schema,
                    variableValues: {
                        limit: 12,
                    },
                    contextValue: context,
                    rootValue: info.rootValue,
                    source: `
									query themeList(
										$limit: Int
									) {
										themeList(
											limit: $limit
										) {
											id
											categories
										}
									}
								`,
                });
                if (data?.themeList) {
                    const promises = data.themeList.map((t) => getTheme(t.id, undefined));
                    resolve({
                        themes: await Promise.all(promises),
                    });
                } else reject(errorName.UNKNOWN);
            } catch (e) {
                console.error(e);
                reject(e);
            }
        } else {
            try {
                const {data} = await graphql({
                    schema: info.schema,
                    variableValues: {
                        limit: 12,
                        query: idLower,
                    },
                    contextValue: context,
                    rootValue: info.rootValue,
                    source: `
									query themeList(
										$limit: Int
										$query: String
									) {
										themeList(
											limit: $limit
											query: $query
										) {
											id
											details {
												name
												description
											}
											categories
										}
									}
								`,
                });

                if (data?.themeList) {
                    const promises = data.themeList.map((t) => getTheme(t.id, undefined));
                    resolve({
                        themes: await Promise.all(promises),
                    });
                } else reject(errorName.UNKNOWN);
            } catch (e) {
                console.error(e);
                reject(e);
            }
        }
    });
}