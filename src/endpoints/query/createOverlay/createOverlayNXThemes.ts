const {
    promises: {readFile}
} = require('fs')
import tmp from 'tmp'
import im from 'imagemagick'
import rimraf from 'rimraf'
import {errorName} from "../../../util/errorTypes";
import {saveFiles} from "../../resolvers";

export default async (_parent, {themeName, blackImg, whiteImg}, _context, _info) => {
    try {
        return await new Promise((resolve, reject) => {
            tmp.dir({unsafeCleanup: true}, async (err, path, cleanupCallback) => {
                if (err) {
                    reject(err)
                    return
                }

                const filePromises = saveFiles([
                    {file: blackImg, path},
                    {file: whiteImg, path}
                ])
                const files = await Promise.all(filePromises)

                im.convert(
                    [
                        `${path}/${files[0]}`,
                        `${path}/${files[1]}`,
                        '-alpha',
                        'off',
                        '(',
                        '-clone',
                        '0,1',
                        '-compose',
                        'difference',
                        '-composite',
                        '-threshold',
                        '50%',
                        '-negate',
                        ')',
                        '(',
                        '-clone',
                        '0,2',
                        '+swap',
                        '-compose',
                        'divide',
                        '-composite',
                        ')',
                        '-delete',
                        '0,1',
                        '+swap',
                        '-compose',
                        'Copy_Opacity',
                        '-composite',
                        `${path}/overlay.png`
                    ],
                    async function (err, _stdout, stderr) {
                        if (err || stderr) {
                            console.error(err)
                            console.error(stderr)
                            reject(errorName.FILE_READ_ERROR)
                            rimraf(path, () => {
                            })
                            cleanupCallback()
                            return
                        } else {
                            resolve({
                                filename: themeName ? `${themeName}_overlay.png` : `overlay.png`,
                                data: await readFile(`${path}/overlay.png`, 'base64'),
                                mimetype: 'image/png'
                            })
                        }
                    }
                )
            })
        })
    } catch (e) {
        console.error(e)
        throw new Error(e)
    }
}