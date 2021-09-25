import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("theme_tag")
export class ThemeTagEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({update: true, length: 100})
    name: string;

}