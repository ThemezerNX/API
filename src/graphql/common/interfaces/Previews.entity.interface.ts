import {Column} from "typeorm";
import {CachableEntityInterface} from "./Cachable.entity.interface";


export abstract class PreviewsEntityInterface extends CachableEntityInterface {

    @Column("bytea")
    image720File: any;
    @Column("bytea")
    image360File: any;
    @Column("bytea")
    image240File: any;
    @Column("bytea")
    image180File: any;
    @Column("bytea")
    imagePlaceholderFile: any;

    abstract get image720Url(): string;

    abstract get image360Url(): string;

    abstract get image240Url(): string;

    abstract get image180Url(): string;

    abstract get imagePlaceholderUrl(): string;

}