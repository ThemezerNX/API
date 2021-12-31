import {MailInterface} from "./mail.interface";

export class ActivateAccountMail extends MailInterface {

    readonly subject = "Email Verification";

    constructor(to: string, {userId, username, verificationToken}) {
        super(to);

        const verificationUrl = `${this.websiteUrl}/verify-email?user=${userId}&token=${verificationToken}`;

        this.html = super.applyHtmlBase(
            `Welcome to Themezer, ${username}!`,
            `
                Please verify your email by clicking the button below.
                <br>
                <br>
                <a href="${verificationUrl}">
                    <img src="https://cdn.themezer.net/resources/mail/buttons/verify_button.webp" width="160px" alt="verify button" style="max-height: 250px">
                </a>
        `);
    }

    readonly html: string;

}