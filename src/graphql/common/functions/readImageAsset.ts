import {ThemeAssetsDataInput} from "../../Theme/dto/ThemeAssetsData.input";
import {HBThemeAssetsDataInput} from "../../Theme/dto/HBThemeAssetsData.input";
import {streamToBuffer} from "@jorgeferrero/stream-to-buffer";
import * as sharp from "sharp";
import {InvalidIconAssetError} from "../errors/InvalidIconAsset.error";
import {propertyToTitleCase} from "./propertyToTitleCase";

export const readImageAsset = async (assets, fileName: keyof ThemeAssetsDataInput | keyof HBThemeAssetsDataInput, {
    width: requiredWidth,
    height: requiredHeight,
}) => {
    const buffer = await streamToBuffer((await assets[fileName]).createReadStream());
    const image = sharp(buffer);
    const {width, height} = await image.metadata();
    if (width !== requiredWidth || height !== requiredHeight)
        throw new InvalidIconAssetError({
            propertyName: propertyToTitleCase(fileName),
            requiredWidth,
            requiredHeight,
        });
    return buffer;
};