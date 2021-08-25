import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class ThemeTagEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({update: true, length: 100})
    name: string;

}