import { ChatInputCommandInteraction } from "discord.js";
import { achievements } from "./achievements";
import { customEmojis, addHeal } from "./functions";
import Trigger from "./trigger";
import { Buffs, DetailedStats, MatchStats, TriggerEvents, TriggerOptions } from "../types";
import buffInfo from "./buffs";

export default class Avalon {
    constructor({ myStats, eStats }: { myStats: any, eStats: any; }) {
        // this._userBuffs = Avalon.getBuffs();
        // this._enemyBuffs = Avalon.getBuffs();

    };

    static checkIfEnded(myStatsC: DetailedStats, eStatsC: DetailedStats, matchStats: MatchStats, notice: string[], interaction: ChatInputCommandInteraction, minionDefeated: any, editEmbed: any, endMatch: any) {
        if (myStatsC.hp < 1) {
            if (matchStats.currentCharacter) {
                matchStats.trigger("minionDeath", myStatsC, eStatsC, myStatsC.buffs, eStatsC.buffs, {});
                return minionDefeated("my");
            };
            if (!eStatsC.blockRevival && myStatsC.revivedTotal < myStatsC.maxRevivals && myStatsC.rev > Math.random()) {
                myStatsC.revivedTotal++;
                myStatsC.hp = Math.floor(myStatsC.maxhp * myStatsC.revhp);
                notice.push(`\n✨ ${myStatsC.name} survived! Restored **${myStatsC.hp}** HP`);
                matchStats.trigger("revival", eStatsC, myStatsC, eStatsC.buffs, myStatsC.buffs, {});
                matchStats.turn === 1;
                editEmbed();

                // Achievements
                achievements[24].check(interaction, interaction.user, myStatsC.revivedTotal), achievements[25].check(interaction, interaction.user, myStatsC.revivedTotal), achievements[26].check(interaction, interaction.user, myStatsC.revivedTotal); // The Show Must Go On
            } else {
                endMatch("l");
            };
        } else if (eStatsC.hp < 1) {
            if (matchStats.currentOpponent) {
                matchStats.trigger("minionDeath", eStatsC, myStatsC, eStatsC.buffs, myStatsC.buffs, {});
                return minionDefeated("e");
            };
            if (!myStatsC.blockRevival && eStatsC.revivedTotal < eStatsC.maxRevivals && eStatsC.rev > Math.random()) {
                eStatsC.revivedTotal++;
                eStatsC.hp = Math.floor(eStatsC.maxhp * eStatsC.revhp);
                notice.push(`\n✨ ${eStatsC.name} survived! Restored **${eStatsC.hp}** HP`);
                matchStats.trigger("revival", myStatsC, eStatsC, myStatsC.buffs, eStatsC.buffs, {});
                matchStats.turn === 1;
                editEmbed();
            } else {
                endMatch("w");
            };
        };
    };

    static hpbar(hp: number, mana: number) {
        let bar = "";
        if (hp > 0 && mana > 0) bar += "<:dblhm:944322994749210735>";
        else if (hp > 0) bar += "<:dblh:944322994895990855>";
        else if (mana > 0) bar += "<:dblm:944322994971476038>";
        else return "<:dbl:944322994585612319><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:dbr:944322994778554400>";

        hp > 0.1 ? hp -= 0.1 : hp = 0;
        mana > 0.1 ? mana -= 0.1 : mana = 0;
        let ret = 8;
        while (ret--) {
            if (hp && mana) bar += "<:dbhm:944322994942144542>";
            else if (hp) bar += "<:dbh:944322995336409128>";
            else if (mana) bar += "<:dbm:944322995088916541>";
            else bar += "<:db:944322995067957288>";
            hp > 0.1 ? hp -= 0.1 : hp = 0;
            mana > 0.1 ? mana -= 0.1 : mana = 0;
        };

        if (hp && mana) bar += "<:dbrhm:944322997144158318>";
        else if (hp) bar += "<:dbrh:944322995122503750>";
        else if (mana) bar += "<:dbrm:944322995135086602>";
        else bar += "<:dbr:944322994778554400>";
        return bar;
    };

