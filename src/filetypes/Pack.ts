export default class Pack {
    protected name;
    protected id;
    protected author;
    protected themes = [];

    constructor() {
    }

    get getThemes() {
        return this.themes;
    }

    get getName() {
        return this.name;
    }

}