import {ItemEntityInterface} from "./Item.entity.interface";
import {AfterInsert, AfterRemove, AfterUpdate, Column, JoinColumn, JoinTable, ManyToMany, ManyToOne} from "typeorm";
import {PackEntity} from "../../Pack/Pack.entity";
import {ThemeTagEntity} from "../../ThemeTag/ThemeTag.entity";
import {PreviewsEntityInterface} from "./Previews.entity.interface";
import {AssetsEntityInterface} from "./Assets.entity.interface";
import {deleteIfEmpty, recomputeNSFW} from "../../Pack/Pack.checkers";


export abstract class ThemeItemEntityInterface extends ItemEntityInterface {

    @ManyToOne(() => PackEntity, pack => pack.themes, {onDelete: "CASCADE"})
    @JoinColumn({name: "packId"})
    pack?: PackEntity;

    @Column({nullable: true})
    packId?: string;

    @Column()
    isNSFW: boolean;

    @ManyToMany(() => ThemeTagEntity, {onDelete: "CASCADE", cascade: true, eager: true})
    @JoinTable()
    tags: ThemeTagEntity[];

    abstract previews: PreviewsEntityInterface;
    abstract assets: AssetsEntityInterface;

    downloadUrl: string;

    abstract setUrls(): void;

    @AfterInsert()
    async recomputeNSFW() {
        await recomputeNSFW(this.packId);
    }

    // if there are less than 2 items left in the pack, delete the pack
    @AfterRemove()
    @AfterUpdate()
    async deletePackIfEmpty() {
        const wasDeleted = await deleteIfEmpty(this.packId);
        if (!wasDeleted) {
            await recomputeNSFW(this.packId);
        }
    }

}