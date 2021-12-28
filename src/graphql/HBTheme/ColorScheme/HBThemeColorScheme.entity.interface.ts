import {Column, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {HBThemeEntity} from "../HBTheme.entity";

export abstract class HBThemeColorSchemeEntityInterface {

    constructor(partial: Partial<HBThemeColorSchemeEntityInterface>) {
        Object.assign(this, partial);
    }

    @OneToOne(() => HBThemeEntity, hbthemeEntity => hbthemeEntity.assets, {onDelete: "CASCADE"})
    @JoinColumn({name: "hbthemeId"})
    hbtheme: HBThemeEntity;
    @PrimaryColumn({update: false})
    hbthemeId: string;

    @Column({type: "char", nullable: true, length: 8})
    textColor: string;
    @Column({type: "char", nullable: true, length: 8})
    frontWaveColor: string;
    @Column({type: "char", nullable: true, length: 8})
    middleWaveColor: string;
    @Column({type: "char", nullable: true, length: 8})
    backWaveColor: string;
    @Column({type: "char", nullable: true, length: 8})
    backgroundColor: string;
    @Column({type: "char", nullable: true, length: 8})
    highlightColor: string;
    @Column({type: "char", nullable: true, length: 8})
    separatorColor: string;
    @Column({type: "char", nullable: true, length: 8})
    borderColor: string;
    @Column({type: "char", nullable: true, length: 8})
    borderTextColor: string;
    @Column({type: "char", nullable: true, length: 8})
    progressBarColor: string;
    @Column({type: "char", nullable: true, length: 8})
    logoColor: string;
    @Column({type: "char", nullable: true, length: 8})
    highlightGradientEdgeColor: string;
    @Column({type: "boolean", nullable: true})
    enableWaveBlending: boolean;

}