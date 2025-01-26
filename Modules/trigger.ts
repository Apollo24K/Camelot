import { ITrigger, DetailedStats, TriggerEvents, TriggerOptions } from "../types";

function* idGen(): Generator<number, number> {
    let id = 1;
    while (true) {
        yield id++;
    };
};
let getId = idGen();

export default class Trigger implements ITrigger {
    private _event: TriggerEvents;
    private _duration: number;
    private _maxRound: number;
    private _maxUsage: number;
    private _used: number;
    private _target?: DetailedStats;
    private _caster?: DetailedStats;
    private _callback: (...args: any[]) => any;
    private _id: number;

    constructor({ event, duration, maxRound, maxUsage, target, caster, callback }: TriggerOptions) {
        this._event = event;
        this._duration = duration ?? Infinity;
        this._maxRound = maxRound ?? Infinity;
        this._maxUsage = maxUsage ?? Infinity;
        this._used = 0;
        this._target = target;
        this._caster = caster;
        this._callback = callback;
        this._id = getId.next().value;
    };

    get event() {
        return this._event;
    };
    get duration() {
        return this._duration;
    };
    get maxRound() {
        return this._maxRound;
    };
    get maxUsage() {
        return this._maxUsage;
    };
    get used() {
        return this._used;
    };
    get target() {
        return this._target;
    };
    get caster() {
        return this._caster;
    };
    get callback() {
        return this._callback;
    };
    get id() {
        return this._id;
    };

    set duration(duration: number) {
        this._duration = duration;
    };
    set used(used: number) {
        this._used = used;
    };
};
