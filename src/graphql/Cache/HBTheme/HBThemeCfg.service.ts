import {HBThemeEntity} from "../../HBTheme/HBTheme.entity";
import {HBThemeAssetsEntity} from "../../HBTheme/Assets/HBThemeAssets.entity";

const UNPRINTABLE_CHARACTER_RE = /[\x00-\x1F\x7F]/g;

const e = (str: string) => str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"")
    .replace(/\f/g, "\\f")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(UNPRINTABLE_CHARACTER_RE, (match) => {
        return `\\x${match.charCodeAt(0).toString(16)}`;
    });

const h2r = (hex) => {
    const [r, g, b, a] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return `(${r},${g},${b},${a})`;
};

export class HBThemeCfg {

    hbtheme: HBThemeEntity;

    constructor(hbtheme: HBThemeEntity) {
        this.hbtheme = hbtheme;
    }

    toString(): string {
        let cfg = `themeInfo={\n\tname="${e(this.hbtheme.name)}";\n\tauthor="${e(this.hbtheme.creator.username)}";\n};\n`;

        if (this.hbtheme.lightTheme) {
            cfg += "lightTheme={\n";
            if (this.hbtheme.lightTheme.textColor) {
                cfg += `\ttextColor=${h2r(this.hbtheme.lightTheme.textColor)};\n`;
            }
            if (this.hbtheme.lightTheme.frontWaveColor) {
                cfg += `\tfrontWaveColor=${h2r(this.hbtheme.lightTheme.frontWaveColor)};\n`;
            }
            if (this.hbtheme.lightTheme.middleWaveColor) {
                cfg += `\tmiddleWaveColor=${h2r(this.hbtheme.lightTheme.middleWaveColor)};\n`;
            }
            if (this.hbtheme.lightTheme.backWaveColor) {
                cfg += `\tbackWaveColor=${h2r(this.hbtheme.lightTheme.backWaveColor)};\n`;
            }
            if (this.hbtheme.lightTheme.backgroundColor) {
                cfg += `\tbackgroundColor=${h2r(this.hbtheme.lightTheme.backgroundColor)};\n`;
            }
            if (this.hbtheme.lightTheme.highlightColor) {
                cfg += `\thighlightColor=${h2r(this.hbtheme.lightTheme.highlightColor)};\n`;
            }
            if (this.hbtheme.lightTheme.separatorColor) {
                cfg += `\tseparatorColor=${h2r(this.hbtheme.lightTheme.separatorColor)};\n`;
            }
            if (this.hbtheme.lightTheme.borderColor) {
                cfg += `\tborderColor=${h2r(this.hbtheme.lightTheme.borderColor)};\n`;
            }
            if (this.hbtheme.lightTheme.borderTextColor) {
                cfg += `\tborderTextColor=${h2r(this.hbtheme.lightTheme.borderTextColor)};\n`;
            }
            if (this.hbtheme.lightTheme.progressBarColor) {
                cfg += `\tprogressBarColor=${h2r(this.hbtheme.lightTheme.progressBarColor)};\n`;
            }
            if (this.hbtheme.lightTheme.logoColor) {
                cfg += `\tlogoColor=${h2r(this.hbtheme.lightTheme.logoColor)};\n`;
            }
            if (this.hbtheme.lightTheme.highlightGradientEdgeColor) {
                cfg += `\thighlightGradientEdgeColor=${h2r(this.hbtheme.lightTheme.highlightGradientEdgeColor)};\n`;
            }
            if (this.hbtheme.lightTheme.enableWaveBlending) {
                cfg += `\tenableWaveBlending=${this.hbtheme.lightTheme.enableWaveBlending};\n`;
            }
            cfg += "};\n";
        }

        if (this.hbtheme.darkTheme) {
            cfg += "darkTheme={\n";
            if (this.hbtheme.darkTheme.textColor) {
                cfg += `\ttextColor=${h2r(this.hbtheme.darkTheme.textColor)};\n`;
            }
            if (this.hbtheme.darkTheme.frontWaveColor) {
                cfg += `\tfrontWaveColor=${h2r(this.hbtheme.darkTheme.frontWaveColor)};\n`;
            }
            if (this.hbtheme.darkTheme.middleWaveColor) {
                cfg += `\tmiddleWaveColor=${h2r(this.hbtheme.darkTheme.middleWaveColor)};\n`;
            }
            if (this.hbtheme.darkTheme.backWaveColor) {
                cfg += `\tbackWaveColor=${h2r(this.hbtheme.darkTheme.backWaveColor)};\n`;
            }
            if (this.hbtheme.darkTheme.backgroundColor) {
                cfg += `\tbackgroundColor=${h2r(this.hbtheme.darkTheme.backgroundColor)};\n`;
            }
            if (this.hbtheme.darkTheme.highlightColor) {
                cfg += `\thighlightColor=${h2r(this.hbtheme.darkTheme.highlightColor)};\n`;
            }
            if (this.hbtheme.darkTheme.separatorColor) {
                cfg += `\tseparatorColor=${h2r(this.hbtheme.darkTheme.separatorColor)};\n`;
            }
            if (this.hbtheme.darkTheme.borderColor) {
                cfg += `\tborderColor=${h2r(this.hbtheme.darkTheme.borderColor)};\n`;
            }
            if (this.hbtheme.darkTheme.borderTextColor) {
                cfg += `\tborderTextColor=${h2r(this.hbtheme.darkTheme.borderTextColor)};\n`;
            }
            if (this.hbtheme.darkTheme.progressBarColor) {
                cfg += `\tprogressBarColor=${h2r(this.hbtheme.darkTheme.progressBarColor)};\n`;
            }
            if (this.hbtheme.darkTheme.logoColor) {
                cfg += `\tlogoColor=${h2r(this.hbtheme.darkTheme.logoColor)};\n`;
            }
            if (this.hbtheme.darkTheme.highlightGradientEdgeColor) {
                cfg += `\thighlightGradientEdgeColor=${h2r(this.hbtheme.darkTheme.highlightGradientEdgeColor)};\n`;
            }
            if (this.hbtheme.darkTheme.enableWaveBlending) {
                cfg += `\tenableWaveBlending=${this.hbtheme.darkTheme.enableWaveBlending};\n`;
            }
            cfg += "};\n";
        }

        if (this.hbtheme.assets.layout || this.hbtheme.assets.backgroundImageFile) {
            cfg += "layout={\n";
            cfg += this.hbtheme.assets.layout ? "\t" + this.hbtheme.assets.layout + "\n" : "";
            cfg += this.hbtheme.assets.backgroundImageFile ? "\tbackgroundImage={\n\t\tvisible=true;\n\t\tposStart=(0,0);\n};\n" : "";
            cfg += "};\n";
        }

        cfg += "assets={\n";
        if (this.hbtheme.assets.batteryIconFile) {
            cfg += "\tbattery_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.BATTERY_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(50,50);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.chargingIconFile) {
            cfg += "\tcharging_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.CHARGING_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(50,50);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.folderIconFile) {
            cfg += "\tfolder_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.FOLDER_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(256,256);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.invalidIconFile) {
            cfg += "\tinvalid_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.INVALID_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(256,256);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.themeIconDarkFile) {
            cfg += "\ttheme_icon_dark={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.THEME_ICON_DARK_FILE.name}";\n`;
            cfg += "\t\timageSize=(256,256);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.themeIconLightFile) {
            cfg += "\ttheme_icon_light={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.THEME_ICON_LIGHT_FILE.name}";\n`;
            cfg += "\t\timageSize=(256,256);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.airplaneIconFile) {
            cfg += "\tairplane_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.AIRPLANE_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(50,50);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.wifiNoneIconFile) {
            cfg += "\twifi_none_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.WIFI_NONE_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(50,50);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.wifi1IconFile) {
            cfg += "\twifi1_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.WIFI1_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(50,50);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.wifi2IconFile) {
            cfg += "\twifi2_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.WIFI2_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(50,50);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.wifi3IconFile) {
            cfg += "\twifi3_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.WIFI3_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(50,50);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.ethIconFile) {
            cfg += "\teth_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.ETH_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(50,50);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.ethNoneIconFile) {
            cfg += "\teth_none_icon={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.ETH_NONE_ICON_FILE.name}";\n`;
            cfg += "\t\timageSize=(50,50);\n";
            cfg += "\t};\n";
        }
        if (this.hbtheme.assets.backgroundImageFile) {
            cfg += "\tbackground_image={\n";
            cfg += `\t\tpath="${HBThemeAssetsEntity.BACKGROUND_IMAGE_FILE.name}";\n`;
            cfg += "\t\timageSize=(1280,720);\n";
            cfg += "\t};\n";
        }

        cfg += "};";
        return cfg;
    }

}