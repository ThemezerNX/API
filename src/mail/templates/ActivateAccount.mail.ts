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
                <br>
                <br>
                If you have any questions or remarks, <a href="https://discord.gg/nnm8wyM">join our Discord server</a> or email to <a href="mailto:contact@themezer.net">contact@themezer.net</a>.
                <br>
                <br>
                <i>If you do not know why you received this email, it was sent in error. Please ignore it.</i>
        `);
    }

    readonly html: string;

}