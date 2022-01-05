import {AfterLoad, Column, DeepPartial, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "../User.entity";
import {CDNMapper} from "../../common/CDNMapper";
import {CachableEntityInterface} from "../../common/interfaces/Cachable.entity.interface";
import {SelectAlways} from "perch-query-builder";
import {ReadStream} from "fs";
import {InvalidImageError} from "../../common/errors/InvalidImage.error";
import * as sharp from "sharp";
import {createBlurHash, createSharpInstance} from "../../common/processors/ScreenshotProcessor";


@Entity()
export class UserProfileEntity extends CachableEntityInterface {

    static AVATAR_FILE = {name: "avatar.webp", width: 256, height: 256, minWidth: 128, minHeight: 128};
    static BANNER_FILE = {name: "banner.webp", width: 1920, height: 500, minWidth: 1280, minHeight: 330};

    constructor(entityLike?: DeepPartial<UserProfileEntity>) {
        super();
        Object.assign(this, entityLike);
    }

    @OneToOne(() => UserEntity, user => user.profile, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: UserEntity;

    @PrimaryColumn("varchar", {length: 19})
    userId: string;

    @Column({length: 10000, nullable: true})
    bio?: string;

    @Column("char", {length: 6, nullable: true})
    color?: string;

    @Column("bytea", {nullable: true})
    avatarFile?: Buffer;
    @Column("bytea", {nullable: true})
    bannerFile?: Buffer;

    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"avatarFile\")",
    })
    @SelectAlways()
    avatarHash?: Buffer;
    @Column({
        type: "bytea",
        nullable: true,
        update: false,
        generatedType: "STORED",
        asExpression: "sha256(\"bannerFile\")",
    })
    @SelectAlways()
    bannerHash?: Buffer;

    @Column({nullable: true})
    avatarBlurHash: string;
    @Column({nullable: true})
    bannerBlurHash: string;

    avatarUrl: string;
    bannerUrl: string;

    @AfterLoad()
    setUrls() {
        this.avatarUrl = !!this.avatarHash ? CDNMapper.users.assets(this.userId,
            UserProfileEntity.AVATAR_FILE.name,
            this.avatarHash) : null;
        this.bannerUrl = !!this.bannerHash ? CDNMapper.users.assets(this.userId,
            UserProfileEntity.BANNER_FILE.name,
            this.bannerHash) : null;
    }

    private static async processImage(
        createReadStream: () => ReadStream,
        {
            width,
            height,
            minWidth,
            minHeight,
        }: {
            width: number,
            height: number,
            minWidth?: number
            minHeight?: number,
        },
    ) {
        const sharpInstance = createSharpInstance(createReadStream);
        const metadata = await sharpInstance.metadata();

        // if not min resolution, throw error
        if (metadata) {
            if ((minWidth != undefined && metadata.width < minWidth) || (minHeight != undefined && metadata.height < minHeight)) {
                throw new InvalidImageError({minWidth, minHeight},
                    `Background Image should be at least {minWidth}x{minHeight}`);
            }
        }

        const targetWidth = metadata.width < width ? metadata.width : width;
        const targetHeight = metadata.height < height ? metadata.height : height;
        sharpInstance
            .resize(targetWidth, targetHeight, {fit: sharp.fit.cover})
            .toFormat("webp");

        return {data: await sharpInstance.toBuffer(), blurHash: await createBlurHash(createReadStream, minWidth, minHeight)};
    }

    async setAvatar(createReadStream: () => ReadStream) {
        const {data, blurHash} = await UserProfileEntity.processImage(createReadStream, UserProfileEntity.AVATAR_FILE);
        this.avatarFile = data;
        this.avatarBlurHash = blurHash;
    }

    async setBanner(createReadStream: () => ReadStream) {
        const {data, blurHash} = await UserProfileEntity.processImage(createReadStream, UserProfileEntity.BANNER_FILE);
        this.bannerFile = data;
        this.bannerBlurHash = blurHash;
    }

}

