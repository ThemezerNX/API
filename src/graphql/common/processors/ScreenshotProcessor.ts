import * as sharp from "sharp";
import {ReadStream} from "fs";
import {InvalidImageError} from "../errors/InvalidImage.error";
import {encode} from "blurhash";

const resizeImage = async (file: ReadStream | Buffer, width: number, height: number, options?: { jpeg?: boolean }): Promise<Buffer> => {
    let sharpInstance;
    if (file instanceof Buffer) {
        sharpInstance = sharp(file);
    } else {
        sharpInstance = sharp();
        file.pipe(sharpInstance);
    }
    sharpInstance
        .resize(width, height, {fit: sharp.fit.cover})
        .toFormat(options.jpeg ? "jpeg" : "webp");
    return sharpInstance.toBuffer();
};

export const generateImages = async (file: (() => ReadStream) | Buffer, jpeg240 = false) => {
    const isFunction = typeof file === "function";
    return {
        image720File: await resizeImage(isFunction ? file() : file, 1280, 720),
        image360File: await resizeImage(isFunction ? file() : file, 640, 360),
        image240File: await resizeImage(isFunction ? file() : file, 426, 240, {jpeg: jpeg240}),
        image180File: await resizeImage(isFunction ? file() : file, 320, 180),
        imageBlurHash: encode(new Uint8ClampedArray(
            await resizeImage(isFunction ? file() : file, 80, 45),
        ), 80, 45, 5, 4),
    };
};

export const generateBackground = async (createReadStream: () => ReadStream) => {
    const pipeline = sharp();
    createReadStream().pipe(pipeline);
    const metadata = await pipeline.metadata();

    // if not min 720p, throw error
    if (metadata) {
        if (metadata.width < 1280 || metadata.height < 720) {
            throw new InvalidImageError({}, "Background Image should be at least 1280x720");
        }
    }

    pipeline
        .resize(1280, 720, {fit: sharp.fit.cover})
        .toFormat("jpeg");
    return pipeline.toBuffer();
};
