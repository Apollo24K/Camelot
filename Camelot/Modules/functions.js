var fs = require('fs');
const { MessageEmbed } = require("discord.js");
var imagesize = require('imagesize');
const https = require("https");
const { characters } = require("./chars.js");
const { classes } = require("./classes.js");
const { db, query } = require("../db_handler.js");

var statsOp = JSON.parse(fs.readFileSync('Storage/statsOp.json', 'utf8'));

module.exports.getDimensions = (url) => {
    return new Promise((resolve, rejects) => {
        var request = https.get(url, (response) => {
            imagesize(response, (err, result) => {
                request.destroy();
                resolve(result);
            });
        });
    });
};

function strCode(id) {
    let inp = characters[id].anime + characters[id].gender + characters[id].name;
    var hash = 0;
    if (inp.length < 2) return 111;
    for (var bi = 0; bi < inp.length; bi++) {
        var char = inp.charCodeAt(bi);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    };
    if (hash < 0) return -hash;
    return hash;
};

function baseHP(id) {
    let hash = strCode(id) % 10;
    switch (characters[id].rarity) {
        case "SS" : hash = Math.round(360 + (12*hash)); break;
        case "S" : hash = Math.round(300 + (12*hash)); break;
        case "A" : hash = Math.round(240 + (12*hash)); break;
        case "B" : hash = Math.round(200 + (10*hash)); break;
        case "C" : hash = Math.round(160 + (8*hash)); break;
        case "D" : hash = Math.round(120 + (8*hash)); break;
        default : hash = 1; break;
    };
    if (statsOp.base.hp[id]) hash += statsOp.base.hp[id];
    return hash;
};

function baseATK(id) {
    let hash = Math.round(((strCode(id)%100)/10)+0.01);
    switch (characters[id].rarity) {
        case "SS" : hash = Math.floor(50 + (3*hash)); break;
        case "S" : hash = Math.floor(40 + (1.5*hash)); break;
        case "A" : hash = Math.floor(35 + (1.5*hash)); break;
        case "B" : hash = Math.floor(30 + (1*hash)); break;
        case "C" : hash = Math.floor(25 + (1*hash)); break;
        case "D" : hash = Math.floor(20 + (1*hash)); break;
        default : hash = 1; break;
    };
    if (statsOp.base.atk[id]) hash += statsOp.base.atk[id];
    return hash;
};

function baseDEF(id) {
    let hash = strCode(id);
    var sum = 0;
    while (hash) {
        sum += hash % 10;
        hash = Math.floor(hash / 10);
    };
    hash = sum%10;

    switch (characters[id].rarity) {
        case "SS" : hash = Math.floor(50 + (22/(hash+1))); break;
        case "S" : hash = Math.floor(42 + (22/(hash+1))); break;
        case "A" : hash = Math.floor(36 + (14/(hash+1))); break;
        case "B" : hash = Math.floor(30 + (12/(hash+1))); break;
        case "C" : hash = Math.floor(24 + (12/(hash+1))); break;
        case "D" : hash = Math.floor(20 + (10/(hash+1))); break;
        default : hash = 1; break;
    };
    if (statsOp.base.def[id]) hash += statsOp.base.def[id];
    return hash;
};

module.exports.baseHP = id => baseHP(id);
module.exports.baseATK = id => baseATK(id);
module.exports.baseDEF = id => baseDEF(id);


