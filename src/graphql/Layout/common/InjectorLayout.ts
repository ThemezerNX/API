import {LayoutOptionType} from "../../LayoutOption/common/LayoutOptionType.enum";
import {Parser} from "expr-eval";
import {patch} from "@themezernx/json-merger";

function reverseHex(s: string) {
    return s.match(/.{2}/g).reverse().join("");
}

export class LoadedLayoutOption {

    uuid: string;
    integerValue?: number;
    decimalValue?: number;
    stringValue?: string;
    colorValue?: string;
    type: LayoutOptionType;
    json: string;

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
            return json.replace(/\?\?string\?\?/gmi, piece.stringValue);
        } else if (piece.colorValue != null) {
            // TODO: replace AA, BB, GG, RR individually
            return json.replace(/\?\?color\?\?/gmi, reverseHex(piece.colorValue.replace(/#/g, "")));
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