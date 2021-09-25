import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn} from "typeorm";
import {LayoutOptionValueEntity} from "../../LayoutOption/OptionValue/LayoutOptionValue.entity";
import {ThemeEntity} from "../Theme.entity";

@Entity()
export class ThemeOptionEntity {

    @OneToOne(() => ThemeEntity, themeEntity => themeEntity.previews, {onDelete: "CASCADE"})
    @JoinColumn({name: "themeId"})
    theme: ThemeEntity;

    @PrimaryColumn({update: false})
    themeId: string;

    @ManyToOne(() => LayoutOptionValueEntity)
    @JoinColumn({name: "layoutOptionValueUUID"})
    layoutOptionValue: LayoutOptionValueEntity;

    @PrimaryColumn({update: false})
    layoutOptionValueUUID: string;

    @Column({nullable: true, comment: "Use a single column for the variable value. Only parse it once building the layout to prevent issues when an option changed e.g. from Integer to Decimal"})
    variable?: string;

}