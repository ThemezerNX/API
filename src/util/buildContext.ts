import axios from "axios";
import {db} from "../db/db";
import {errorName} from "./errorTypes"

const discordApiBase = "https://discord.com/api";

function cleanString(input) {
    let output = "";
    for (let i = 0; i < input.length; i++) {
        if (input.charCodeAt(i) <= 127) {
            output += input.charAt(i);
        }
    }
    return output;
}

const buildCommonContext = (req, additionalContext: {}) => ({
    authenticate: () => {
        const token = req.headers.token;
        if (token) {
            return new Promise((resolve, reject) => {
                axios({
                    url: discordApiBase + "/users/@me",
                    headers: {
                        Authorization: token,
                    },
                })
                    .then(async (res) => {
                        const id = res.data.id;
                        delete res.data.id;

                        res.data.username = cleanString(res.data.username);

                        try {
                            // 1. Check if user exists
                            const existingUser = await db.oneOrNone(
                                `
                                    SELECT *, coalesce(custom_username, discord_user ->> 'username') AS display_name
                                    FROM creators
                                    WHERE id = $1
                                `,
                                [id]
                            );

                            // 1.1 If user exists, update and return
                            let user;
                            if (existingUser) {
                                if (process.env.READ_ONLY !== "true") {
                                    user = await db.one(
                                        `
                                    UPDATE creators
                                    SET discord_user = $2
                                    WHERE id = $1
                                    RETURNING *, coalesce(custom_username, discord_user ->> 'username') AS display_name
                                    `,
                                        [id, res.data]
                                    );
                                }
                            } else {
                                if (process.env.READ_ONLY === "true") {
                                    reject(new Error(errorName.READ_ONLY));
                                }

                                user = await db.one(
                                    `
                                    INSERT INTO creators (id, discord_user, joined, backup_code)
                                    VALUES ($1, $2, NOW(), md5(random()::varchar)::varchar)
                                    RETURNING *, coalesce(custom_username, discord_user ->> 'username') AS display_name
                                    `,
                                    [id, res.data]
                                );
                            }

                            req.user = user;

                            // Then add the user object to the original req object
                            resolve(true);
                        } catch (e) {
                            reject(e);
                        }
                    })
                    .catch(() => {
                        resolve(false);
                    });
            });
        } else return false;
    },
    req,
    ...additionalContext,
});

const buildContext = (contextParams) => {
    const {req, connection, payload, ...additionalContext} = contextParams;

    if (connection) {
        return buildCommonContext(connection.context.req, additionalContext);
    }

    const sharedContext = buildCommonContext(req as any, additionalContext);

    return {
        ...sharedContext,
    };
};

export default buildContext;
