import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";
import {Target} from "../common/enums/Target";
import {LayoutOptionEntity} from "../LayoutOption/LayoutOption.entity";
import {UserEntity} from "../User/User.entity";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {LayoutPreviewsEntity} from "./Previews/LayoutPreviews.entity";
import {CDNMapper} from "../common/CDNMapper";


@Entity()
export class LayoutEntity extends ItemEntityInterface {

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

    options: LayoutOptionEntity[];

    globalOptions: LayoutOptionEntity[];

    @OneToOne(() => LayoutPreviewsEntity, layoutPreviews => layoutPreviews.layout, {cascade: true, eager: true})
    previews: LayoutPreviewsEntity;

    get downloadUrl(): string {
        return CDNMapper.layouts.download(this.id);
    }

    get downloadCommonUrl(): string {
        return CDNMapper.layouts.downloadCommon(this.id);
    }

}