import Theme from "../../../filetypes/Theme";
import rimraf from "rimraf";
import tmp from "tmp";
import {errorName} from "../../../util/errorTypes";
import {saveFiles} from "../../resolvers";
import Layout from "../../../filetypes/Layout";
import {validLayoutTargetName} from "../../../util/targetParser";

const link = require("fs-symlink");

const {
    promises: {readFile},
} = require("fs");

export default async (_parent, {layout, piece, common}, _context, _info) => {
    return await new Promise((resolve, reject) => {
        tmp.dir({unsafeCleanup: true, tmpdir: process.env.TMP_PATH}, async (err, path, cleanupCallback) => {
            if (err) {
                console.error(err);
                reject(new Error(errorName.FILE_SAVE_ERROR));
                return;
            }

            try {
                // Save files to disk
                const filesToSave = [{file: layout, path}];
                if (!!piece) {
                    filesToSave[1] = {file: piece, path};
                }
                if (!!common) {
                    filesToSave[2] = {file: common, path};
                }

                const filePromises = saveFiles(filesToSave);
                const files = await Promise.all(filePromises);

                // Create objects
                const layout1 = new Layout();
                await layout1.readFile(`${path}/${files[0]}`, false);
                if (!!piece) {
                    layout1.addPiece(await readFile(`${path}/${files[1]}`, "utf8"));
                }
                await layout1.saveTo(path);

                if (!validLayoutTargetName(layout1.getTarget)) {
                    reject(new Error(errorName.INVALID_TARGET_NAME));
                    return;
                }

                // Symlink the files to the two dirs
                const linkPromises = [
                    link(`${path}/layout.json`, `${path}/black/layout.json`),
                    link(`${__dirname}/../../../../images/BLACK.dds`, `${path}/black/image.dds`),
                    link(`${path}/layout.json`, `${path}/white/layout.json`),
                    link(`${__dirname}/../../../../images/WHITE.dds`, `${path}/white/image.dds`),
                ];
                if (!!common) {
                    linkPromises.push(link(`${path}/${files[2]}`, `${path}/black/common.json`));
                    linkPromises.push(link(`${path}/${files[2]}`, `${path}/white/common.json`));
                }
                await Promise.all(linkPromises);

                // Make NXThemes
                const themes = [
                    {
                        path: `${path}/black`,
                        name: "Black background",
                    },
                    {
                        path: `${path}/white`,
                        name: "White background",
                    },
                ];
                const savePromises = themes.map(async (theme) => {
                    const nxtheme = new Theme(theme.name);
                    await nxtheme.loadFolder(theme.path, false);
                    return nxtheme.toBase64();
                });

                resolve(await Promise.all(savePromises));
                cleanupCallback();
            } catch (e) {
                reject(e);
                rimraf(path, () => {
                });
            }
        });
    });
}