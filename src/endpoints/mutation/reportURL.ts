import {reportMessage} from "../../util/webhookMessages";
import {errorName} from "../../util/errorTypes";
import {avatar} from "../resolvers";
import webhook from "webhook-discord";

const Hook = new webhook.Webhook(process.env.REPORT_WEBHOOK_URL);

export default async (_parent, {url, type, nsfw, reason}, context, _info) => {
    if (process.env.READ_ONLY === "true") {
        throw new Error("READ_ONLY mode is enabled.");
    }

    return await new Promise(async (resolve, reject) => {
        if (await context.authenticate()) {
            try {
                const newReportMessage = reportMessage();

                newReportMessage
                    .setTitle("Link to reported item" + (nsfw ? " (NSFW!)" : ""))
                    .setAuthor(
                        context.req.user.display_name,
                        avatar(context.req.user.id, context.req.user.discord_user) + "?size=64",
                        `${process.env.WEBSITE_ENDPOINT}/creators/${context.req.user.id}`,
                    )
                    .addField("Type:", type)
                    .setURL(url);

                if (reason) {
                    newReportMessage.addField("Reason:", reason);
                }

                await Hook.send(newReportMessage);

                resolve(true);
            } catch (e) {
                console.error(e);
                reject(new Error(errorName.UNKNOWN));
            }
        } else {
            reject(new Error(errorName.UNAUTHORIZED));
        }
    });
}