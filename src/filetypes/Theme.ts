import fs from "fs";
import Layout from "./Layout";
import {errorName} from "../util/errorTypes";
import {fileNameToThemeTarget, fileNameToWebName} from "../util/targetParser";

const {PythonShell} = require("python-shell");

export const sarcToolPath = `${__dirname}/../../../SARC-Tool`;
export const invalidFilenameCharsREGEX = /[\\~#*{}\/:<>?|"]/gm;

// Allowed files according to https://github.com/exelix11/SwitchThemeInjector/blob/master/SwitchThemesCommon/PatchTemplate.cs#L10-L29
export const allowedFilesInNXTheme = [
    "info.json",
    "image.dds",
    "image.jpg",
    "layout.json",
    "common.json",
    "album.dds",
    "album.png",
    "news.dds",
    "news.png",
    "shop.dds",
    "shop.png",
    "controller.dds",
    "controller.png",
    "settings.dds",
    "settings.png",
    "power.dds",
    "power.png",
    "lock.dds",
    "lock.png",
];

const {
    promises: {readdir, readFile, writeFile},
} = fs;
const tmp = require("tmp");
const rimraf = require("rimraf");

export default class Theme {
    protected name;
    protected author;
    protected target;
    protected id;
    protected pieceUUIDs = [];
    protected layout;
    protected commonLayout;
    protected contentsPath;

    constructor(name?, author?) {
        this.name = name;
        this.author = author || "Themezer";
    }

    get getName() {
        return this.name;
    }

    get getAuthor() {
        return this.author;
    }

    get getId() {
        return this.id;
    }

    get getTarget() {
        return this.target;
    }

    get getLayout() {
        return this.layout;
    }

    get getCommonLayout() {
        return this.commonLayout;
    }

    get getContentsPath() {
        return this.contentsPath;
    }

    getInfo = () => {
        return {
            Version: 15,
            ThemeName: this.name,
            Author: this.author,
            Target: fileNameToThemeTarget(this.target),
            LayoutInfo: !!this.layout ? `${this.layout.getName} by ${this.layout.getAuthor}` : "",
        };
    };

    saveTo = (folderPath: string) => {
        return new Promise<any>(async (resolve, reject) => {
            if (!!this.layout) {
                await writeFile(`${folderPath}/layout.json`, this.layout.toJSON(), "utf8");
            }

            if (!!this.commonLayout) {
                await writeFile(`${folderPath}/common.json`, this.commonLayout.toJSON(), "utf8");
            }

            const info = this.getInfo();
            await writeFile(`${folderPath}/info.json`, JSON.stringify(info), "utf8");

            // Run SARC-Tool main.py on the specified folder
            const options = {
                pythonPath: "python3.8",
                scriptPath: sarcToolPath,
                // Compression 0, to reduce stress on CPU
                args: ["-little", "-compress", "0", "-o", `${folderPath}/theme.nxtheme`, folderPath],
            };
            PythonShell.run("main.py", options, async (err) => {
                if (err) {
                    console.error(err);
                    reject(errorName.NXTHEME_CREATE_FAILED);
                    rimraf(folderPath, () => {
                    });
                    return;
                }

                resolve({
                    filename:
                        (`${this.name} by ${this.author}` +
                            ` (${fileNameToWebName(this.target)})` +
                            (info.LayoutInfo.length > 0 ? `; ${info.LayoutInfo}` : "") +
                            (this.id ? `-${this.id}` : "") +
                            ".nxtheme").replace(invalidFilenameCharsREGEX, "_"),
                    path: `${folderPath}/theme.nxtheme`,
                    mimetype: "application/nxtheme",
                });
            });
        });
    };

    toBase64 = () => {
        return new Promise(((resolve, reject) => {
            tmp.dir({unsafeCleanup: true}, async (err, path, _cleanupCallback) => {
                if (err) {
                    reject(err);
                    return;
                }

                const theme = await this.saveTo(this.contentsPath || path);

                resolve({
                    data: await readFile(theme.path, "base64"),
                    ...theme,
                });
            });
        }));
    };

    loadFile = async (filePath): Promise<any> => {
        const options = {
            pythonPath: "python3.8",
            scriptPath: sarcToolPath,
            args: [filePath],
        };
        return new Promise<any>((resolve, reject) => {
            try {
                PythonShell.run("main.py", options, async (err) => {
                    if (err) {
                        console.error(err);
                        reject(errorName.NXTHEME_UNPACK_FAILED);
                        return;
                    }

                    // Return extracted dir path
                    const unpackPath = filePath.replace(/\.[^\/.]+$/, "");
                    await this.loadFolder(unpackPath, false);
                    resolve(this);
                });
            } catch (e) {
                reject(e);
            }
        });
    };

    loadFolder = async (path: string, loadFromDB): Promise<void> => {
        this.contentsPath = path;
        const filesInFolder = await readdir(path);

        if (!this.layout && filesInFolder.includes("layout.json")) {
            this.layout = new Layout();
            await this.layout.readFile(`${path}/layout.json`, loadFromDB);
            // Preferably set the target to the target from the database, else use the layout target
            this.target = this.target || this.layout.getTarget;
        }

        if (!this.commonLayout && filesInFolder.includes("common.json")) {
            this.commonLayout = new Layout();
            await this.commonLayout.readFile(`${path}/common.json`, loadFromDB);
        }
    };

}