import { ChatInputCommandInteraction } from "discord.js";
import { achievements } from "./achievements";
import { customEmojis, addHeal, deleteReplyIn, imageChange } from "./functions";
import Trigger from "./trigger";
import { Buffs, DetailedStats, MatchStats, TriggerEvents, TriggerOptions } from "../types";
import { customHpBars } from "./customHpBars";

export default class Avalon {
    constructor({ myStats, eStats }: { myStats: any, eStats: any; }) {
        // this._userBuffs = Avalon.getBuffs();
        // this._enemyBuffs = Avalon.getBuffs();

    };

    static checkIfEnded(myStatsC: DetailedStats, eStatsC: DetailedStats, mybuffs: Buffs, ebuffs: Buffs, matchStats: MatchStats, notice: string[], interaction: ChatInputCommandInteraction, minionDefeated: any, editEmbed: any, endMatch: any) {
        if (myStatsC.hp < 1) {
            if (matchStats.currentCharacter) {
                matchStats.trigger("minionDeath", myStatsC, eStatsC, mybuffs, ebuffs, {});
                return minionDefeated("my");
            };
            if (!eStatsC.blockRevival && myStatsC.revivedTotal < myStatsC.maxRevivals && myStatsC.rev > Math.random()) {
                myStatsC.revivedTotal++;
                myStatsC.hp = Math.floor(myStatsC.maxhp * myStatsC.revhp);
                notice.push(`\n🪽 ${myStatsC.name} survived! Restored **${myStatsC.hp}** HP`);
                matchStats.trigger("revival", myStatsC, eStatsC, mybuffs, ebuffs, {});
                matchStats.turn === 1;
                editEmbed();

                // Achievements
                achievements[24].check(interaction, interaction.user, myStatsC.revivedTotal), achievements[25].check(interaction, interaction.user, myStatsC.revivedTotal), achievements[26].check(interaction, interaction.user, myStatsC.revivedTotal); // The Show Must Go On
            } else {
                endMatch("l");
            };
        } else if (eStatsC.hp < 1) {
            if (matchStats.currentOpponent) {
                matchStats.trigger("minionDeath", eStatsC, myStatsC, ebuffs, mybuffs, {});
                return minionDefeated("e");
            };
            if (!myStatsC.blockRevival && eStatsC.revivedTotal < eStatsC.maxRevivals && eStatsC.rev > Math.random()) {
                eStatsC.revivedTotal++;
                eStatsC.hp = Math.floor(eStatsC.maxhp * eStatsC.revhp);
                notice.push(`\n<:revival:1341347208590790759> ${eStatsC.name} survived! Restored **${eStatsC.hp}** HP`);
                matchStats.trigger("revival", eStatsC, myStatsC, ebuffs, mybuffs, {});
                matchStats.turn === 1;
                editEmbed();
            } else {
                endMatch("w");
            };
        };
    };

    static hpbar(hp: number, mana: number, hpBarId: number | null = 0) {

        const hpBarTheme = customHpBars[hpBarId || 0];

        return hpBarTheme.getHpBar(hp, mana);

        // let bar = "";
        // if (hp > 0 && mana > 0) bar += "<:dblhm:944322994749210735>";
        // else if (hp > 0) bar += "<:dblh:944322994895990855>";
        // else if (mana > 0) bar += "<:dblm:944322994971476038>";
        // else return "<:dbl:944322994585612319><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:dbr:944322994778554400>";

        // hp > 0.1 ? hp -= 0.1 : hp = 0;
        // mana > 0.1 ? mana -= 0.1 : mana = 0;
        // let ret = 8;
        // while (ret--) {
        //     if (hp && mana) bar += "<:dbhm:944322994942144542>";
        //     else if (hp) bar += "<:dbh:944322995336409128>";
        //     else if (mana) bar += "<:dbm:944322995088916541>";
        //     else bar += "<:db:944322995067957288>";
        //     hp > 0.1 ? hp -= 0.1 : hp = 0;
        //     mana > 0.1 ? mana -= 0.1 : mana = 0;
        // };

        // if (hp && mana) bar += "<:dbrhm:944322997144158318>";
        // else if (hp) bar += "<:dbrh:944322995122503750>";
        // else if (mana) bar += "<:dbrm:944322995135086602>";
        // else bar += "<:dbr:944322994778554400>";
        // return bar;
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
            user: interaction.user.id,
            roundCheck: 1,
            ended: false,
            interaction: interaction,
            actionSequence: flags.actionSequence ?? [],
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
            currentCharacter: 0, // 1 = minion
            currentOpponent: 0,
            myStatsCC: {},
            eStatsCC: {},
            tdChance: 0,
            shieldBreak: 0,
            damageFormula: "default" as "default" | `log_scale_${number}`,

            sendWarning: function ({ content, ephemeral = true }: { content: string, ephemeral?: boolean; }) {
                // Suppress warning if action sequence is active
                if (this.actionSequence.length > 0) return;
                if (matchStats.interaction.commandName === "arena") return (interaction.channel?.isSendable()) ? interaction.channel.send(content).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err)) : false;

