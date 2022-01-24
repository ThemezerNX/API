import {Injectable} from "@nestjs/common";
import im from "imagemagick";
import {createWriteStream, readFileSync, ReadStream} from "fs";
import {dirSync} from "tmp";
import {FileReadError} from "../common/errors/FileRead.error";
import {FileModel} from "../common/models/File.model";
import {SarcFile} from "@themezernx/sarclib/dist";
import {ThemeAssetsEntity} from "../Theme/Assets/ThemeAssets.entity";
import {toTheme} from "@themezernx/target-parser/dist";
import * as path from "path";
import {LayoutService} from "../Layout/Layout.service";

@Injectable()
export class ThemeOverlayCreatorService {

    constructor(
        private layoutService: LayoutService,
    ) {
    }

    static testThemes = [
        {imagePath: path.join(__dirname, "../../resources/BLACK.dds"), name: "Black Theme"},
        {imagePath: path.join(__dirname, "../../resources/WHITE.dds"), name: "White Theme"},
    ];

    private createTheme(
        layout: string,
        piece: string,
        commonlayout: string,
        image: Buffer,
        themeName: string,
        creatorName: string,
    ) {
        const sarc = new SarcFile();
        const parsedLayout = JSON.parse(layout);

        let layoutInfo = "";
        if (layout) {
            layoutInfo = `${parsedLayout.PatchName} by ${parsedLayout.AuthorName}`;
            sarc.addRawFile(
                this.layoutService.buildOneForOverlayTheme(layout, piece),
                ThemeAssetsEntity.LAYOUT_FILENAME,
            );
        }
        if (commonlayout) {
            sarc.addRawFile(Buffer.from(commonlayout), ThemeAssetsEntity.COMMON_FILENAME);
        }
        sarc.addRawFile(image, ThemeAssetsEntity.BACKGROUND_IMAGE_FILE.name);
        // create info.json
        const info = {
            Version: 15,
            ThemeName: themeName,
            Author: creatorName,
            Target: toTheme(parsedLayout.target),
            LayoutInfo: layoutInfo,
        };
        sarc.addRawFile(Buffer.from(JSON.stringify(info, null, 4)), ThemeAssetsEntity.INFO_FILENAME);

        return sarc.save(2);
    }

    createThemes(layoutJson: string, pieceJson: string, commonlayoutJson: string) {
        return ThemeOverlayCreatorService.testThemes.map((theme) => {
            const imageBuffer = readFileSync(theme.imagePath);
            const themeName = theme.name;
            const creatorName = "Themezer";
            return {
                data: this.createTheme(
                    layoutJson,
                    pieceJson,
                    commonlayoutJson,
                    imageBuffer,
                    themeName,
                    creatorName,
                ),
                mimetype: "application/nxtheme",
                fileName: `${themeName}.nxtheme`,
            };
        });
    }

    createOverlay(blackImage: () => ReadStream, whiteImage: () => ReadStream): Promise<FileModel> {
        return new Promise<FileModel>(async (resolve, reject) => {
            const tmpDir = dirSync();
            const blackImagePath = `${tmpDir.name}/black.png`;
            const whiteImagePath = `${tmpDir.name}/white.png`;
            const outputPath = `${tmpDir.name}/output.png`;

            // pipe both files to disk
            blackImage().pipe(createWriteStream(blackImagePath)).on("finish", () => {
                whiteImage().pipe(createWriteStream(whiteImagePath)).on("finish", () => {
                    im.convert([
                        blackImagePath,
                        whiteImagePath,
                        "-alpha",
                        "off",
                        "(",
                        "-clone",
                        "0,1",
                        "-compose",
                        "difference",
                        "-composite",
                        "-threshold",
                        "50%",
                        "-negate",
                        ")",
                        "(",
                        "-clone",
                        "0,2",
                        "+swap",
                        "-compose",
                        "divide",
                        "-composite",
                        ")",
                        "-delete",
                        "0,1",
                        "+swap",
                        "-compose",
                        "Copy_Opacity",
                        "-composite",
                        outputPath,
                    ], (err, stdout, stderr) => {
                        if (err || stderr) {
                            console.error(err || stderr);
                            reject(new FileReadError());
                            tmpDir.removeCallback();
                        } else {
                            resolve({
                                fileName: "overlay.png",
                                data: readFileSync(outputPath, "base64"),
                                mimetype: "image/png",
                            });
                        }
                        tmpDir.removeCallback();
                    });
                }).on("error", (err) => {
                    reject(new FileReadError(err));
                });
            }).on("error", (err) => {
                reject(new FileReadError(err));
            });
        });
    }

}