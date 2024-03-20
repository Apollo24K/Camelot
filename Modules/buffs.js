function* idGen() {
    let id = 1;
    while (true) {
        yield id++;
    };
};
let getId = idGen();

class buffInfo {
    constructor(type, val, last, change = 0, ctype = "+", cap = undefined) {
        this._type = type; // multiplicative (*), additive (+), set (=)
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
};

module.exports = buffInfo;