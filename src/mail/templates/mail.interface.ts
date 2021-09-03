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
                            <img src="https://cdn.themezer.net/resources/mail/banners/banner_848x208.jpeg" width="100%" alt="banner">
                        </a>
                        <h1>${title}</h1>
                        ${content}
                    </td>
                </tr>
            </table>
        </center>
        `;
    }

}