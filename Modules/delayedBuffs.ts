import { IdelayedBuff, ItemAbility } from "../types";

export default class delayedBuff implements IdelayedBuff {
    private _round: number;
    private _func: ItemAbility;
    private _last: number;
    private _usage: number;
    private _used: number;

    constructor(round: number, func: ItemAbility, last: number = 1, usage: number = 9999) {
        this._round = round;
        this._func = func;
        this._last = last;
        this._usage = usage;
        this._used = 0;
    };

    get round() {
        return this._round;
    };
    get run() {
        // this._used++;
        return this._func;
    };
    get last() {
        return this._last;
    };
    get usage() {
        return this._usage;
    };
    get used() {
        return this._used;
    };
    set used(used: number) {
        this._used = used;
    };
    decrement() {
        this._last--;
    };
};
