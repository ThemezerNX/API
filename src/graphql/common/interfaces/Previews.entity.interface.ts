import {Column} from "typeorm";
import {CachableEntityInterface} from "./Cachable.entity.interface";
import {ReadStream} from "fs";
import {generateImages} from "../processors/ScreenshotProcessor";
import {SelectAlways} from "perch-query-builder";


export abstract class PreviewsEntityInterface extends CachableEntityInterface {

    static IMAGE_720_FILENAME = "720.webp";
    static IMAGE_360_FILENAME = "360.webp";
    static IMAGE_240_FILENAME = "240.webp";
    static IMAGE_180_FILENAME = "180.webp";

    @Column("bytea", {select: false})
    image720File: Buffer;
    @Column("bytea", {select: false})
    image360File: Buffer;
    @Column("bytea", {select: false})
    image240File: Buffer;
    @Column("bytea", {select: false})
    image180File: Buffer;
    @Column("varchar")
    imageBlurHash: string;

    image720Url: string;
    image360Url: string;
    image240Url: string;
    image180Url: string;

    @Column({type: "bytea", update: false, generatedType: "STORED", asExpression: "sha256(\"image720File\")"})
    @SelectAlways()
    readonly image720Hash: Buffer;
    @Column({type: "bytea", update: false, generatedType: "STORED", asExpression: "sha256(\"image360File\")"})
    @SelectAlways()
    readonly image360Hash: Buffer;
    @Column({type: "bytea", update: false, generatedType: "STORED", asExpression: "sha256(\"image240File\")"})
    @SelectAlways()
    readonly image240Hash: Buffer;
    @Column({type: "bytea", update: false, generatedType: "STORED", asExpression: "sha256(\"image180File\")"})
    @SelectAlways()
    readonly image180Hash: Buffer;

    protected assignImages(images) {
        this.image720File = images.image720File;
        this.image360File = images.image360File;
        this.image240File = images.image240File;
        this.image180File = images.image180File;
        this.imageBlurHash = images.imageBlurHash;
    }

    async generateFromStream(file: (() => ReadStream) | Buffer) {
        this.assignImages(await generateImages(file));
    }

}