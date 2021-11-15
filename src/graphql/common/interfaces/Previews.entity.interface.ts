import {Column} from "typeorm";
import {CachableEntityInterface} from "./Cachable.entity.interface";
import {ReadStream} from "fs";
import {generateImages} from "../processors/ScreenshotProcessor";
import {SelectAlways} from "perch-query-builder";


export abstract class PreviewsEntityInterface extends CachableEntityInterface {

    @Column("bytea", {select: false})
    image720File: Buffer;
    @Column("bytea", {select: false})
    image360File: Buffer;
    @Column("bytea", {select: false})
    image240File: Buffer;
    @Column("bytea", {select: false})
    image180File: Buffer;
    @Column("bytea", {select: false})
    imagePlaceholderFile: Buffer;

    image720Url: string;
    image360Url: string;
    image240Url: string;
    image180Url: string;
    imagePlaceholderUrl: string;

    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"image720File\")"})
    @SelectAlways()
    readonly image720Hash: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"image360File\")"})
    @SelectAlways()
    readonly image360Hash: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"image240File\")"})
    @SelectAlways()
    readonly image240Hash: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"image180File\")"})
    @SelectAlways()
    readonly image180Hash: Buffer;
    @Column({type: "bytea", generatedType: "STORED", asExpression: "sha256(\"imagePlaceholderFile\")"})
    @SelectAlways()
    readonly imagePlaceholderHash: Buffer;

}