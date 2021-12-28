import {
    AfterLoad,
    Column,
    CreateDateColumn,
    Generated,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import {UserEntity} from "../../User/User.entity";
import {CachableEntityInterface} from "./Cachable.entity.interface";
import {slugify} from "../WebsiteMappings";
import {SelectAlways} from "perch-query-builder";


export abstract class ItemEntityInterface extends CachableEntityInterface {

    @Column({type: "int", update: false, select: false})
    @Generated("increment")
    readonly counter: number;

    @PrimaryColumn({type: "varchar", update: false, generatedType: "STORED", asExpression: "upper(to_hex(counter))"})
    id: string;

    slug: string;

    @JoinColumn({name: "creatorId"})
    @ManyToOne(() => UserEntity, {onDelete: "CASCADE"})
    creator: UserEntity;

    @Column("varchar", {length: 19})
    creatorId: string;

    @Column({length: 100})
    @SelectAlways()
    name: string;

    @Column({nullable: true, length: 1000})
    description?: string;

    @CreateDateColumn({type: "timestamp", update: false})
    addedTimestamp: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedTimestamp: Date;

    @Column("int", {default: 0})
    downloadCount: number;

    @AfterLoad()
    setSlug() {
        this.slug = slugify(this.name);
    }

}