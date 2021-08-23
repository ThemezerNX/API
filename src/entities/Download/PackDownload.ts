import {
    AfterInsert,
    AfterRemove,
    BaseEntity,
    CreateDateColumn,
    Entity,
    getConnection,
    JoinColumn,
    ManyToOne,
} from "typeorm";
import {User} from "../User/User";
import {Pack} from "../Pack/Pack";
import {DownloadClient} from "./DownloadClient";

@Entity()
export class PackDownload extends BaseEntity {

    @JoinColumn()
    @ManyToOne(() => Pack, {primary: true, onDelete: "CASCADE"})
    pack: Pack;

    @JoinColumn()
    @ManyToOne(() => User, {primary: true, onDelete: "CASCADE"})
    user: User;

    @CreateDateColumn({primary: true, type: "timestamp"})
    timestamp: Date;

    @JoinColumn()
    @ManyToOne(() => DownloadClient, {primary: true})
    downloadClient: DownloadClient;

    @AfterInsert()
    async addCount() {
        this.pack.dlCount++;
        await getConnection().getRepository(Pack).save(this.pack);
    }

    @AfterRemove()
    async removeCount() {
        this.pack.dlCount--;
        await getConnection().getRepository(Pack).save(this.pack);
    }

}