module.exports.getDetailedStats = (id, inv, classLevel, lu=0, refine=false) => {

    let dStats = {
        "hp": baseHP(id),
        "maxhp": 1,
        "atk": baseATK(id),
        "def": baseDEF(id),
        "ep": 0,
        "md": 0,
        "mr": 0,
        "cr": 0.18,
        "cd": 1.25,
        "td": 0,
        "br": 0.2,
        "agility": 80,
        "dodge": 0.1,
        "mana": 80,
        "mg": 15,
        "sm": 20,
        "rev": 0,
        "revhp": 0.5,
        "lvl": 1,
        "ref": 0,
        "class": -1,
        "clvl": 1,
    };

    if (inv.level[id]) dStats.lvl = inv.level[id];
    dStats.lvl += lu;
    if (inv.ref[id]) dStats.ref = inv.ref[id];
    if (refine) dStats.ref++;
    if (dStats.ref > 5) dStats.ref = 5;

    let clsStats;
    if (id in inv.class) {
        dStats.class = inv.class[id];
        dStats.clvl = getClassLvl(dStats.class, classLevel);
        clsStats = classes[dStats.class].stats;
        Object.keys(clsStats).forEach((s) => dStats[s] = dStats[s] * clsStats[s][0] + clsStats[s][1]);
        ["mana", "mg", "sm"].forEach((stat) => dStats[stat] = Math.floor(dStats[stat]));
    };
    
    switch (characters[id].rarity) {
        case "SS" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((5+(2*((dStats.hp-180)/60)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((2.4+(0.35*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((1.25+(0.25*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "S" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((3.9+(0.6*((dStats.hp-150)/50)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((1.9+(0.3*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((1+(0.2*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "A" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((3.3+(0.4*((dStats.hp-120)/60)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((1.6+(0.25*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.8+(0.15*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "B" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((2.8+(0.4*((dStats.hp-100)/50)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((1.2+(0.3*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.6+(0.2*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "C" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((2.4+(0.4*((dStats.hp-80)/40)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((0.9+(0.35*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.5+(0.15*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "D" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((2+(0.5*((dStats.hp-70)/30)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((0.75+(0.25*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.4+(0.5*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        default : dStats.hp = 1; dStats.atk = 1; dStats.def = 1; break;
    };
    dStats.td = dStats.atk, dStats.md = dStats.atk, dStats.mr = dStats.def;
    if (dStats.class !== -1) {
        ["td","md","mr"].forEach((s) => dStats[s] = Math.floor(dStats[s] * clsStats[s][0] + clsStats[s][1]));
        let scale;
        switch (classes[dStats.class].tier) {
            case 1: scale = {"hp": 4, "atk": 1.3, "md": 1.3, "def": 0.8, "mr": 0.8, "mana": 0.4}; break;
            case 2: scale = {"hp": 5, "atk": 1.7, "md": 1.7, "def": 0.95, "mr": 0.95, "mana": 0.5}; break;
            case 3: scale = {"hp": 6, "atk": 2, "md": 2, "def": 1.1, "mr": 1.1, "mana": 0.65}; break;
            case 4: scale = {"hp": 8, "atk": 3, "md": 3, "def": 1.35, "mr": 1.35, "mana": 0.8}; break;
            default: break;
        };
        ["hp", "atk", "md", "def", "mr", "mana"].forEach((s) => dStats[s] += Math.floor((scale[s] * clsStats[s][0]) * (dStats.clvl-1)));
    };
    dStats.maxhp = dStats.hp;
    dStats.ep = Math.floor(((dStats.hp/Math.pow(0.99818,dStats.def)) / (200/dStats.atk))*100) / 100;
    return dStats;
};

module.exports.search = (name, inv, interaction, silent=false) => {
    name = name.toLowerCase();
    if (name === "last" || name === "latest") name = inv[inv.length-1].toString();

    if (!isNaN(name)) {
        if (name < 0) return silent ? false : interaction.reply("The ID can't be negative.");
        if (name >= characters.length) return silent ? false : interaction.reply(`The ID must be smaller than ${characters.length}`);
        if (!(name[0] === "0" && name.length > 1)) return characters[parseInt(name)];
    };
    
    let cArgs = name.split(" ");

    let fastCheck = characters.filter((e) => e.name.toLowerCase() === cArgs.join(' ') || e.alias.some((a) => a.toLowerCase() === cArgs.join(' ')));
    if (fastCheck[0] !== undefined) return fastCheck[0];

    let fArray = characters.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0] || e.alias.some((a) => a.toLowerCase()[0] === cArgs[0][0]));

    let letter = 0;
    for (word=0; word < cArgs.length; word++) {
        let { length:wl } = cArgs[word];

        while (wl--) {
            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[word] === undefined ? false :  e.name.toLowerCase().split(" ")[word][letter] === cArgs[word][letter] || e.alias.some((a) => a.toLowerCase()[letter] === cArgs[word][letter]));
            letter++;
        };

        if (fArray.length < 2) break;
        letter = 0;
    };

    if (fArray.length === 0) return silent ? false : interaction.reply("No match found");
    if (fArray.length > 1) return silent ? false : interaction.reply(fArray.length + " matches found");
    return fArray[0];
};

function rarity(rar) {
    switch (rar) {
        case "SS" : return "https://i.ibb.co/GdhDTj1/n3qj4i2.png"; break;
        case "S" : return "https://i.ibb.co/8KZJLLZ/aSXEB8J.png"; break;
        case "A" : return "https://i.ibb.co/8MTkwzf/MNNSMIP.png"; break;
        case "B" : return "https://i.ibb.co/WswjB19/HHgIQsZ.png"; break;
        case "C" : return "https://i.ibb.co/ZHRxzFB/bF4Uwq7.png"; break;
        case "D" : return "https://i.ibb.co/Yp26KZG/qHR5lBz.png"; break;
        default : return "https://i.ibb.co/j6Vhb5B/zPpfb14.jpg"; break;
    };
};

module.exports.rarity = (rar) => {
    return rarity(rar);
};

function getRefinement(cid) {
    if (cid > 4) return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552>";
    switch (cid) {
        case 4: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136>";
        case 3: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
        case 2: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
        case 1: return "<:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
        default: return "<:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
    };
};

module.exports.getRefinement = (cid) => {
    return getRefinement(cid);
};

function splitTitle(title) {
    if (title.length <= 30) return title;
    let add = ""
    while (title.length > 30) {
      let spaceIndex = title.slice(0,30).lastIndexOf(" ");
      add += title.slice(0,30).replace(/\s+\S*$/, "\n")
      title = title.slice(spaceIndex+1)
    };
    add += title;
    return add;
};

module.exports.splitTitle = title => splitTitle(title);

module.exports.displayPull = (user, thisChar, pCount, dupes, pullsMade, lastVote, refinement) => {
    let animeL = splitTitle(thisChar.anime);
    refinement = getRefinement(refinement);
    let img = thisChar.image;

    // Check if vote
    let canVote = "";
    if ((pCount-pullsMade) == 0) {
        canVote = ` | You can /vote`;
        if (lastVote && ((new Date().getTime() - lastVote) < 12*60*60*1000)) canVote = "";
    };

    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setImage(img)
    .setThumbnail(rarity(thisChar.rarity))
    .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
    .setFooter(`You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this\n${pCount-pullsMade} ${pCount-pullsMade == 1 ? "pull" : "pulls"} left${canVote}`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
    return { embeds: [Embed] };
};

module.exports.searchAnime = (name, inv, interaction) => {
    name = name.toLowerCase();
    if (name === "last" || name === "latest") name = characters[inv[inv.length -1]].anime.toLowerCase();

    let cArgs = name.split(" ");

    // Full Title Search
    let fastCheck = characters.filter((e) => e.anime.toLowerCase() === name.toLowerCase() || e.anialias.some((a) => a.toLowerCase() === name.toLowerCase()));
    if (fastCheck[0] !== undefined) return fastCheck;

    // Acronym Search
    fastCheck = characters.filter((e) => e.anime.toLowerCase().match(/\b(\w)/g).join('') === name.toLowerCase() || e.anialias.some((a => a.toLowerCase().match(/\b(\w)/g).join('') === name.toLowerCase())));
    for (i=0; i < fastCheck.length; i++) {
        if (fastCheck[i].anime != fastCheck[0].anime) fastCheck = [];
    };
    if (fastCheck[0] !== undefined) return fastCheck;

    let fArray = characters.filter((e) => e.anime.toLowerCase()[0] === cArgs[0][0] || e.anialias.some((a) => a.toLowerCase()[0] === cArgs[0][0]));

    let letter = 0;
    for (word=0; word < cArgs.length; word++) {
        let { length:wl } = cArgs[word];

        while (wl--) {
            fArray = fArray.filter((e) => e.anime.toLowerCase().split(" ")[word] === undefined ? false :  e.anime.toLowerCase().split(" ")[word][letter] === cArgs[word][letter] || e.anialias.some((a) => a.toLowerCase()[letter] === cArgs[word][letter]));
            letter++;
        };
        
        if ([...new Set(fArray.map((e) => e.anime))].length < 2) break;
        letter = 0;
    };

    if (fArray.length === 0) return interaction.reply("No match found");
    if ([...new Set(fArray.map((e) => e.anime))].length > 1) return interaction.reply([...new Set(fArray.map((e) => e.anime))].length + " matches found");
    return fArray;
};

module.exports.userLevel = (xpr) => {
    let level = 0;
    for (i=1; xpr >= 0; i++) {
        xpr -= Math.floor(5*Math.log(i)**4 + 30);
        level++;
    };
    return level;
};

function getClassLvl(cls, classLvl) {
    let clvl = 1, classxp = 0;
    if (cls in classLvl) classxp = classLvl[cls];
    for (ci=1; classxp > 0; ci++) {
        clvl++;
        classxp -= ci*50;
    };
    if (classxp < 0) clvl--;

    switch (classes[cls].tier) {
        case 1: if (clvl > 50) clvl = 50; break;
        case 2: if (clvl > 70) clvl = 70; break;
        default: break;
    };

    return clvl;
};

module.exports.getClassLvl = (cls, classLvl) => getClassLvl(cls, classLvl);

module.exports.searchClass = (name, interaction, silent=false) => {
    name = name.toLowerCase();

    if (!isNaN(name)) {
        if (name < 0) return silent ? false : interaction.reply("The ID can't be negative.");
        if (name >= classes.length) return silent ? false : interaction.reply("The ID must be smaller than " + classes.length);
        return classes[parseInt(name)];
    };

    let fastCheck = classes.find((e) => e.name.toLowerCase() === name);
    if (fastCheck) return fastCheck;

    let cArgs = name.split(" ");

    let fArray = classes.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0]);

    let letter = 0;
    for (word=0; word < cArgs.length; word++) {
        let { length:wl } = cArgs[word];

        while (wl--) {
            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[word] === undefined ? false : e.name.toLowerCase().split(" ")[word][letter] === cArgs[word][letter]);
            letter++;
        };

        if (fArray.length < 2) break;
        letter = 0;
    };

    if (fArray.length === 0) return silent ? false : interaction.reply("No match found");
    if (fArray.length > 1) return silent ? false : interaction.reply(fArray.length + " matches found");
    return fArray[0];
};

function* idGen() {
    let id = 1;
    while (true) {
        yield id++;
    };
};
let getId = idGen();
module.exports.getId = getId;