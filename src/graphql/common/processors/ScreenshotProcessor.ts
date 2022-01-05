import * as sharp from "sharp";
import {ReadStream} from "fs";
import {InvalidImageError} from "../errors/InvalidImage.error";
import {encode} from "blurhash";
import {InvalidScreenshotError} from "../errors/InvalidScreenshot.error";
import * as parseExif from "exif-reader";

export const createSharpInstance = (file: (() => ReadStream) | Buffer) => {
    if (file instanceof Buffer) {
        return sharp(file);
    } else {
        const instance = sharp();
        file().pipe(instance);
        return instance;
    }
};

const resizeImage = async (file: (() => ReadStream) | Buffer, width: number, height: number, options: { jpeg?: boolean } = {}): Promise<Buffer> => {
    const sharpInstance = createSharpInstance(file);

    sharpInstance
        .resize(width, height, {fit: sharp.fit.cover})
        .resize(width, height, {fit: sharp.fit.cover})
        .toFormat(options.jpeg ? "jpeg" : "webp");
    return sharpInstance.toBuffer();
};

export const createBlurHash = async (file: (() => ReadStream) | Buffer, width: number, height: number): Promise<string> => {
    const sharpInstance = createSharpInstance(file);

    sharpInstance
        .raw()
        .ensureAlpha()
        .resize(width, height, {fit: sharp.fit.cover});

    return encode(new Uint8ClampedArray(await sharpInstance.toBuffer()), width, height, 5, 4);
};

export const generateImages = async (file: (() => ReadStream) | Buffer, {
    jpeg240 = false,
    requireNintendoExif = true,
} = {}) => {
    if (requireNintendoExif) {
        const sharpInstance = createSharpInstance(file);
        const metadata = await sharpInstance.metadata();

        // if not taken on switch, throw error
        const exif = metadata?.exif ? parseExif(metadata.exif) : null;
        if (!exif?.image?.Make?.includes("Nintendo")) {
            throw new InvalidScreenshotError();
        }
    }

    const [image720File, image360File, image240File, image180File, imageBlurHash] = await Promise.all([
        resizeImage(file, 1280, 720),
        resizeImage(file, 640, 360),
        resizeImage(file, 426, 240, {jpeg: jpeg240}),
        resizeImage(file, 320, 180),
        createBlurHash(file, 80, 45),
    ]);

    return {image720File, image360File, image240File, image180File, imageBlurHash};
};

export const generateBackground = async (
    createReadStream: () => ReadStream,
    {
        minWidth,
        minHeight,
    }: {
        minWidth: number
        minHeight: number,
    },
) => {
    const sharpInstance = createSharpInstance(createReadStream);
    const metadata = await sharpInstance.metadata();

    // if not min resolution, throw error
    if (metadata) {
        if (metadata.width < minWidth || metadata.height < minHeight) {
            throw new InvalidImageError({minWidth, minHeight}, `Background Image should be at least {minWidth}x{minHeight}`);
        }
    }

    sharpInstance
        .resize(minWidth, minHeight, {fit: sharp.fit.cover})
        .toFormat("jpeg");
    return sharpInstance.toBuffer();
};
