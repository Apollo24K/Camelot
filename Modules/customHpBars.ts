import { ColorResolvable } from "discord.js";

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
    private _color: number;
    private _bar: hpBarComponents;

    constructor(name: string, id: number, color: number, bar: hpBarComponents) {
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
    new CustomHpBar("Default", 0, 0x000000, {
        start: { empty: "<:dbl:944322994585612319>", hp_only: "<:dblh:944322994895990855>", mana_only: "<:dblm:944322994971476038>", full: "<:dblhm:944322994749210735>" },
        middle: { empty: "<:db:944322995067957288>", hp_only: "<:dbh:944322995336409128>", mana_only: "<:dbm:944322995088916541>", full: "<:dbhm:944322994942144542>" },
        end: { empty: "<:dbr:944322994778554400>", hp_only: "<:dbrh:944322995122503750>", mana_only: "<:dbrm:944322995135086602>", full: "<:dbrhm:944322997144158318>" },
    }),

    new CustomHpBar("Coffee Brew", 1, 0xe0c4ac, {
        start: { empty: "<:dbl:1408770662310482020>", hp_only: "<:dblh:1408770639711436860>", mana_only: "<:dblm:1408770644761378928>", full: "<:dblhm:1408770642790056107>" },
        middle: { empty: "<:db:1408770656207765505>", hp_only: "<:dbh:1408770658497855558>", mana_only: "<:dbm:1408770646871248998>", full: "<:dbhm:1408770660452270201>" },
        end: { empty: "<:dbr:1408770648666279976>", hp_only: "<:dbrh:1408770650117636127>", mana_only: "<:dbrm:1408770654655873134>", full: "<:dbrhm:1408770652525035530>" },
    }),

    new CustomHpBar("Pinkish Fantasy", 2, 0xffc0cb, {
        start: { empty: "<:dbl:1408775597869760532>", hp_only: "<:dblh:1408775599446691972>", mana_only: "<:dblm:1408775585567608944>", full: "<:dblhm:1408775583281844375>" },
        middle: { empty: "<:db:1408775592052133988>", hp_only: "<:dbh:1408775594249814066>", mana_only: "<:dbm:1408775587924938903>", full: "<:dbhm:1408775596171071608>" },
        end: { empty: "<:dbr:1408775589745262664>", hp_only: "<:dbrh:1408775547865141340>", mana_only: "<:dbrm:1408775552986382428>", full: "<:dbrhm:1408775550213816341>" },
    }),

    new CustomHpBar("Golden Grasslands", 3, 0x0057b7, {
        start: { empty: "<:dbl:1408905623290253312>", hp_only: "<:dblh:1408905624980553799>", mana_only: "<:dblm:1408905603358658580>", full: "<:dblhm:1408905627148877905>" },
        middle: { empty: "<:db:1408905617632137356>", hp_only: "<:dbh:1408905619901120674>", mana_only: "<:dbm:1408905605242028192>", full: "<:dbhm:1408905621637435464>" },
        end: { empty: "<:dbr:1408905606831538226>", hp_only: "<:dbrh:1408905609155182623>", mana_only: "<:dbrm:1408905614238814258>", full: "<:dbrhm:1408905611818700872>" },
    }),

    new CustomHpBar("Falling Leaves", 4, 0xe78700, {
        start: { empty: "<:dbl:1412184144393539694>", hp_only: "<:dblh:1412184147841257502>", mana_only: "<:dblm:1412184113389109419>", full: "<:dblhm:1412184151557406834>" },
        middle: { empty: "<:db:1412184133299605545>", hp_only: "<:dbh:1412184137711751239>", mana_only: "<:dbm:1412184116241236068>", full: "<:dbhm:1412184140706480269>" },
        end: { empty: "<:dbr:1412184120683008161>", hp_only: "<:dbrh:1412184124822913235>", mana_only: "<:dbrm:1412184130208272434>", full: "<:dbrhm:1412184127507140788>" },
    }),

    new CustomHpBar("Autumn Leaves", 5, 0xa0522d, {
        start: { empty: "<:dbl:1415266537748828203>", hp_only: "<:dblh:1415266542815285268>", mana_only: "<:dblm:1415266553150046259>", full: "<:dblhm:1415266548976713882>" },
        middle: { empty: "<:db:1415266524532314272>", hp_only: "<:dbh:1415266531268366437>", mana_only: "<:dbm:1415266558237868052>", full: "<:dbhm:1415266535798476890>" },
        end: { empty: "<:dbr:1415266560745934848>", hp_only: "<:dbrh:1415266565607129141>", mana_only: "<:dbrm:1415266578114674842>", full: "<:dbrhm:1415266572775198750>" },
    }),

    new CustomHpBar("Velvet Night", 6, 0xae0303, {
        start: { empty: "<:dbl:1415266537748828203>", hp_only: "<:dblh:1431679718356287619>", mana_only: "<:dblm:1431679624512929934>", full: "<:dblhm:1431679721292435617>" },
        middle: { empty: "<:db:1415266524532314272>", hp_only: "<:dbh:1431679710726717500>", mana_only: "<:dbm:1431679627042226236>", full: "<:dbhm:1431679712937382049>" },
        end: { empty: "<:dbr:1415266560745934848>", hp_only: "<:dbrh:1431679631358038077>", mana_only: "<:dbrm:1431679697766449314>", full: "<:dbrhm:1431679641524899871>" },
    }),

    new CustomHpBar("Poison Silk", 7, 0x00c125, {
        start: { empty: "<:dbl:1431960329780330496>", hp_only: "<:dblh:1431960334226423909>", mana_only: "<:dblm:1431960342707306597>", full: "<:dblhm:1431960338282188832>" },
        middle: { empty: "<:db:1431960311946149918>", hp_only: "<:dbh:1431960318099066890>", mana_only: "<:dbm:1431960345550782615>", full: "<:dbhm:1431960324239790122>" },
        end: { empty: "<:dbr:1431965091603026010>", hp_only: "<:dbrh:1431961483490623509>", mana_only: "<:dbrm:1431961475668377651>", full: "<:dbrhm:1431961487446118454>" },
    }),

    new CustomHpBar("Pumpkin Parade", 8, 0xff6400, {
        start: { empty: "<:dbl:1431968892984754277>", hp_only: "<:dblh:1431968897409618082>", mana_only: "<:dblm:1431968903143227452>", full: "<:dblhm:1431968900697817148>" },
        middle: { empty: "<:db:1431968923389001738>", hp_only: "<:dbh:1431968885418233966>", mana_only: "<:dbm:1431968906444013659>", full: "<:dbhm:1431968890317045851>" },
        end: { empty: "<:dbr:1431968909585809488>", hp_only: "<:dbrh:1431968913683386452>", mana_only: "<:dbrm:1431968920197136394>", full: "<:dbrhm:1431968917051674755>" },
    }),


];
