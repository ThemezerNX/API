import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Target} from "../common/enums/Target";
import {LayoutOptionEntity} from "./LayoutOption/LayoutOption.entity";
import {UserEntity} from "../User/User.entity";
import {ItemEntityInterface} from "../common/interfaces/Item.entity.interface";
import {LayoutPreviewsEntity} from "./LayoutPreviews/LayoutPreviews.entity";


@Entity()
export class LayoutEntity extends ItemEntityInterface {

    @Column("uuid", {unique: true})
    uuid: string;

    @ManyToOne(() => UserEntity, {onDelete: "SET NULL"})
    @JoinColumn()
    creator: UserEntity;

    @Column({
        type: "enum",
        enum: Target,
    })
    target: Target;

    @Column("char", {length: 6, nullable: true})
    color?: string;

    @Column("jsonb", {nullable: true})
    json?: string;

    @Column("jsonb", {nullable: true})
    commonJson?: string;

    @OneToMany(() => LayoutOptionEntity, layoutOption => layoutOption.layout, {cascade: true, eager: true})
    options: LayoutOptionEntity[];

    @OneToOne(() => LayoutPreviewsEntity, layoutPreviews => layoutPreviews.layout, {cascade: true, eager: true})
    previews: LayoutPreviewsEntity;

}