import { ClassStats } from "../types";

interface SkillDescription {
    active: string;
    passive: string;
}

const skillDescs: SkillDescription[] = [
    { "active": `Deals **125%** physical damage. (Timeout true)`, "passive": `None` },
    { "active": `Reduces enemy ATK by **15%** for 3 rounds. (Timeout false)`, "passive": `None` },
    { "active": `Increases Crit Rate by **10%** for 2 rounds. (Timeout false)`, "passive": `None` },
    { "active": `Deals true damage (ignores enemy shield) and ignores **30%** of enemy DEF for the attack (Timeout Yes)`, "passive": `None` },
    { "active": `Increases dodge chance by **+20%** for 2 rounds. (Timeout false)`, "passive": `None` },
    { "active": `Increases ATK by **15%** but decreases DEF by **10%** for 2 rounds. (Timeout false)`, "passive": `None` },
    { "active": `Deals a guaranteed critical hit. (Timeout true)`, "passive": `None` },
    { "active": `Deals **80%** physical damage and heals self for **30%** of the damage. (Timeout true)`, "passive": `None` },
    { "active": `Deals **115%** magic damage. (Timeout true)`, "passive": `All normal attacks deal magic damage.` },
    { "active": `Heals self for **20%** of max HP. (Timeout true)`, "passive": `Normal attacks deal magic damage.` },
    { "active": `Summons an undead to fight for the user. The undead will have **40%** of the summoners stats. During this mode the undead's mana generation will halt until the it is defeated. Once the undead dies, the summoner will continue the fight. (Timeout true)`, "passive": `None` },
    { "active": `Counters the next enemy attack. (CD: 3, Timeout true)`, "passive": `None` },
    { "active": `Gains **15%** ATK for 3 rounds. You will get **20** coins for every usage of this skill (only if you win the fight). (Timeout true)`, "passive": `None` },
    { "active": `Gains **280** DEF and Magic Resist for 2 rounds. (Timeout true)`, "passive": `Heals self for **3%** of his max HP after each round.` },
    { "active": `Decreases (almost) all enemy stats by **10%** for 3 rounds. (Timeout false)`, "passive": `Enemy loses **2%** of his HP after each round.` },
    { "active": `Deals **120%** physical damage and poisons the enemy for 2 rounds, which will deal **4%** of enemy HP as damage. (Timeout true)`, "passive": `Heals **2%** of max HP every round.` },
    { "active": `Decreases (almost) all enemy stats by **20%** for 3 rounds. (Timeout false)`, "passive": `Enemy loses **3%** of his HP after each round. Decreases enemy dodge chance by **20%**.` },
    { "active": `Deals **150%** physical damage and poisons the enemy for 3 rounds, which will deal **5%** of enemy HP as damage. (Timeout true)`, "passive": `Heals **4%** of max HP every round.` },
    { "active": `Deals a guaranteed hit with **12.5%** increased crit rate. (Timeout true)`, "passive": `Increases crit damage by **2%** every round (up to **20%**).` },
    { "active": `Deals a guaranteed hit with **20%** increased crit rate. (Timeout true)`, "passive": `Increases crit damage by **3%** every round (up to **30%**).` },
    { "active": `Deals a guaranteed critical hit. (Timeout true)`, "passive": `None` },
    { "active": `Deals a guaranteed critical hit with **20%** increased crit damage. (Timeout true)`, "passive": `Your crit rate increases by **+2%** after each round.` },
    { "active": `Deals physical damage ignoring **25%** of enemy DEF. (Timeout true)`, "passive": `Has a **20%** chance of dealing magic damage.` },
    { "active": `Enters \`Dormant Sage\` for **10** rounds, taking **50%** less incoming damage. When attacked, the Soulfist retaliates, dealing **120%** damage (Up to twice every round). This is considered a successful counter *twice*. After leaving the \`Dormant Sage\`, loses all counter chance, but decreases the enemy's DEF & MR by **20%** (max **2.5x** damage) (1 use, Timeout true)`, "passive": `Has an **20%** chance to counter attacks. For the first **5** successful counters, permanently increases ATK and MD by **5%** each. Afterwards successful counters restore **5%** missing HP (Up to once every round). The healing-scaling is increased by **5%** for every round the effect didn't trigger. Up to **25%** can be stored at once.` },
    { "active": `Increases ATK and Magic Damage by **30** permanently. (Timeout false)`, "passive": `Has a **33%** chance of firing a second shot.` },
    { "active": `Summons a beast to fight in your place. The beast will have **75%** of your stats (except for ATK -> only 60%). During this mode your mana generation will halt until the beast is defeated. Once the beast dies, you will continue fighting with your character. (Timeout true)`, "passive": `None` },
    { "active": `Heals self for **20%** of max HP. (Timeout false)`, "passive": `Heals **3%** of current HP after each round.` },
    { "active": `Starts off with a **40%** heal of max HP, which decreases by **4%** after every usage. Mana gain decreases by **2** after every use as well. (Timeout false)`, "passive": `Heals **5%** of current HP after each round. Has a **100%** chance of revival after first death, regenerating **50%** of the user's initial HP.` },

    { // Traditionalist
        "active": `Deals true damage (ignores shield) and reduces enemy DEF by **30%** for the attack (Timeout true)`,
        "passive": `His ATK increases by **3%** after each round (up to **30%**).`
    },
    { // Asura
        "active": `Heals and increases max HP by **10%**. (Uses: 12, Timeout true)`,
        "passive": `Normal attacks reduce max HP by **5%**, but increase ATK by **8%** permanently. Asuras can't block or dodge, nor can they use character abilities.`
    },

    { "active": `Steals the equivalent of **10%** of his stats from the enemy for **3** rounds. (Timeout true)`, "passive": `Has a **33%** chance of healing for **10%** of damage dealt.` },
    { // Rogue
        "active": `Steals the equivalent of **20%** of his stats from the enemy for **4** rounds. (Uses: 6, CD: 5, Timeout true)`,
        "passive": `Has a **66%** chance of healing for **10%** of damage dealt.`
    },

    { "active": `Deals physical damage which increases by **10%** after each round (up to **200%**). (Timeout true)`, "passive": `Loses **3%** of current HP after each round.` },
    { "active": `Deals physical damage which increases by **20%** after each round (up to **240%**). (Timeout true)`, "passive": `Loses **2%** of current HP after each round.` },
    { "active": `Deals **150%** physical damage and causes bleeding for 2 rounds. (Timeout true)`, "passive": `Critical strikes cause bleeding, dealing **5%** damage to the enemy for 2 rounds.` },
    { "active": `Deals **120%** true damage (ignores shield) and causes bleeding for 3 rounds. (Timeout true)`, "passive": `Critical strikes cause bleeding, dealing **5%** damage to the enemy for 3 rounds.` },
    { "active": `Deals **120%** magic damage in dungeon, **110%** in arena. (Timeout true)`, "passive": `Heals for **5%** of current HP after every round.` },
    { "active": `Deals **130%** magic damage in dungeon, **115%** in arena. (Timeout true)`, "passive": `Has **10%** increased ATK in the dungeon. Heals for **5%** of current HP every round, and increases their own magic damage by **3%** (max **30%**).` },
    { "active": `Blocks the enemy from dodging, blocking and critting for 2 rounds. (Timeout false)`, "passive": `Decreases enemy ATK by **3%** after each round. Has a **20%** chance of dealing magic damage.` },
    { // Demonic
        "active": `Enters Archdemon form, in which HP equal to **4%** of max HP is sacrificed for **10** rounds, to gain **20%** increased ATK, MD, CR and CD. These buffs increase by an additional **2%** per round, up to a total of **40%**. (Uses: 1 [Only starting from the 6th round], Timeout true)`,
        "passive": `Reflects **30%** of all damage taken back to the attacker as true damage. For every **3%** HP lost, gains **1%** ATK. Once per battle, after the demonic's HP falls below **30%**, attacks once dealing **120%** damage, and recovers **20%** of max HP.\n\n_true damage: ignores shield_`
    },

    { "active": `Counters the next 2 attacks. (CD: 4, Timeout true)`, "passive": `The user builds up a combo attack increasing their damage by **8%** after every attack (up to **40%**). This resets when the user misses the target or uses another action.` },
    { "active": `Increases own ATK by **1%** for every 50 characters in the players inventory for 3 rounds (max 75%). (Timeout true)`, "passive": `Gets 25% more coins in the dungeon.` },
    { "active": `Gains **200** DEF and Magic Resist for 3 rounds. (Timeout true)`, "passive": `Heals **5%** of max HP after each round.` },
    { "active": `Deals **100%** damage, which ignores **60%** of enemy DEF and MR. (Timeout true)`, "passive": `None` },
    { "active": `Increases own DEF and Magic Resist depending on mana consumtion for 6 rounds. Starting with **100** DEF and **25** Magic Resist, the user gains **+8** DEF and **+2** Magic Resist for every mana consumed above 20. (Timeout false)`, "passive": `Gains **+25%** increased class xp from the dungeon.` },
    { "active": `Summons a spirit to fight for you. The spirit will have **30%** of your stats, but has a **20%** chance of summoning a stronger spirit which has **50%** of your stats. During this mode your mana generation will halt until the spirit is defeated. Once the spirit dies, you will continue fighting with your character. (Timeout false)`, "passive": `Has a **20%** chance of dealing magic damage.` },
    { "active": `Creates a shield equal to **20%** of max HP. (Timeout false)`, "passive": `When shield breaks down from taking damage, freezes the enemy and increases own ATK and MD by **50%** for **1** round. All attacks deal magic damage by default.` },
    { "active": `Deals **125%** magic damage and causes burning, dealing **6%** damage over 2 rounds. (Timeout true)`, "passive": `All attacks deal magic damage.` },
    { // Wizard
        "active": `Deals **150%** magic damage and causes burning, dealing an additional **50%** damage over 3 rounds. (CD: 3, Timeout true)`,
        "passive": `Wizards have **20%** increased MD. All attacks deal magic damage.`
    },

    { "active": "**Uses**: `Unlimited`\n**Cost**: `10 💧 + unlimited`\n**Timeout**: `Yes`\nDeals **110%** physical damage which increases by **+1%** for every mana consumed above 10.", "passive": `None` },
    { // Grappler
        "active": `Removes the enemy's prepared counters before entering __Free-Flow__ for **7** rounds. During this period, the enemy has **0%** dodge rate, and receives **5%** more damage for every round the domain lasts, up to **35%** by the last round. This stacks on top of other vulnerability effects, but is reset after leaving the domain. (CD: 7, Timeout false)`,
        "passive": "Evades the first two lethal hits. When not in __Free-Flow__, restores **3%** missing HP every round."
    },
    { "active": `Increases own ATK by **10%** permanently. (Uses: 3, Timeout false)`, "passive": `The user builds up a combo attack increasing their damage by **10%** after every attack. This resets when the user misses their target or uses another action.` },
    { "active": `Increases dodge chance and crit rate by **10%** for 3 rounds. (Timeout false)`, "passive": `Gains a **4%** ATK boost after every dodge lasting 5 rounds.` },
];

