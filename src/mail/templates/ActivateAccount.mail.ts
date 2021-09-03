import {MailInterface} from "./mail.interface";

export class ActivateAccountMail extends MailInterface {

    readonly subject = "Email Verification";

    constructor(to: string, {userId, username, verificationToken}) {
        super(to);

        const verificationUrl = `${this.websiteUrl}/verify-email?user=${userId}&token=${verificationToken}`;

        this.html = super.applyHtmlBase(
            `Welcome to Themezer ${username}!`,
            `
            Please verify your email by visiting the following link:<br>
            <br>
            <a href="${verificationUrl}">${verificationUrl}</a><br>
            <br>
            <i>If you do not know why you received this email, it was sent in error. Please ignore it.</i>
        `);
    }

    readonly html: string;

}