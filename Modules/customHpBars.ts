
type hpBarComponents = {
    start: {
        empty: string;
        hp_only: string;
        mana_only: string;
        full: string;
    };
    middle: {
        empty: string;
        hp_only: string;
        mana_only: string;
        full: string;
    };
    end: {
        empty: string;
        hp_only: string;
        mana_only: string;
        full: string;
    };
};

export default class CustomHpBar {
    private _name: string;
    private _id: number;
    private _color: string;
    private _bar: hpBarComponents;

    constructor(name: string, id: number, color: string, bar: hpBarComponents) {
        this._name = name;
        this._id = id;
        this._color = color;
        this._bar = bar;
    };

    get name() {
        return this._name;
    };
    get id() {
        return this._id;
    };
    get color() {
        return this._color;
    };
    get bar() {
        return this._bar;
    };

    getHpBar(hp: number, mana: number) {
        let bar = "";
        if (hp > 0 && mana > 0) bar += this._bar.start.full;
        else if (hp > 0) bar += this._bar.start.hp_only;
        else if (mana > 0) bar += this._bar.start.mana_only;
        else return this._bar.start.empty + this._bar.middle.empty.repeat(8) + this._bar.end.empty;

        hp > 0.1 ? hp -= 0.1 : hp = 0;
        mana > 0.1 ? mana -= 0.1 : mana = 0;
        let ret = 8;
        while (ret--) {
            if (hp && mana) bar += this._bar.middle.full;
            else if (hp) bar += this._bar.middle.hp_only;
            else if (mana) bar += this._bar.middle.mana_only;
            else bar += this._bar.middle.empty;
            hp > 0.1 ? hp -= 0.1 : hp = 0;
            mana > 0.1 ? mana -= 0.1 : mana = 0;
        };

        if (hp && mana) bar += this._bar.end.full;
        else if (hp) bar += this._bar.end.hp_only;
        else if (mana) bar += this._bar.end.mana_only;
        else bar += this._bar.end.empty;
        return bar;
    };

};

export const customHpBars: CustomHpBar[] = [
    new CustomHpBar("Default", 0, "#000000", {
        start: { empty: "<:dbl:944322994585612319>", hp_only: "<:dblh:944322994895990855>", mana_only: "<:dblm:944322994971476038>", full: "<:dblhm:944322994749210735>" },
        middle: { empty: "<:db:944322995067957288>", hp_only: "<:dbh:944322995336409128>", mana_only: "<:dbm:944322995088916541>", full: "<:dbhm:944322994942144542>" },
        end: { empty: "<:dbr:944322994778554400>", hp_only: "<:dbrh:944322995122503750>", mana_only: "<:dbrm:944322995135086602>", full: "<:dbrhm:944322997144158318>" },
    }),

    new CustomHpBar("Coffee Brew", 1, "#e0c4ac", {
        start: { empty: "<:dbl:1397207925935702169>", hp_only: "<:dblh:1397207928326459432>", mana_only: "<:dblm:1397207956625293475>", full: "<:dblhm:1397207954830131372>" },
        middle: { empty: "<:db:1397207941509021716>", hp_only: "<:dbh:1397207943102857348>", mana_only: "<:dbm:1397207931350417450>", full: "<:dbhm:1397207945825226892>" },
        end: { empty: "<:dbr:1397207933800153168>", hp_only: "<:dbrh:1397207936153030778>", mana_only: "<:dbrm:1397207939496018044>", full: "<:dbrhm:1397207938044526726>" },
    }),


];
