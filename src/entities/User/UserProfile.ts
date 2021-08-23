import {BeforeUpdate, Column, Entity, Generated, JoinColumn, OneToOne} from "typeorm";
import {Field, ObjectType} from "type-graphql";
import {IsHexColor} from "class-validator";
import {User} from "./User";
import {HexColorCodeResolver, URLResolver} from "graphql-scalars";
import {v4 as uuid} from "uuid";


@ObjectType()
@Entity()
export class UserProfile {

    @OneToOne(() => User, user => user.profile, {primary: true, onDelete: "CASCADE"})
    @JoinColumn()
    user: User;

    @Field({nullable: true})
    @Column({length: 10000, nullable: true})
    bio?: string;

    @Field(() => HexColorCodeResolver, {nullable: true})
    @IsHexColor()
    @Column("char", {length: 6, nullable: true})
    color?: string;

    @Column("uuid", {unique: true})
    @Generated("uuid")
    randomUuid: string;

    @Column("bytea", {nullable: true})
    avatarFile?: string;
    @Column("bytea", {nullable: true})
    bannerFile?: string;

    @Field(() => URLResolver, {description: "WebP image", nullable: true})
    get avatar(): string {
        return this.avatarFile ? `//cdn.themezer.net/creators/${this.user.id}/${this.randomUuid}/avatar` : null;
    }

    @Field(() => URLResolver, {description: "WebP image", nullable: true})
    get banner(): string {
        return this.bannerFile ? `//cdn.themezer.net/creators/${this.user.id}/${this.randomUuid}/banner` : null;
    }

    @BeforeUpdate()
    randomizeUuid() {
        this.randomUuid = uuid();
    }


}