import {AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Target} from "../common/enums/Target";
import {LayoutOptionEntity} from "../LayoutOption/LayoutOption.entity";
import {UserEntity} from "../User/User.entity";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {LayoutPreviewsEntity} from "./Previews/LayoutPreviews.entity";
import {CDNMapper} from "../common/CDNMapper";
import {EntityWithPreviewsInterface} from "../common/interfaces/EntityWithPreviews.interface";


@Entity()
export class LayoutEntity extends ItemEntityInterface implements EntityWithPreviewsInterface {

    @Column({type: "uuid", unique: true, update: false})
    uuid: string;

    @ManyToOne(() => UserEntity, {onDelete: "SET NULL"})
    @JoinColumn()
    creator: UserEntity;

    @Column({
        type: "enum",
        enum: Target,
        update: false,
    })
    target: Target;

    @Column("char", {length: 6, nullable: true})
    color?: string;

    @Column("varchar", {nullable: true})
    json?: string;

    @Column("varchar", {nullable: true})
    commonJson?: string;

    @OneToMany(() => LayoutOptionEntity, layoutOption => layoutOption.layout, {cascade: true, eager: false})
    options: LayoutOptionEntity[];

    @OneToOne(() => LayoutPreviewsEntity, layoutPreviews => layoutPreviews.layout, {cascade: true, eager: true})
    previews: LayoutPreviewsEntity;

    @Column({type: "char", length: 32})
    insertionMD5: string;

    downloadUrl: string;
    downloadCommonUrl: string;

    @AfterLoad()
    setUrls() {
        this.downloadUrl = CDNMapper.layouts.download(this.id);
        this.downloadCommonUrl = CDNMapper.layouts.downloadCommon(this.id);
    }

}