import {Injectable} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import {UserService} from "../User/User.service";
import {UserEntity} from "../User/User.entity";
import {EmailNotRegisteredError} from "../../errors/auth/EmailNotRegistered.error";
import {PasswordIncorrectError} from "../../errors/auth/PasswordIncorrect.error";
import {EmailVerificationPendingError} from "../../errors/auth/EmailVerificationPending.error";
import {MailService} from "../../mail/mail.service";
import {UserNotFoundError} from "../../errors/auth/UserNotFound.error";
import {EmailAlreadyVerifiedError} from "../../errors/auth/EmailAlreadyVerified.error";
import {UnauthorizedError} from "../../errors/auth/Unauthorized.error";

@Injectable()
export class AuthService {

    constructor(private userService: UserService, private mailService: MailService) {
    }

    private static hashPassword(inputPassword): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(inputPassword, 10, function (err, hash) {
                if (err) return reject(err);
                resolve(hash);
            });
        });
    }

    private static validatePassword(inputPassword, actualPassword): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(inputPassword, actualPassword, function (err, isMatch) {
                if (err) return reject(err);
                resolve(isMatch);
            });
        });
    }

    private sendVerificationEmail(user): Promise<void> {
        return this.mailService.sendActivationMail(user);
    }

    async validateUser(email: string, password: string): Promise<UserEntity> {
        console.log(email)
        const user = await this.userService.findOne({email});

        if (!user) {
            throw new EmailNotRegisteredError();
        }
        if (!await AuthService.validatePassword(password, user.password)) {
            throw new PasswordIncorrectError();
        }
        if (!user.isVerified) {
            await this.sendVerificationEmail(user);
            throw new EmailVerificationPendingError();
        }

        return user;
    }

    async register(email, password, username): Promise<UserEntity> {
        const passwordHash = await AuthService.hashPassword(password);
        const user = await this.userService.create(email, passwordHash, username);
        await this.sendVerificationEmail(user);
        return user;
    }

    async verifyEmail(userId: string, verificationToken: string): Promise<boolean> {
        const user = await this.userService.findOne({id: userId});

        if (!user) {
            throw new UserNotFoundError();
        }
        if (user.isVerified) {
            throw new EmailAlreadyVerifiedError();
        }
        if (user.verificationToken != verificationToken) {
            throw new UnauthorizedError();
        }

        user.isVerified = true;
        await user.save()

        return true;
    }

}