    static padStats(stats: DetailedStats) {
        let line1 = customEmojis.atk, line2 = customEmojis.md;

        let len = Math.max(`${stats.atk}`.length, `${stats.md}`.length);
        line1 += `\`${" ".repeat(len - `${stats.atk}`.length)}${stats.atk}\`` + customEmojis.def;
        line2 += `\`${" ".repeat(len - `${stats.md}`.length)}${stats.md}\`` + customEmojis.mr;

        len = Math.max(`${stats.def}`.length, `${stats.mr}`.length);
        line1 += `\`${" ".repeat(len - `${stats.def}`.length)}${stats.def}\`` + customEmojis.cr;
        line2 += `\`${" ".repeat(len - `${stats.mr}`.length)}${stats.mr}\`` + customEmojis.dodge;

        len = Math.max(`${Math.floor(stats.cr * 100)}`.length, `${Math.floor(stats.dodge * 100)}`.length);
        line1 += `\`${" ".repeat(len - `${Math.floor(stats.cr * 100)}`.length)}${Math.floor(stats.cr * 100)}%\`` + customEmojis.cd;
        line2 += `\`${" ".repeat(len - `${Math.floor(stats.dodge * 100)}`.length)}${Math.floor(stats.dodge * 100)}%\`` + customEmojis.mg;

        len = Math.max(`${Math.floor(stats.cd * 100)}`.length, `${stats.mg}`.length);
        line1 += `\`${" ".repeat(len - `${Math.floor(stats.cd * 100)}`.length)}${Math.floor(stats.cd * 100)}%\``;
        line2 += `\`${" ".repeat(len - `${stats.mg}`.length)}+${stats.mg}\``;

        return line1 + "\n" + line2;
    };

    static getDifficulty(epDiff: number) { // epDiff = myEP/eEP
        if (epDiff >= 1.25) return "<a:arrow_green:916716811842621450> Threat Level: **Easy**";
        if (epDiff >= 0.75) return "<a:arrow_orange:916716747623641210> Threat Level: **Medium**";
        if (epDiff >= 0.5) return "<a:arrow_red:916716702618767401> Threat Level: **Hard**";
        return "<a:arrow_black:916718325386588221> Threat Level: **Impossible**";
    };

    static getMatchStats(interaction: ChatInputCommandInteraction, flags: any = {}) {
        const matchStats: MatchStats = {
            turn: 1,
            round: 1,
            roundCheck: 1,
            ended: false,
            interaction: interaction,
            turnSkill: 0,
            timeout: 0,
            defUsed: 0,
            p1usedblock: -1,
            p2usedblock: -1,
            combodmg: 0,
            revivedTotal: 0,
            collector: {},
            abilityUsed: 0,
            blockAbilities: 0,
            loot: 0,
            lootm: 1,
            xpboost: 0,
            counter: 0,
            counterChance: 1,
            currentCharacter: 0, // 1 = minion
            currentOpponent: 0,
            myStatsCC: {},
            eStatsCC: {},
            tdChance: 0,
            shieldBreak: 0,
            selfdmg: 0,
            selfheal: 0,
            selfhealChance: 0,
            twinshot: 0,
            critbleed: false,
            critbleedlast: 0,
            evadeDeathStrike: 0,
            evadeDeathChance: 0,
            allowExecution: true,
            damageFormula: "default" as "default" | `log_scale_${number}`,
            consumeMana: 0,
            lightningMultiplier: 0,
            dodgebuff: 0,
            heap1: 0,

            listeners: {} as Record<TriggerEvents, Trigger[]>,
            on: function (event: TriggerEvents, options: TriggerOptions | ((...args: any[]) => any)) {
                if (this.listeners[event] === undefined) this.listeners[event] = [];

                if (typeof options === "object") {
                    this.listeners[event]?.push(new Trigger({ ...options, event }));
                } else {
                    this.listeners[event]?.push(new Trigger({ event, callback: options }));
                };
            },
            off: function (event: TriggerEvents, trigger: Trigger | number) {
                if (this.listeners[event] !== undefined) {
                    this.listeners[event] = this.listeners[event]?.filter(listener => listener !== trigger && listener.id !== trigger);
                };
            },
            trigger: function (event: TriggerEvents, caster: any, target: any, casterBuff: any, targetBuff: any, options: any = {}) {
                this.listeners[event]?.forEach(trigger => {
                    const used = trigger.callback({ trigger, caster, target, casterBuff, targetBuff, matchStats: this, options });
                    if (used) trigger.used++;
                    trigger.duration--;

                    if (trigger.used >= trigger.maxUsage) {
                        this.off(event, trigger);
                    };

                    if (trigger.duration < 1) {
                        this.off(event, trigger);
                    };

                    if (trigger.maxRound < this.round) {
                        this.off(event, trigger);
                    };
                });
            },
        };
        Object.keys(flags).forEach((e) => (matchStats as any)[e] = flags[e]);
        return matchStats;
    };

