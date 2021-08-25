import {createCipheriv, createDecipheriv} from "crypto";

require("dotenv").config();

export const decrypt = (cipherText) => {
    const decipher = createDecipheriv("aes128", process.env.KEY, process.env.IV);
    return decipher.update(cipherText, "hex", "utf8") + decipher.final("utf8");
};
export const encrypt = (text) => {
    const cipher = createCipheriv("aes128", process.env.KEY, process.env.IV);
    return cipher.update(text, "utf8", "hex") + cipher.final("hex");
};
