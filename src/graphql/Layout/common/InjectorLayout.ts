import {LayoutOptionType} from "../../LayoutOption/common/LayoutOptionType.enum";
import {Parser} from "expr-eval";
import {patch} from "@themezernx/json-merger";
import {LayoutEntity} from "../Layout.entity";

const lengthenHexCode = (hex: string): string[] => {
    if (hex.length == 3) {
        return [hex[0] + hex[0], hex[1] + hex[1], hex[2] + hex[2], "FF"];
    } else if (hex.length == 4) {
        return [hex[0] + hex[0], hex[1] + hex[1], hex[2] + hex[2], hex[3] + hex[3]];
    } else {
        return hex.match(/.{2}/g);
    }
};

export class LoadedLayoutOption {

    uuid?: string;
    json: string;
    type?: LayoutOptionType;
    integerValue?: number;
    decimalValue?: number;
    stringValue?: string;
    colorValue?: string;

}

export class InjectorLayout {

    PatchName: string = "";
    AuthorName: string = "";
    TargetName: string;
    ID: string;
    HideOnlineBtn = true;
    Files: Array<any>;
    Anims: Array<any>;

    private evaluate(piece: LoadedLayoutOption): string {
        const json = piece.json;

        if (piece.stringValue != null) {
            return json.replace(/\?\?string\?\?/gmi, piece.stringValue.replace(/([\\"])/g, "\\$1"));
        } else if (piece.colorValue != null) {
            const hex = lengthenHexCode(piece.colorValue.replace(/^#/g, ""));
            return json.replace(/\?\?{color:?((?:RR|GG|BB|AA){4})}\?\?/gmi,
                (whole, colorPattern: string) => {
                    return colorPattern.match(/.{2}/g).map((block) => {
                        switch (block.toUpperCase()) {
                            case "RR":
                                return hex[0];
                            case "GG":
                                return hex[1];
                            case "BB":
                                return hex[2];
                            case "AA":
                                return hex[3];
                        }
                    }).join("");
                });
        } else if (piece.integerValue != null || piece.decimalValue != null) {
            return json.replace(/"?\?\?(.*?{(integer|decimal)}.*?)\?\?"?/gmi,
                (whole, expression: string, type: string) => {
                    // if the only thing in this string is the expression, try to parse it as number
                    const isOnlyExpression = whole.startsWith("\"") && whole.endsWith("\"");
                    const isInteger = type.toLowerCase() == "integer";
                    const evaluated = Parser.evaluate(expression, {
                        value: isInteger ?
                            piece.integerValue : piece.decimalValue,
                    });

                    const computed = evaluated.toPrecision(6);
                    const number = isInteger ? parseInt(computed) : parseFloat(computed);
                    if (isOnlyExpression) {
                        return number.toString();
                    } else {
                        return (whole.startsWith("\"") ? "\"" : "") +
                            number +
                            (whole.endsWith("\"") ? "\"" : "");
                    }
                });
        }

        return json;
    }

    copyBasicPropertiesFromJson = (layoutJson: string) => {
        const parsedJson = JSON.parse(layoutJson);

        this.PatchName = parsedJson.PatchName;
        this.AuthorName = parsedJson.AuthorName;
        this.TargetName = parsedJson.TargetName;

        if (parsedJson.HideOnlineBtn == true || parsedJson.HideOnlineBtn == false) {
            this.HideOnlineBtn = parsedJson.HideOnlineBtn;
        }
        if (!!parsedJson.Files) {
            this.Files = parsedJson.Files;
        }
        if (!!parsedJson.Anims) {
            this.Anims = parsedJson.Anims;
        }
    };

    copyBasicProperties = (layout: LayoutEntity) => {
        const parsedJson = JSON.parse(layout.json);

        this.PatchName = layout.name;
        this.AuthorName = layout.creator.username;
        this.TargetName = layout.target + ".szs";

        if (parsedJson.HideOnlineBtn == true || parsedJson.HideOnlineBtn == false) {
            this.HideOnlineBtn = parsedJson.HideOnlineBtn;
        }
        if (!!parsedJson.Files) {
            this.Files = parsedJson.Files;
        }
        if (!!parsedJson.Anims) {
            this.Anims = parsedJson.Anims;
        }
    };

    applyOptions = (pieces: LoadedLayoutOption[]) => {
        // pieces are already sorted by priority asc
        for (const piece of pieces) {
            const parsed = JSON.parse(this.evaluate(piece));

            if (parsed.HideOnlineBtn == true || parsed.HideOnlineBtn == false) {
                this.HideOnlineBtn = parsed.HideOnlineBtn;
            }

            // Merge files patches
            if (Array.isArray(this.Files)) {
                this.Files = patch(this.Files, parsed.Files, [
                    "FileName",
                    "PaneName",
                    "PropName",
                    "GroupName",
                    "name",
                    "MaterialName",
                    "unknown",
                ]);
            }

            // Merge animation files patches
            if (Array.isArray(this.Anims)) {
                this.Anims = patch(this.Anims, parsed.Anims, [
                    "FileName",
                ]);
            }
        }
    };

}