                this.interaction.followUp({ content, ephemeral });
            },

            listeners: {} as Record<TriggerEvents, Trigger[]>,
            on: function (event: TriggerEvents, options: TriggerOptions | ((...args: any[]) => any)): () => void {
                if (this.listeners[event] === undefined) this.listeners[event] = [];

                let triggerId: number;

                if (typeof options === "object") {
                    const trigger = new Trigger({ ...options, event });
                    triggerId = trigger.id;

                    this.listeners[event]?.push(trigger);
                } else {
                    const trigger = new Trigger({ event, callback: options });
                    triggerId = trigger.id;

                    this.listeners[event]?.push(trigger);
                };

                return (() => this.off(event, triggerId));
            },
            off: function (event: TriggerEvents, trigger: Trigger | number) {
                if (this.listeners[event] !== undefined) {
                    this.listeners[event] = this.listeners[event]?.filter(listener => listener !== trigger && listener.id !== trigger);
                };
            },
            trigger: function (event: TriggerEvents, caster: any, target: any, casterBuff: any, targetBuff: any, options: any = {}) {
                this.listeners[event]?.forEach(trigger => {
                    if (trigger.target !== undefined && target !== trigger.target) return;

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

    static applyBuffs(stats: DetailedStats, eStats: DetailedStats, obj: Buffs, ebuff: Buffs, matchstats: MatchStats, notice: string[]) {
        (Object.keys(obj) as (keyof Buffs)[]).forEach((stat) => {
            if (obj[stat].length) obj[stat].forEach((buff) => {
                if (stat === "hp" && buff.type === "+") {
                    const heal = buff.isDebuff
                        ? Math.min(buff.range[1], Math.max(buff.range[0], (buff.val * Math.pow(0.99895, Math.max(stats.def, stats.mr)))))
                        : Math.min(buff.range[1], Math.max(buff.range[0], buff.val));
                    addHeal(stats, eStats, stats, obj, ebuff, matchstats, notice, ``, heal, {});
                } else {
                    switch (buff.type) {
                        case "*": stats[stat] = Math.floor(stats[stat] * Math.min(buff.range[1], Math.max(buff.range[0], buff.val))); break;
                        case "+": stats[stat] += Math.min(buff.range[1], Math.max(buff.range[0], buff.val)); break;
                        case "=": stats[stat] = Math.min(buff.range[1], Math.max(buff.range[0], buff.val)); break;
                        default: false; break;
                    };
                };
                switch (buff.ctype) {
                    case "*": buff.val = Math.floor(buff.val * buff.change); break;
                    case "+": buff.val += buff.change; break;
                    case "=": buff.val = buff.change; break;
                    default: false; break;
                };
                buff.last--;
            });
            if (obj[stat].length) obj[stat] = obj[stat].filter((buff) => buff.last);
        });
        stats.sm += stats.mg;
        if (stats.sm > stats.mana) stats.sm = stats.mana;
    };

    static consumeActiveMana(matchStats: any, myStatsC: any, buffs: any, myChar: any, notice: any, Embed: any, thumbnail: any) {
        if (myStatsC.consumeMana > 0) {
            myStatsC.sm -= myStatsC.consumeMana;
            if (myStatsC.consumeMana > myStatsC.sm) {
                myStatsC.heap1.forEach((e: any) => {
                    buffs[e.type].forEach((a: any, i: number) => {
                        if (a.id === e.id) buffs[e.type].splice(i, 1);
                    });
                    if (e.type === "mg") myStatsC[e.type] += e.buff;
                    else myStatsC[e.type] -= e.buff;
                });
                myStatsC.consumeMana = 0;
                myStatsC.heap1 = [];
                imageChange(Embed, matchStats, myStatsC, thumbnail);
                return notice.push(`\n⚜️ **${myChar.name}** stopped ${myChar.gender === "F" ? "her" : "his"} transformation`);
            };
        };
    };

};
