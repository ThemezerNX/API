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
import {Theme} from "../Theme/Theme";

@Entity()
export class ThemeDownload extends BaseEntity {

    @JoinColumn()
    @ManyToOne(() => Theme, {primary: true, onDelete: "CASCADE"})
    theme: Theme;

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
        this.theme.dlCount++;
        await getConnection().getRepository(Pack).save(this.theme);
    }

    @AfterRemove()
    async removeCount() {
        this.theme.dlCount--;
        await getConnection().getRepository(Pack).save(this.theme);
    }

}