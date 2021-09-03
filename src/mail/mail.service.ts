import {Injectable} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import {ActivateAccountMail} from "./templates/ActivateAccount.mail";
import {UserEntity} from "../graphql/User/User.entity";

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

}
