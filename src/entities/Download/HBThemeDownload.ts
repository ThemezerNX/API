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
import {HBTheme} from "../Theme/HBTheme";

@Entity()
export class HBThemeDownload extends BaseEntity {

    @JoinColumn()
    @ManyToOne(() => HBTheme, {primary: true, onDelete: "CASCADE"})
    hbTheme: HBTheme;

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
        this.hbTheme.dlCount++;
        await getConnection().getRepository(HBTheme).save(this.hbTheme);
    }

    @AfterRemove()
    async removeCount() {
        this.hbTheme.dlCount--;
        await getConnection().getRepository(HBTheme).save(this.hbTheme);
    }

}