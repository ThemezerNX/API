import {MailInterface} from "./mail.interface";

export class PrivatedPackMail extends MailInterface {

    readonly subject = "A pack was privated by an admin";

    constructor(to: string, {itemName, itemUrl, image360Url, reason}) {
        super(to);

        this.html = super.applyHtmlBase(
            `Hmm, this is unfortunate...`,
            `
                One of your packs, including all related themes, was privated by an admin.
                <br>
                <br>
                <b>Name:</b>
                <b><i>${itemName}</i></b>
                <a href="${itemUrl}">
                    <img src="${image360Url}" alt="verify button" style="max-height: 360px">
                </a>
                <br>
                <b>Reason:</b>
                <i>${reason ? reason : "No reason was provided."}</i>
                <br>
                Please make sure your theme meets <a href="${this.websiteUrl}/submission-requirements">all requirements</a> and does not violate our <a href="${this.websiteUrl}/terms-of-service">Terms of Service</a>, before you make it public again.
        `);
    }

    readonly html: string;

}