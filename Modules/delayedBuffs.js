class delayedBuff {
    constructor(round, func, last = 1, usage = 9999) {
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
    decrement() {
        this._last--;
    };
};

module.exports = delayedBuff;