    static getBuffs(): Buffs {
        return {
            "hp": [], // [new buffInfo("*", 1.5, 3), new buffInfo("+", 30, 5, 10)]
            "atk": [],
            "def": [],
            "ep": [],
            "md": [],
            "mr": [],
            "cr": [],
            "cd": [],
            "td": [],
            "br": [],
            "agility": [],
            "dodge": [],
            "mana": [],
            "mg": [],
            "sm": [],
            "rev": [],
            "revhp": [],
        };
    };

    static applyBuffs(stats: any, eStats: any, obj: any, ebuff: any, matchstats: any, notice: any) {
        Object.keys(obj).forEach((stat) => {
            if (obj[stat].length) obj[stat].forEach((buff: buffInfo) => {
                if (stat === "hp" && buff.type === "+") addHeal(stats, eStats, stats, obj, ebuff, matchstats, notice, ``, Math.min(buff.range[1], Math.max(buff.range[0], buff.val)), {});
                switch (buff.type) {
                    case "*": stats[stat] = Math.floor(stats[stat] * Math.min(buff.range[1], Math.max(buff.range[0], buff.val))); break;
                    case "+": stats[stat] += Math.min(buff.range[1], Math.max(buff.range[0], buff.val)); break;
                    case "=": stats[stat] = Math.min(buff.range[1], Math.max(buff.range[0], buff.val)); break;
                    default: false; break;
                };
                switch (buff.ctype) {
                    case "*": buff.val = Math.floor(buff.val * buff.change); break;
                    case "+": buff.val += buff.change; break;
                    case "=": buff.val = buff.change; break;
                    default: false; break;
                };
                buff.last--;
            });
            if (obj[stat].length) obj[stat] = obj[stat].filter((buff: buffInfo) => buff.last);
        });
        stats.sm += stats.mg;
        if (stats.sm > stats.mana) stats.sm = stats.mana;
    };

    static consumeActiveMana(matchStats: any, myStatsC: any, buffs: any, myChar: any, notice: any, Embed: any, thumbnail: any) {
        if (matchStats.consumeMana > 0) {
            myStatsC.sm -= matchStats.consumeMana;
            if (matchStats.consumeMana > myStatsC.sm) {
                matchStats.heap1.forEach((e: any) => {
                    buffs[e.type].forEach((a: any, i: number) => {
                        if (a.id === e.id) buffs[e.type].splice(i, 1);
                    });
                    if (e.type === "mg") myStatsC[e.type] += e.buff;
                    else myStatsC[e.type] -= e.buff;
                });
                matchStats.consumeMana = 0;
                matchStats.heap1 = [];
                Embed.setThumbnail(thumbnail);
                return notice.push(`\n⚜️ **${myChar.name}** stopped ${myChar.gender === "F" ? "her" : "his"} transformation`);
            };
        };
    };

};
