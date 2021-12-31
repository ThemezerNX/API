import {Injectable} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import {ActivateAccountMail} from "./templates/ActivateAccount.mail";
import {UserEntity} from "../graphql/User/User.entity";
import {PrivatedThemeMail} from "./templates/PrivatedTheme.mail";
import {ItemEntityInterface} from "../graphql/common/interfaces/Item.entity.interface";
import {PackEntity} from "../graphql/Pack/Pack.entity";
import {PrivatedPackMail} from "./templates/PrivatedPack.mail";

@Injectable()
export class MailService {

    private transporter = nodemailer.createTransport({
        service: "",
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });


    async sendActivationMail({id, email, username, verificationToken}: UserEntity): Promise<void> {
        const mail = new ActivateAccountMail(email, {
            userId: id,
            username,
            verificationToken,
        });

        await this.transporter.sendMail(mail);
    }

    async sendThemePrivatedByAdmin(
        {
            creator: {email},
            name,
            pageUrl,
            previews: {image360Url},
        }: ItemEntityInterface,
        reason: string,
    ): Promise<void> {
        if (email) {
            const mail = new PrivatedThemeMail(email, {
                itemName: name,
                itemUrl: pageUrl,
                image360Url,
                reason,
            });

            await this.transporter.sendMail(mail);
        }
    }

    async sendPackPrivatedByAdmin(
        {
            creator: {email},
            name,
            pageUrl,
            previews: {image360Url},
        }: PackEntity,
        reason: string,
    ): Promise<void> {
        if (email) {
            const mail = new PrivatedPackMail(email, {
                itemName: name,
                itemUrl: pageUrl,
                image360Url,
                reason,
            });

            await this.transporter.sendMail(mail);
        }
    }

}
