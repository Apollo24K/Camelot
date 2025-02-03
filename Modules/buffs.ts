import { BuffType, IbuffInfo } from "../types";

function* idGen(): Generator<number, number> {
    let id = 1;
    while (true) {
        yield id++;
    };
};
let getId = idGen();

export default class buffInfo implements IbuffInfo {
    private _type: BuffType;
    private _val: number;
    private _last: number;
    private _change: number;
    private _ctype: string;
    private _cap: number | [number, number] | undefined;
    private _id: number;

    constructor(type: BuffType, val: number, last: number, change: number = 0, ctype: string = "+", cap: number | [number, number] | undefined = undefined) {
        this._type = type;
        this._val = val;
        this._last = last;
        this._change = change;
        this._ctype = ctype;
        this._cap = cap;
        this._id = getId.next().value;
    };

    get type() {
        return this._type;
    };
    get val() {
        return this._val;
    };
    get last() {
        return this._last;
    };
    get change() {
        return this._change;
    };
    get ctype() {
        return this._ctype;
    };
    get cap() {
        return this._cap;
    };
    get id() {
        return this._id;
    };

    set val(val: number) {
        this._val = val;
    };
    set last(last: number) {
        this._last = last;
    };

    get isDebuff() {
        return ((this.type === "*" && this.val < 1) || (this.type === "+" && this.val < 0));
    };
    get range(): [number, number] {
        if (this._cap === undefined) return [-Infinity, Infinity];
        if (Array.isArray(this._cap)) return this._cap;
        return [-Infinity, this._cap];
    };
};
