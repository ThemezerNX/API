import {ItemEntityInterface} from "./Item.entity.interface";
import {AfterRemove, AfterUpdate, Column, JoinColumn, JoinTable, ManyToMany, ManyToOne} from "typeorm";
import {PackEntity} from "../../Pack/Pack.entity";
import {ThemeTagEntity} from "../../ThemeTag/ThemeTag.entity";
import {PreviewsEntityInterface} from "./Previews.entity.interface";
import {AssetsEntityInterface} from "./Assets.entity.interface";
import {deleteIfEmpty, recomputeNSFW} from "../../Pack/Pack.constraints";
import {SelectAlways} from "perch-query-builder";


export abstract class ThemeItemEntityInterface extends ItemEntityInterface {

    @ManyToOne(() => PackEntity, pack => pack.themes, {onDelete: "CASCADE"})
    @JoinColumn({name: "packId"})
    pack?: PackEntity;

    @Column({nullable: true})
    packId?: string;

    @Column()
    isNSFW: boolean;

    // Tags should not be cascade save. Otherwise, 1) custom insert tags and then 2) save theme will result in duplicate key error
    @ManyToMany(() => ThemeTagEntity, {onDelete: "CASCADE", cascade: false, eager: true})
    @JoinTable()
    tags: ThemeTagEntity[];

    abstract previews: PreviewsEntityInterface;
    abstract assets: AssetsEntityInterface;

    @Column()
    @SelectAlways()
    isPrivate: boolean;

    abstract setUrls(): void;

    // if there are less than 2 items left in the pack, delete the pack
    @AfterRemove()
    @AfterUpdate()
    async deletePackIfEmpty() {
        const wasDeleted = await deleteIfEmpty(this.packId);
        if (!wasDeleted) {
            await recomputeNSFW({packId: this.packId, pack: this.pack});
        }
    }

}