import {Column} from "typeorm";
import {CachableEntityInterface} from "./Cachable.entity.interface";


export abstract class PreviewsEntityInterface extends CachableEntityInterface {

    @Column("bytea")
    image720File: Buffer;
    @Column("bytea")
    image360File: Buffer;
    @Column("bytea")
    image240File: Buffer;
    @Column("bytea")
    image180File: Buffer;
    @Column("bytea")
    imagePlaceholderFile: Buffer;

    abstract get image720Url(): string;

    abstract get image360Url(): string;

    abstract get image240Url(): string;

    abstract get image180Url(): string;

    abstract get imagePlaceholderUrl(): string;

}