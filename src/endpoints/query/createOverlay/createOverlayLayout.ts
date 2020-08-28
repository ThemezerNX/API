const {
    promises: {readFile, writeFile},
} = require('fs')
import rimraf from 'rimraf'
import link from 'fs-symlink'
import tmp from 'tmp'
import {errorName} from "../../../util/errorTypes";
import {createNXThemes, mergeJson, saveFiles} from "../../resolvers";

export default async (_parent, {layout, piece, common}, _context, _info) => {
    try {
        return await new Promise((resolve, reject) => {
            tmp.dir({unsafeCleanup: true}, async (err, path, cleanupCallback) => {
                if (err) {
                    reject(err)
                    return
                }

                try {
                    const filesToSave = [{file: layout, path}]

                    if (!!piece) {
                        filesToSave[1] = {file: piece, path}
                    }

                    if (!!common) {
                        filesToSave[2] = {file: common, path}
                    }

                    const filePromises = saveFiles(filesToSave)
                    const files = await Promise.all(filePromises)
                    const layoutJson = await readFile(`${path}/${files[0]}`, 'utf8')

                    const piecesJson = []

                    if (!!piece) {
                        piecesJson.push(await readFile(`${path}/${files[1]}`, 'utf8'))
                    }

                    const layoutJsonParsed = JSON.parse(layoutJson)

                    if (!!common && layoutJsonParsed.Target === 'common.szs') {
                        reject(errorName.NO_COMMON_ALLOWED)
                        return
                    }

                    layoutJsonParsed.ID = 'overlaycreator'

                    const json = mergeJson(layoutJsonParsed, piecesJson)
                    await writeFile(`${path}/layout_merged.json`, JSON.stringify(json, null, 4))

                    const linkPromises = [
                        link(`${path}/layout_merged.json`, `${path}/black/layout.json`),
                        link(`${__dirname}/../../images/BLACK.dds`, `${path}/black/image.dds`),
                        link(`${path}/layout_merged.json`, `${path}/white/layout.json`),
                        link(`${__dirname}/../../images/WHITE.dds`, `${path}/white/image.dds`)
                    ]

                    if (!!common) {
                        linkPromises.push(link(`${path}/${files[2]}`, `${path}/black/common.json`))
                        linkPromises.push(link(`${path}/${files[2]}`, `${path}/white/common.json`))
                    }

                    // Symlink the files to the two dirs
                    await Promise.all(linkPromises)

                    // Make NXThemes
                    const themes = [
                        {
                            path: `${path}/black`,
                            themeName: 'Black background'
                        },
                        {
                            path: `${path}/white`,
                            themeName: 'White background'
                        }
                    ]
                    const themePromises = createNXThemes(themes)
                    const themesReturned: Array<any> = await Promise.all(themePromises)

                    const themesB64 = []
                    for (const i in themesReturned) {
                        themesB64.push({
                            filename: themesReturned[i].filename,
                            data: await readFile(themesReturned[i].path, 'base64'),
                            mimetype: themesReturned[i].mimetype
                        })
                    }

                    resolve(themesB64)

                    cleanupCallback()
                } catch (e) {
                    reject(e)
                    rimraf(path, () => {})
                }
            })
        })
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}