export default class classInfo {
    private _name: string;
    private _tier: number;
    private _emblem: string;
    private _image: string;
    private _stats: ClassStats;
    private _id: number;
    private _path: number[][];

    constructor(name: string, tier: number, emblem: string, image: string, stats: ClassStats, id: number, path: number[][] = []) {
        this._name = name;
        this._tier = tier;
        this._emblem = emblem;
        this._image = image;
        this._stats = stats;
        this._id = id;
        this._path = path;
    };

    get name(): string {
        return this._name;
    };
    get tier(): number {
        return this._tier;
    };
    get emblem(): string {
        return this._emblem;
    };
    get image(): string {
        return this._image;
    };
    get stats(): ClassStats {
        return this._stats;
    };
    get id(): number {
        return this._id;
    };
    get path(): number[][] {
        return this._path;
    };
    get active(): string {
        return skillDescs[this._id].active;
    };
    get passive(): string {
        return skillDescs[this._id].passive;
    };

    get upgrades(): classInfo[] {
        const res: classInfo[] = [];
        this._path.forEach((e) => {
            let upgrade = e[e.indexOf(this._id) + 1];
            if (classes[upgrade]) res.push(classes[upgrade]);
        });
        return res;
    };
};

export const classes: classInfo[] = [
    new classInfo("Warrior", 1, "<:Warrior:950377993023393832>", "https://i.ibb.co/cxRDyGz/Warrior.png", { "hp": [1.15, 0], "atk": [1.2, 10], "def": [1, 10], "md": [0.4, 0], "mr": [0.6, 0], "cr": [1, 0], "cd": [1.2, 0], "br": [1.15, 0], "agility": [0.9, 0], "dodge": [0.8, 0], "td": [1, 0], "mana": [1, 0], "mg": [0.9, 0] }, 0, [[0, 11, 40], [0, 12, 41]]),
    new classInfo("Knight", 1, "<:Knight:950377992469749760>", "https://i.ibb.co/dMHzr5f/Knight.png", { "hp": [1.2, 0], "atk": [0.95, 0], "def": [1, 20], "md": [0.5, 0], "mr": [0.6, 0], "cr": [0.8, 0], "cd": [1, 0], "br": [1.3, 0], "agility": [0.9, 0], "dodge": [0.8, 0], "td": [1, 0], "mana": [1, 0], "mg": [0.85, 0] }, 1, [[1, 13, 42], [1, 14, 16]]),
    new classInfo("Archer", 1, "<:Archer:950377991232446495>", "https://i.ibb.co/rwvPx1N/Archer.png", { "hp": [0.8, 0], "atk": [1.3, 0], "def": [0.9, 0], "md": [1, 0], "mr": [1.2, 0], "cr": [1.25, 0], "cd": [1.15, 0], "br": [0.95, 0], "agility": [1.3, 0], "dodge": [1.25, 0], "td": [1, 0], "mana": [1, 0], "mg": [0.9, 0] }, 2, [[2, 15, 17], [2, 18, 19]]),
    new classInfo("Gunner", 1, "<:Gunner:950377992390070282>", "https://i.ibb.co/b1gRDhM/Gunner.png", { "hp": [0.9, 0], "atk": [1.25, 0], "def": [0.85, 0], "md": [0.75, 0], "mr": [0.8, 0], "cr": [1, 0], "cd": [1.3, 0], "br": [0.95, 0], "agility": [1.15, 0], "dodge": [1.15, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, -3] }, 3, [[3, 20, 21], [3, 43, 44]]),
    new classInfo("Martial Artist", 1, "<:Martial_Artist:950377992574607401>", "https://i.ibb.co/KDfkNf7/Martial-Artist.png", { "hp": [0.9, 0], "atk": [1.2, 0], "def": [1, 0], "md": [0.75, 0], "mr": [0.8, 0], "cr": [1.1, 0], "cd": [1.1, 0], "br": [1.1, 0], "agility": [1.3, 0], "dodge": [1.3, 0], "td": [1, 0], "mana": [1, 15], "mg": [1.25, 0] }, 4, [[4, 22, 23], [4, 28, 29]]),
    new classInfo("Fighter", 1, "<:Fighter:950377992415240192>", "https://i.ibb.co/d6TpZ1c/Fighter.png", { "hp": [0.85, 0], "atk": [1.25, 0], "def": [1, 0], "md": [0.75, 0], "mr": [0.8, 0], "cr": [1, 0], "cd": [1.2, 0], "br": [1.1, 0], "agility": [1.35, 0], "dodge": [1.3, 0], "td": [1, 0], "mana": [1, -5], "mg": [1, -3] }, 5, [[5, 49, 50], [5, 51, 52]]),
    new classInfo("Assassin", 1, "<:Assassin:950377992058720276>", "https://i.ibb.co/XFjg2G5/Assassin.png", { "hp": [0.8, 0], "atk": [1.05, 0], "def": [1, -10], "md": [0.9, 0], "mr": [0.9, 0], "cr": [1.5, 0], "cd": [1, 0], "br": [0.8, 0], "agility": [1.3, 0], "dodge": [1.3, 0], "td": [1, 0], "mana": [1, 10], "mg": [1, 3] }, 6, [[6, 34, 35], [6, 38, 39]]),
    new classInfo("Thief", 1, "<:Thief:950377992406827019>", "https://i.ibb.co/tXFkY96/Thief.png", { "hp": [0.95, 0], "atk": [1.1, 0], "def": [0.8, 0], "md": [1, -10], "mr": [1, -10], "cr": [1, 0.05], "cd": [1.1, 0], "br": [1, 0], "agility": [1.2, 0], "dodge": [1.2, 0], "td": [1, 0], "mana": [1, 5], "mg": [1, 0] }, 7, [[7, 30, 31], [7, 32, 33]]),
    new classInfo("Mage", 1, "<:Mage:950377992469766185>", "https://i.ibb.co/FY5rf7H/Mage.png", { "hp": [0.8, 0], "atk": [1.2, 0], "def": [0.8, 0], "md": [1.4, 0], "mr": [1.1, 0], "cr": [1, 0], "cd": [0.9, 0], "br": [1, 0], "agility": [1.1, 0], "dodge": [1.1, 0], "td": [1, 0], "mana": [1, 10], "mg": [1, 3] }, 8, [[8, 47, 48], [8, 45, 46]]),
    new classInfo("Priest", 1, "<:Priest:950377992767537232>", "https://i.ibb.co/gR4DXmf/Priest.png", { "hp": [1, 0], "atk": [1.05, 0], "def": [0.85, 0], "md": [1.2, 0], "mr": [1.25, 0], "cr": [1, 0], "cd": [1, 0], "br": [1.15, 0], "agility": [1, 0], "dodge": [1, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 5] }, 9, [[9, 26, 27], [9, 36, 37]]),
    new classInfo("Necromancer", 4, "<:Necromancer:958697899754151986>", "https://i.ibb.co/syHhdFp/Necromancer.png", { "hp": [1.25, 0], "atk": [1.3, 0], "def": [1, 0], "md": [1.6, 0], "mr": [1.3, 0], "cr": [1, 0], "cd": [1.2, 0], "br": [1, 0], "agility": [1, 0], "dodge": [1.1, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 0] }, 10),
    new classInfo("Duelist", 2, "<:Duelist:958806771525382154>", "https://i.ibb.co/Kqx7jN3/Duelist.png", { "hp": [1.1, 0], "atk": [1.4, 0], "def": [1, 0], "md": [0.6, 0], "mr": [0.6, 0], "cr": [1.1, 0], "cd": [1.2, 0], "br": [1.2, 0], "agility": [1.2, 0], "dodge": [1.2, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, -2] }, 11, [[0, 11, 40]]),
    new classInfo("Mercenary", 2, "<:Mercenary:958825697307148318>", "https://i.ibb.co/pXXtbkJ/Mercenary.png", { "hp": [1.2, 0], "atk": [1.4, 0], "def": [1, 0], "md": [0.7, 0], "mr": [0.7, 0], "cr": [1, 0], "cd": [1, 0], "br": [1, 0.03], "agility": [1, 0], "dodge": [1, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 0] }, 12, [[0, 12, 41]]),
    new classInfo("Holy Knight", 2, "<:Holy_Knight:958836245839085628>", "https://i.ibb.co/DMktcQ8/Holy-Knight.png", { "hp": [1.3, 0], "atk": [1.1, 0], "def": [1.2, 0], "md": [0.7, 0], "mr": [1.3, 0], "cr": [0.75, 0], "cd": [0.9, 0], "br": [1.4, 0], "agility": [1, 0], "dodge": [0.8, 0], "td": [1, 0], "mana": [1, -10], "mg": [1, -2] }, 13, [[1, 13, 42]]),
    new classInfo("Dark Knight", 2, "<:Dark_Knight:958836252822618163>", "https://i.ibb.co/km1rzGP/Dark-Knight.png", { "hp": [1.25, 0], "atk": [1.2, 0], "def": [1.1, 0], "md": [0.6, 0], "mr": [0.8, 0], "cr": [0.85, 0], "cd": [1, 0], "br": [1.3, 0], "agility": [1, 0], "dodge": [0.8, 0], "td": [1, 0], "mana": [1, -10], "mg": [1, 0] }, 14, [[1, 14, 16]]),
    new classInfo("Hunter", 2, "<:Hunter:958847728690020402>", "https://i.ibb.co/6t6Lq71/Hunter.png", { "hp": [0.85, 0], "atk": [1.3, 0], "def": [0.8, 0], "md": [1, 0], "mr": [0.8, 0], "cr": [1.2, 0], "cd": [1.2, 0], "br": [0.8, 0], "agility": [1.4, 0], "dodge": [1.35, 0], "td": [1, 0], "mana": [1, 10], "mg": [1, 0] }, 15, [[2, 15, 17]]),
    new classInfo("Death Knight", 3, "<:Death_Knight:963855201910014062>", "https://i.ibb.co/6s282YP/Death-Knight.png", { "hp": [1.4, 0], "atk": [1.25, 0], "def": [1.15, 0], "md": [0.8, 0], "mr": [0.9, 0], "cr": [0.85, 0], "cd": [1.2, 0], "br": [1.4, 0], "agility": [0.9, 0], "dodge": [0.7, 0], "td": [1, 0], "mana": [1, -15], "mg": [1, 5] }, 16, [[1, 14, 16]]),
    new classInfo("Arbalist", 3, "<:Arbalist:963855229084913684>", "https://i.ibb.co/Bg16Vtv/Arbalist.png", { "hp": [0.9, 0], "atk": [1.4, 0], "def": [0.8, 0], "md": [1, 0], "mr": [0.8, 0], "cr": [1.3, 0], "cd": [1.3, 0], "br": [1, 0], "agility": [1.2, 0], "dodge": [1.2, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 0] }, 17, [[2, 15, 17]]),
    new classInfo("Marksman", 2, "<:Marksman:959907706909630464>", "https://i.ibb.co/dMFzRcn/Marksman.png", { "hp": [0.8, 0], "atk": [1.3, 0], "def": [0.75, 0], "md": [1, 0], "mr": [0.75, 0], "cr": [1.3, 0], "cd": [1.3, 0], "br": [0.8, 0], "agility": [1, 0], "dodge": [1, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 0] }, 18, [[2, 18, 19]]),
    new classInfo("Ranger", 3, "<:Ranger:963855448992280616>", "https://i.ibb.co/G77GKGP/Ranger.png", { "hp": [0.85, 0], "atk": [1.35, 0], "def": [0.8, 0], "md": [1, 0], "mr": [0.8, 0], "cr": [1.3, 0], "cd": [1.3, 0], "br": [0.8, 0], "agility": [1, 0], "dodge": [1, 0], "td": [1, 0], "mana": [1, -10], "mg": [1, 0] }, 19, [[2, 18, 19]]),
    new classInfo("Shooter", 2, "<:Shooter:959914001230331956>", "https://i.ibb.co/dQ6Rxbf/Shooter.png", { "hp": [1, 0], "atk": [1.2, 0], "def": [0.8, 0], "md": [0.75, 0], "mr": [0.75, 0], "cr": [1.2, 0], "cd": [1.3, 0], "br": [0.7, 0], "agility": [1, 0], "dodge": [1.1, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 0] }, 20, [[3, 20, 21]]),
    new classInfo("Sniper", 3, "<:Sniper:963855437604720690>", "https://i.ibb.co/bN3VkC6/Sniper.png", { "hp": [1.1, 0], "atk": [1.3, 0], "def": [1, 0], "md": [0.8, 0], "mr": [0.85, 0], "cr": [1.3, 0], "cd": [1.4, 0], "br": [0.8, 0], "agility": [1, 0], "dodge": [1.1, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 0] }, 21, [[3, 20, 21]]),
    new classInfo("Ki Master", 2, "<:Ki_Master:960292671186956308>", "https://i.ibb.co/TgMPn2z/Ki-Master.png", { "hp": [0.85, 0], "atk": [1.1, 0], "def": [0.8, 0], "md": [1.2, 0], "mr": [0.8, 0], "cr": [0.8, 0], "cd": [0.9, 0], "br": [0.7, 0], "agility": [1, 0], "dodge": [1.2, 0], "td": [1, 0], "mana": [1, 5], "mg": [1, 0] }, 22, [[4, 22, 23]]),
    new classInfo("Soulfist", 3, "<:Soulfist:963855465601716285>", "https://i.ibb.co/YdsrCQh/Soulfist.png", { "hp": [0.9, 0], "atk": [1.2, 0], "def": [0.9, 0], "md": [1.25, 0], "mr": [0.9, 0], "cr": [0.8, 0], "cd": [1, 0], "br": [0.8, 0], "agility": [1, 0], "dodge": [1.2, 0], "td": [1, 0], "mana": [1, 10], "mg": [1, 1] }, 23, [[4, 22, 23]]),
    new classInfo("Twinshot", 4, "<:Twinshot:963857741653372938>", "https://i.ibb.co/bHqVmVY/Twinshot.png", { "hp": [1.1, 0], "atk": [1.35, 0], "def": [1, 0], "md": [1.2, 0], "mr": [1, 0], "cr": [1.2, 0], "cd": [1.4, 0], "br": [1.05, 0], "agility": [1, 0], "dodge": [1.2, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, -3] }, 24),
    new classInfo("Beast Lord", 4, "<:Beast_Lord:964099796816244776>", "https://i.ibb.co/JdqCxVx/Beast-Lord.png", { "hp": [1.4, 0], "atk": [1.15, 0], "def": [1, 0], "md": [1.2, 0], "mr": [1.2, 0], "cr": [0.8, 0], "cd": [1, 0], "br": [1.2, 0], "agility": [1, 0], "dodge": [1.1, 0], "td": [1, 0], "mana": [1, 30], "mg": [1, 0] }, 25),
    new classInfo("Bishop", 2, "<:Bishop:964264107345850398>", "https://i.ibb.co/3k7yvnY/Bishop.png", { "hp": [1.2, 0], "atk": [0.9, 0], "def": [0.8, 0], "md": [1.2, 0], "mr": [1.2, 0], "cr": [0.9, 0], "cd": [1.05, 0], "br": [0.95, 0], "agility": [1, 0], "dodge": [1, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 0] }, 26, [[9, 26, 27]]),
    new classInfo("Saint", 3, "<:Saint:964298765089533952>", "https://i.ibb.co/Rv0jPhg/Saint.png", { "hp": [1.3, 0], "atk": [0.95, 0], "def": [0.85, 0], "md": [1.25, 0], "mr": [1.25, 0], "cr": [1, 0], "cd": [1.1, 0], "br": [1.1, 0], "agility": [1, 0], "dodge": [1, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 5] }, 27, [[9, 26, 27]]),
    new classInfo("Traditionalist", 2, "<:Traditionalist:964490892801105980>", "https://i.ibb.co/Qm9ynzX/Traditionalist.png", { "hp": [0.9, 0], "atk": [1.25, 0], "def": [0.75, 0], "md": [0.8, 0], "mr": [0.75, 0], "cr": [1.1, 0], "cd": [1.1, 0], "br": [1.1, 0], "agility": [1.4, 0], "dodge": [1.4, 0], "td": [1, 0], "mana": [1, 10], "mg": [1, 2] }, 28, [[4, 28, 29]]),
    new classInfo("Asura", 3, "<:Asura:964495121037008907>", "https://i.ibb.co/GMfhf81/Asura.png", { "hp": [1, 0], "atk": [1.4, 0], "def": [0.7, 0], "md": [1, 0], "mr": [0.7, 0], "cr": [1.1, 0], "cd": [1.1, 0], "br": [1.1, 0], "agility": [1.55, 0], "dodge": [1.5, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 2] }, 29, [[4, 28, 29]]),
    new classInfo("Outlaw", 2, "<:Outlaw:964807710937866280>", "https://i.ibb.co/VD8kvhf/Outlaw.png", { "hp": [0.8, 0], "atk": [0.95, 0], "def": [0.8, 0], "md": [0.9, 0], "mr": [0.8, 0], "cr": [1.15, 0], "cd": [1, 0], "br": [1, 0], "agility": [1.8, 0], "dodge": [1.35, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 0] }, 30, [[7, 30, 31]]),
    new classInfo("Rogue", 3, "<:Rogue:964837711468969984>", "https://i.ibb.co/2jFPMb6/Rogue.png", { "hp": [0.85, 0], "atk": [1.1, 0], "def": [0.8, 0], "md": [0.95, 0], "mr": [0.8, 0], "cr": [1.2, 0], "cd": [1, 0], "br": [1, 0], "agility": [2, 0], "dodge": [1.5, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 0] }, 31, [[7, 30, 31]]),
    new classInfo("Barbarian", 2, "<:Barbarian:964840930949623808>", "https://i.ibb.co/Bc8Fk4Q/Barbarian.png", { "hp": [1.1, 0], "atk": [1.3, 0], "def": [0.7, 0], "md": [0.6, 0], "mr": [0.65, -10], "cr": [0.5, 0], "cd": [1.1, 0], "br": [0.6, 0], "agility": [1.5, 0], "dodge": [0.8, 0], "td": [1, 0], "mana": [1, 15], "mg": [1, 2] }, 32, [[7, 32, 33]]),
    new classInfo("Berserker", 3, "<:Berserker:964840986029228062>", "https://i.ibb.co/9gG9Vy8/Berserker.png", { "hp": [1.2, 0], "atk": [1.4, 0], "def": [0.7, 0], "md": [0.7, 0], "mr": [0.65, -10], "cr": [0.5, 0], "cd": [1.2, 0], "br": [0.65, 0], "agility": [1.5, 0], "dodge": [1.1, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 3] }, 33, [[7, 32, 33]]),
    new classInfo("Deathblade", 2, "<:Deathblade:964905705876389928>", "https://i.ibb.co/0YNncxx/Deathblade.png", { "hp": [0.7, 0], "atk": [1.3, 0], "def": [0.75, 0], "md": [1, 0], "mr": [0.7, 0], "cr": [1.4, 0], "cd": [1.1, 0], "br": [0.85, 0], "agility": [1.4, 0], "dodge": [1.4, 0], "td": [1, 0], "mana": [1, 15], "mg": [1, 0] }, 34, [[6, 34, 35]]),
    new classInfo("Reaper", 3, "<:Reaper:964905793826729984>", "https://i.ibb.co/jg8jHtB/Reaper.png", { "hp": [0.75, 0], "atk": [1.35, 0], "def": [0.85, 0], "md": [1, 0], "mr": [0.75, 0], "cr": [1.5, 0], "cd": [1.25, 0], "br": [0.9, 0], "agility": [1.5, 0], "dodge": [1.3, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 0] }, 35, [[6, 34, 35]]),
    new classInfo("Cleric", 2, "<:Cleric:964939425744306186>", "https://i.ibb.co/0ytkZc2/Cleric.png", { "hp": [1, 0], "atk": [1.1, 0], "def": [0.9, 0], "md": [1.35, 0], "mr": [1.3, 0], "cr": [1, 0], "cd": [1, 0], "br": [1.1, 0], "agility": [1, 0], "dodge": [1, 0], "td": [1, 0], "mana": [1, 25], "mg": [1, 2] }, 36, [[9, 36, 37]]),
    new classInfo("Sage", 3, "<:Sage:964939472863101050>", "https://i.ibb.co/dmKbxjJ/Sage.png", { "hp": [1.1, 0], "atk": [0.9, 0], "def": [1, 0], "md": [1.4, 0], "mr": [1.5, 0], "cr": [1, 0], "cd": [1.15, 0], "br": [1, 0], "agility": [1, 0], "dodge": [0.85, 0], "td": [1, 0], "mana": [1, 30], "mg": [1, 3] }, 37, [[9, 36, 37]]),
    new classInfo("Shadowhunter", 2, "<:Shadowhunter:964994498335739904>", "https://i.ibb.co/896qvvN/Shadowhunter.png", { "hp": [1.15, 0], "atk": [1, 0], "def": [1.1, 0], "md": [1, 0], "mr": [1.1, 0], "cr": [1.15, 0], "cd": [1, 0], "br": [0.8, 0], "agility": [1.2, 0], "dodge": [1.2, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 0] }, 38, [[6, 38, 39]]),
    new classInfo("Demonic", 3, "<:Demonic:964994531844030534>", "https://i.ibb.co/37WsQSs/Demonic.png", { "hp": [1.1, 0], "atk": [1.15, 0], "def": [1, 0], "md": [1.05, 0], "mr": [1.1, 0], "cr": [1.5, 0], "cd": [1, 0], "br": [0.8, 0], "agility": [1.25, 0], "dodge": [1.25, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 0] }, 39, [[6, 38, 39]]),
    new classInfo("Slayer", 3, "<:Slayer:965179197691670528>", "https://i.ibb.co/3YnNZ8y/Slayer.png", { "hp": [1.2, 0], "atk": [1.25, 0], "def": [1.1, 0], "md": [1, 0], "mr": [0.9, 0], "cr": [1, 0], "cd": [1, 0], "br": [1.15, 0], "agility": [1.25, 0], "dodge": [1.25, 0], "td": [1, 0], "mana": [1, 15], "mg": [1, 0] }, 40, [[0, 11, 40]]),
    new classInfo("Warlord", 3, "<:Warlord:965280076935626833>", "https://i.ibb.co/mq6MGyw/Warlord.png", { "hp": [1.3, 0], "atk": [1.3, 0], "def": [1, 0], "md": [0.8, 0], "mr": [0.8, 0], "cr": [1, 0], "cd": [1, 0], "br": [1.2, 0], "agility": [1, 0], "dodge": [1, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 0] }, 41, [[0, 12, 41]]),
    new classInfo("Paladin", 3, "<:Paladin:965363084740952105>", "https://i.ibb.co/4KYcxxG/Paladin.png", { "hp": [1.3, 0], "atk": [1.1, 0], "def": [1.3, 0], "md": [0.8, 0], "mr": [1.35, 0], "cr": [0.75, 0], "cd": [0.9, 0], "br": [1.4, 0], "agility": [1, 0], "dodge": [0.75, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 0] }, 42, [[1, 13, 42]]),
    new classInfo("Artillerist", 2, "<:Artillerist:965373784372674581>", "https://i.ibb.co/jD90SGR/Artillerist.png", { "hp": [1, 0], "atk": [1.2, 0], "def": [0.9, 0], "md": [0.8, 0], "mr": [0.9, 0], "cr": [1, 0], "cd": [1.3, 0], "br": [0.95, 0], "agility": [1.15, 0], "dodge": [1.15, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, -3] }, 43, [[3, 43, 44]]),
    new classInfo("Warmachine", 3, "<:Warmachine:965373810964570152>", "https://i.ibb.co/ZLwqy2d/Warmachine.png", { "hp": [1.1, 0], "atk": [1.15, 0], "def": [1.25, 0], "md": [0.85, 0], "mr": [1.15, 0], "cr": [1, 0], "cd": [1.1, 0], "br": [1.25, 0], "agility": [0.7, 0], "dodge": [0.7, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, -5] }, 44, [[3, 43, 44]]),
    new classInfo("Summoner", 2, "<:Summoner:965737249759166506>", "https://i.ibb.co/hKdk11L/Summoner.png", { "hp": [0.75, 0], "atk": [1.3, 0], "def": [0.7, 0], "md": [1.3, 0], "mr": [1.2, 0], "cr": [1, 0], "cd": [0.9, 0], "br": [0.9, 0], "agility": [0.9, 0], "dodge": [0.9, 0], "td": [1, 0], "mana": [1, 30], "mg": [1, 3] }, 45, [[8, 45, 46]]),
    new classInfo("Shaman", 3, "<:Shaman:965890163756642384>", "https://i.ibb.co/12WhFsC/Shaman.png", { "hp": [0.85, 0], "atk": [1.25, 0], "def": [0.75, 0], "md": [1.35, 0], "mr": [1.2, 0], "cr": [1, 0], "cd": [0.9, 0], "br": [0.75, 0], "agility": [1.4, 0], "dodge": [1.3, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 3] }, 46, [[8, 45, 46]]),
    new classInfo("Sorcerer", 2, "<:Sorcerer:965962753951031396>", "https://i.ibb.co/Gsk5nSz/Sorcerer.png", { "hp": [0.75, 0], "atk": [0.8, 0], "def": [0.75, 0], "md": [1.35, 0], "mr": [1.15, 0], "cr": [1, 0], "cd": [1, 0], "br": [0.8, 0], "agility": [1.15, 0], "dodge": [1.1, 0], "td": [1, 0], "mana": [1, 20], "mg": [1, 4] }, 47, [[8, 47, 48]]),
    new classInfo("Wizard", 3, "<:Wizard:965962845302952016>", "https://i.ibb.co/kDccC30/Wizard.png", { "hp": [0.8, 0], "atk": [0.9, 0], "def": [0.75, 0], "md": [1.4, 0], "mr": [1.2, 0], "cr": [1, 0], "cd": [1.1, 0], "br": [0.85, 0], "agility": [1.2, 0], "dodge": [1.15, 0], "td": [1, 0], "mana": [1, 30], "mg": [1, 5] }, 48, [[8, 47, 48]]),
    new classInfo("Brawler", 2, "<:Brawler:965966697288826900>", "https://i.ibb.co/PYgn8w0/Brawler.png", { "hp": [0.9, 0], "atk": [1.25, 0], "def": [1.1, 0], "md": [0.75, 0], "mr": [0.8, 0], "cr": [1.1, 0], "cd": [1.2, 0], "br": [1.1, 0], "agility": [1.4, 0], "dodge": [1.35, 0], "td": [1, 0], "mana": [1, -10], "mg": [1, -3] }, 49, [[5, 49, 50]]),
    new classInfo("Grappler", 3, "<:Grappler:965969957911408751>", "https://i.ibb.co/B3NZvYZ/Grappler.png", { "hp": [1.25, 0], "atk": [1.1, 0], "def": [1.1, 0], "md": [1.05, 0], "mr": [1, 0], "cr": [1.1, 0], "cd": [1.25, 0], "br": [1.3, 0], "agility": [0.8, 0], "dodge": [0.8, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 5] }, 50, [[5, 49, 50]]),
    new classInfo("Striker", 2, "<:Striker:965969932561051708>", "https://i.ibb.co/QD43cn9/Striker.png", { "hp": [0.9, 0], "atk": [1.2, 0], "def": [1, 0], "md": [0.8, 0], "mr": [0.8, 0], "cr": [1.2, 0], "cd": [1.3, 0], "br": [1.1, 0], "agility": [1, 0], "dodge": [1, 0], "td": [1, 0], "mana": [1, 0], "mg": [1, 0] }, 51, [[5, 51, 52]]),
    new classInfo("Wardancer", 3, "<:Wardancer:965976897987170354>", "https://i.ibb.co/f4Pn3qZ/Wardancer.png", { "hp": [0.9, 0], "atk": [1.3, 0], "def": [0.9, 0], "md": [0.8, 0], "mr": [0.8, 0], "cr": [1.5, 0], "cd": [1, 0], "br": [1, 0], "agility": [1.4, 0], "dodge": [1.5, 0], "td": [1, 0], "mana": [1, 10], "mg": [1, 0] }, 52, [[5, 51, 52]]),
];
