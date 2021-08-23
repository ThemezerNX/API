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
import {DownloadClient} from "./DownloadClient";
import {Layout} from "../Layout/Layout";

@Entity()
export class LayoutDownload extends BaseEntity {

    @JoinColumn()
    @ManyToOne(() => Layout, {primary: true, onDelete: "CASCADE"})
    layout: Layout;

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
        this.layout.dlCount++;
        await getConnection().getRepository(Layout).save(this.layout);
    }

    @AfterRemove()
    async removeCount() {
        this.layout.dlCount--;
        await getConnection().getRepository(Layout).save(this.layout);
    }

}