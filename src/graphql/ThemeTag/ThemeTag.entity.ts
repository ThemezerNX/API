import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class ThemeTagEntity extends BaseEntity {

    constructor(name: string) {
        super();
        this.name = name;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({update: true, length: 100, unique: true})
    name: string;

}