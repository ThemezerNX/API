import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {UserEntity} from "./User.entity";
import {UserProfileEntity} from "./UserProfile/UserProfile.entity";

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) {
    }

    async findAll(): Promise<UserEntity[]> {
        UserProfileEntity.create({ava})
        return await this.userRepository.find();
    }

}