import Mail from "nodemailer/lib/mailer";

export abstract class MailInterface implements Mail.Options {

    protected constructor(to: string) {
        this.to = to;
    }

    readonly websiteUrl = process.env.WEBSITE_ENDPOINT;
    readonly mailResources = process.env.CDN_ENDPOINT + "/resources/mail";

    readonly from = "Themezer noreply@themezer.net";
    readonly to: string;
    abstract subject: string;
    abstract html: string;

    applyHtmlBase(title: string, content: string) {
        return `
        <center>
            <table border=0 cellpadding=0 cellspacing=0 style="min-width: 600px; width: 600px; max-width: 600px; margin:0 auto;" align=center valign=top role=presentation>
                <tr>
                    <td dir=ltr valign=top>
                        <a href="https://themezer.net/">
                            <img src="https://cdn.themezer.net/resources/mail/banners/banner_848x208.webp" width="100%" alt="banner" style="border-radius: 10px">
                        </a>
                        <h1>${title}</h1>
                        ${content}
                        <br>
                        <br>
                        If you have any questions or remarks, <a href="https://discord.gg/nnm8wyM">join our Discord server</a> or email to <a href="mailto:contact@themezer.net">contact@themezer.net</a>.
                        <br>
                        <br>
                        <i>If you do not know why you received this email, it was sent in error. Please ignore it.</i>
                    </td>
                </tr>
            </table>
        </center>
        `;
    }

}