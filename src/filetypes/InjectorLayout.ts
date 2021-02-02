import fs from "fs";

const {patch} = require("@themezernx/json-merger");

const {
    promises: {readFile},
} = fs;

export default class InjectorLayout {
    private name;
    private author;
    private target;
    private id;
    private hideOnlineBtn = false;
    private files = [];
    private anims = [];

    constructor(name?, author?, target?, id?, hideOnlineBtn?, files?, anims?) {
        this.name = name;
        this.author = author;
        this.target = target ? (target + ".szs") : undefined;
        this.id = id;
        this.hideOnlineBtn = hideOnlineBtn;
        this.files = files;
        this.anims = anims;
    }

    get getName() {
        return this.name;
    }

    get getAuthor() {
        return this.author;
    }

    get getTarget() {
        return this.target;
    }

    get getId() {
        return this.id;
    }

    get getHideOnlineBtn(): boolean {
        return this.hideOnlineBtn;
    }

    get getFiles(): any[] {
        return this.files;
    }

    get getAnims(): any[] {
        return this.anims;
    }

    readFile = async (file) => {
        const obj = await readFile(file, "utf8");
        this.readJSON(obj);
    };

    readJSON = (obj) => {
        const json = JSON.parse(obj);
        this.name = this.name || json.PatchName;
        this.author = this.author || json.AuthorName;
        this.target = this.target || json.TargetName;
        this.id = this.id || json.ID;
        this.hideOnlineBtn = json.HideOnlineBtn;
        this.files = json.Files;
        this.anims = json.Anims;
    };

    toJSON = (finalID?) => {
        return JSON.stringify({
            PatchName: this.name,
            AuthorName: this.author,
            TargetName: this.target,
            ID: finalID || this.id,
            HideOnlineBtn: this.hideOnlineBtn,
            Files: this.files,
            Anims: this.anims,
        }, null, 4);
    };

    applyPieces = (pieces) => {
        while (pieces.length > 0) {
            const shifted = pieces.shift();

            // Merge files patches
            if (Array.isArray(this.files)) {
                this.files = patch(this.files, JSON.parse(shifted.json).Files, [
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
            if (Array.isArray(this.anims)) {
                this.anims = patch(this.anims, JSON.parse(shifted.json).Anims, ["FileName"]);
            }
        }
    };

}