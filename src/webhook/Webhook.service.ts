import {Injectable} from "@nestjs/common";
import {MessageEmbed, WebhookClient} from "discord.js";
import {PackEntity} from "../graphql/Pack/Pack.entity";
import {WebsiteMappings} from "../graphql/common/WebsiteMappings";
import {ThemeEntity} from "../graphql/Theme/Theme.entity";
import {HBThemeEntity} from "../graphql/HBTheme/HBTheme.entity";
import {Target} from "../graphql/common/enums/Target";

@Injectable()
export class WebhookService {

    private client: WebhookClient;

    constructor() {
        this.client = new WebhookClient({
            id: process.env.WEBHOOK_ID,
            token: process.env.WEBHOOK_TOKEN,
        });
    }

    private static informativeThemeName(name: string, isNSFW: boolean, target: Target | null): string {
        return `${name} - ${target ? target : "Homebrew"}${isNSFW ? " (NSFW)" : ""}`;
    }

    // send discord embed to webhook
    public async newPack(pack: PackEntity, themes: ThemeEntity[], hbthemes: HBThemeEntity[]) {
        pack.previews.setUrls();
        const embed = new MessageEmbed()
            .setColor("#b40a86")
            .setTitle(pack.name)
            .setDescription(pack.description)
            .setURL(WebsiteMappings.pack(pack.id, pack.name))
            .setAuthor(pack.creator.username, pack.creator.profile?.avatarUrl, WebsiteMappings.user(pack.creator.id))
            .setThumbnail(pack.previews.image720Url)
            .setTimestamp()
            .addFields(
                {
                    name: "NXThemes Installer ID:",
                    value: "P" + pack.id,
                },
            );

        if (hbthemes?.length > 0 || themes?.length > 0) {
            embed.addFields(
                {
                    name: "Themes in This Pack:",
                    value: themes.map((t: ThemeEntity) =>
                            WebhookService.informativeThemeName(
                                t.name,
                                t.isNSFW,
                                t.target,
                            ),
                        ).join("\n") +
                        hbthemes.map((t: HBThemeEntity) =>
                            WebhookService.informativeThemeName(
                                t.name,
                                t.isNSFW,
                                null,
                            ),
                        ).join("\n"),
                },
            );
        }

        await this.client.send({
            content: "New Pack Submission!",
            username: "Packs",
            embeds: [embed],
        });
    }

    public async newThemes(themes: ThemeEntity[], hbthemes: HBThemeEntity[]) {
        const embeds = [];
        for (const theme of themes) {
            theme.previews.setUrls();
            embeds.push(
                new MessageEmbed()
                    .setColor("#0ab379")
                    .setTitle(theme.name)
                    .setDescription(theme.description || "")
                    .setURL(WebsiteMappings.theme(theme.id, theme.name))
                    .setAuthor(theme.creator.username,
                        theme.creator.profile?.avatarUrl,
                        WebsiteMappings.user(theme.creator.id))
                    .setThumbnail(theme.previews.image720Url)
                    .setTimestamp()
                    .addFields(
                        {
                            name: "NXThemes Installer ID:",
                            value: "T" + theme.id,
                        },
                    )
            )
        }
        for (const hbtheme of hbthemes) {
            hbtheme.previews.setUrls();
            embeds.push(
                new MessageEmbed()
                    .setColor("#0083ff")
                    .setTitle(hbtheme.name)
                    .setDescription(hbtheme.description || "")
                    .setURL(WebsiteMappings.hbtheme(hbtheme.id, hbtheme.name))
                    .setAuthor(hbtheme.creator.username,
                        hbtheme.creator.profile?.avatarUrl,
                        WebsiteMappings.user(hbtheme.creator.id))
                    .setThumbnail(hbtheme.previews.image720Url)
                    .setTimestamp()
                    .addFields(
                        {
                            name: "NXThemes Installer ID:",
                            value: "H" + hbtheme.id,
                        },
                    )
            )
        }

        await this.client.send({
            content: `New Theme Submission${embeds.length > 1 ? "s" : ""}!`,
            username: "Themes",
            embeds,
        });
    }

}