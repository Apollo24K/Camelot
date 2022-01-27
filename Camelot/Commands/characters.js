var fs = require('fs');
const { rejects } = require("assert");
const { resolve } = require("path");
var imagesize = require('imagesize');
const https = require("https");
const { MessageEmbed, Message } = require("discord.js");
const Discord = require('discord.js');
const { characters, auniq, charactersF, charactersM, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } = require("./chars.js");

var inventory = JSON.parse(fs.readFileSync('Storage/inventory.json', 'utf8'));
var favChar = JSON.parse(fs.readFileSync('Storage/favChar.json', 'utf8'));
var xp = JSON.parse(fs.readFileSync('Storage/xp.json', 'utf8'));
var coins = JSON.parse(fs.readFileSync('Storage/coins.json', 'utf8'));
var ccgUsers = JSON.parse(fs.readFileSync('Storage/ccgUsers.json', 'utf8'));
var pity = JSON.parse(fs.readFileSync('Storage/pity.json', 'utf8'));
var ref = JSON.parse(fs.readFileSync('Storage/ref.json', 'utf8'));
var charlvl = JSON.parse(fs.readFileSync('Storage/charlvl.json', 'utf8'));
var battleChar = JSON.parse(fs.readFileSync('Storage/battleChar.json', 'utf8'));
var shards = JSON.parse(fs.readFileSync('Storage/shards.json', 'utf8'));
var statsOp = JSON.parse(fs.readFileSync('Storage/statsOp.json', 'utf8'));
var seed = JSON.parse(fs.readFileSync('Storage/seed.json', 'utf8'));
var seedChanged = JSON.parse(fs.readFileSync('Storage/seedChanged.json', 'utf8'));
var animationDelay = JSON.parse(fs.readFileSync('Storage/animationDelay.json', 'utf8'));
var tickets = JSON.parse(fs.readFileSync('Storage/tickets.json', 'utf8'));
var arenaResults = JSON.parse(fs.readFileSync('Storage/arenaResults.json', 'utf8'));
var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

module.exports = {
    name: 'characters',
    description: 'Characters',
    execute(message, args, cmd, client) {

        var prefix = "!";
        var servPrefix = JSON.parse(fs.readFileSync('Storage/servPrefix.json', 'utf8'));
        if (servPrefix[message.guild.id]) prefix = servPrefix[message.guild.id];

        if (!ccgUsers[message.author.id] || ccgUsers[message.author.id] !== message.author.tag) {
            ccgUsers[message.author.id] = message.author.tag;
            fs.writeFile('Storage/ccgUsers.json', JSON.stringify(ccgUsers), (err) => {
                if (err) console.error(err);
            });
        };

        var premium = JSON.parse(fs.readFileSync('Storage/premium.json', 'utf8'));

        if (cmd === "seed") {
            if (!(premium[message.author.id] > 1)) return message.channel.send("This is a `" + prefix + "premium` feature changing the base stats of every character to fit your server (see `" + prefix + "help seed` for more information)\nIf you're having any issues, please join our `" + prefix + "support` Server.");
            if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send("You need to have admin permissions to change the seed of a server");
            if (!seedChanged[message.author.id]) seedChanged[message.author.id] = [];

            if (!args[0]) {
                if (seed[message.guild.id]) return message.channel.send("The current server seed is `" + seed[message.guild.id] + "\n`Use `" + prefix + "seed <string>` to change it.");
                return message.channel.send("Please provide a seed, it can be any string less than 21 characters");
            };

            if (args[0].toLowerCase() === "reset" && seed[message.guild.id]) {
                delete seed[message.guild.id];
                let seedKeys = Object.keys(seedChanged);
                let seedValues = Object.values(seedChanged);
                for (i=0; i< seedValues.length; i++) {
                    if (seedValues[i].filter((e) => e === message.guild.id)) seedChanged[seedKeys[i]].splice(seedChanged[seedKeys[i]].indexOf(message.guild.id));
                };
                fs.writeFile('Storage/seed.json', JSON.stringify(seed), (err) => {
                    if (err) console.error(err);
                });
                fs.writeFile('Storage/seedChanged.json', JSON.stringify(seedChanged), (err) => {
                    if (err) console.error(err);
                });
                return message.channel.send(`The seed for ${message.guild.name} has been resetted`);
            };

            let changesTotal = 0;
            switch (premium[message.author.id]) {
                case "2": changesTotal = 1; break;
                case "3": changesTotal = 2; break;
                case "4": changesTotal = 3; break;
                case "5": changesTotal = 3; break;
                case "6": changesTotal = 3; break;
                default : false; break;
            };
            if (!seedChanged[message.author.id].includes(message.guild.id)) {
                if (seedChanged[message.author.id].length >= changesTotal) return message.channel.send(`You can change the seed of ${changesTotal} ${changesTotal === 1 ? "Server" : "Servers"} at most. If you want to change this servers seed, use \`${prefix}seed reset\` on the server whose seed you changed in the past. If you're having trouble with this, you can ask for help on our support server!`);
            };
            
            let key = args.join(" ");
            if (key.length > 20) return message.channel.send("This string is too long. It should be less than 21 characters")

            if (seed[message.guild.id]) {
                if (!seedChanged[message.author.id].includes(message.guild.id)) {
                    let seedKeys = Object.keys(seedChanged);
                    let seedValues = Object.values(seedChanged);
                    for (i=0; i< seedValues.length; i++) {
                        if (seedValues[i].filter((e) => e === message.guild.id)) seedChanged[seedKeys[i]].splice(seedChanged[seedKeys[i]].indexOf(message.guild.id));
                    };
                };
            };

            seed[message.guild.id] = key;
            if (!seedChanged[message.author.id].includes(message.guild.id)) seedChanged[message.author.id].push(message.guild.id);
            message.channel.send("Server seed set to `" + key + "`")
            fs.writeFile('Storage/seed.json', JSON.stringify(seed), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/seedChanged.json', JSON.stringify(seedChanged), (err) => {
                if (err) console.error(err);
            });
        };

        function getDimensions(url) {
            return new Promise((resolve, rejects) => {
                var request = https.get(url, (response) => {
                    imagesize(response, (err, result) => {
                        request.abort();
                        resolve(result);
                    });
                });
            });
        };

        function strCode(id) {
            inp = characters[id].anime + characters[id].gender + characters[id].name;
            if (seed[message.guild.id]) inp += seed[message.guild.id];
            var hash = 0;
            if (inp.length < 2) return 111;
            for (var bi = 0; bi < inp.length; bi++) {
                var char = inp.charCodeAt(bi);
                hash = ((hash<<5)-hash)+char;
                hash = hash & hash; // Convert to 32bit integer
            };
            if (hash < 0) hash = -hash;
            return hash
        };

        function baseHP(id) {
            let hash = strCode(id) % 10;
            switch (characters[id].rarity) {
                case "SS" : hash = Math.round(180 + (6*hash)); break;
                case "S" : hash = Math.round(150 + (5*hash)); break;
                case "A" : hash = Math.round(120 + (6*hash)); break;
                case "B" : hash = Math.round(100 + (5*hash)); break;
                case "C" : hash = Math.round(80 + (4*hash)); break;
                case "D" : hash = Math.round(70 + (3*hash)); break;
                default : hash = 1; break;
            };
            if (seed[message.guild.id]) return hash;
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
            if (seed[message.guild.id]) return hash;
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
                case "SS" : hash = Math.floor(32 + (10/(hash+1))); break;
                case "S" : hash = Math.floor(24 + (10/(hash+1))); break;
                case "A" : hash = Math.floor(18 + (8/(hash+1))); break;
                case "B" : hash = Math.floor(15 + (7/(hash+1))); break;
                case "C" : hash = Math.floor(12 + (6/(hash+1))); break;
                case "D" : hash = Math.floor(10 + (5/(hash+1))); break;
                default : hash = 1; break;
            };
            if (seed[message.guild.id]) return hash;
            if (statsOp.base.def[id]) hash += statsOp.base.def[id];
            return hash;
        };

        function getStats(id) {
            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            if (!charlvl[message.author.id + message.guild.id][id]) charlvl[message.author.id + message.guild.id][id] = 1;

            let currLvl = charlvl[message.author.id + message.guild.id][id];

            let hp = baseHP(id);
            let atk = baseATK(id);
            let def = baseDEF(id);
            let rm;
            if (!ref[message.author.id + message.guild.id][id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][id];
            };
            if (rm > 5) rm = 5;
            
            switch (characters[id].rarity) {
                case "SS" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((5+(2*((hp-180)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((2.4+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1.25+(0.25*((def-50)/30)))*(currLvl-1)); break;
                case "S" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.9+(0.6*((hp-150)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.9+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1+(0.2*((def-50)/30)))*(currLvl-1)); break;
                case "A" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.3+(0.4*((hp-120)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.6+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.8+(0.15*((def-50)/30)))*(currLvl-1)); break;
                case "B" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.8+(0.4*((hp-100)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.2+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.6+(0.2*((def-50)/30)))*(currLvl-1)); break;
                case "C" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.4+(0.4*((hp-80)/40)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.9+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.5+(0.15*((def-50)/30)))*(currLvl-1)); break;
                case "D" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2+(0.5*((hp-70)/30)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.75+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.4+(0.5*((def-50)/30)))*(currLvl-1)); break;
                default : hp = 1; atk = 1; def = 1; break;
            };
            let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (100/atk))*100) / 100;
            return [hp, atk, def, ep];
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

        function getRefinement(cid) {
            if (ref[message.author.id + message.guild.id][cid] > 4) return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552>";
            switch (ref[message.author.id + message.guild.id][cid]) {
                case 4: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136>";
                case 3: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                case 2: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                case 1: return "<:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                default: return "<:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
            };
        };

        function search(cName) {
            cName = cName.toLowerCase();
            if (cName === "last" || cName === "latest") cName = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1].toString();
            let cArgs = cName.split(" ");
            
            let fArray;

            if (!isNaN(cArgs[0]) && cArgs[0] < characters.length && !cArgs[1]) {
                if (!(cArgs[0][0] === "0" && cArgs[0].length > 1) && cArgs[0][0] !== "-") {
                    fArray = characters[cArgs[0]];
                } else {
                    let fastCheck = characters.filter((e) => e.name.toLowerCase() === cArgs.join(' ') || e.alias.some((a => a.toLowerCase() === args.join(' '))));
                    if (fastCheck[0] !== undefined) {
                        fArray = fastCheck[0];
                    } else {
                        fArray = characters.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0] || e.alias.some((a => a.toLowerCase()[0] === cArgs[0][0])));

                        let i = 0;
                        
                        for (j=0; j < cArgs.length; j++) {
                            let argsW = cArgs[j].length;
            
                            while (argsW > 0) {
                                fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === cArgs[j][i] || e.alias.some((a => a.toLowerCase()[i] === cArgs[j][i])));
                                argsW--;
                                i++;
                            };
            
                            i = 0;
                            if (fArray.length < 2) {
                                j = cArgs.length;
                            };
                        };
            
                        if (fArray.length === 0) {
                            return message.channel.send("No match found");
                        };
                        if (fArray.length > 1) {
                            return message.channel.send(fArray.length + " matches found");
                        };
                    };
                };
            } else if (!isNaN(cArgs[0]) && cArgs[0] >= characters.length && !cArgs[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            } else {
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === cArgs.join(' ') || e.alias.some((a => a.toLowerCase() === cArgs.join(' '))));
                if (fastCheck[0] !== undefined) {
                    fArray = fastCheck[0];
                } else {
                    fArray = characters.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0] || e.alias.some((a => a.toLowerCase()[0] === cArgs[0][0])));

                    let i = 0;
                    
                    for (j=0; j < cArgs.length; j++) {
                        let argsW = cArgs[j].length;
        
                        while (argsW > 0) {
                            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === cArgs[j][i] || e.alias.some((a => a.toLowerCase()[i] === cArgs[j][i])));
                            argsW--;
                            i++;
                        };
        
                        i = 0;
                        if (fArray.length < 2) {
                            j = cArgs.length;
                        };
                    };
        
                    if (fArray.length === 0) {
                        return message.channel.send("No match found");
                    };
                    if (fArray.length > 1) {
                        return message.channel.send(fArray.length + " matches found");
                    };
                    fArray = fArray[0];
                };
            };
            return fArray;
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

        function display(thisChar) {
            let animeL = splitTitle(thisChar.anime);
            let img = thisChar.image;
            if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[thisChar.id]) img = customSettings[message.author.id + message.guild.id].cimg[thisChar.id];
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(img)
            .setThumbnail(rarity(thisChar.rarity))
            .setDescription("**" + thisChar.name + "**" + "\n" + animeL)
            .setFooter(`ID: #${thisChar.id}`)
            message.channel.send(Embed);
        };

        function displayPull(thisChar, pCount) {
            let animeL = splitTitle(thisChar.anime);
            const dupes = inventory[message.author.id + message.guild.id].filter((e) => e === thisChar.id);
            let copy;
            if (dupes.length < 2) {
                copy = "copy";
            } else {
                copy = "copies"
            };
            let refinement = getRefinement(thisChar.id);
            let pullsMade = pullCount[message.author.id + message.guild.id];
            let img = thisChar.image;
            if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[thisChar.id]) img = customSettings[message.author.id + message.guild.id].cimg[thisChar.id];

            // Check if vote
            let canVote = "";
            if ((pCount-pullsMade) == 0) {
                canVote = ` | You can ${prefix}vote`;
                var lastVote = JSON.parse(fs.readFileSync('Storage/lastVote.json', 'utf8'));
                if (lastVote[message.author.id] && ((new Date().getTime() - lastVote[message.author.id]) < 12*60*60*1000)) canVote = "";
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(img)
            .setThumbnail(rarity(thisChar.rarity))
            .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
            .setFooter("You have " + (dupes.length) + ` ${copy} of this\n${pCount-pullsMade} ${pCount-pullsMade == 1 ? "pull" : "pulls"} left${canVote}`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            message.channel.send(Embed);
        };

        function displayMy(thisChar) {
            let animeL = splitTitle(thisChar.anime);
            const dupes = inventory[message.author.id + message.guild.id].filter((e) => e === thisChar.id);
            let copy;
            if (dupes.length < 2) {
                copy = "copy";
            } else {
                copy = "copies"
            };
            let refinement = getRefinement(thisChar.id);

            let img = thisChar.image;
            if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[thisChar.id]) img = customSettings[message.author.id + message.guild.id].cimg[thisChar.id];

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(img)
            .setThumbnail(rarity(thisChar.rarity))
            .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
            .setFooter("You have " + (dupes.length) + ` ${copy} of this`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            message.channel.send(Embed);
        };

        function displayIm(thisChar) {
            let animeL = splitTitle(thisChar.anime);
            const dupes = inventory[message.author.id + message.guild.id].filter((e) => e === thisChar.id);
            let copy;
            if (dupes.length < 2) {
                copy = "copy";
            } else {
                copy = "copies"
            };
            let refinement = getRefinement(thisChar.id);

            let img = thisChar.image;
            if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[thisChar.id]) img = customSettings[message.author.id + message.guild.id].cimg[thisChar.id];

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(img)
            .setThumbnail(rarity(thisChar.rarity))
            .setDescription("**" + thisChar.name + "**" + "\n" + animeL + "\n\n**Ref**. " + refinement)
            .setFooter("You have " + (dupes.length) + ` ${copy} of this`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            message.channel.send(Embed);
        };

        function base(thisChar) {
            let hp = baseHP(thisChar.id);
            let atk = baseATK(thisChar.id);
            let def = baseDEF(thisChar.id);
            let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (100/atk))*100) / 100;

            let animeL = splitTitle(thisChar.anime);

            let img = thisChar.image;
            if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[thisChar.id]) img = customSettings[message.author.id + message.guild.id].cimg[thisChar.id];
            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(img)
            .setThumbnail(rarity(thisChar.rarity))
            .setDescription("**" + thisChar.name + "**" + "\n" + animeL + "\n")
            .addFields(
                { name: 'HP ️️️💖', value: hp, inline: true },
                { name: 'ATK ️️⚔️', value: atk, inline: true },
                { name: 'DEF ️️️🛡️', value: def, inline: true },
            )
            .setFooter(`EP: ${ep}`)
            message.channel.send(Embed);
        };

        class enemyInfo {
            constructor(name, species, title, boss, hp, atk, def, image, floor) {
                this._name = name;
                this._species = species;
                this._title = title;
                this._boss = boss;
                this._hp = hp;
                this._atk = atk;
                this._def = def;
                this._image = image;
                this._floor = floor;
            };

            get name() {
                return this._name;
            };
            get species() {
                return this._species;
            };
            get title() {
                return this._title;
            };
            get boss() {
                return this._boss;
            };
            hp(fl) {
                // 100-200HP, Floor 1-10 || min=(min+((max-min)/floorsTotal)*(floor-1)) max=(min+((max-min)/floorsTotal)*floor) || ((200-100)/10)*FL
                return parseInt(this._hp.split("-")[0]) + Math.floor(Math.random() * (((parseInt(this._hp.split("-")[1]) - parseInt(this._hp.split("-")[0]))/this.floor[this.floor.length-1]) * fl +1));
                // (min+((max-min)/floorsTotal)*(floor+(-1+Math.random())))
            };
            atk(fl) {
                return parseInt(this._atk.split("-")[0]) + Math.floor(Math.random() * (((parseInt(this._atk.split("-")[1]) - parseInt(this._atk.split("-")[0]))/this.floor[this.floor.length-1]) * fl +1));
            };
            def(fl) {
                return parseInt(this._def.split("-")[0]) + Math.floor(Math.random() * (((parseInt(this._def.split("-")[1]) - parseInt(this._def.split("-")[0]))/this.floor[this.floor.length-1]) * fl +1))
            };
            get hpr() {
                return this._hp.split("-");
            };
            get atkr() {
                return this._atk.split("-");
            };
            get defr() {
                return this._def.split("-");
            };
            get image() {
                return this._image;
            };
            get floor() {
                return this._floor;
            };
            aep(fl) {
                return Math.floor(((this.hp(fl)/Math.pow(0.99818,this.def(fl))) / (100/this.atk(fl)))*100) / 100;
            };
            stats(fl) {
                let eHp = this.hp(fl);
                let eAtk = this.atk(fl);
                let eDef = this.def(fl);
                let eEp = Math.floor(((eHp/Math.pow(0.99818,eDef)) / (100/eAtk))*100) / 100;
                return [eHp, eAtk, eDef, eEp]
            };
        };

        const enemies = [
            new enemyInfo("Slime", "Slime", "a Slime", false, "80-300", "25-80", "10-70", ["https://i.ibb.co/yWHMQT9/slime.png"], [1,2,3,4,6,7,8,9]),
            new enemyInfo("Skeleton", "Skeleton", "a Skeleton", false, "60-280", "30-130", "20-50", ["https://i.ibb.co/Hz73P9Q/s.png", "https://i.ibb.co/SVKxHF4/s.png"], [1,2,3,4,6,7,8,9]),
            new enemyInfo("Direwolf", "Direwolf", "a Direwolf", false, "100-320", "35-130", "40-80", ["https://i.ibb.co/3yky5nD/D.png"], [1,2,3,4,6,7,8,9]),
            new enemyInfo("Goblin", "Goblin", "a Goblin", false, "130-400", "50-180", "40-100", ["https://i.ibb.co/jfBtZ1Q/g1.png", "https://i.ibb.co/b1YMVnv/g3.png", "https://i.ibb.co/64vWDRt/g.png"], [3,4,6,7,8,9,11,12,13,14]),
            new enemyInfo("Skeleton Soldier", "Skeleton", "a Skeleton", true, "200-200", "90-90", "65-65", ["https://i.ibb.co/chdgQGf/ss.png"], [5]),
            new enemyInfo("Retar", "Wolf", "a Wolf", false, "180-360", "80-160", "70-120", ["https://i.ibb.co/0BDYjvG/r.png"], [6,7,8,9,11,12,13,14]),
            new enemyInfo("Werewolf", "Werewolf", "a Werewolf", false, "200-420", "90-170", "70-130", ["https://i.ibb.co/8x5RRPB/w.png", "https://i.ibb.co/VqkvYLW/w2.png", "https://i.ibb.co/qkXNdcp/w7.png", "https://i.ibb.co/YRs6L0y/w0.png"], [6,7,8,9,11,12,13,14]),
            new enemyInfo("Illfang", "Kobold Lord", "the Kobold Lord", true, "360-360", "130-130", "75-75", ["https://i.ibb.co/GH0gJxG/il.png"], [10]),
            new enemyInfo("Skeleton Wolf", "Skeleton Wolf", "a Skeleton Wolf", false, "320-420", "130-150", "60-100", ["https://i.ibb.co/Stp0dCT/sw.png"], [11,12,13,14]),
            new enemyInfo("Death Spot", "Werewolf", "a Werewolf", true, "500-500", "150-150", "101-101", ["https://i.ibb.co/6JRGgSK/spot.png"], [15]),
            new enemyInfo("Silverwing", "Silverwing", "a Silverwing", false, "550-730", "120-180", "110-170", ["https://i.ibb.co/X2fz8cc/silverwing.png"], [16,17,18,19,21,22,23,24]),
            new enemyInfo("Lizardman", "Lizardman", "a Lizardman", false, "480-640", "140-210", "105-160", ["https://i.ibb.co/GnXmw3y/l3.png", "https://i.ibb.co/1Kym5M8/l2.png", "https://i.ibb.co/7Xk3LYz/l.png", "https://i.ibb.co/pvg2jGn/li.png", "https://i.ibb.co/d4sYN2k/L1.png"], [16,17,18,19,21,22,23,24]),
            new enemyInfo("Geld", "Orc Lord", "the Orc Lord", true, "620-620", "180-180", "150-150", ["https://i.ibb.co/2q7VXkT/rc.png"], [20]),
            new enemyInfo("Serpent", "Serpent", "a Serpent", false, "580-650", "160-205", "130-155", ["https://i.ibb.co/jGFxTrZ/s.png"], [21,22,23,24]),
            new enemyInfo("Beru", "Ant King", "the Ant King", true, "640-640", "200-200", "180-180", ["https://i.ibb.co/2q7VXkT/rc.png"], [25]),
            new enemyInfo("Kaonashi", "Ghost", "a Ghost", false, "800-900", "150-160", "160-180", ["https://i.ibb.co/ZNRSPXs/gh.png"], [21,22,23,24,26,27,28,29]),
            new enemyInfo("Zenberu", "Dragon Tusk", "a Dragon Tusk", true, "980-980", "185-185", "125-125", ["https://i.ibb.co/yV3YW6B/image.png"], [30]),
            new enemyInfo("Sky Dragon", "Sky Dragon", "a Sky Dragon", false, "920-1200", "170-210", "200-200", ["https://i.ibb.co/XDgVQmT/sd.png", "https://i.ibb.co/FJbBpc6/sd2.png"], [31,32,33,34,36,37,38,39]),
            new enemyInfo("Gleam Eyes", "Minotaur", "a Minotaur", true, "1130-1130", "200-200", "150-150", ["https://i.ibb.co/VL0Kxmz/ge.png"], [35]),
            new enemyInfo("Bicorn", "Bicorn", "a Bicorn", false, "1080-1340", "180-240", "170-195", ["https://i.ibb.co/hLwMYSn/bc.png"], [36,37,38,39,41,42,43,44]),
            new enemyInfo("Entoma", "Arachnoid", "an Arachnoid", true, "1260-1260", "230-230", "160-160", ["https://i.ibb.co/XkFT4pM/e.png"], [40]),
            new enemyInfo("CZ2128 Delta", "Automaton", "an Automaton", true, "1370-1370", "260-260", "130-130", ["https://i.ibb.co/FsSx42T/cz.png"], [45]),
            new enemyInfo("Earth Golem", "Golem", "an Earth Golem", false, "1320-1540", "170-240", "250-280", ["https://i.ibb.co/C2fHr5M/gl.png"], [41,42,43,44,46,47,48,49]),
            new enemyInfo("Narberal Gamma", "Doppelgänger", "a Doppelgänger", true, "1520-1520", "280-280", "210-210", ["https://i.ibb.co/f1WjFRH/g.png"], [50]),
            new enemyInfo("Ice Golem", "Golem", "an Ice Golem", false, "1430-1580", "220-270", "270-285", ["https://i.ibb.co/bN7RBX3/igg.png"], [46,47,48,49,51,52,53,54]),
            new enemyInfo("Lupusregina Beta", "Werewolf", "a Werewolf", true, "1590-1590", "310-310", "250-250", ["https://i.ibb.co/F5Brx59/beta.png"], [55]),
            new enemyInfo("Fire Golem", "Golem", "a Fire Golem", false, "1510-1630", "270-340", "280-335", ["https://i.ibb.co/kVLJGgH/fg.png"], [51,52,53,54,56,57,58,59]),
            new enemyInfo("Cocytus", "Vermin Lord", "a Vermin Lord", true, "1200-1200", "375-375", "400-400", ["https://i.ibb.co/Z6JGcQ4/c.png"], [60]),
            new enemyInfo("Wight", "Wight", "a Wight", false, "1100-1800", "360-440", "380-440", ["https://i.ibb.co/6yDHvNw/wk.png"], [61,62,63,64,66,67,68,69,71,72,73,74]),
            new enemyInfo("Demiurge", "Arch Devil", "an Arch Devil", true, "1420-1420", "400-400", "360-360", ["https://i.ibb.co/1Z4Rb2N/d.png"], [65]),
            new enemyInfo("Death Dragon", "Death Dragon", "a Death Dragon", false, "1770-1980", "380-430", "260-290", ["https://i.ibb.co/yY5xhzB/d.png"], [66,67,68,69,71,72,73,74]),
            new enemyInfo("Albert", "Death Paladin", "a Death Paladin", true, "1400-1400", "420-420", "380-380", ["https://i.ibb.co/tHkgdwJ/albert.png"], [70]),
            new enemyInfo("Adalman", "Wight King", "the Wight King", true, "1560-1560", "420-420", "420-420", ["https://i.ibb.co/17mGxbM/a.png"], [75]),
            new enemyInfo("Treant", "Treant", "a Treant", false, "1720-2120", "390-470", "350-380", ["https://i.ibb.co/yn6wcSR/Treant.png"], [76,77,78,79,81,82,83,84]),
            new enemyInfo("Hercules", "Demigod", "a Demigod", true, "2000-2000", "450-450", "430-430", ["https://i.ibb.co/PTLf68Z/h.png"], [80]),
            new enemyInfo("Brain Eater", "Brain Eater", "a Brain Eater", false, "2100-2400", "430-480", "400-450", ["https://i.ibb.co/zXTZkW7/brain-eater.jpg"], [81,82,83,84,85,86,87,88,89]),
            new enemyInfo("Enkidu", "Homunculus", "a Homunculus", true, "2210-2210", "480-480", "450-450", ["https://i.ibb.co/qgLmpzb/hc.png"], [85]),
            new enemyInfo("Death Knight", "Death Knight", "a Death Knight", false, "2200-2500", "440-470", "410-460", ["https://i.ibb.co/JvSdTvr/death-knight.png"], [81,82,83,84,85,86,87,88,89]),
            new enemyInfo("Albedo", "Succubus", "a Succubus", true, "2560-2560", "500-500", "480-480", ["https://i.ibb.co/XDZpgFd/ab.png"], [90]),
            new enemyInfo("Gilgamesh", "Demigod", "a Demigod", true, "2830-2830", "540-540", "510-510", ["https://i.ibb.co/8zQhj3V/k.png"], [91]),
            new enemyInfo("King Hassan", "Servant", "a Servant", true, "3170-3170", "560-560", "520-520", ["https://i.ibb.co/DtTZsRv/ha.png"], [92]),
            new enemyInfo("Diablo", "Primordial Demon", "a Primordial Demon", true, "3333-3333", "580-580", "540-540", ["https://i.ibb.co/yk3P2f9/noir.png"], [93]),
            new enemyInfo("Raphael", "Demon Slime", "the Voice of the World", true, "3750-3750", "600-600", "560-560", ["https://i.ibb.co/dgwF05f/R.png"], [94]),
            new enemyInfo("Guy Crimson", "Primordial Demon", "a Demon Lord", true, "4200-4200", "666-666", "666-666", ["https://i.ibb.co/y4Rjv3L/guy.png"], [95]),
            new enemyInfo("Igneel", "Dragon", "a Fire Dragon", true, "4600-4600", "680-680", "600-600", ["https://i.ibb.co/6Bck42F/igneel.png"], [96]),
            new enemyInfo("Acnologia", "Dragon", "the Dragon King", true, "4960-4960", "720-720", "650-650", ["https://i.ibb.co/qNXB6sm/acnnologia.png"], [97]),
            new enemyInfo("Vaision", "Dragon", "a Dragon Lord", true, "5780-5780", "900-900", "690-690", ["https://i.ibb.co/DDVwf6b/pdl.png"], [98]),
            new enemyInfo("Ainz Ooal Gown", "Overlord", "the Overlord", true, "8960-8960", "1650-1650", "750-750", ["https://i.ibb.co/9NZgKGJ/aog.png"], [99]),
            new enemyInfo("Veldora", "True Dragon", "a True Dragon", true, "20000-20000", "5000-5000", "1000-1000", ["https://i.ibb.co/DrSCF5S/veldora.png"], [100]),
        ];




        // /* /* Commands */ */ //

        // Profile
        if (cmd === "pr" || cmd === "profile") {

            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();

            if (!inventory[user.id + message.guild.id] || inventory[user.id + message.guild.id][0] === undefined) {
                if (user.id === message.author.id) return message.channel.send("You don't have any characters");
                return message.channel.send(`${user.username} has no characters`);
            };
            
            const uniq = inventory[user.id + message.guild.id].reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]]);
            };

            const collected = uniq.length;
            const collectedF = chars.filter((e) => e.gender === "F").length;
            const collectedM = chars.filter((e) => e.gender === "M").length;
            const collRatio = Math.floor((collected / characters.length)*100);
            const collRatioF = Math.floor((collectedF / charactersF.length)*100);
            const collRatioM = Math.floor((collectedM / charactersM.length)*100);
            const collSS = chars.filter((e) => e.rarity === "SS").length;
            const collS = chars.filter((e) => e.rarity === "S").length;
            const collA = chars.filter((e) => e.rarity === "A").length;
            const collB = chars.filter((e) => e.rarity === "B").length;
            const collC = chars.filter((e) => e.rarity === "C").length;
            const collD = chars.filter((e) => e.rarity === "D").length;

            // Level
            let xpr = xp[user.id + message.guild.id];
            let level = 0;
            for (i=1; xpr >= 0; i++) {
                xpr -= Math.floor(5*Math.log(i)*Math.log(i)*Math.log(i)*Math.log(i) + 30);
                level++;
            };
            // Coins
            let coin = 0;
            if (coins[user.id + message.guild.id]) coin = coins[user.id + message.guild.id];

            let aniCompleted = 0;
            for (i=0; i < auniq.length; i++) {
                let animeCheck = characters.filter((e) => e.anime === auniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === auniq[i]).length;
                if (animeCheck === invCheck) {
                    aniCompleted++;
                };
            };
            // Floor
            var dungeonFloors = JSON.parse(fs.readFileSync('Storage/dungeonFloors.json', 'utf8'));
            let floor = 1;
            if (dungeonFloors[user.id + message.guild.id]) {
                if (dungeonFloors[user.id + message.guild.id][Object.keys(dungeonFloors[user.id + message.guild.id])[Object.keys(dungeonFloors[user.id + message.guild.id]).length-1]] >= 20 && Object.keys(dungeonFloors[user.id + message.guild.id])[Object.keys(dungeonFloors[user.id + message.guild.id]).length-1] !== 100) dungeonFloors[user.id + message.guild.id][1+parseInt(Object.keys(dungeonFloors[user.id + message.guild.id])[Object.keys(dungeonFloors[user.id + message.guild.id]).length-1])] = 0;
                if (dungeonFloors[user.id + message.guild.id][Object.keys(dungeonFloors[user.id + message.guild.id])[Object.keys(dungeonFloors[user.id + message.guild.id]).length-1]] >= 1 && Object.keys(dungeonFloors[user.id + message.guild.id])[Object.keys(dungeonFloors[user.id + message.guild.id]).length-1] % 5 == 0 && Object.keys(dungeonFloors[user.id + message.guild.id])[Object.keys(dungeonFloors[user.id + message.guild.id]).length-1] !== 100) dungeonFloors[user.id + message.guild.id][1+parseInt(Object.keys(dungeonFloors[user.id + message.guild.id])[Object.keys(dungeonFloors[user.id + message.guild.id]).length-1])] = 0;
                floor = parseInt(Object.keys(dungeonFloors[user.id + message.guild.id])[Object.keys(dungeonFloors[user.id + message.guild.id]).length-1])
                fs.writeFile('Storage/dungeonFloors.json', JSON.stringify(dungeonFloors), (err) => {
                    if (err) console.error(err);
                });
            };

            // Arena
            let aWins = 0;
            let aLosses = 0;
            if (arenaResults[user.id + message.guild.id]) aWins = arenaResults[user.id + message.guild.id].wins, aLosses = arenaResults[user.id + message.guild.id].losses;

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) {
                thumbnail = characters[favChar[user.id + message.guild.id]].image;
                if (premium[user.id] > 3) if (customSettings[user.id + message.guild.id] && customSettings[user.id + message.guild.id].cimg[favChar[user.id + message.guild.id]]) thumbnail = customSettings[user.id + message.guild.id].cimg[favChar[user.id + message.guild.id]];
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s profile`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("**Level**: " + level + ` (${prefix}level) ㅤㅤ **Coins**: ` + coin + "<:coins:872926669055356939>\n**Collected**: " + collected + "/" + characters.length + " (" + collectedF + "/" + charactersF.length + "<:female:870076411430436914> " + collectedM + "/" + charactersM.length + "<:male:870076394649047080>)\n**Completion**: " + collRatio + "% (" + collRatioF + "%<:female:870076411430436914> " + collRatioM + "%<:male:870076394649047080>)\n**Anime Completed**: " + aniCompleted + "/" + auniq.length + `\n**Dungeon**: Floor ${floor} ㅤ **Arena**: ${aWins} wins, ${aLosses} losses`)
            .setThumbnail(thumbnail)
            .addFields(
                { name: 'Rarity', value: "<:SSTier:869316489931546644> **Tier**: " + `${collSS}/${charactersSS.length}` + "\n<:ATier:869316558013464627> **Tier**: " + `${collA}/${charactersA.length}` + "\n<:CTier:869316602858991657> **Tier**: " + `${collC}/${charactersC.length}`, inline: true },
                { name: '_ _', value: "<:STier:869316518675095552> **Tier**: " + `${collS}/${charactersS.length}` + "\n<:BTier:869316586803179571> **Tier**: " + `${collB}/${charactersB.length}` + "\n<:DTier:869316616071032843> **Tier**: " + `${collD}/${charactersD.length}`, inline: true },
            )
            message.channel.send(Embed);
            return;
        };

        // Change Image
        if (cmd === "changeimage" || cmd === "changeimg") {

            if (!(premium[message.author.id] > 2)) return message.channel.send("This is a `" + prefix + "premium` feature to change the image of a character. If you're enjoying the bot we would appreciate your help <:RaphiSmile:868998036645380197>\nIf you're having any issues, you can ask us on our `" + prefix + "support` Server.");
            if (!args[0]) return message.channel.send("Change a characters image!\nUsage: `" + prefix + "changeimg <character>, <image link>`\n\nSome important things to note:\n> ‧ The image has to be uploaded to either imgur.com or imgbb.com. You can upload to both sites without having an account.\n> ‧ The width to height ratio should be 9:14 (recommended: 225x350px)\n> ‧ The image should not contain any gore or nudity\n> ‧ The character in question should be visible on the image\n> ‧ It should be of decent quality, at least\n> ‧ Every image gets checked by our staff, if it violates any of the above rules it can be removed")
            if (!message.content.includes(",")) return message.channel.send("Please provide a characters name and URL to an image separated by a comma (,)\nUsage: `" + prefix + "changeimg <character>, <image link>`\n\nSome important things to note:\n> ‧ The image has to be uploaded to either imgur.com or imgbb.com. You can upload to both sites without having an account.\n> ‧ The width to height ratio should be 9:14 (recommended: 225x350px)\n> ‧ The image should not contain any gore or nudity\n> ‧ The character in question should be visible on the image\n> ‧ It should be of decent quality, at least\n> ‧ Every image gets checked by our staff, if it violates any of the above rules it can be removed");

            let imgurl = message.content.split(",")[1].replace(/\s/g, '');

            args = message.content.split(",")[0].split(" ");
            args = args.filter((e) => e != "");
            args.shift();

            let fArray = search(args.join(" "));
            if (!fArray.name) return;
            if (!inventory[message.author.id + message.guild.id].includes(fArray.id)) return message.channel.send(`You don't have a copy of ${fArray.name}`);

            customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

            if (!customSettings[message.author.id + message.guild.id]) customSettings[message.author.id + message.guild.id] = { cimg:{}, aimg:{} };
            fs.writeFile('Storage/customSettings.json', JSON.stringify(customSettings), (err) => {
                if (err) console.error(err);
            });
            if (imgurl.toLowerCase() === "reset") {
                if (customSettings[message.author.id + message.guild.id].cimg[fArray.id]) {
                    delete customSettings[message.author.id + message.guild.id].cimg[fArray.id];
                    setTimeout(() => {
                        fs.writeFile('Storage/customSettings.json', JSON.stringify(customSettings), (err) => {
                            if (err) console.error(err);
                        });
                    }, 100);
                    return message.channel.send(`Removed **${fArray.name}** image`);
                } else {
                    return message.channel.send(`Your **${fArray.name}** doesn't have a custom image`);
                };
            };
            if (!(imgurl.startsWith("https://i.ibb.co/") || imgurl.startsWith("https://i.imgur.com/") || imgurl.startsWith("https://imgur.com/"))) return message.channel.send("Please use an URL from imgur.com or imgbb.com");
            if (!(imgurl.endsWith(".png") || imgurl.endsWith(".jpg") || imgurl.endsWith(".jpeg") || imgurl.endsWith(".gif"))) return message.channel.send("Please use an URL from imgur.com or imgbb.com that end with .png, .jpg, .jpeg or .gif");
            
            let uploadLimit = 0;
            let ulpc = 0; // upload limit per character
            let hasGif = false;
            switch (premium[message.author.id]) {
                case "4": uploadLimit = 5; break;
                case "5": uploadLimit = 10; hasGif = true; break;
                case "6": uploadLimit = 30; ulpc = 5; hasGif = true; break;
                case "7": uploadLimit = 100000000; ulpc = 30; hasGif = true; break;
                default : false; break;
            };

            if (Object.keys(customSettings[message.author.id + message.guild.id].cimg).length >= uploadLimit) return message.channel.send(`You have reached your upload limit of ${uploadLimit} characters. You can reset the image of a character with \`${prefix}changeimg <char>, reset\``);
            if (imgurl.endsWith(".gif") && !hasGif) return message.channel.send("You can't use gifs");
            
            async function getImg() {
                let dimensions = await getDimensions(imgurl);
                if (!dimensions) return message.channel.send("Invalid image link. Please try another one")
                if (!((dimensions.width % 9 == 0 && dimensions.height % 14 == 0) && (dimensions.width/9 == dimensions.height/14))) return message.channel.send(`Your image should have a width to height ratio of 9:14 (recommended: 225x350px)\nCurrent image width x height = ${dimensions.width}x${dimensions.height}`);
                setCustomImage();
            };

            function setCustomImage() {
                customSettings[message.author.id + message.guild.id].cimg[fArray.id] = imgurl;
                message.channel.send(`**${fArray.name}**'s image was changed successfully`);
                fs.writeFile('Storage/customSettings.json', JSON.stringify(customSettings), (err) => {
                    if (err) console.error(err);
                });
                const channel = client.channels.cache.find(channel => channel.id === "934117922039791627");
                const Embed = new MessageEmbed()
                .setTitle(fArray.name)
                .setColor(0xbbffff)
                .setImage(imgurl)
                .setThumbnail(fArray.image)
                .setDescription(`Server: ${message.guild.name}\nType \`!remove <img link>\` to remove it`)
                .setFooter(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                channel.send(Embed);
            };

            getImg();
        };

        // Favourite Character
        if (cmd === "fav" || cmd === "favourite" || cmd === "favorite") {

            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters");
            if (!args[0]) return message.channel.send("Please provide a name");

            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                if (inventory[message.author.id + message.guild.id].some((a) => a === fastCheck[0].id)) {
                    favChar[message.author.id + message.guild.id] = fastCheck[0].id;
                    fs.writeFile('Storage/favChar.json', JSON.stringify(favChar), (err) => {
                        if (err) console.error(err);
                    });
                    let img = fastCheck[0].image;
                    if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[fastCheck[0].id]) img = customSettings[message.author.id + message.guild.id].cimg[fastCheck[0].id];        
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setDescription(`Battle character set to \n**${fastCheck[0].name}**`)
                    .setImage(img)
                    message.channel.send(Embed);
                } else {
                    message.channel.send("You don't own this card");
                };
            } else {
                message.channel.send("No match found. Please use the characters full name");
            };
        };

        // Battle Char
        if (cmd === "bc" || cmd ===  "select" || cmd === "battlechar" || cmd === "battlecharacter") {

            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters");
            if (!args[0]) return message.channel.send("Please provide a name");

            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                if (inventory[message.author.id + message.guild.id].some((a) => a === fastCheck[0].id)) {
                    battleChar[message.author.id + message.guild.id] = fastCheck[0].id;
                    fs.writeFile('Storage/battleChar.json', JSON.stringify(battleChar), (err) => {
                        if (err) console.error(err);
                    });
                    let img = fastCheck[0].image;
                    if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[fastCheck[0].id]) img = customSettings[message.author.id + message.guild.id].cimg[fastCheck[0].id];        
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setDescription(`Battle character set to \n**${fastCheck[0].name}**`)
                    .setImage(img)
                    message.channel.send(Embed);
                } else {
                    message.channel.send("You don't own this card");
                };
            } else {
                message.channel.send("No match found. Please use the characters full name");
            };
        };

        // Pity
        if (cmd === "pity") {
            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();
            
            if (!pity[user.id + message.guild.id]) {
                if (user.id === message.author.id) return message.channel.send("You haven't started with the game yet. Use `" + prefix + "p` to start collecting characters.");
                return message.channel.send(`${user.username} hasn't started with the game yet.`);
            };

            const uniq = inventory[user.id + message.guild.id].reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) thumbnail = characters[favChar[user.id + message.guild.id]].image;

            let sPit = 80;
            let ssPit = 210;
            if (premium[user.id]) {
                switch (premium[user.id]) {
                    case "1": sPit = 70, ssPit = 180; break;
                    case "2": sPit = 65, ssPit = 170; break;
                    case "3": sPit = 60, ssPit = 160; break;
                    case "4": sPit = 60, ssPit = 160; break;
                    case "5": sPit = 50, ssPit = 150; break;
                    case "6": sPit = 50, ssPit = 150; break;
                    default : false; break;
                };
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s profile`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription(`Since last <:STier:869316518675095552> pull: **${pity[user.id + message.guild.id].lastS}**/${sPit}\nSince last <:SSTier:869316489931546644> pull: **${pity[user.id + message.guild.id].lastSS}**/${ssPit}\n\nYou have pulled a total of **${pity[user.id + message.guild.id].pullsTotal}** times!`)
            .setThumbnail(thumbnail)
            message.channel.send(Embed);
            return;
        };

        // Pull
        if (cmd === "p" || cmd === "pull") {

            var pullCount = JSON.parse(fs.readFileSync('Storage/pullCount.json', 'utf8'));
            if (!inventory[message.author.id + message.guild.id]) inventory[message.author.id + message.guild.id] = [];
            if (!pity[message.author.id + message.guild.id]) pity[message.author.id + message.guild.id] = { pullsTotal: 0, lastSS: 0, lastS: 0, };
            if (!ref[message.author.id + message.guild.id]) ref[message.author.id + message.guild.id] = {};
            if (!pullCount[message.author.id + message.guild.id] && pullCount[message.author.id + message.guild.id] !== 0) pullCount[message.author.id + message.guild.id] = 0;

            // Check if vote
            let canVote = `\nYou can **${prefix}vote** now! To reset your pull counter (use \`!rp\` after the vote)`;
            var lastVote = JSON.parse(fs.readFileSync('Storage/lastVote.json', 'utf8'));
            if (lastVote[message.author.id] && ((new Date().getTime() - lastVote[message.author.id]) < 12*60*60*1000)) canVote = "";

            let pullLimit = 6;
            if (xp[message.author.id + message.guild.id] > 659) false; // pullLimit++;
            if (xp[message.author.id + message.guild.id] > 3520) false; // pullLimit++;
            if (premium[message.author.id]) {
                switch (premium[message.author.id]) {
                    case "1": pullLimit += 2; break;
                    case "2": pullLimit += 3; break;
                    case "3": pullLimit += 4; break;
                    case "4": pullLimit += 4; break;
                    case "5": pullLimit += 4; break;
                    case "6": pullLimit += 6; break;
                    default : false; break;
                };
            };

            // Change %2 === 0 to 1 during winter ?
            if (pullCount[message.author.id + message.guild.id] >= pullLimit) {
                let time = new Date();
                let nextPull = time.getHours() % 2 === 0 ? Math.ceil(time/3600000)*3600000 + 3600000 : Math.ceil(time/3600000)*3600000;
                let timeLeft = nextPull - time;
                if (timeLeft > 7200000 - 60000) return message.channel.send(`You've reached your pull limit, please wait **2**h` + canVote);
                return message.channel.send(`You've reached your pull limit, please wait ${timeLeft > 3600000 ? "**1**h " : ""}**${timeLeft > 3600000 ? Math.ceil((timeLeft - 3600000)/60000) : Math.ceil((timeLeft)/60000)}** min` + canVote);
            };
            pullCount[message.author.id + message.guild.id]++;

            let ranRar = Math.floor(Math.random() * 1000); // 0-999

            pity[message.author.id + message.guild.id].pullsTotal++;
            if (ranRar > 2) pity[message.author.id + message.guild.id].lastSS++;
            if (ranRar > 20) pity[message.author.id + message.guild.id].lastS++;

            let sPit = 80;
            let ssPit = 210;
            if (premium[message.author.id]) {
                switch (premium[message.author.id]) {
                    case "1": sPit = 70, ssPit = 180; break;
                    case "2": sPit = 65, ssPit = 170; break;
                    case "3": sPit = 60, ssPit = 160; break;
                    case "4": sPit = 60, ssPit = 160; break;
                    case "5": sPit = 50, ssPit = 150; break;
                    case "6": sPit = 50, ssPit = 150; break;
                    default : false; break;
                };
            };

            if (pity[message.author.id + message.guild.id].lastS >= sPit && pity[message.author.id + message.guild.id].lastSS >= ssPit) { ranRar = 1; pity[message.author.id + message.guild.id].lastS--; pity[message.author.id + message.guild.id].lastSS = 0 };
            if (pity[message.author.id + message.guild.id].lastS >= sPit) { ranRar = 10; pity[message.author.id + message.guild.id].lastS = 0 };
            if (pity[message.author.id + message.guild.id].lastSS >= ssPit) { ranRar = 1; pity[message.author.id + message.guild.id].lastSS = 0 };

            const ranXp = Math.ceil(Math.random() * 10); // 1-10
            if (!xp[message.author.id + message.guild.id]) xp[message.author.id + message.guild.id] = 0;
            xp[message.author.id + message.guild.id] += ranXp;
            if (ranRar < 21 && ranRar > 2) xp[message.author.id + message.guild.id] += ranXp;
            if (ranRar < 3) xp[message.author.id + message.guild.id] += 20;
            fs.writeFile('Storage/xp.json', JSON.stringify(xp), (err) => {
                if (err) console.error(err);
            });

            if (ranRar < 3) {
                const ssClass = characters.filter((e) => e.rarity === "SS");
                const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                pity[message.author.id + message.guild.id].lastSS = 0;
                if (!ref[message.author.id + message.guild.id][ssClass[ssNum].id]) ref[message.author.id + message.guild.id][ssClass[ssNum].id] = 0;
                ref[message.author.id + message.guild.id][ssClass[ssNum].id]++;
                displayPull(ssClass[ssNum], pullLimit);
            } else if (ranRar < 21) {
                const sClass = characters.filter((e) => e.rarity === "S");
                const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                pity[message.author.id + message.guild.id].lastS = 0;
                if (!ref[message.author.id + message.guild.id][sClass[sNum].id]) ref[message.author.id + message.guild.id][sClass[sNum].id] = 0;
                ref[message.author.id + message.guild.id][sClass[sNum].id]++;
                displayPull(sClass[sNum], pullLimit);
            } else if (ranRar < 63) {
                const aClass = characters.filter((e) => e.rarity === "A");
                const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                if (!ref[message.author.id + message.guild.id][aClass[aNum].id]) ref[message.author.id + message.guild.id][aClass[aNum].id] = 0;
                ref[message.author.id + message.guild.id][aClass[aNum].id]++;
                displayPull(aClass[aNum], pullLimit);
            } else if (ranRar < 189) {
                const bClass = characters.filter((e) => e.rarity === "B");
                const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                if (!ref[message.author.id + message.guild.id][bClass[bNum].id]) ref[message.author.id + message.guild.id][bClass[bNum].id] = 0;
                ref[message.author.id + message.guild.id][bClass[bNum].id]++;
                displayPull(bClass[bNum], pullLimit);
            } else if (ranRar < 442) {
                const cClass = characters.filter((e) => e.rarity === "C");
                const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                if (!ref[message.author.id + message.guild.id][cClass[cNum].id]) ref[message.author.id + message.guild.id][cClass[cNum].id] = 0;
                ref[message.author.id + message.guild.id][cClass[cNum].id]++;
                displayPull(cClass[cNum], pullLimit);
            } else if (ranRar < 1000) {
                const dClass = characters.filter((e) => e.rarity === "D");
                const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                if (!ref[message.author.id + message.guild.id][dClass[dNum].id]) ref[message.author.id + message.guild.id][dClass[dNum].id] = 0;
                ref[message.author.id + message.guild.id][dClass[dNum].id]++;
                displayPull(dClass[dNum], pullLimit);
            };

            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/pullCount.json', JSON.stringify(pullCount), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/pity.json', JSON.stringify(pity), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/ref.json', JSON.stringify(ref), (err) => {
                if (err) console.error(err);
            });
        };

        // Reset pulls
        if (cmd === "rp") {
            var pullResets = JSON.parse(fs.readFileSync('Storage/pullResets.json', 'utf8'));
            if (!pullResets[message.author.id]) return message.channel.send(`You don't have any pull resets. You can obtain them by voting (**${prefix}vote**)`);
            var pullCount = JSON.parse(fs.readFileSync('Storage/pullCount.json', 'utf8'));
            pullResets[message.author.id]--;
            pullCount[message.author.id + message.guild.id] = 0;
            message.channel.send("Resettet your pull counter. You can pull again!")
            fs.writeFile('Storage/pullResets.json', JSON.stringify(pullResets), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/pullCount.json', JSON.stringify(pullCount), (err) => {
                if (err) console.error(err);
            });
        };

        // Shop
        if (cmd === "shop") {
            let state = 0;

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Shop")
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .setDescription("Card game shop to buy character packs.\nUse `" + prefix + "buy <id>` to buy one")
            .addField("#1 | Character Pack - 300<:coins:872926669055356939>", "Get a random character")
            .addField("#2 | Waifu Pack- 300<:coins:872926669055356939>", "Get a random waifu")
            .addField("#3 | Husbando Pack - 300<:coins:872926669055356939>", "Get a random husbando")
            .addField("#4 | Character Bundle - 800<:coins:872926669055356939>", "Get 3 characters for a discount")
            .addField("#5 | Rare Pack - 500<:coins:872926669055356939>", "Get at least a <:CTier:869316602858991657>-Tier character")
            .addField("#6 | Morpheus Blessing - 2000<:coins:872926669055356939>", "Get a guaranteed new character\n(_<:SSTier:869316489931546644>-Tier are excluded from this pack_)")
            .setFooter(`Balance: ${coins[message.author.id + message.guild.id]} coins`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")

            const EmbedS = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Shop")
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .setDescription("Card game shop to buy character packs.\nUse `" + prefix + "buy <id>` to buy one")
            .addField("#1 | Character Pack - 5x<:s_shard:917202925514817566>", "Get a random character")
            .addField("#2 | Waifu Pack- 5x<:s_shard:917202925514817566>", "Get a random waifu")
            .addField("#3 | Husbando Pack - 5x<:s_shard:917202925514817566>", "Get a random husbando")
            .addField("#4 | Character Bundle - 12x<:s_shard:917202925514817566>", "Get 3 characters for a discount")
            .addField("#5 | Rare Pack - 1x<:ss_shard:917203009543503892>", "Get at least a <:CTier:869316602858991657>-Tier character")
            .addField("#6 | Morpheus Blessing - 4x<:ss_shard:917203009543503892>", "Get a guaranteed new character\n(_<:SSTier:869316489931546644>-Tier are excluded from this pack_)")
            .setFooter(`Balance: ${coins[message.author.id + message.guild.id]} coins`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            
            message.channel.send(Embed).then(msg => {
                msg.react('917203009543503892').then(r => {
                    const shardFilter = (reaction, user) => reaction.emoji.id === "917203009543503892" && user.id === message.author.id;
                    const coinsFilter = (reaction, user) => reaction.emoji.id === "872926669055356939" && user.id === message.author.id;
    
                    const shard = msg.createReactionCollector(shardFilter, {time: 60000});
                    const coins = msg.createReactionCollector(coinsFilter, {time: 60000});
    
                    shard.on('collect', r => {
                        if (state === 0) {
                            state++;
                            msg.edit(EmbedS);
                            msg.reactions.resolve("917203009543503892").users.remove(message.author);
                            msg.reactions.resolve("917203009543503892").users.remove();
                            msg.react('872926669055356939');
                        };
                    });
    
                    coins.on('collect', r => {
                        if (state === 1) {
                            state--;
                            msg.edit(Embed);
                            msg.reactions.resolve("872926669055356939").users.remove(message.author);
                            msg.reactions.resolve("872926669055356939").users.remove();
                            msg.react('917203009543503892')
                        };
                    });
                });

            });
        };

        // Buy
        if (cmd === "buy") {
            if (!args[0]) return message.channel.send("Please specify what you want to buy\nUsage: `" + prefix + "buy <id>`")
            if (isNaN(args[0])) return message.channel.send("Please use the ID of the item you want to buy")
            if (parseInt(args[0]) < 0 || parseInt(args[0]) > 6) return message.channel.send(`**${args[0]}** is not a valid ID. Please see \`${prefix}shop\``)
            
            if (!inventory[message.author.id + message.guild.id]) inventory[message.author.id + message.guild.id] = [];
            
            const ranRar = Math.floor(Math.random() * 1000); // 0-999
            const ranRar2 = Math.floor(Math.random() * 1000); // 0-999
            const ranRar3 = Math.floor(Math.random() * 1000); // 0-999

            if (args[0] === "0") {
                return message.channel.send(`**${args[0]}** is not a valid ID. Please see \`${prefix}shop\``)
            } else if (args[0] === "1") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 300) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 300;

                if (ranRar < 3) {
                    const ssClass = characters.filter((e) => e.rarity === "SS");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                    displayMy(ssClass[ssNum]);
                } else if (ranRar < 21) {
                    const sClass = characters.filter((e) => e.rarity === "S");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                    displayMy(sClass[sNum]);
                } else if (ranRar < 63) {
                    const aClass = characters.filter((e) => e.rarity === "A");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    displayMy(aClass[aNum]);
                } else if (ranRar < 189) {
                    const bClass = characters.filter((e) => e.rarity === "B");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    displayMy(bClass[bNum]);
                } else if (ranRar < 442) {
                    const cClass = characters.filter((e) => e.rarity === "C");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    displayMy(cClass[cNum]);
                } else if (ranRar < 1000) {
                    const dClass = characters.filter((e) => e.rarity === "D");
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                    displayMy(dClass[dNum]);
                };
            } else if (args[0] === "2") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 300) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 300;

                if (ranRar < 3) {
                    const ssClass = characters.filter((e) => e.rarity === "SS" && e.gender === "F");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                    displayMy(ssClass[ssNum]);
                } else if (ranRar < 21) {
                    const sClass = characters.filter((e) => e.rarity === "S" && e.gender === "F");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                    displayMy(sClass[sNum]);
                } else if (ranRar < 63) {
                    const aClass = characters.filter((e) => e.rarity === "A" && e.gender === "F");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    displayMy(aClass[aNum]);
                } else if (ranRar < 189) {
                    const bClass = characters.filter((e) => e.rarity === "B" && e.gender === "F");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    displayMy(bClass[bNum]);
                } else if (ranRar < 442) {
                    const cClass = characters.filter((e) => e.rarity === "C" && e.gender === "F");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    displayMy(cClass[cNum]);
                } else if (ranRar < 1000) {
                    const dClass = characters.filter((e) => e.rarity === "D" && e.gender === "F");
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                    displayMy(dClass[dNum]);
                };
            } else if (args[0] === "3") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 300) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 300;

                if (ranRar < 3) {
                    const ssClass = characters.filter((e) => e.rarity === "SS" && e.gender === "M");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                    displayMy(ssClass[ssNum]);
                } else if (ranRar < 21) {
                    const sClass = characters.filter((e) => e.rarity === "S" && e.gender === "M");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                    displayMy(sClass[sNum]);
                } else if (ranRar < 63) {
                    const aClass = characters.filter((e) => e.rarity === "A" && e.gender === "M");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    displayMy(aClass[aNum]);
                } else if (ranRar < 189) {
                    const bClass = characters.filter((e) => e.rarity === "B" && e.gender === "M");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    displayMy(bClass[bNum]);
                } else if (ranRar < 442) {
                    const cClass = characters.filter((e) => e.rarity === "C" && e.gender === "M");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    displayMy(cClass[cNum]);
                } else if (ranRar < 1000) {
                    const dClass = characters.filter((e) => e.rarity === "D" && e.gender === "M");
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                    displayMy(dClass[dNum]);
                };
            } else if (args[0] === "4") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 800) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 800;

                let desc3 = [];
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")

                if (ranRar < 3) {
                    const ssClass = characters.filter((e) => e.rarity === "SS");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    desc3.push(`1. <:SSTier:869316489931546644>-Tier **${ssClass[ssNum].name}**`)
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                } else if (ranRar < 21) {
                    const sClass = characters.filter((e) => e.rarity === "S");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    desc3.push(`1. <:STier:869316518675095552>-Tier **${sClass[sNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                } else if (ranRar < 63) {
                    const aClass = characters.filter((e) => e.rarity === "A");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    desc3.push(`1. <:ATier:869316558013464627>-Tier **${aClass[aNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                } else if (ranRar < 189) {
                    const bClass = characters.filter((e) => e.rarity === "B");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    desc3.push(`1. <:BTier:869316586803179571>-Tier **${bClass[bNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                } else if (ranRar < 442) {
                    const cClass = characters.filter((e) => e.rarity === "C");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    desc3.push(`1. <:CTier:869316602858991657>-Tier **${cClass[cNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                } else if (ranRar < 1000) {
                    const dClass = characters.filter((e) => e.rarity === "D");
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    desc3.push(`1. <:DTier:869316616071032843>-Tier **${dClass[dNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                };

                if (ranRar2 < 3) {
                    const ssClass = characters.filter((e) => e.rarity === "SS");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    desc3.push(`2. <:SSTier:869316489931546644>-Tier **${ssClass[ssNum].name}**`)
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                } else if (ranRar2 < 21) {
                    const sClass = characters.filter((e) => e.rarity === "S");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    desc3.push(`2. <:STier:869316518675095552>-Tier **${sClass[sNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                } else if (ranRar2 < 63) {
                    const aClass = characters.filter((e) => e.rarity === "A");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    desc3.push(`2. <:ATier:869316558013464627>-Tier **${aClass[aNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                } else if (ranRar2 < 189) {
                    const bClass = characters.filter((e) => e.rarity === "B");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    desc3.push(`2. <:BTier:869316586803179571>-Tier **${bClass[bNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                } else if (ranRar2 < 442) {
                    const cClass = characters.filter((e) => e.rarity === "C");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    desc3.push(`2. <:CTier:869316602858991657>-Tier **${cClass[cNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                } else if (ranRar2 < 1000) {
                    const dClass = characters.filter((e) => e.rarity === "D");
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    desc3.push(`2. <:DTier:869316616071032843>-Tier **${dClass[dNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                };

                if (ranRar3 < 3) {
                    const ssClass = characters.filter((e) => e.rarity === "SS");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    desc3.push(`3. <:SSTier:869316489931546644>-Tier **${ssClass[ssNum].name}**`)
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                } else if (ranRar3 < 21) {
                    const sClass = characters.filter((e) => e.rarity === "S");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    desc3.push(`3. <:STier:869316518675095552>-Tier **${sClass[sNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                } else if (ranRar3 < 63) {
                    const aClass = characters.filter((e) => e.rarity === "A");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    desc3.push(`3. <:ATier:869316558013464627>-Tier **${aClass[aNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                } else if (ranRar3 < 189) {
                    const bClass = characters.filter((e) => e.rarity === "B");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    desc3.push(`3. <:BTier:869316586803179571>-Tier **${bClass[bNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                } else if (ranRar3 < 442) {
                    const cClass = characters.filter((e) => e.rarity === "C");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    desc3.push(`3. <:CTier:869316602858991657>-Tier **${cClass[cNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                } else if (ranRar3 < 1000) {
                    const dClass = characters.filter((e) => e.rarity === "D");
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    desc3.push(`3. <:DTier:869316616071032843>-Tier **${dClass[dNum].name}**`);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                };

                Embed.setDescription(desc3).setThumbnail(characters[inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length - 3]].image)
                message.channel.send(Embed);

            } else if (args[0] === "5") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 500) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 500;

                if (ranRar < 4) {
                    const ssClass = characters.filter((e) => e.rarity === "SS");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                    displayMy(ssClass[ssNum]);
                } else if (ranRar < 30) {
                    const sClass = characters.filter((e) => e.rarity === "S");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                    displayMy(sClass[sNum]);
                } else if (ranRar < 103) {
                    const aClass = characters.filter((e) => e.rarity === "A");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    displayMy(aClass[aNum]);
                } else if (ranRar < 412) {
                    const bClass = characters.filter((e) => e.rarity === "B");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    displayMy(bClass[bNum]);
                } else if (ranRar < 1000) {
                    const cClass = characters.filter((e) => e.rarity === "C");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    displayMy(cClass[cNum]);
                };
            } else if (args[0] === "6") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 2000) return message.channel.send("You don't have enough coins");
                let newChars = characters.filter((e) => !inventory[message.author.id + message.guild.id].some((a) => a === e.id) && (e.rarity === "S" || e.rarity === "A" || e.rarity === "B" || e.rarity === "C" || e.rarity === "D"));
                if (newChars.length < 1) return message.channel.send("You already have every character");
                coins[message.author.id + message.guild.id] -= 2000;
                
                if (ranRar < 21) {
                    let rarUp = "S";
                    if (!newChars.some((e) => e.rarity === "S")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "S" || e.rarity === "A")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "S" || e.rarity === "A" || e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "S" || e.rarity === "A" || e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                    const sClass = newChars.filter((e) => e.rarity === rarUp);
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                    displayMy(sClass[sNum]);
                } else if (ranRar < 63) {
                    let rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "A")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B" || e.rarity === "C" || e.rarity === "D")) rarUp = "S";
                    const aClass = newChars.filter((e) => e.rarity === rarUp);
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    displayMy(aClass[aNum]);
                } else if (ranRar < 189) {
                    let rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C" || e.rarity === "D")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C" || e.rarity === "D" || e.rarity === "A")) rarUp = "S";
                    const bClass = newChars.filter((e) => e.rarity === rarUp);
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    displayMy(bClass[bNum]);
                } else if (ranRar < 442) {
                    let rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D" || e.rarity === "B")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D" || e.rarity === "B" || e.rarity === "A")) rarUp = "S";
                    const cClass = newChars.filter((e) => e.rarity === rarUp);
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    displayMy(cClass[cNum]);
                } else if (ranRar < 1000) {
                    let rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "D")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C" || e.rarity === "B")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C" || e.rarity === "B" || e.rarity === "A")) rarUp = "S";
                    const dClass = newChars.filter((e) => e.rarity === rarUp);
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                    displayMy(dClass[dNum]);
                };
            };

            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                if (err) console.error(err);
            });
        };

        // Daily
        if (cmd === "daily") {
            var daily = JSON.parse(fs.readFileSync('Storage/daily.json', 'utf8'));
            if (!daily[message.author.id + message.guild.id]) daily[message.author.id + message.guild.id] = 0;
            if (!coins[message.author.id + message.guild.id]) coins[message.author.id + message.guild.id] = 0;

            if (daily[message.author.id + message.guild.id] < 1) {
                // Level
                let xpr = xp[message.author.id + message.guild.id];
                let level = 0;
                for (i=1; xpr >= 0; i++) {
                    xpr -= Math.floor(5*Math.log(i)*Math.log(i)*Math.log(i)*Math.log(i) + 30);
                    level++;
                };
                dailyCoins = 200 + (Math.floor(level/2)*10);
                if (premium[message.author.id]) {
                    switch (premium[message.author.id]) {
                        case "1": dailyCoins = Math.floor(dailyCoins*1.2); break;
                        case "2": dailyCoins = Math.floor(dailyCoins*1.5); break;
                        case "3": dailyCoins = Math.floor(dailyCoins*2); break;
                        case "4": dailyCoins = Math.floor(dailyCoins*2.5); break;
                        case "5": dailyCoins = Math.floor(dailyCoins*3); break;
                        case "6": dailyCoins = Math.floor(dailyCoins*4); break;
                        default : false; break;
                    };
                };
                coins[message.author.id + message.guild.id] += dailyCoins;
                daily[message.author.id + message.guild.id]++;
                message.channel.send(`Added ${dailyCoins} coins to your balance`);
            } else {
                return message.channel.send("You have already claimed your daily. Come back in " + `${(23-new Date().getHours()) ? `**${23-new Date().getHours()}**h` : ""} **${60-new Date().getMinutes()}**min`);
            };

            fs.writeFile('Storage/daily.json', JSON.stringify(daily), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                if (err) console.error(err);
            });
            return;
        };

        // Weekly
        if (cmd === "weekly") {
            if (!premium[message.author.id]) return message.channel.send("This is a `" + prefix + "premium` feature. If you like the bot we'd appreciate your support <:RaphiSmile:868998036645380197>");
            
            var weekly = JSON.parse(fs.readFileSync('Storage/weekly.json', 'utf8'));
            if (!weekly[message.author.id + message.guild.id]) weekly[message.author.id + message.guild.id] = 0;
            if (!coins[message.author.id + message.guild.id]) coins[message.author.id + message.guild.id] = 0;
            if (!tickets[message.author.id + message.guild.id]) tickets[message.author.id + message.guild.id] = { "dT": 0, "cT": 0, "bT": 0, "aT": 0, "sT": 0, "ssT": 0 };

            if (weekly[message.author.id + message.guild.id] > 0) {
                let s = (7*24*60*60000) - (new Date().getTime() % (7*24*60*60000))
                let dLeft = Math.floor(s/(24*60*60000))
                s -= dLeft * 24*60*60000
                let hLeft = Math.floor(s/(60*60000))
                s -= hLeft * 60*60000
                let mLeft = Math.floor(s/60000)
                return message.channel.send("You have already used your weekly this week. Come back in " + `${dLeft ? `**${dLeft}**d ` : ""}${hLeft ? `**${hLeft}**h ` : ""}**${mLeft+1}**min`);
            };

            let addCoins = 0;
            let sTicket = 0;
            let ssTicket = 0;

            if (premium[message.author.id]) {
                switch (premium[message.author.id]) {
                    case "1": addCoins = 10000; sTicket = 1; break;
                    case "2": addCoins = 20000; sTicket = 3; break;
                    case "3": addCoins = 30000; sTicket = 5; ssTicket = 1; break;
                    case "4": addCoins = 40000; sTicket = 5; ssTicket = 2; break;
                    case "5": addCoins = 50000; sTicket = 6; ssTicket = 3; break;
                    case "6": addCoins = 75000; sTicket = 10; ssTicket = 5; break;
                    default : false; break;
                };
            };

            coins[message.author.id + message.guild.id] += addCoins;
            tickets[message.author.id + message.guild.id].sT += sTicket;
            tickets[message.author.id + message.guild.id].ssT += ssTicket;
            weekly[message.author.id + message.guild.id]++;
            message.channel.send(`Added ${addCoins}<:coins:872926669055356939>${ssTicket == 0 ? ` and ${sTicket}x<:s_ticket:927642487705722890>` : `, ${sTicket}x<:s_ticket:927642487705722890> and ${ssTicket}x<:ss_ticket:927503239396622336>`}`)
        
            fs.writeFile('Storage/weekly.json', JSON.stringify(weekly), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/tickets.json', JSON.stringify(tickets), (err) => {
                if (err) console.error(err);
            });
        };

        // Cooldown
        if (cmd === "cooldown" || cmd === "cd") {
            var pullCount = JSON.parse(fs.readFileSync('Storage/pullCount.json', 'utf8'));
            var dLimit = JSON.parse(fs.readFileSync('Storage/dungeonLimit.json', 'utf8'));
            var dFloors = JSON.parse(fs.readFileSync('Storage/dungeonFloors.json', 'utf8'));
            var daily = JSON.parse(fs.readFileSync('Storage/daily.json', 'utf8'));
            var lastVote = JSON.parse(fs.readFileSync('Storage/lastVote.json', 'utf8'));

            let pull = `Your pulls are ready! => \`${prefix}p\``;
            let dungeon = `Your runs are ready! => \`${prefix}d\``;
            let dailymsg = `Your daily is ready! => \`${prefix}daily\``
            let weekly = `\`locked\` => see \`${prefix}premium\``;
            let vote = `You can vote now! => \`${prefix}vote\``;
            
            // Limits
            let pullLimit = 6;
            dLimit = dLimit[message.author.id + message.guild.id] ? dLimit[message.author.id + message.guild.id] : {"current":0,"normal":0};
            dFloors = dFloors[message.author.id + message.guild.id] ? dFloors[message.author.id + message.guild.id] : {};
            if (!Object.keys(dFloors).length) dFloors["1"] = 0;
            let dunLim = 5;

            if (premium[message.author.id]) {
                // Pulls & Dungeon
                switch (premium[message.author.id]) {
                    case "1": pullLimit += 2; dunLim = 7; break;
                    case "2": pullLimit += 3; dunLim = 8; break;
                    case "3": pullLimit += 4; dunLim = 9; break;
                    case "4": pullLimit += 4; dunLim = 9; break;
                    case "5": pullLimit += 4; dunLim = 9; break;
                    case "6": pullLimit += 6; dunLim = 11; break;
                    default : false; break;
                };
                // Weekly
                if (weekly[message.author.id + message.guild.id] > 0) {
                    let s = (7*24*60*60000) - (new Date().getTime() % (7*24*60*60000))
                    let dLeft = Math.floor(s/(24*60*60000))
                    s -= dLeft * 24*60*60000
                    let hLeft = Math.floor(s/(60*60000))
                    s -= hLeft * 60*60000
                    let mLeft = Math.floor(s/60000)
                    weekly = `${dLeft ? `**${dLeft}**d ` : ""}${hLeft ? `**${hLeft}**h ` : ""}**${mLeft+1}**min left`;
                } else {
                    weekly = `Your weekly is ready! => \`${prefix}weekly\``;
                };
            };

            // Pulls
            if (pullCount[message.author.id + message.guild.id] >= pullLimit) {
                let time = new Date();
                let nextPull = time.getHours() % 2 === 0 ? Math.ceil(time/3600000)*3600000 + 3600000 : Math.ceil(time/3600000)*3600000;
                let timeLeft = nextPull - time;
                pull = (timeLeft > 7200000 - 60000) ? "**2**h left" : `${timeLeft > 3600000 ? "**1**h " : ""}**${timeLeft > 3600000 ? Math.ceil((timeLeft - 3600000)/60000) : Math.ceil((timeLeft)/60000)}** min left`;
            };
            // Dungeon
            if (dLimit["current"] > dunLim && dLimit["normal"] > dunLim) dungeon = `${(7-(new Date().getHours() % 8)) ? `**${7-(new Date().getHours()%8)}**h` : ""} **${60-new Date().getMinutes()}**min left`;
            // Daily
            if (daily[message.author.id + message.guild.id]) dailymsg = `${(23-new Date().getHours()) ? `**${23-new Date().getHours()}**h` : ""} **${60-new Date().getMinutes()}**min left`;
            // Vote
            if (lastVote[message.author.id] && ((new Date().getTime() - lastVote[message.author.id]) < 12*60*60*1000)) {
                let hr = Math.floor(((12*60*60*1000) - (new Date().getTime() - lastVote[message.author.id])) / (60*60*1000));
                let min = Math.floor((((12*60*60*1000) - (new Date().getTime() - lastVote[message.author.id])) % (60*60*1000)) / (60*1000))+1;
                vote = `${hr ? `**${hr}**h ` : ""}${`**${min}**min`} left`;
            };

            return message.channel.send(`**Pulls**: ${pull}\n**Dungeon**: ${dungeon}\n**Daily**: ${dailymsg}\n**Weekly**: ${weekly}\n**Vote**: ${vote}`);
        };

        // Tickets
        if (cmd === "tickets" || cmd === "ticket") {
            if (!tickets[message.author.id + message.guild.id]) return message.channel.send("You don't have any tickets");

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${message.author.username}'s inventory`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("You can use a ticket with  `" + prefix + "use <item name>`")
            .addFields(
                { name: 'Shards', value: `<:ss_ticket:927503239396622336>x${tickets[message.author.id + message.guild.id]["ssT"]}\n<:b_ticket:929420396535615519>x${tickets[message.author.id + message.guild.id]["bT"]}`, inline: true },
                { name: '\u200B', value: `<:s_ticket:927642487705722890>x${tickets[message.author.id + message.guild.id]["sT"]}\n<:c_ticket:929420424645853214>x${tickets[message.author.id + message.guild.id]["cT"]}`, inline: true },
                { name: '\u200B', value: `<:a_ticket:929420377946472508>x${tickets[message.author.id + message.guild.id]["aT"]}\n<:d_ticket:929420447102152714>x${tickets[message.author.id + message.guild.id]["dT"]}`, inline: true },
            )
            .setThumbnail((favChar[message.author.id + message.guild.id] || favChar[message.author.id + message.guild.id] === 0) ? characters[favChar[message.author.id + message.guild.id]].image : characters[inventory[message.author.id + message.guild.id][Math.floor(Math.random() * inventory[message.author.id + message.guild.id].length)]].image)
            message.channel.send(Embed);
        };

        // Use Tickets
        if (cmd === "use") {
            if (!tickets[message.author.id + message.guild.id]) return message.channel.send("You don't have any tickets");
            if (!args[0]) return message.channel.send("Please specify which item you want to use. The item list includes **SS Ticket**, **S Ticket**, **A Ticket**, **B Ticket**, **C Ticket** and **D Ticket**.")
            let argsj = args.join("").toLowerCase();
            let item = "";
            let tRarity = "";
            switch (argsj) {
                case "ssticket": item = "ssT"; tRarity = "SS"; break;
                case "sticket": item = "sT"; tRarity = "S"; break;
                case "aticket": item = "aT"; tRarity = "A"; break;
                case "bticket": item = "bT"; tRarity = "B"; break;
                case "cticket": item = "cT"; tRarity = "C"; break;
                case "dticket": item = "dT"; tRarity = "D"; break;
                default : false; break;
            };
            if (!item) return message.channel.send(`**${args.join(" ")}** is not a valid item.`);
            if (tickets[message.author.id + message.guild.id][item] < 1) return message.channel.send(`You don't have any ${tRarity} Tickets left`);
            let tChar = characters.filter((e) => e.rarity === tRarity);
            let tId = Math.floor(tChar.length * Math.random());
            inventory[message.author.id + message.guild.id].push(tChar[tId].id);
            displayMy(tChar[tId]);
            tickets[message.author.id + message.guild.id][item]--;
            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/tickets.json', JSON.stringify(tickets), (err) => {
                if (err) console.error(err);
            });
        };

        // Inventory
        if (cmd === "inv" || cmd === "inventory" || cmd === "invr" || cmd === "inva" || cmd === "invd") {
            
            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();

            if (!inventory[user.id + message.guild.id]) {
                if (user.id === message.author.id) return message.channel.send("You don't have any characters");
                return message.channel.send(`${user.username} has no characters`);
            };

            if (inventory[user.id + message.guild.id].length < 1) return message.channel.send("You don't have any characters");

            const inv = inventory[user.id + message.guild.id];
            const uniq = inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);

            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]].name);
            };
            if (cmd[3] === "a") chars.sort();

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (!isNaN(parseInt(args[0])) && parseInt(args[0]) <= pagesTotal) {
                currPage = parseInt(args[0]);
            };

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) thumbnail = characters[favChar[user.id + message.guild.id]].image;

            if (cmd[3] === "r" || cmd[3] === "d") {

                if (cmd[3] === "d") {
                    for (i=uniq.length-1; i >= 0; i--) {
                        if (inv.filter((e) => e === uniq[i]).length === 1) {
                            uniq.splice(uniq.indexOf(uniq[i]), 1);
                        };
                    };
                    if (uniq.length < 1) return message.channel.send("You don't have any duplicates");
                };

                pagesTotal = Math.ceil(uniq.length / 15);
                if (!isNaN(parseInt(args[0])) && parseInt(args[0]) <= pagesTotal) {
                    currPage = parseInt(args[0]);
                };

                let charsR = [];
                for (i=0; i < uniq.length; i++) {
                    charsR.push(characters[uniq[i]]);
                };

                let ssChars = charsR.filter((b) => b.rarity === "SS");
                let sChars = charsR.filter((b) => b.rarity === "S");
                let aChars = charsR.filter((b) => b.rarity === "A");
                let bChars = charsR.filter((b) => b.rarity === "B");
                let cChars = charsR.filter((b) => b.rarity === "C");
                let dChars = charsR.filter((b) => b.rarity === "D");

                if (cmd[3] === "d") {
                    ssChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    sChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    aChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    bChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    cChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    dChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                };

                function tierNamesInv (t, arr) {
                    if (cmd[3] === "d") {
                        let dupes = 0;
                        for (h=0; h < t.length; h++) {
                            dupes = inv.filter((e) => e === t[h].id).length;
                            arr.push(t[h].name + ` | **x${dupes}**`);
                        };
                        arr.sort((a, b) => b.match(/\d+(?=\D*$)/)[0] - a.match(/\d+(?=\D*$)/)[0]);
                    } else {
                        for (h=0; h < t.length; h++) {
                            arr.push(t[h].name);
                        };
                    };
                    return arr;
                };

                let ssCharsN = [];
                let sCharsN = [];
                let aCharsN = [];
                let bCharsN = [];
                let cCharsN = [];
                let dCharsN = [];

                let desc = "";
                
                if (ssChars[0]) desc += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv(ssChars, ssCharsN).join("\n> ");
                if (sChars[0]) desc += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv(sChars, sCharsN).join("\n> ");
                if (aChars[0]) desc += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv(aChars, aCharsN).join("\n> ");
                if (bChars[0]) desc += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv(bChars, bCharsN).join("\n> ");
                if (cChars[0]) desc += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv(cChars, cCharsN).join("\n> ");
                if (dChars[0]) desc += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv(dChars, dCharsN).join("\n> ");

                let allChars = ssChars.concat(sChars).concat(aChars).concat(bChars).concat(cChars).concat(dChars);

                if (uniq.length < 16) {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                    .setThumbnail(thumbnail)
                    .setDescription(desc)
                    .setFooter(`Page 1/1`)
                    message.channel.send(Embed);
                } else {
                    let left = uniq.length % 15;
                    let showChars = [];
                    if (currPage < pagesTotal) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showChars.push(allChars[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showChars.push(allChars[i]);
                        };
                    };

                    let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                    let sFiltered = showChars.filter((b) => b.rarity === "S");
                    let aFiltered = showChars.filter((b) => b.rarity === "A");
                    let bFiltered = showChars.filter((b) => b.rarity === "B");
                    let cFiltered = showChars.filter((b) => b.rarity === "C");
                    let dFiltered = showChars.filter((b) => b.rarity === "D");

                    let ssFiltrN = [];
                    let sFiltrN = [];
                    let aFiltrN = [];
                    let bFiltrN = [];
                    let cFiltrN = [];
                    let dFiltrN = [];

                    let description = "";

                    if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv(ssFiltered, ssFiltrN).join("\n> ");
                    if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv(sFiltered, sFiltrN).join("\n> ");
                    if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv(aFiltered, aFiltrN).join("\n> ");
                    if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv(bFiltered, bFiltrN).join("\n> ");
                    if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv(cFiltered, cFiltrN).join("\n> ");
                    if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv(dFiltered, dFiltrN).join("\n> ");

                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                    .setThumbnail(thumbnail)
                    .setDescription(description)
                    .setFooter(`Page ${currPage}/${pagesTotal}`)
                    message.channel.send(Embed).then(msg => {
                        msg.react("⏪").then(r => {
                            msg.react("⏩");

                            const prevFilter = (reaction, user1) => reaction.emoji.name === "⏪" && user1.id === message.author.id;
                            const nextFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                            const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                            const next = msg.createReactionCollector(nextFilter, {time: 60000});

                            prev.on('collect', r => {
                                if (currPage > 1) {
                                    currPage--;
                                } else {
                                    currPage = pagesTotal;
                                };
                                let showChars = [];
                                if (currPage < pagesTotal || left === 0) {
                                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                        showChars.push(allChars[i]);
                                    };
                                } else {
                                    for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                        showChars.push(allChars[i]);
                                    };
                                };

                                let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                                let sFiltered = showChars.filter((b) => b.rarity === "S");
                                let aFiltered = showChars.filter((b) => b.rarity === "A");
                                let bFiltered = showChars.filter((b) => b.rarity === "B");
                                let cFiltered = showChars.filter((b) => b.rarity === "C");
                                let dFiltered = showChars.filter((b) => b.rarity === "D");
            
                                let ssFiltrN = [];
                                let sFiltrN = [];
                                let aFiltrN = [];
                                let bFiltrN = [];
                                let cFiltrN = [];
                                let dFiltrN = [];
            
                                let description = "";
            
                                if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv(ssFiltered, ssFiltrN).join("\n> ");
                                if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv(sFiltered, sFiltrN).join("\n> ");
                                if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv(aFiltered, aFiltrN).join("\n> ");
                                if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv(bFiltered, bFiltrN).join("\n> ");
                                if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv(cFiltered, cFiltrN).join("\n> ");
                                if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv(dFiltered, dFiltrN).join("\n> ");
                                Embed.setDescription(description).setFooter(`Page ${currPage}/${pagesTotal}`);
                                msg.edit(Embed);
                                msg.reactions.resolve("⏪").users.remove(message.author);
                            });

                            next.on('collect', r => {
                                if (currPage < pagesTotal) {
                                    currPage++;
                                } else {
                                    currPage = 1;
                                };
                                let showChars = [];
                                if (currPage < pagesTotal || left === 0) {
                                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                        showChars.push(allChars[i]);
                                    };
                                } else {
                                    for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                        showChars.push(allChars[i]);
                                    };
                                };

                                let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                                let sFiltered = showChars.filter((b) => b.rarity === "S");
                                let aFiltered = showChars.filter((b) => b.rarity === "A");
                                let bFiltered = showChars.filter((b) => b.rarity === "B");
                                let cFiltered = showChars.filter((b) => b.rarity === "C");
                                let dFiltered = showChars.filter((b) => b.rarity === "D");
            
                                let ssFiltrN = [];
                                let sFiltrN = [];
                                let aFiltrN = [];
                                let bFiltrN = [];
                                let cFiltrN = [];
                                let dFiltrN = [];
            
                                let description = "";
            
                                if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv(ssFiltered, ssFiltrN).join("\n> ");
                                if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv(sFiltered, sFiltrN).join("\n> ");
                                if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv(aFiltered, aFiltrN).join("\n> ");
                                if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv(bFiltered, bFiltrN).join("\n> ");
                                if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv(cFiltered, cFiltrN).join("\n> ");
                                if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv(dFiltered, dFiltrN).join("\n> ");
                                Embed.setDescription(description).setFooter(`Page ${currPage}/${pagesTotal}`);
                                msg.edit(Embed);
                                msg.reactions.resolve("⏩").users.remove(message.author);
                            });

                        })
                    });
                };
                return;
            };

            if (uniq.length < 16) {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(chars.join('\n'))
                .setFooter(`Page 1/1`)
                message.channel.send(Embed);
            } else {
                let left = uniq.length % 15;
                let showChars = [];
                if (currPage < pagesTotal) {
                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                        showChars.push(chars[i]);
                    };
                } else {
                    for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                        showChars.push(chars[i]);
                    };
                };
                
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(showChars.join('\n'))
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                message.channel.send(Embed).then(msg => {
                    msg.react("⏪").then(r => {
                        msg.react("⏩");

                        const prevFilter = (reaction, user1) => reaction.emoji.name === "⏪" && user1.id === message.author.id;
                        const nextFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                        const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                        const next = msg.createReactionCollector(nextFilter, {time: 60000});

                        prev.on('collect', r => {
                            if (currPage > 1) {
                                currPage--;
                            } else {
                                currPage = pagesTotal;
                            };
                            let showChars = [];
                            if (currPage < pagesTotal || left === 0) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showChars.push(chars[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showChars.push(chars[i]);
                                };
                            };
                            Embed.setDescription(showChars.join('\n')).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏪").users.remove(message.author);
                        });
                          
                        next.on('collect', r => {
                            if (currPage < pagesTotal) {
                                currPage++;
                            } else {
                                currPage = 1;
                            };
                            let showChars = [];
                            if (currPage < pagesTotal || left === 0) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showChars.push(chars[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showChars.push(chars[i]);
                                };
                            };
                            Embed.setDescription(showChars.join('\n')).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏩").users.remove(message.author);
                        });
                    });
                });
            };

        };

        // Balance
        if (cmd === "bal" || cmd === "balance" || cmd === "coins") {

            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();

            if (!coins[user.id + message.guild.id]) coins[user.id + message.guild.id] = 0;

            const inv = inventory[user.id + message.guild.id];
            let uniq = [];
            if (inv !== undefined) {
                uniq = inv.reduce(function(a,b) {
                    if (a.indexOf(b) < 0 ) a.push(b);
                    return a;
                },[]);
            };

            let thumbnail = "https://i.ibb.co/cgh59Lb/WWM4K98.png";
            if (inventory[user.id + message.guild.id] && inventory[user.id + message.guild.id].length >= 1) thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) {
                thumbnail = characters[favChar[user.id + message.guild.id]].image;
                if (premium[user.id] > 3) if (customSettings[user.id + message.guild.id] && customSettings[user.id + message.guild.id].cimg[favChar[user.id + message.guild.id]]) thumbnail = customSettings[user.id + message.guild.id].cimg[favChar[user.id + message.guild.id]];
            };

            var daily = JSON.parse(fs.readFileSync('Storage/daily.json', 'utf8'));
            let dailyQ = "Your daily is available";
            if (daily[user.id + message.guild.id] > 0) dailyQ = "You have claimed your daily";

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s Balance`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setThumbnail(thumbnail)
            .setDescription("**Balance**: " + coins[user.id + message.guild.id] + "<:coins:872926669055356939>\n" + dailyQ)
            message.channel.send(Embed);
        };

        // Sell
        if (cmd === "sell") {

            if (!args[0]) return message.channel.send("Please provide a name or ID");
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");
            if (!coins[message.author.id + message.guild.id]) coins[message.author.id + message.guild.id] = 0;

            const inv = [];
            for (i=0; i < inventory[message.author.id + message.guild.id].length; i++) {
                inv.push(inventory[message.author.id + message.guild.id][i]);
            };

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1].toString();

            if (args[0].toLowerCase() === "dupes" || args[0].toLowerCase() === "duplicates") {
                // Command: !sell dupes 3 ss
                if (!args[1]) args[1] = "1";
                if (isNaN(args[1]) || args[1] < 1) return message.channel.send("Please specify which duplicates you want to sell.\nUsage: `!sell dupes <number> <rarity>`\n(number: sells all dupes with over this much copies)");
                let inv = inventory[message.author.id + message.guild.id].filter((e) => characters[e].rarity != "SS");
                if (args[2]) {
                    if (args[2].toLowerCase() == "ss") return message.channel.send("You can't sell <:SSTier:869316489931546644> cards in mass.");
                    if (!(args[2].toLowerCase() == "s" || args[2].toLowerCase() == "a" || args[2].toLowerCase() == "b" || args[2].toLowerCase() == "c" || args[2].toLowerCase() == "d")) return message.channel.send("Please specify which duplicates you want to sell.\nUsage: `!sell dupes <number> <rarity>`\n(rarity: has to be either S, A, B, C or D)");
                    inv = inv.filter((e) => characters[e].rarity == args[2].toUpperCase());
                };
                
                let uniq = inv.reduce(function(a,b) {
                    if (a.indexOf(b) < 0 ) a.push(b);
                    return a;
                },[]);
                for (i=uniq.length-1; i >= 0; i--) {
                    if (!(inv.filter((e) => e === uniq[i]).length > parseInt(args[1]))) {
                        uniq.splice(uniq.indexOf(uniq[i]), 1);
                    };
                };
                if (uniq.length < 1) return message.channel.send(args[1] == "1" ? "You don't have any duplicates." : `You don't have any duplicates with more than ${args[1]} copies.`);

                let price = 0;
                for (i=0; i < uniq.length; i++) {
                    let multiplier = inv.filter((e) => e === uniq[i]).length - parseInt(args[1]);
                    switch (characters[uniq[i]].rarity) {
                        case "S" : price += 1000*multiplier; break;
                        case "A" : price += 500*multiplier; break;
                        case "B" : price += 250*multiplier; break;
                        case "C" : price += 100*multiplier; break;
                        case "D" : price += 50*multiplier; break;
                        default : price += 0; break;
                    };
                };
                message.channel.send(`Are you sure you want to sell ${args[2] ? `all ${args[2].toUpperCase()} rank cards` : "all cards (SS excluded)"} with more than ${args[1] == "1" ? "1 copy" : `${args[1]} copies`} for **${price}**<:coins:872926669055356939>?`).then(msg => {
                    msg.react("☑️").then(r => {
                        msg.react("❎");

                        const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                        const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                        const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                        const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});

                        confirm.on('collect', r => {
                            for (i=0; i < uniq.length; i++) {
                                for (k=0; k < inv.filter((e) => e === uniq[i]).length - parseInt(args[1]); k++) {
                                    let indx = inventory[message.author.id + message.guild.id].indexOf(uniq[i]);
                                    inventory[message.author.id + message.guild.id].splice(indx, 1);
                                };
                            };
                            coins[message.author.id + message.guild.id] += price;

                            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                                if (err) console.error(err);
                            });
                            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                                if (err) console.error(err);
                            });
                            message.channel.send(`**${price}**<:coins:872926669055356939> were added to your balance`);
                            confirm.stop();
                            cancel.stop();
                        });

                        cancel.on('collect', r=> {
                            message.channel.send("Action cancelled")
                            confirm.stop();
                            cancel.stop();
                        });

                    });
                });
                return;
            };

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!inv.some((e) => e == args[0])) return message.channel.send(`You don't have a copy of **${characters[args[0]].name}**`);

                let price = 0;
                if (characters[args[0]].rarity === "SS") price = 5000;
                if (characters[args[0]].rarity === "S") price = 1000;
                if (characters[args[0]].rarity === "A") price = 500;
                if (characters[args[0]].rarity === "B") price = 250;
                if (characters[args[0]].rarity === "C") price = 100;
                if (characters[args[0]].rarity === "D") price = 50;
                message.channel.send(`Are you sure you want to sell **${characters[args[0]].name}** for **${price}**<:coins:872926669055356939>?`).then(msg => {
                    msg.react("☑️").then(r => {
                        msg.react("❎");

                        const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                        const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                        const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                        const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});

                        confirm.on('collect', r => {
                            let indx = inventory[message.author.id + message.guild.id].indexOf(parseInt(args[0]));
                            inventory[message.author.id + message.guild.id].splice(indx, 1);
                            coins[message.author.id + message.guild.id] += price;

                            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                                if (err) console.error(err);
                            });
                            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                                if (err) console.error(err);
                            });
                            message.channel.send(`**${price}**<:coins:872926669055356939> were added to your balance`);
                            confirm.stop();
                            cancel.stop();
                        });

                        cancel.on('collect', r=> {
                            message.channel.send("Action cancelled")
                            confirm.stop();
                            cancel.stop();
                        });

                    });
                });
                return;
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            };

            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a) => a.toLowerCase() === args.join(' ').toLowerCase()));
            if (fastCheck[0] !== undefined) {
                if (!inv.some((e) => e == fastCheck[0].id)) return message.channel.send(`You don't have a copy of **${fastCheck[0].name}**`);

                price = 0;
                if (fastCheck[0].rarity === "SS") price = 5000;
                if (fastCheck[0].rarity === "S") price = 1000;
                if (fastCheck[0].rarity === "A") price = 500;
                if (fastCheck[0].rarity === "B") price = 250;
                if (fastCheck[0].rarity === "C") price = 100;
                if (fastCheck[0].rarity === "D") price = 50;

                message.channel.send(`Are you sure you want to sell **${fastCheck[0].name}** for **${price}**<:coins:872926669055356939>?`).then(msg => {
                    msg.react("☑️").then(r => {
                        msg.react("❎");

                        const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                        const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                        const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                        const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});

                        confirm.on('collect', r => {
                            let indx = inventory[message.author.id + message.guild.id].indexOf(fastCheck[0].id);
                            inventory[message.author.id + message.guild.id].splice(indx, 1);
                            coins[message.author.id + message.guild.id] += price;

                            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                                if (err) console.error(err);
                            });
                            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                                if (err) console.error(err);
                            });
                            message.channel.send(`**${price}**<:coins:872926669055356939> were added to your balance`);
                            confirm.stop();
                            cancel.stop();
                        });

                        cancel.on('collect', r=> {
                            message.channel.send("Action cancelled")
                            confirm.stop();
                            cancel.stop();
                        });
                    });
                });
            } else {
                message.channel.send("No match found. Please use the characters full name");
            };
            return;
        };

        // Give & Gift
        if (cmd === "give" || cmd === "gift") {

            if (!args[0] || !args[0].startsWith("<@") || !message.mentions.users.first()) {
                if (cmd[2] === "v") return message.channel.send("Please mention a user first. The command structure should look like this:\n`" + prefix + "give @user <amount of coins>`");
                if (cmd[2] === "f") return message.channel.send("Please mention a user first. The command structure should look like this:\n`" + prefix + "gift @user <character name or ID>`");
            };
            
            let user = message.mentions.users.first();
            if (user.bot) return message.channel.send("You can't send something to a bot");
            if (user.id === message.author.id) return message.channel.send("no <:yogurtKek:794982064553328660>")

            // Give
            if (cmd[2] === "v") {
                if (!isNaN(parseInt(args[1]))) {
                    if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < parseInt(args[1])) return message.channel.send("You dont have that much coins");
                    if (parseInt(args[1]) < 1) return message.channel.send(args[1] + " coins? <:ConfusedSmug:820800487904903218>");

                    message.channel.send(`Are you sure you want to give **${user.username}** **${args[1]}**<:coins:872926669055356939>?`).then(msg => {
                        msg.react("☑️").then(r => {
                            msg.react("❎");

                            const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                            const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                            const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                            const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});

                            confirm.on('collect', r => {
                                coins[message.author.id + message.guild.id] -= parseInt(args[1]);
                                if (!coins[user.id + message.guild.id]) coins[user.id + message.guild.id] = 0;
                                coins[user.id + message.guild.id] += parseInt(args[1]);
    
                                fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                                    if (err) console.error(err);
                                });
                                message.channel.send(`Sent **${args[1]}**<:coins:872926669055356939> to **${user.username}**`);
                                confirm.stop();
                                cancel.stop();
                            });

                            cancel.on('collect', r=> {
                                message.channel.send("Action cancelled")
                                confirm.stop();
                                cancel.stop();
                            });
                        });
                    });
                } else {
                    return message.channel.send("Please specify the amount of coins you want to give\n`!give @user <amount of coins>`");
                };
            };

            // Gift
            if (cmd[2] === "f") {

                if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters. Use `" + prefix + "pull` to get started.");

                const inv = [];
                for (i=0; i < inventory[message.author.id + message.guild.id].length; i++) {
                    inv.push(inventory[message.author.id + message.guild.id][i]);
                };

                if (!isNaN(args[1]) && !args[2] && args[1] < characters.length && (args[1].startsWith("0") ? args[1].length > 1 ? false : true : true) && args[1][0] !== "-") {
                    if (!inv.some((e) => e == args[1])) return message.channel.send(`You don't have a copy of **${characters[args[1]].name}**`);

                    message.channel.send(`Are you sure you want to gift **${characters[args[1]].name}** to **${user.username}**?`).then(msg => {
                        msg.react("☑️").then(r => {
                            msg.react("❎");
    
                            const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                            const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                            const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                            const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});
    
                            confirm.on('collect', r => {
                                let indx = inventory[message.author.id + message.guild.id].indexOf(parseInt(args[1]));
                                inventory[message.author.id + message.guild.id].splice(indx, 1);
                                if (!inventory[user.id + message.guild.id]) inventory[user.id + message.guild.id] = [];
                                inventory[user.id + message.guild.id].push(parseInt(args[1]));
    
                                fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                                    if (err) console.error(err);
                                });
                                message.channel.send(`**${characters[args[1]].name}** was gifted to **${user.username}**`);
                                confirm.stop();
                                cancel.stop();
                            });
    
                            cancel.on('collect', r=> {
                                message.channel.send("Action cancelled")
                                confirm.stop();
                                cancel.stop();
                            });
    
                        });
                    });
                    return;
                } else if (!isNaN(args[1]) && args[1] >= characters.length && !args[2]) {
                    return message.channel.send("The ID must be smaller than " + characters.length);
                };

                args.shift();
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                if (fastCheck[0] !== undefined) {
                    if (!inv.some((e) => e == fastCheck[0].id)) return message.channel.send(`You don't have a copy of **${fastCheck[0].name}**`);
    
                    message.channel.send(`Are you sure you want to gift **${fastCheck[0].name}** to **${user.username}**?`).then(msg => {
                        msg.react("☑️").then(r => {
                            msg.react("❎");
    
                            const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                            const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                            const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                            const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});
    
                            confirm.on('collect', r => {
                                let indx = inventory[message.author.id + message.guild.id].indexOf(fastCheck[0].id);
                                inventory[message.author.id + message.guild.id].splice(indx, 1);
                                inventory[user.id + message.guild.id].push(fastCheck[0].id);
    
                                fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                                    if (err) console.error(err);
                                });
                                message.channel.send(`**${fastCheck[0].name}** was gifted to **${user.username}**`);
                                confirm.stop();
                                cancel.stop();
                            });
    
                            cancel.on('collect', r=> {
                                message.channel.send("Action cancelled")
                                confirm.stop();
                                cancel.stop();
                            });
                        });
                    });
                } else {
                    message.channel.send("No match found. Please use the characters full name or ID");
                };

            };
        };

        // Trade
        if (cmd === "trade") {
            if (!message.mentions.users.first() || !args[0].startsWith("<@")) return message.channel.send("Please mention someone first\nUsage: `" + prefix + "trade @user <char to offer> , <char to receive>`");
            let user = message.mentions.users.first();
            if (user.bot) return message.channel.send("You can't trade with a bot <:Heh:848238885893177404>");
            if (user.id === message.author.id) return message.channel.send("You can't trade with yourself <:Heh:848238885893177404>");
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send(`You don't have any characters`);
            if (!inventory[user.id + message.guild.id]) return message.channel.send(`**${user.username}** doesn't have any characters`);

            args.shift();
            let msgLeft = args.join(" ");
            if (msgLeft.search(",") === -1) return message.channel.send("You have to seperate both characters with a `,`\nUsage: `" + prefix + "trade @user <char to offer> , <char to receive>`")
            let arrLeft = msgLeft.split(",");
            for (i=0; i < arrLeft.length; i++) {
                arrLeft[i] = arrLeft[i].trim();
            };

            let inv1 = inventory[message.author.id + message.guild.id];
            let inv2 = inventory[user.id + message.guild.id];

            let char1;
            let char2;

            if (!isNaN(arrLeft[0]) && arrLeft[0] < characters.length && arrLeft[0].length === parseInt(arrLeft[0]).toString().length && arrLeft[0][0] !== "-") {
                if (!inv1.some((e) => e == arrLeft[0])) return message.channel.send(`You don't have a copy of **${characters[arrLeft[0]].name}**`);
                char1 = characters[arrLeft[0]];
            } else {
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === arrLeft[0].toLowerCase() || e.alias.some((a => a.toLowerCase() === arrLeft[0].toLowerCase())));
                if (fastCheck[0] !== undefined) {
                    if (!inv1.some((e) => e == fastCheck[0].id)) return message.channel.send(`You don't have a copy of **${fastCheck[0].name}**`);
                    char1 = fastCheck[0]
                } else {
                    return message.channel.send("No match found for **" + arrLeft[0] + "**. Please use the characters full name or ID");
                };
            };

            if (!isNaN(arrLeft[1]) && arrLeft[1] < characters.length && arrLeft[1].length === parseInt(arrLeft[1]).toString().length && arrLeft[1][0] !== "-") {
                if (!inv2.some((e) => e == arrLeft[1])) return message.channel.send(`**${user.username}** doesn't have a copy of **${characters[arrLeft[1]].name}**`);
                char2 = characters[arrLeft[1]];
            } else {
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === arrLeft[1].toLowerCase() || e.alias.some((a => a.toLowerCase() === arrLeft[1].toLowerCase())));
                if (fastCheck[0] !== undefined) {
                    if (!inv2.some((e) => e == fastCheck[0].id)) return message.channel.send(`**${user.username}** doesn't have a copy of **${fastCheck[0].name}**`);
                    char2 = fastCheck[0]
                } else {
                    return message.channel.send("No match found for **" + arrLeft[1] + "**. Please use the characters full name or ID");
                };
            };

            message.channel.send(`${user.toString()} **${message.author.username}** wants to trade **${char1.name}** for your **${char2.name}**. Do you accept?`).then(msg => {
                msg.react("☑️").then(r => {
                    msg.react("❎");
    
                    const confirmFilter = (reaction, userz) => reaction.emoji.name === "☑️" && userz.id === user.id;
                    const cancelFilter = (reaction, userz) => reaction.emoji.name === "❎" && (userz.id === user.id || userz.id === message.author.id);
                    const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                    const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});

                    confirm.on('collect', r => {
                        let indx1 = inventory[message.author.id + message.guild.id].indexOf(char1.id);
                        let indx2 = inventory[user.id + message.guild.id].indexOf(char2.id);
                        inventory[message.author.id + message.guild.id].splice(indx1, 1);
                        inventory[user.id + message.guild.id].splice(indx2, 1);
                        inventory[message.author.id + message.guild.id].push(char2.id);
                        inventory[user.id + message.guild.id].push(char1.id);

                        fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                            if (err) console.error(err);
                        });
                        message.channel.send(`Your trade was successful`);
                        confirm.stop();
                        cancel.stop();
                    });

                    cancel.on('collect', r=> {
                        message.channel.send("Action cancelled")
                        confirm.stop();
                        cancel.stop();
                    });
                });
            });

        };

        // Top
        if (cmd === "top" || cmd === "topp" || cmd === "topc" || cmd === "topc%" || cmd === "topa" || cmd === "topd") {
            
            let keys = [];
            let showUsers = [];

            if (cmd === "topp") {
                let pullsC = {};
                for (i=0; i < Object.keys(pity).length; i++) {
                    pullsC[Object.keys(pity)[i]] = pity[Object.keys(pity)[i]].pullsTotal;
                };
                
                let pullsSorted = Object.fromEntries(
                    Object.entries(pullsC).sort(([,a],[,b]) => b-a)
                );
                keys = Object.keys(pullsSorted);
                keys = keys.filter((e) => e.slice(18, 37) === message.guild.id);

                for (i=0; i < keys.length; i++) {
                    showUsers.push(`${i+1}. **${ccgUsers[keys[i].slice(0, 18)]}** - **${pullsSorted[keys[i]]}** pulls`);
                };
            } else if (cmd === "topc%") {
                let cList = {};
                for (i=0; i < Object.keys(inventory).length; i++) {
                    if (Object.keys(inventory)[i].slice(18, 37) === message.guild.id) {
                        let inv = inventory[Object.keys(inventory)[i]];
                        let uniq = inv.reduce(function(a,b) {
                            if (a.indexOf(b) < 0 ) a.push(b);
                            return a;
                        },[]);
                        let charsTotal = Object.keys(characters).length;
                        let collected = uniq.length;
                        let collRatio = Math.floor((collected / charsTotal)*100);

                        cList[Object.keys(inventory)[i]] = collRatio;
                    };
                };

                let cSorted = Object.fromEntries(
                    Object.entries(cList).sort(([,a],[,b]) => b-a)
                );
                keys = Object.keys(cSorted);
                let i2 = 0;
                for (i=0; i < keys.length; i++) {
                    showUsers.push(`${i2+1}. **${ccgUsers[keys[i].slice(0, 18)]}** - has completed **${cSorted[keys[i]]}%**`);
                    i2++;
                };
            } else if (cmd === "topc") {
                let cList = {};
                for (i=0; i < Object.keys(inventory).length; i++) {
                    if (Object.keys(inventory)[i].slice(18, 37) === message.guild.id) {
                        let inv = inventory[Object.keys(inventory)[i]];
                        let uniq = inv.reduce(function(a,b) {
                            if (a.indexOf(b) < 0 ) a.push(b);
                            return a;
                        },[]);
                        cList[Object.keys(inventory)[i]] = uniq.length;
                    };
                };

                let cSorted = Object.fromEntries(
                    Object.entries(cList).sort(([,a],[,b]) => b-a)
                );
                keys = Object.keys(cSorted);
                let i2 = 0;
                for (i=0; i < keys.length; i++) {
                    showUsers.push(`${i2+1}. **${ccgUsers[keys[i].slice(0, 18)]}** - has **${cSorted[keys[i]]}** characters`);
                    i2++;
                };
            } else if (cmd === "topa") {
                let cList = {};
                for (i=0; i < Object.keys(inventory).length; i++) {
                    if (Object.keys(inventory)[i].slice(18, 37) === message.guild.id) {
                        let inv = inventory[Object.keys(inventory)[i]];
                        let uniq = inv.reduce(function(a,b) {
                            if (a.indexOf(b) < 0 ) a.push(b);
                            return a;
                        },[]);
                        let chars = [];
                        for (j=0; j < uniq.length; j++) {
                            chars.push(characters[uniq[j]]);
                        };
                        let aniCompleted = 0;
                        for (j=0; j < auniq.length; j++) {
                            let animeCheck = characters.filter((e) => e.anime === auniq[j]).length;
                            let invCheck = chars.filter((e) => e.anime === auniq[j]).length;
                            if (animeCheck === invCheck) {
                                aniCompleted++;
                            };
                        };
                        cList[Object.keys(inventory)[i]] = aniCompleted;
                    };
                };

                let cSorted = Object.fromEntries(
                    Object.entries(cList).sort(([,a],[,b]) => b-a)
                );
                keys = Object.keys(cSorted);
                let i2 = 0;
                for (i=0; i < keys.length; i++) {
                    showUsers.push(`${i2+1}. **${ccgUsers[keys[i].slice(0, 18)]}** - has completed **${cSorted[keys[i]]}** anime`);
                    i2++;
                };
            } else if (cmd === "topd") {
                var dungeonFloors = JSON.parse(fs.readFileSync('Storage/dungeonFloors.json', 'utf8'));

                let floorsU = {};
                for (i=0; i < Object.keys(dungeonFloors).length; i++) {
                    floorsU[Object.keys(dungeonFloors)[i]] = parseInt(Object.keys(dungeonFloors[Object.keys(dungeonFloors)[i]])[Object.keys(dungeonFloors[Object.keys(dungeonFloors)[i]]).length-1]);
                };
                
                let floorsSorted = Object.fromEntries(
                    Object.entries(floorsU).sort(([,a],[,b]) => b-a)
                );
                keys = Object.keys(floorsSorted);
                keys = keys.filter((e) => e.slice(18, 37) === message.guild.id);

                for (i=0; i < keys.length; i++) {
                    showUsers.push(`${i+1}. **${ccgUsers[keys[i].slice(0, 18)]}** - Floor **${floorsSorted[keys[i]]}**`);
                };
            } else {
                let xpSorted = Object.fromEntries(
                    Object.entries(xp).sort(([,a],[,b]) => b-a)
                );
                keys = Object.keys(xpSorted);
                keys = keys.filter((e) => e.slice(18, 37) === message.guild.id);
                for (i=0; i < keys.length; i++) {
                    let xpr = xp[keys[i].slice(0, 18) + message.guild.id];
                    let level = 0;
                    for (j=1; xpr >= 0; j++) {
                        xpr -= Math.floor(5*Math.log(j)*Math.log(j)*Math.log(j)*Math.log(j) + 30);
                        level++;
                    };
                    showUsers.push(`${i+1}. **${ccgUsers[keys[i].slice(0, 18)]}** - Level **${level}**`);
                };
            };

            let thumbnail;
            if (showUsers.length < 1) {
                showUsers.push("This server has no players yet.");
                thumbnail = "https://i.ibb.co/Kr6h5JJ/46txCUb.png";
            } else {
                thumbnail = characters[inventory[keys[0]][Math.floor(Math.random() * inventory[keys[0]].length)]].image;
            };
            if (favChar[keys[0]]) thumbnail = characters[favChar[keys[0]]].image;
            if (showUsers.length < 16) {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`🏆 ${message.guild.name} top players 🏆`)
                .setDescription(showUsers)
                .setThumbnail(thumbnail)
                message.channel.send(Embed);
            } else {
                let pagesTotal = Math.ceil(showUsers.length / 15);
                let currPage = 1;
                
                let left = showUsers.length % 15;
                let showUsersF = [];
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showUsersF.push(showUsers[i]);
                };

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`🏆 ${message.guild.name} top players 🏆`)
                .setDescription(showUsersF)
                .setThumbnail(thumbnail)
                message.channel.send(Embed).then(msg => {
                    msg.react("⏪").then(r => {
                        msg.react("⏩");

                        const prevFilter = (reaction, user1) => reaction.emoji.name === "⏪" && user1.id === message.author.id;
                        const nextFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                        const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                        const next = msg.createReactionCollector(nextFilter, {time: 60000});

                        prev.on('collect', r => {
                            if (currPage > 1) {
                                currPage--;
                            } else {
                                currPage = pagesTotal;
                            };
                            let showUsersF = [];
                            if (currPage < pagesTotal) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showUsersF.push(showUsers[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showUsersF.push(showUsers[i]);
                                };
                            };
                            Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏪").users.remove(message.author);
                        });

                        next.on('collect', r => {
                            if (currPage < pagesTotal) {
                                currPage++;
                            } else {
                                currPage = 1;
                            };
                            let showUsersF = [];
                            if (currPage < pagesTotal) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showUsersF.push(showUsers[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showUsersF.push(showUsers[i]);
                                };
                            };
                            Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏩").users.remove(message.author);
                        });

                    });
                });
            };
        };

        // Stats
        if (cmd === "stats") {
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Card Game Stats")
            .setDescription("")
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .addFields(
                { name: 'Characters', value: "<:Rem:869894433385095198> **Waifu total**: " + charactersF.length + "\n<:Yato:869897062672642118> **Husbando total**: " + charactersM.length + "\n<:Gawrgura:869894477752447007> **Characters total**: " + characters.length, inline: true},
                { name: 'Anime', value: "<:Menhera:869913008686649374> **Anime total**: " + auniq.length, inline: true },
                { name: '\u200B', value: '_ _' },
                { name: 'Rarity', value: "<:SSTier:869316489931546644> **Tier**: " + charactersSS.length + "\n<:ATier:869316558013464627> **Tier**: " + charactersA.length + "\n<:CTier:869316602858991657> **Tier**: " + charactersC.length, inline: true },
                { name: '_ _', value: "<:STier:869316518675095552> **Tier**: " + charactersS.length + "\n<:BTier:869316586803179571> **Tier**: " + charactersB.length + "\n<:DTier:869316616071032843> **Tier**: " + charactersD.length, inline: true },
            )
            message.channel.send(Embed);
        };

        // Base stats
        if (cmd === "is" || cmd === "infos" || cmd === "infostats") {

            if (!args[0]) return message.channel.send("Please provide a name or ID");

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1].toString();

            let fArray;

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") {
                    fArray = characters[args[0]];
                } else {
                    let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                    if (fastCheck[0] !== undefined) {
                        fArray = fastCheck[0];
                    } else {
                        fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                        let i = 0;
                        
                        for (j=0; j < args.length; j++) {
                            let argsW = args[j].length;
            
                            while (argsW > 0) {
                                fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                                argsW--;
                                i++;
                            };
            
                            i = 0;
                            if (fArray.length < 2) {
                                j = args.length;
                            };
                        };
            
                        if (fArray.length === 0) {
                            return message.channel.send("No match found");
                        };
                        if (fArray.length > 1) {
                            return message.channel.send(fArray.length + " matches found");
                        };
                    };
                };
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            } else {
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                if (fastCheck[0] !== undefined) {
                    fArray = fastCheck[0];
                } else {
                    fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                    let i = 0;
                    
                    for (j=0; j < args.length; j++) {
                        let argsW = args[j].length;
        
                        while (argsW > 0) {
                            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                            argsW--;
                            i++;
                        };
        
                        i = 0;
                        if (fArray.length < 2) {
                            j = args.length;
                        };
                    };
        
                    if (fArray.length === 0) {
                        return message.channel.send("No match found");
                    };
                    if (fArray.length > 1) {
                        return message.channel.send(fArray.length + " matches found");
                    };
                    fArray = fArray[0];
                };
            };
            return base(fArray);
        };
        
        // Charakter stats
        if (cmd === "ims" || cmd === "infomystats") {
            
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");
            if (!args[0] && (battleChar[message.author.id + message.guild.id] || battleChar[message.author.id + message.guild.id] === 0)) args[0] = "" + battleChar[message.author.id + message.guild.id];
            if (!args[0]) return message.channel.send("Please provide a name or ID");

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1].toString();

            let fArray;

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") {
                    fArray = characters[args[0]];
                } else {
                    let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                    if (fastCheck[0] !== undefined) {
                        fArray = fastCheck[0];
                    } else {
                        fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                        let i = 0;
                        
                        for (j=0; j < args.length; j++) {
                            let argsW = args[j].length;
            
                            while (argsW > 0) {
                                fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                                argsW--;
                                i++;
                            };
            
                            i = 0;
                            if (fArray.length < 2) {
                                j = args.length;
                            };
                        };
            
                        if (fArray.length === 0) {
                            return message.channel.send("No match found");
                        };
                        if (fArray.length > 1) {
                            return message.channel.send(fArray.length + " matches found");
                        };
                    };
                };
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            } else {
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                if (fastCheck[0] !== undefined) {
                    fArray = fastCheck[0];
                } else {
                    fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                    let i = 0;
                    
                    for (j=0; j < args.length; j++) {
                        let argsW = args[j].length;
        
                        while (argsW > 0) {
                            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                            argsW--;
                            i++;
                        };
        
                        i = 0;
                        if (fArray.length < 2) {
                            j = args.length;
                        };
                    };
        
                    if (fArray.length === 0) {
                        return message.channel.send("No match found");
                    };
                    if (fArray.length > 1) {
                        return message.channel.send(fArray.length + " matches found");
                    };
                    fArray = fArray[0];
                };
            };

            if (!inventory[message.author.id + message.guild.id].some((e) => e == fArray.id)) return message.channel.send(`You don't have a copy of **${fArray.name}**`);
            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            if (!charlvl[message.author.id + message.guild.id][fArray.id]) charlvl[message.author.id + message.guild.id][fArray.id] = 1;

            let currLvl = charlvl[message.author.id + message.guild.id][fArray.id];

            let hp = baseHP(fArray.id);
            let atk = baseATK(fArray.id);
            let def = baseDEF(fArray.id);
            let rm;
            if (!ref[message.author.id + message.guild.id][fArray.id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][fArray.id];
            };
            if (rm > 5) rm = 5;
            
            switch (fArray.rarity) {
                case "SS" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((5+(2*((hp-180)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((2.4+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1.25+(0.25*((def-50)/30)))*(currLvl-1)); break;
                case "S" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.9+(0.6*((hp-150)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.9+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1+(0.2*((def-50)/30)))*(currLvl-1)); break;
                case "A" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.3+(0.4*((hp-120)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.6+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.8+(0.15*((def-50)/30)))*(currLvl-1)); break;
                case "B" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.8+(0.4*((hp-100)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.2+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.6+(0.2*((def-50)/30)))*(currLvl-1)); break;
                case "C" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.4+(0.4*((hp-80)/40)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.9+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.5+(0.15*((def-50)/30)))*(currLvl-1)); break;
                case "D" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2+(0.5*((hp-70)/30)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.75+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.4+(0.5*((def-50)/30)))*(currLvl-1)); break;
                default : hp = 1; atk = 1; def = 1; break;
            };
            let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (100/atk))*100) / 100;

            let animeL = fArray.anime;
            if (fArray.anime.length > 30) {
                let spaceIndex = fArray.anime.slice(0,30).lastIndexOf(" ");
                animeL = fArray.anime.slice(0,spaceIndex) + "\n" + fArray.anime.slice(spaceIndex);
            };
            let refinement = "";
            if (!ref[message.author.id + message.guild.id][fArray.id] || ref[message.author.id + message.guild.id][fArray.id] < 1) {
                refinement = "<:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
            } else if (ref[message.author.id + message.guild.id][fArray.id] < 2) {
                refinement = "<:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
            } else if (ref[message.author.id + message.guild.id][fArray.id] < 3) {
                refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
            } else if (ref[message.author.id + message.guild.id][fArray.id] < 4) {
                refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
            } else if (ref[message.author.id + message.guild.id][fArray.id] < 5) {
                refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136>";
            } else {
                refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552>";
            };

            let img = fArray.image;
            if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[fArray.id]) img = customSettings[message.author.id + message.guild.id].cimg[fArray.id];

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(img)
            .setThumbnail(rarity(fArray.rarity))
            .setDescription("**" + fArray.name + "**" + "\n" + animeL + `\n\n **Level** ${currLvl}ㅤ**Ref.** ${refinement}`)
            .addFields(
                { name: 'HP ️️️💖', value: hp, inline: true },
                { name: 'ATK ️️⚔️', value: atk, inline: true },
                { name: 'DEF ️️️🛡️', value: def, inline: true },
            )
            .setFooter(`EP: ${ep}`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            message.channel.send(Embed);
            return;
        };

        // Character ranking
        if (cmd === "rankmy") {

            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();
            if (!inventory[user.id + message.guild.id]) return message.channel.send("You don't have any characters.");
            
            if (!charlvl[user.id + message.guild.id]) charlvl[user.id + message.guild.id] = {};
            let uniq = characters.filter((e) => inventory[user.id + message.guild.id].includes(e.id));

            let rok = {};
            for (j=0; j < uniq.length; j++) {
                let currLvl;
                if (!charlvl[user.id + message.guild.id][uniq[j].id]){
                    currLvl = 1;
                } else {
                    currLvl = charlvl[user.id + message.guild.id][uniq[j].id]
                }

                let hp = baseHP(uniq[j].id);
                let atk = baseATK(uniq[j].id);
                let def = baseDEF(uniq[j].id);
                let rm;
                if (!ref[user.id + message.guild.id][uniq[j].id]) {
                    rm = 0;
                } else {
                    rm = ref[user.id + message.guild.id][uniq[j].id];
                };
                if (rm > 5) rm = 5;
                switch (uniq[j].rarity) {
                    case "SS" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((5+(2*((hp-180)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((2.4+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1.25+(0.25*((def-50)/30)))*(currLvl-1)); break;
                    case "S" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.9+(0.6*((hp-150)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.9+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1+(0.2*((def-50)/30)))*(currLvl-1)); break;
                    case "A" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.3+(0.4*((hp-120)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.6+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.8+(0.15*((def-50)/30)))*(currLvl-1)); break;
                    case "B" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.8+(0.4*((hp-100)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.2+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.6+(0.2*((def-50)/30)))*(currLvl-1)); break;
                    case "C" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.4+(0.4*((hp-80)/40)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.9+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.5+(0.15*((def-50)/30)))*(currLvl-1)); break;
                    case "D" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2+(0.5*((hp-70)/30)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.75+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.4+(0.5*((def-50)/30)))*(currLvl-1)); break;
                    default : hp = 1; atk = 1; def = 1; break;
                };
                let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (100/atk))*100) / 100;
                rok[j] = ep;
            };
            let rokS = Object.keys(rok).sort(function(a, b) {return -(rok[a] - rok[b])});
            let sortedArr = [];
            for (i=0; i < uniq.length; i++) {
                let rokT = "";
                switch (uniq[rokS[i]].rarity) {
                    case "SS" : rokT = "<:SSTier:869316489931546644>"; break;
                    case "S" : rokT = "<:STier:869316518675095552>"; break;
                    case "A" : rokT = "<:ATier:869316558013464627>"; break;
                    case "B" : rokT = "<:BTier:869316586803179571>"; break;
                    case "C" : rokT = "<:CTier:869316602858991657>"; break;
                    case "D" : rokT = "<:DTier:869316616071032843>"; break;
                    default : rokT = ""; break;
                };
                sortedArr.push(`${rokT} ${i+1}. ${uniq[rokS[i]].name} - EP: **${rok[rokS[i]]}**`);
            };
            
            let pagesTotal = Math.ceil(sortedArr.length / 15);
            let currPage = 1;
            
            let left = sortedArr.length % 15;
            let showUsersF = [];
            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                showUsersF.push(sortedArr[i]);
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`Your top characters`)
            .setDescription(showUsersF)
            .setThumbnail(uniq[rokS[0]].image)
            .setFooter(`Page ${currPage}/${pagesTotal}`);
            message.channel.send(Embed).then(msg => {
                msg.react("⏪").then(r => {
                    msg.react("⏩");

                    const prevFilter = (reaction, user1) => reaction.emoji.name === "⏪" && user1.id === message.author.id;
                    const nextFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                    const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                    const next = msg.createReactionCollector(nextFilter, {time: 60000});

                    prev.on('collect', r => {
                        if (currPage > 1) {
                            currPage--;
                        } else {
                            currPage = pagesTotal;
                        };
                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏪").users.remove(message.author);
                    });

                    next.on('collect', r => {
                        if (currPage < pagesTotal) {
                            currPage++;
                        } else {
                            currPage = 1;
                        };
                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏩").users.remove(message.author);
                    });

                });
            });
            return;
        };

        // Server top character ranking
        if (cmd === "ranks" || cmd === "rankserv" || cmd === "rankserver") {

            let sInv = {};
            for (i=0; i < Object.keys(inventory).length; i++) {
                if (Object.keys(inventory)[i].slice(18, 37) === message.guild.id) {
                    sInv[Object.keys(inventory)[i]] = inventory[Object.keys(inventory)[i]];
                };
            };

            if (!sInv) return message.channel.send("No one on this server has a character.");

            let rok = {};
            for (s=0; s < Object.keys(sInv).length; s++) {
                if (!charlvl[Object.keys(sInv)[s]]) charlvl[Object.keys(sInv)[s]] = {};

                let uniq = characters.filter((e) => inventory[Object.keys(sInv)[s]].includes(e.id));
                
                for (j=0; j < uniq.length; j++) {
                    let currLvl;
                    if (!charlvl[Object.keys(sInv)[s]][uniq[j].id]){
                        currLvl = 1;
                    } else {
                        currLvl = charlvl[Object.keys(sInv)[s]][uniq[j].id]
                    };
                    if (characters[uniq[j].id].rarity === "D" && currLvl < 30) continue;

                    let hp = baseHP(uniq[j].id);
                    let atk = baseATK(uniq[j].id);
                    let def = baseDEF(uniq[j].id);
                    let rm;
                    if (!ref[Object.keys(sInv)[s]][uniq[j].id]) {
                        rm = 0;
                    } else {
                        rm = ref[Object.keys(sInv)[s]][uniq[j].id];
                    };
                    if (rm > 5) rm = 5;
                    switch (uniq[j].rarity) {
                        case "SS" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((5+(2*((hp-180)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((2.4+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1.25+(0.25*((def-50)/30)))*(currLvl-1)); break;
                        case "S" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.9+(0.6*((hp-150)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.9+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1+(0.2*((def-50)/30)))*(currLvl-1)); break;
                        case "A" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.3+(0.4*((hp-120)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.6+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.8+(0.15*((def-50)/30)))*(currLvl-1)); break;
                        case "B" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.8+(0.4*((hp-100)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.2+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.6+(0.2*((def-50)/30)))*(currLvl-1)); break;
                        case "C" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.4+(0.4*((hp-80)/40)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.9+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.5+(0.15*((def-50)/30)))*(currLvl-1)); break;
                        case "D" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2+(0.5*((hp-70)/30)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.75+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.4+(0.5*((def-50)/30)))*(currLvl-1)); break;
                        default : hp = 1; atk = 1; def = 1; break;
                    };
                    let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (100/atk))*100) / 100;
                    if (ep >= 100) rok[Object.keys(sInv)[s] + " " + uniq[j].id] = ep;
                };
            };

            if (Object.keys(rok).length == 0) return message.channel.send("The top list ist currently empty.");

            let sortedArr = [];
            let rokS = Object.keys(rok).sort(function(a, b) {return -(rok[a] - rok[b])});
            for (i=0; i < rokS.length; i++) {
                let rokT = "";
                switch (characters[rokS[i].split(" ")[1]].rarity) {
                    case "SS" : rokT = "<:SSTier:869316489931546644>"; break;
                    case "S" : rokT = "<:STier:869316518675095552>"; break;
                    case "A" : rokT = "<:ATier:869316558013464627>"; break;
                    case "B" : rokT = "<:BTier:869316586803179571>"; break;
                    case "C" : rokT = "<:CTier:869316602858991657>"; break;
                    case "D" : rokT = "<:DTier:869316616071032843>"; break;
                    default : rokT = ""; break;
                };
                sortedArr.push(`${rokT} ${i+1}. **${characters[rokS[i].split(" ")[1]].name}** - EP: ${rok[rokS[i]]} => ${ccgUsers[rokS[i].split(" ")[0].slice(0, 18)]}`);
            };
            
            let pagesTotal = Math.ceil(sortedArr.length / 15);
            let currPage = 1;
            
            let left = sortedArr.length % 15;
            let showUsersF = [];
            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                showUsersF.push(sortedArr[i]);
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`🏆 ${message.guild.name} top characters 🏆`)
            .setDescription(showUsersF)
            .setThumbnail(characters[rokS[0].split(" ")[1]].image)
            .setFooter(`Page ${currPage}/${pagesTotal}`);
            message.channel.send(Embed).then(msg => {
                msg.react("⏪").then(r => {
                    msg.react("⏩");

                    const prevFilter = (reaction, user1) => reaction.emoji.name === "⏪" && user1.id === message.author.id;
                    const nextFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                    const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                    const next = msg.createReactionCollector(nextFilter, {time: 60000});

                    prev.on('collect', r => {
                        if (currPage > 1) {
                            currPage--;
                        } else {
                            currPage = pagesTotal;
                        };
                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏪").users.remove(message.author);
                    });

                    next.on('collect', r => {
                        if (currPage < pagesTotal) {
                            currPage++;
                        } else {
                            currPage = 1;
                        };
                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏩").users.remove(message.author);
                    });

                });
            });
            return;
        };

        // Character base ranking
        if (cmd === "rank") {
            /*
            Formula                         | P0 100  1  0  EP:   1.00
            HP₁ -= ATK₂*(0.99818)^DEF₁      | P1 300 30 30  EP:  95.05
            HP₂ -= ATK₁*(0.99818)^DEF₂      | P2 400 50 40  EP: 172.09

            HP -= ATK -> over time: HP/ATK₁(c)^0
            P1 Finishes in 3.33t
            P2 Finishes in 2.5t        less is better
            
            P1 Finished in 316.85t
            P2 Finished in 430.23t     more is better

            HP₁ -= 100*(0.99818)^DEF₁  -> HP₁/(1*(0.99818)^DEF₁)
            HP₂ -= 100*(0.99818)^DEF₂

            EP = d(HP₁)/dt / d(HP)/dt = (HP₁/(0.99818)^DEF₁)/(100/ATK₁) -> (HP*ATK)/c^DEF
            */

            let rok = {};
            for (j=0; j < characters.length; j++) {
                let hp = baseHP(j);
                let atk = baseATK(j);
                let def = baseDEF(j);
                let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (100/atk))*100) / 100
                rok[j] = ep;
            };
            let rokS = Object.keys(rok).sort(function(a, b) {return -(rok[a] - rok[b])});
            let sortedArr = [];
            for (i=0; i < characters.length; i++) {
                let rokT = "";
                switch (characters[rokS[i]].rarity) {
                    case "SS" : rokT = "<:SSTier:869316489931546644>"; break;
                    case "S" : rokT = "<:STier:869316518675095552>"; break;
                    case "A" : rokT = "<:ATier:869316558013464627>"; break;
                    case "B" : rokT = "<:BTier:869316586803179571>"; break;
                    case "C" : rokT = "<:CTier:869316602858991657>"; break;
                    case "D" : rokT = "<:DTier:869316616071032843>"; break;
                    default : rokT = ""; break;
                };
                sortedArr.push(`${rokT} ${i+1}. ${characters[rokS[i]].name} - EP: **${rok[rokS[i]]}**`);
            };
            
            let pagesTotal = Math.ceil(sortedArr.length / 15);
            let currPage = 1;
            
            let left = sortedArr.length % 15;
            let showUsersF = [];
            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                showUsersF.push(sortedArr[i]);
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`Top Characters Ranking`)
            .setDescription(showUsersF)
            .setThumbnail(characters[rokS[0]].image)
            .setFooter(`Page ${currPage}/${pagesTotal}`);
            message.channel.send(Embed).then(msg => {
                msg.react("⏪").then(r => {
                    msg.react("⏩");

                    const prevFilter = (reaction, user1) => reaction.emoji.name === "⏪" && user1.id === message.author.id;
                    const nextFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                    const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                    const next = msg.createReactionCollector(nextFilter, {time: 60000});

                    prev.on('collect', r => {
                        if (currPage > 1) {
                            currPage--;
                        } else {
                            currPage = pagesTotal;
                        };
                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏪").users.remove(message.author);
                    });

                    next.on('collect', r => {
                        if (currPage < pagesTotal) {
                            currPage++;
                        } else {
                            currPage = 1;
                        };
                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏩").users.remove(message.author);
                    });

                });
            });

        };

        // Level up Characters
        if (cmd === "levelup" || cmd === "lvlup" || cmd === "lu") {
            
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");
            if (!args[0]) return message.channel.send("Please provide a name or ID");
            if (!coins[message.author.id + message.guild.id]) coins[message.author.id + message.guild.id] = 0;

            let toMax = false
            let up = 1;
            if (message.content.includes(",") && ((!Number.isInteger(message.content.split(",")[1]) && message.content.split(",")[1] > 0) || message.content.split(",")[1].toLowerCase().replace(/\s/g, '') == "max")) {
                if (message.content.split(",")[1].toLowerCase().replace(/\s/g, '') == "max") {
                    toMax = true;
                } else {
                    up = parseInt(message.content.split(",")[1]);
                };
                args = message.content.split(",")[0].split(" ");
                args = args.filter((e) => e != "");
                args.shift();
            };

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1].toString();

            let fArray;

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") {
                    fArray = characters[args[0]];
                } else {
                    let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                    if (fastCheck[0] !== undefined) {
                        fArray = fastCheck[0];
                    } else {
                        fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                        let i = 0;
                        
                        for (j=0; j < args.length; j++) {
                            let argsW = args[j].length;
            
                            while (argsW > 0) {
                                fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                                argsW--;
                                i++;
                            };
            
                            i = 0;
                            if (fArray.length < 2) {
                                j = args.length;
                            };
                        };
            
                        if (fArray.length === 0) {
                            return message.channel.send("No match found");
                        };
                        if (fArray.length > 1) {
                            return message.channel.send(fArray.length + " matches found");
                        };
                    };
                };
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            } else {
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                if (fastCheck[0] !== undefined) {
                    fArray = fastCheck[0];
                } else {
                    fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                    let i = 0;
                    
                    for (j=0; j < args.length; j++) {
                        let argsW = args[j].length;
        
                        while (argsW > 0) {
                            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                            argsW--;
                            i++;
                        };
        
                        i = 0;
                        if (fArray.length < 2) {
                            j = args.length;
                        };
                    };
        
                    if (fArray.length === 0) {
                        return message.channel.send("No match found");
                    };
                    if (fArray.length > 1) {
                        return message.channel.send(fArray.length + " matches found");
                    };
                    fArray = fArray[0];
                };
            };

            if (!inventory[message.author.id + message.guild.id].some((e) => e == fArray.id)) return message.channel.send(`You don't have a copy of **${fArray.name}**`);
            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            if (!charlvl[message.author.id + message.guild.id][fArray.id]) charlvl[message.author.id + message.guild.id][fArray.id] = 1;

            if (toMax && coins[message.author.id + message.guild.id]) {
                let iCoins = coins[message.author.id + message.guild.id];
                let lvup = 0;
                while (iCoins >= 0) {
                    switch (fArray.rarity) {
                        case "SS" : iCoins -= 500 + 100*(charlvl[message.author.id + message.guild.id][fArray.id]-1+lvup); break;
                        case "S" : iCoins -= 350 + 80*(charlvl[message.author.id + message.guild.id][fArray.id]-1+lvup); break;
                        case "A" : iCoins -= 250 + 65*(charlvl[message.author.id + message.guild.id][fArray.id]-1+lvup); break;
                        case "B" : iCoins -= 200 + 50*(charlvl[message.author.id + message.guild.id][fArray.id]-1+lvup); break;
                        case "C" : iCoins -= 150 + 35*(charlvl[message.author.id + message.guild.id][fArray.id]-1+lvup); break;
                        case "D" : iCoins -= 100 + 25*(charlvl[message.author.id + message.guild.id][fArray.id]-1+lvup); break;
                        default : iCoins -= 999999; break;
                    };
                    lvup++;
                };
                up = lvup-1;
                if (up === 0) return message.channel.send("You don't have enough coins");
            };

            let currLvl = charlvl[message.author.id + message.guild.id][fArray.id];
            let price = 0;
            for (i=0; i < up; i++) {
                switch (fArray.rarity) {
                    case "SS" : price += 500 + 100*(currLvl-1+i); break;
                    case "S" : price += 350 + 80*(currLvl-1+i); break;
                    case "A" : price += 250 + 65*(currLvl-1+i); break;
                    case "B" : price += 200 + 50*(currLvl-1+i); break;
                    case "C" : price += 150 + 35*(currLvl-1+i); break;
                    case "D" : price += 100 + 25*(currLvl-1+i); break;
                    default : price += 999999; break;
                };
            };
            if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < price) return message.channel.send(`You don't have enough coins (**${coins[message.author.id + message.guild.id]}**/${price}<:coins:872926669055356939>)`);
            

            let bhp = baseHP(fArray.id);
            let batk = baseATK(fArray.id);
            let bdef = baseDEF(fArray.id);

            let hp = bhp;
            let atk = batk;
            let def = bdef;
            let rm;
            if (!ref[message.author.id + message.guild.id][fArray.id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][fArray.id];
            };
            if (rm > 5) rm = 5;
            
            switch (fArray.rarity) {
                case "SS" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((5+(2*((hp-180)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((2.4+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1.25+(0.25*((def-50)/30)))*(currLvl-1)); break;
                case "S" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.9+(0.6*((hp-150)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.9+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1+(0.2*((def-50)/30)))*(currLvl-1)); break;
                case "A" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.3+(0.4*((hp-120)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.6+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.8+(0.15*((def-50)/30)))*(currLvl-1)); break;
                case "B" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.8+(0.4*((hp-100)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.2+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.6+(0.2*((def-50)/30)))*(currLvl-1)); break;
                case "C" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.4+(0.4*((hp-80)/40)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.9+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.5+(0.15*((def-50)/30)))*(currLvl-1)); break;
                case "D" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2+(0.5*((hp-70)/30)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.75+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.4+(0.5*((def-50)/30)))*(currLvl-1)); break;
                default : hp = 1; atk = 1; def = 1; break;
            };
            let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (100/atk))*100) / 100;

            let hp2 = bhp;
            let atk2 = batk;
            let def2 = bdef;
            switch (fArray.rarity) {
                case "SS" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((5+(2*((hp2-180)/60)))*(currLvl-1+up)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((2.4+(0.35*((atk2-50)/30)))*(currLvl-1+up)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((1.25+(0.25*((def2-50)/30)))*(currLvl-1+up)); break;
                case "S" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((3.9+(0.6*((hp2-150)/50)))*(currLvl-1+up)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((1.9+(0.3*((atk2-50)/30)))*(currLvl-1+up)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((1+(0.2*((def2-50)/30)))*(currLvl-1+up)); break;
                case "A" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((3.3+(0.4*((hp2-120)/60)))*(currLvl-1+up)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((1.6+(0.25*((atk2-50)/30)))*(currLvl-1+up)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((0.8+(0.15*((def2-50)/30)))*(currLvl-1+up)); break;
                case "B" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((2.8+(0.4*((hp2-100)/50)))*(currLvl-1+up)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((1.2+(0.3*((atk2-50)/30)))*(currLvl-1+up)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((0.6+(0.2*((def2-50)/30)))*(currLvl-1+up)); break;
                case "C" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((2.4+(0.4*((hp2-80)/40)))*(currLvl-1+up)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((0.9+(0.35*((atk2-50)/30)))*(currLvl-1+up)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((0.5+(0.15*((def2-50)/30)))*(currLvl-1+up)); break;
                case "D" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((2+(0.5*((hp2-70)/30)))*(currLvl-1+up)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((0.75+(0.25*((atk2-50)/30)))*(currLvl-1+up)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((0.4+(0.5*((def2-50)/30)))*(currLvl-1+up)); break;
                default : hp2 = 1; atk2 = 1; def2 = 1; break;
            };
            let ep2 = Math.floor(((hp2/Math.pow(0.99818,def2)) / (100/atk2))*100) / 100;

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setDescription(`**${fArray.name}**\nLevel up from ${currLvl} -> **${currLvl+up}** for **${price}**<:coins:872926669055356939>`)
            .addFields(
                { name: 'HP ️️️💖', value: `${hp} -> **${hp2}**`, inline: true },
                { name: 'ATK ️️⚔️', value: `${atk} -> **${atk2}**`, inline: true },
                { name: 'DEF ️️️🛡️', value: `${def} -> **${def2}**`, inline: true },
            )
            .setThumbnail(fArray.image)
            .setFooter(`EP: ${ep} -> ${ep2}`)
            message.channel.send(Embed).then(msg => {
                msg.react("☑️").then(r => {
                    msg.react("❎");

                    const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                    const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                    const confirm = msg.createReactionCollector(confirmFilter, {time: 30000});
                    const cancel = msg.createReactionCollector(cancelFilter, {time: 30000});

                    confirm.on('collect', r => {
                        coins[message.author.id + message.guild.id] -= price;
                        charlvl[message.author.id + message.guild.id][fArray.id] += up;

                        fs.writeFile('Storage/charlvl.json', JSON.stringify(charlvl), (err) => {
                            if (err) console.error(err);
                        });
                        fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                            if (err) console.error(err);
                        });
                        message.channel.send(`**${fArray.name}** reached level ${charlvl[message.author.id + message.guild.id][fArray.id]}!`);
                        confirm.stop();
                        cancel.stop();
                    });

                    cancel.on('collect', r=> {
                        message.channel.send("Action cancelled")
                        confirm.stop();
                        cancel.stop();
                    });

                });
            });
            fs.writeFile('Storage/charlvl.json', JSON.stringify(charlvl), (err) => {
                if (err) console.error(err);
            });
        };

        // Reset level
        if (cmd === "reset") {
            if (!args[0]) return message.channel.send("Please provide a name or ID")
            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1].toString();

            let fArray;

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") {
                    fArray = characters[args[0]];
                } else {
                    let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                    if (fastCheck[0] !== undefined) {
                        fArray = fastCheck[0];
                    } else {
                        fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                        let i = 0;
                        
                        for (j=0; j < args.length; j++) {
                            let argsW = args[j].length;
            
                            while (argsW > 0) {
                                fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                                argsW--;
                                i++;
                            };
            
                            i = 0;
                            if (fArray.length < 2) {
                                j = args.length;
                            };
                        };
            
                        if (fArray.length === 0) {
                            return message.channel.send("No match found");
                        };
                        if (fArray.length > 1) {
                            return message.channel.send(fArray.length + " matches found");
                        };
                    };
                };
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            } else {
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                if (fastCheck[0] !== undefined) {
                    fArray = fastCheck[0];
                } else {
                    fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                    let i = 0;
                    
                    for (j=0; j < args.length; j++) {
                        let argsW = args[j].length;
        
                        while (argsW > 0) {
                            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                            argsW--;
                            i++;
                        };
        
                        i = 0;
                        if (fArray.length < 2) {
                            j = args.length;
                        };
                    };
        
                    if (fArray.length === 0) {
                        return message.channel.send("No match found");
                    };
                    if (fArray.length > 1) {
                        return message.channel.send(fArray.length + " matches found");
                    };
                    fArray = fArray[0];
                };
            };

            if (!inventory[message.author.id + message.guild.id].some((e) => e == fArray.id)) return message.channel.send(`You don't have a copy of **${fArray.name}**`);
            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            if (!charlvl[message.author.id + message.guild.id][fArray.id]) charlvl[message.author.id + message.guild.id][fArray.id] = 1;
            if (charlvl[message.author.id + message.guild.id][fArray.id] == 1) return message.channel.send(`Your **${fArray.name}** is already level 1`);
            
            let currLvl = charlvl[message.author.id + message.guild.id][fArray.id];
            let price = 0;
            for (i=0; i < currLvl; i++) {
                switch (fArray.rarity) {
                    case "SS" : price += 500 + 100*i; break;
                    case "S" : price += 350 + 80*i; break;
                    case "A" : price += 250 + 65*i; break;
                    case "B" : price += 200 + 50*i; break;
                    case "C" : price += 150 + 35*i; break;
                    case "D" : price += 100 + 25*i; break;
                    default : price += 1; break;
                };
            };

            let rPer = 0.8;
            if (premium[message.author.id]) {
                switch (premium[message.author.id]) {
                    case "1": rPer = 0.8; break;
                    case "2": rPer = 0.9; break;
                    case "3": rPer = 1; break;
                    case "4": rPer = 1; break;
                    case "5": rPer = 1; break;
                    case "6": rPer = 1; break;
                    default : false; break;
                };
            };
            price = Math.floor(price*rPer)
            if (!coins[message.author.id + message.guild.id]) coins[message.author.id + message.guild.id] = 0;

            message.channel.send(`Do you want to reset **${fArray.name}**'s level for **${price}**<:coins:872926669055356939>? (You will get ${rPer*100}% back of what you've invested)`).then(msg => {
                msg.react("☑️").then(r => {
                    msg.react("❎");

                    const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                    const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                    const confirm = msg.createReactionCollector(confirmFilter, {time: 30000});
                    const cancel = msg.createReactionCollector(cancelFilter, {time: 30000});

                    confirm.on('collect', r => {
                        coins[message.author.id + message.guild.id] += price;
                        charlvl[message.author.id + message.guild.id][fArray.id] = 1;

                        fs.writeFile('Storage/charlvl.json', JSON.stringify(charlvl), (err) => {
                            if (err) console.error(err);
                        });
                        fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                            if (err) console.error(err);
                        });
                        message.channel.send(`Action completed successfully. Added **${price}**<:coins:872926669055356939> to your balance.`);
                        confirm.stop();
                        cancel.stop();
                    });

                    cancel.on('collect', r=> {
                        message.channel.send("Action cancelled")
                        confirm.stop();
                        cancel.stop();
                    });

                });
            });
            fs.writeFile('Storage/charlvl.json', JSON.stringify(charlvl), (err) => {
                if (err) console.error(err);
            });

        };

        // EP calculator
        if (cmd === "ep") {
            if (isNaN(args[0]) || isNaN(args[1]) || isNaN(args[2])) return;
            message.channel.send(Math.floor(((parseInt(args[0])/Math.pow(0.99818,parseInt(args[2]))) / (100/parseInt(args[1])))*100) / 100)
        };

        // Abilities
        if (cmd === "abilities") {

            let charsID = [64,238,274,405,733,1824,2079,2080,2360]
            let chars = []
            for (i=0; i < charsID.length; i++) {
                chars.push(characters[charsID[i]])
            };

            let userInv = inventory[message.author.id + message.guild.id];
            let userInvUniq = userInv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let userChars = [];
            for (i=0; i < userInvUniq.length; i++) {
                if (charsID.includes(parseInt(userInvUniq[i]))) userChars.push(characters[userInvUniq[i]]);
            };

            let anime = [];
            for (i=0; i < chars.length; i++) {
                anime.push(chars[i].anime);
            };
            let uniq = anime.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            uniq = uniq.sort();

            let showChars = [];
            for (i=0; i < uniq.length; i++) {
                let charsInAnime = chars.filter((e) => e.anime === uniq[i]);
                if (charsInAnime.length < 1) return;
                charsInAnime.sort();
                showChars.push(`**${uniq[i]}**`);
                for (j=0; j < charsInAnime.length; j++) {
                    if (userChars.some((e) => e.id == charsInAnime[j].id)) {
                        showChars.push("> " + charsInAnime[j].name + " <a:check:873196253276700682>");
                    } else {
                        showChars.push("> " + charsInAnime[j].name);
                    };
                };
                showChars.push("");
            };
            
            let pagesTotal = Math.ceil(showChars.length / 15);
            let currPage = 1;
            if (!isNaN(parseInt(args[0])) && parseInt(args[0]) <= pagesTotal) {
                currPage = parseInt(args[0]);
            };
            let left = showChars.length % 15;

            let showCharsF = [];
            if (currPage < pagesTotal || left === 0) {
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showCharsF.push(showChars[i]);
                };
            } else {
                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                    showCharsF.push(showChars[i]);
                };
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`Characters with Abilities`)
            .setThumbnail(chars[Math.floor(Math.random() * chars.length)].image)
            .setDescription(showCharsF)
            .setFooter(`Page ${currPage}/${pagesTotal}`)
            message.channel.send(Embed).then(msg => {
                msg.react("⏪").then(r => {
                    msg.react("⏩");

                    const prevFilter = (reaction, user) => reaction.emoji.name === "⏪" && user.id === message.author.id;
                    const nextFilter = (reaction, user) => reaction.emoji.name === "⏩" && user.id === message.author.id;
                    const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                    const next = msg.createReactionCollector(nextFilter, {time: 60000});

                    prev.on('collect', r => {
                        if (currPage > 1) {
                            currPage--;
                        } else {
                            currPage = pagesTotal;
                        };

                        let showCharsF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showCharsF.push(showChars[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showCharsF.push(showChars[i]);
                            };
                        };

                        Embed.setDescription(showCharsF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏪").users.remove(message.author);
                    });

                    next.on('collect', r => {
                        if (currPage < pagesTotal) {
                            currPage++;
                        } else {
                            currPage = 1;
                        };

                        let showCharsF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showCharsF.push(showChars[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showCharsF.push(showChars[i]);
                            };
                        };

                        Embed.setDescription(showCharsF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏩").users.remove(message.author);
                    });
                });
            });
            return;
        };


        /* // Dungeon Info
        if (message.content.toLowerCase().startsWith("!di") || message.content.toLowerCase().startsWith("!dungeoninfo") || message.content.toLowerCase().startsWith("!dungeon-info")) {
            var dungeonFloors = JSON.parse(fs.readFileSync('Storage/dungeonFloors.json', 'utf8'));
            if (!args[0]) return message.channel.send("Please provide a floor number. This has to be a floor that you have already unlocked.\nUsage: `!di <floor>`");
            if (isNaN[args[0]] || Number.isInteger(args[0]) || args[0] < 1) return message.channel.send("Please use a positive integer")
            let floor = 1;
            if (dungeonFloors[message.author.id + message.guild.id]) {
                if (dungeonFloors[message.author.id + message.guild.id][Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1]] >= 10 && Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1] !== 100) dungeonFloors[message.author.id + message.guild.id][1+parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1])] = 0;
                if (dungeonFloors[message.author.id + message.guild.id][Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1]] >= 1 && Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1] % 5 == 0 && Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1] !== 100) dungeonFloors[message.author.id + message.guild.id][1+parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1])] = 0;
                floor = parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1])
                fs.writeFile('Storage/dungeonFloors.json', JSON.stringify(dungeonFloors), (err) => {
                    if (err) console.error(err);
                });
            };

            if (args[0] > floor) return message.channel.send("You haven't unlocked this floor yet");

            let fEnemies = enemies.filter((e) => e.floor.includes(parseInt(args[0])));
            let tHP = [0,0], tATK = [0,0], tDEF = [0,0];
            for (i=0; i < fEnemies.length; i++) {
                tHP[0] += Math.floor(parseInt(fEnemies[i].hpr[0]) + (((parseInt(fEnemies[i].hpr[1])-parseInt(fEnemies[i].hpr[0]))/fEnemies[i].floor.length)*(args[0]-1)));
                tHP[1] += Math.floor(parseInt(fEnemies[i].hpr[0]) + (((parseInt(fEnemies[i].hpr[1])-parseInt(fEnemies[i].hpr[0]))/fEnemies[i].floor.length)*args[0]));
                tATK[0] += Math.floor(parseInt(fEnemies[i].atkr[0]) + (((parseInt(fEnemies[i].atkr[1])-parseInt(fEnemies[i].atkr[0]))/fEnemies[i].floor.length)*(args[0]-1)));
                tATK[1] += Math.floor(parseInt(fEnemies[i].atkr[0]) + (((parseInt(fEnemies[i].atkr[1])-parseInt(fEnemies[i].atkr[0]))/fEnemies[i].floor.length)*args[0]));
                tDEF[0] += Math.floor(parseInt(fEnemies[i].defr[0]) + (((parseInt(fEnemies[i].defr[1])-parseInt(fEnemies[i].defr[0]))/fEnemies[i].floor.length)*(args[0]-1)));
                tDEF[1] += Math.floor(parseInt(fEnemies[i].defr[0]) + (((parseInt(fEnemies[i].defr[1])-parseInt(fEnemies[i].defr[0]))/fEnemies[i].floor.length)*args[0]));
            };
            let average = [Math.floor((tHP[0]+tHP[1])/(2*fEnemies.length)), Math.floor((tATK[0]+tATK[1])/(2*fEnemies.length)), Math.floor((tDEF[0]+tDEF[1])/(2*fEnemies.length))];
            let aEP = Math.floor(((average[0]/Math.pow(0.99818,average[2])) / (100/average[1]))*100) / 100;

            let enemiesFound = "";
            for (i=0; i < fEnemies.length; i++) {
                enemiesFound += `${fEnemies[i].name},\n`
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`Dungeon Floor ${args[0]} Info`)
            .setDescription(`**Boss Floor**? ${fEnemies[0].boss ? "Yes" : "No"}\nEnemies found: ${enemiesFound}`)
            .addFields(
                { name: 'average HP ️️️💖', value: `${average[0]}`, inline: true },
                { name: 'average ATK ️️⚔️', value: `${average[1]}`, inline: true },
                { name: 'average DEF ️️️🛡️', value: `${average[2]}`, inline: true },
            )
            .setThumbnail(fEnemies[Math.floor(fEnemies.length * Math.random())].image[0])
            .setFooter(`averge EP: ${aEP}`)
            message.channel.send(Embed)

        };
        */

        // Animation delay
        if (cmd === "animationdelay" || cmd === "delay" || cmd === "anidelay" || cmd === "ad") {
            if (!premium[message.author.id]) return message.channel.send("This is a `" + prefix +"premium` feature. It changes the animation delay during a battle. If you're interested in supporting us, please see our patreon! <:RaphiSmile:868998036645380197>")
            if (!args[0]) return message.channel.send("Please provide a number between 200-1200");
            if (isNaN(args[0])) return message.channel.send("Please provide a number between 200-1200");
            if (parseInt(args[0]) < 200 || parseInt(args[0]) > 1200) return message.channel.send("Please provide a number between 200-1200");
            animationDelay[message.author.id + message.guild.id] = parseInt(args[0]);
            fs.writeFile('Storage/animationDelay.json', JSON.stringify(animationDelay), (err) => {
                if (err) console.error(err);
            });
            message.channel.send(`Your animation delay was set to ${args[0]}ms\nTry it out in the \`${prefix}dungeon\` !`)
        };

        // Dungeon
        if (cmd === "dungeon" || cmd === "d" || (cmd === "arena" && (args[0] === "<@!695286837568340119>" || args[0] === "<@695286837568340119>"))) {
            let floor;
            let dunLim = 5;
            if (cmd === "arena") {
                if (!battleChar[message.author.id + message.guild.id]) return message.channel.send("You have to choose a battle character first. Use `" + prefix + "select <char name>` to choose one.");
                if (!inventory[message.author.id + message.guild.id].includes(battleChar[message.author.id + message.guild.id])) return message.channel.send("You have to choose a battle character first. Use `" + prefix + "select <char name>` to choose one.");
            } else {
                if (message.content.toLowerCase() == "!d bump") return;
                
                var dungeonLimit = JSON.parse(fs.readFileSync('Storage/dungeonLimit.json', 'utf8'));
                var dungeonFloors = JSON.parse(fs.readFileSync('Storage/dungeonFloors.json', 'utf8'));
                if (!dungeonLimit[message.author.id + message.guild.id]) dungeonLimit[message.author.id + message.guild.id] = { current: 0, normal: 0 };
                if (!dungeonFloors[message.author.id + message.guild.id]) dungeonFloors[message.author.id + message.guild.id] = { };
                if (!dungeonFloors[message.author.id + message.guild.id][1]) dungeonFloors[message.author.id + message.guild.id][1] = 0;
                if (dungeonFloors[message.author.id + message.guild.id][Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1]] >= 20 && Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1] !== 100) dungeonFloors[message.author.id + message.guild.id][1+parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1])] = 0;
                if (dungeonFloors[message.author.id + message.guild.id][Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1]] >= 1 && enemies.filter((e) => e.floor.includes(parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1])))[0].boss && Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1] !== 100) dungeonFloors[message.author.id + message.guild.id][1+parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1])] = 0;

                fs.writeFile('Storage/dungeonLimit.json', JSON.stringify(dungeonLimit), (err) => {
                    if (err) console.error(err);
                });
                /*
                fs.writeFile('Storage/dungeonFloors.json', JSON.stringify(dungeonFloors), (err) => {
                    if (err) console.error(err);
                });
                */
                
                if (!battleChar[message.author.id + message.guild.id]) return message.channel.send("You have to choose a battle character first. Use `" + prefix + "select <char name>` to choose one.");
                if (!inventory[message.author.id + message.guild.id].includes(battleChar[message.author.id + message.guild.id])) return message.channel.send("You have to choose a battle character first. Use `" + prefix + "select <char name>` to choose one.");

                floor = parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1]);
                if (args[0] && !isNaN(args[0])) {
                    if (typeof dungeonFloors[message.author.id + message.guild.id][args[0]] !== 'undefined') {
                        floor = parseInt(args[0]);
                    } else {
                        if (args[0] < 1) return message.channel.send(`There is no Floor ${args[0]} <:EmiliaWot:868996542080622603>`);
                        return message.channel.send(`You haven't unlocked Floor ${args[0]} yet. You need 20 wins per floor to unlock the next one or just 1 if it's a boss floor.`);
                    };
                };
                if (floor > 100) floor = 100;

                // Increase limit
                if (premium[message.author.id]) {
                    switch (premium[message.author.id]) {
                        case "1": dunLim = 7; break;
                        case "2": dunLim = 8; break;
                        case "3": dunLim = 9; break;
                        case "4": dunLim = 9; break;
                        case "5": dunLim = 9; break;
                        case "6": dunLim = 11; break;
                        default : false; break;
                    };
                };

                // Check if daily limit reached
                if (floor === parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1])) {
                    if (dungeonLimit[message.author.id + message.guild.id]["current"] > dunLim && dungeonLimit[message.author.id + message.guild.id]["normal"] > dunLim) return message.channel.send("You have reached your limit for this interval. Come back in " + `${(7-(new Date().getHours() % 8)) ? `**${7-(new Date().getHours()%8)}**h` : ""} **${60-new Date().getMinutes()}**min`);
                    if (dungeonLimit[message.author.id + message.guild.id]["current"] > dunLim && floor !== 1) return message.channel.send("You have reached your limit for this floor, but you can still challenge lower level floors.\nUsage: `" + prefix + "dungeon <floor>`");
                    if (dungeonLimit[message.author.id + message.guild.id]["current"] > dunLim) return message.channel.send("You have reached your limit for this interval. Come back in " + `${(7-(new Date().getHours() % 8)) ? `**${7-(new Date().getHours()%8)}**h` : ""} **${60-new Date().getMinutes()}**min`);
                    dungeonLimit[message.author.id + message.guild.id]["current"]++;
                } else {
                    if (dungeonLimit[message.author.id + message.guild.id]["current"] > dunLim && dungeonLimit[message.author.id + message.guild.id]["normal"] > dunLim) return message.channel.send("You have reached your limit for this interval. Come back in " + `${(7-(new Date().getHours() % 8)) ? `**${7-(new Date().getHours()%8)}**h` : ""} **${60-new Date().getMinutes()}**min`);
                    if (dungeonLimit[message.author.id + message.guild.id]["normal"] > dunLim) return message.channel.send("You have reached your limit for the lower level floors, but you can still challenge floor " + parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1]) + ".\nUsage: `" + prefix + "dungeon <floor>`");
                    dungeonLimit[message.author.id + message.guild.id]["normal"]++;
                };
                fs.writeFile('Storage/dungeonLimit.json', JSON.stringify(dungeonLimit), (err) => {
                    if (err) console.error(err);
                });
            };

            let myChar = characters[battleChar[message.author.id + message.guild.id]];

            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            if (!charlvl[message.author.id + message.guild.id][myChar.id]) charlvl[message.author.id + message.guild.id][myChar.id] = 1;
            
            let currLvl = charlvl[message.author.id + message.guild.id][myChar.id];

            let myHP = baseHP(myChar.id);
            let myATK = baseATK(myChar.id);
            let myDEF = baseDEF(myChar.id);

            let rm;
            if (!ref[message.author.id + message.guild.id][myChar.id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][myChar.id];
            };
            if (rm > 5) rm = 5;
            
            switch (myChar.rarity) {
                case "SS" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((5+(2*((myHP-180)/60)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((2.4+(0.35*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((1.25+(0.25*((myDEF-50)/30)))*(currLvl-1)); break;
                case "S" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((3.9+(0.6*((myHP-150)/50)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((1.9+(0.3*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((1+(0.2*((myDEF-50)/30)))*(currLvl-1)); break;
                case "A" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((3.3+(0.4*((myHP-120)/60)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((1.6+(0.25*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((0.8+(0.15*((myDEF-50)/30)))*(currLvl-1)); break;
                case "B" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((2.8+(0.4*((myHP-100)/50)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((1.2+(0.3*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((0.6+(0.2*((myDEF-50)/30)))*(currLvl-1)); break;
                case "C" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((2.4+(0.4*((myHP-80)/40)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((0.9+(0.35*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((0.5+(0.15*((myDEF-50)/30)))*(currLvl-1)); break;
                case "D" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((2+(0.5*((myHP-70)/30)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((0.75+(0.25*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((0.4+(0.5*((myDEF-50)/30)))*(currLvl-1)); break;
                default : myHP = 1; myATK = 1; myDEF = 1; break;
            };
            let myEP = Math.floor(((myHP/Math.pow(0.99818,myDEF)) / (100/myATK))*100) / 100;
            let myHPd = myHP;
            let myHPt = myHP;
            let myATKd = myATK;
            let myDEFd = myDEF;

            let enemy, eHP, eATK, eDEF, eEP, eStats;
            if (cmd === "arena") {
                enemy = {"name":"Camelot","image":"https://i.ibb.co/jZ7fHSj/camelot.png"};
                eHP = Math.floor(myHP*1.16);
                eATK = Math.floor(myATK*1.16);
                eDEF = Math.floor(myDEF);
                eEP = Math.floor(((eHP/Math.pow(0.99818,eDEF)) / (100/eATK))*100) / 100;
                eStats = [eHP, eATK, eDEF, eEP]
            } else {
                enemy = enemies.filter((e) => e.floor.includes(floor))[Math.floor(Math.random() * (enemies.filter((e) => e.floor.includes(floor)).length))]
                eStats = enemy.stats(floor);
                eHP = eStats[0];
                eATK = eStats[1];
                eDEF = eStats[2];
                eEP = eStats[3];
            };

            function hpbar(cur, initial) {
                if (cur/initial > 0.9 && cur/initial <= 1) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barR:872111210571628605>";
                if (cur/initial > 0.8 && cur/initial <= 0.9) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barRh:872111194188705848>";
                if (cur/initial > 0.7 && cur/initial <= 0.8) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.6 && cur/initial <= 0.7) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.5 && cur/initial <= 0.6) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.4 && cur/initial <= 0.5) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.3 && cur/initial <= 0.4) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.2 && cur/initial <= 0.3) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.1 && cur/initial <= 0.2) return "<:barL:872111285741969438><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0 && cur/initial <= 0.1) return "<:barL:872111285741969438><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial <= 0) return "<:barLh:872111263747035177><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            };

            let difficulty;
            if (myEP/eEP >= 1.25) difficulty = "<a:arrow_green:916716811842621450> Difficulty: **Easy**";
            if (myEP/eEP >= 0.75 && myEP/eEP < 1.25) difficulty = "<a:arrow_orange:916716747623641210> Difficulty: **Medium**";
            if (myEP/eEP >= 0.5 && myEP/eEP < 0.75) difficulty = "<a:arrow_red:916716702618767401> Difficulty: **Hard**";
            if (myEP/eEP < 0.5) difficulty = "<a:arrow_black:916718325386588221> Difficulty: **Impossible**";

            let aDelay = 1200;
            if (animationDelay[message.author.id + message.guild.id]) aDelay = parseInt(animationDelay[message.author.id + message.guild.id]);

            function matchResult(r) {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setThumbnail(myChar.image)
                if (cmd === "d" || cmd === "dungeon") {
                    let desc = "";
                    if (r === "w") {
                        dungeonFloors[message.author.id + message.guild.id][floor]++;
                        let unlocked = `<a:arrow_green:916716811842621450> Floor ${floor} progress: **${dungeonFloors[message.author.id + message.guild.id][floor]}**/${enemies.filter((e) => e.floor.includes(floor))[0].boss ? "1" : "20"}`;
                        if ((enemies.filter((e) => e.floor.includes(floor))[0].boss && dungeonFloors[message.author.id + message.guild.id][floor] == 1) || (!enemies.filter((e) => e.floor.includes(floor))[0].boss && dungeonFloors[message.author.id + message.guild.id][floor] == 20)) {
                            unlocked = `🔑 Floor **${floor+1}** has been unlocked`;
                            dungeonFloors[message.author.id + message.guild.id][floor+1] = 0;
                        };
                        desc = `<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n${unlocked}\n<a:arrow_orange:916716747623641210> Runs left: **${dunLim+1 - dungeonLimit[message.author.id + message.guild.id]["current"]}**+**${dunLim+1 - dungeonLimit[message.author.id + message.guild.id]["normal"]}**`;
                    };
                    if (r === "l") desc = `💀 **${myChar.name}** lost 💀\n<a:arrow_green:916716811842621450> Floor ${floor} progress: **${dungeonFloors[message.author.id + message.guild.id][floor]}**/${enemies.filter((e) => e.floor.includes(floor))[0].boss ? "1" : "20"}\n<a:arrow_orange:916716747623641210> Runs left: **${dunLim+1 - dungeonLimit[message.author.id + message.guild.id]["current"]}**+**${dunLim+1 - dungeonLimit[message.author.id + message.guild.id]["normal"]}**\n<a:arrow_red:916716702618767401> ${eEP > myEP ? `**${enemy.name}** was ${Math.floor((eEP/myEP)*10000)/100}% stronger` : "Better luck next time"}`
                    Embed.setTitle(`Dungeon Floor ${floor} ${enemy.boss ? "(Boss)" : ""}`)
                    .setDescription(desc)
                    .setFooter(`Balance: ${coins[message.author.id + message.guild.id]} coins`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                    if (r === "w") {
                        let loot = 80 + Math.floor(Math.random() * floor * 5);
                        Embed.setFooter(`Balance: ${parseInt(coins[message.author.id + message.guild.id])+loot} coins`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                        function shardCount(p, n) {
                            let shard = 0;
                            for (si=0; si < n; si++) {
                                shard += Math.floor((1+(p*Math.ceil(floor/10)))*Math.random());
                            };
                            return shard;
                        };
                        let ssShards = shardCount(0.01, 3);
                        let sShards = shardCount(0.016, 5);
                        let aShards = shardCount(0.026, 7);
                        let bShards = shardCount(0.067, 9);
                        let cShards = shardCount(0.098, 12);
                        let dShards = shardCount(0.13, 15);
                        if (enemies.filter((e) => e.floor.includes(floor))[0].boss && dungeonFloors[message.author.id + message.guild.id][floor] == 1) ssShards += 2, loot *= 2;
                        
                        if (!shards[message.author.id + message.guild.id]) shards[message.author.id + message.guild.id] = { ss: 0, s: 0, a: 0, b: 0, c: 0, d: 0 };
                        shards[message.author.id + message.guild.id]["ss"] += ssShards;
                        shards[message.author.id + message.guild.id]["s"] += sShards;
                        shards[message.author.id + message.guild.id]["a"] += aShards;
                        shards[message.author.id + message.guild.id]["b"] += bShards;
                        shards[message.author.id + message.guild.id]["c"] += cShards;
                        shards[message.author.id + message.guild.id]["d"] += dShards;

                        let lootArr = [loot];
                        if (ssShards != 0) lootArr.push(`<:ss_shard:917203009543503892>x${ssShards}`);
                        if (sShards != 0) lootArr.push(`<:s_shard:917202925514817566>x${sShards}`);
                        if (aShards != 0) lootArr.push(`<:a_shard:917202904862052392>x${aShards}`);
                        if (bShards != 0) lootArr.push(`<:b_shard:917202862851899392>x${bShards}`);
                        if (cShards != 0) lootArr.push(`<:c_shard:917202862499582002>x${cShards}`);
                        if (dShards != 0) lootArr.push(`<:d_shard:917202840563363891>x${dShards}`);

                        if(!coins[message.author.id + message.guild.id]) coins[message.author.id + message.guild.id] = 0;
                        coins[message.author.id + message.guild.id] += loot;
                        if (lootArr.length > 6) {
                            Embed.addFields(
                                { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}\n${lootArr[6]}`, inline: true },
                                { name: '\u200B', value: `${lootArr[1]}\n${lootArr[4]}`, inline: true },
                                { name: '\u200B', value: `${lootArr[2]}\n${lootArr[5]}`, inline: true },
                            )
                        } else if (lootArr.length == 6) {
                            Embed.addFields(
                                { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}`, inline: true },
                                { name: '\u200B', value: `${lootArr[1]}\n${lootArr[4]}`, inline: true },
                                { name: '\u200B', value: `${lootArr[2]}\n${lootArr[5]}`, inline: true },
                            )
                        } else if (lootArr.length == 5) {
                            Embed.addFields(
                                { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}`, inline: true },
                                { name: '\u200B', value: `${lootArr[1]}\n${lootArr[4]}`, inline: true },
                                { name: '\u200B', value: `${lootArr[2]}`, inline: true },
                            )
                        } else if (lootArr.length == 4) {
                            Embed.addFields(
                                { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}`, inline: true },
                                { name: '\u200B', value: `${lootArr[1]}`, inline: true },
                                { name: '\u200B', value: `${lootArr[2]}`, inline: true },
                            )
                        } else if (lootArr.length == 3) {
                            Embed.addFields(
                                { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>`, inline: true },
                                { name: '\u200B', value: `${lootArr[1]}`, inline: true },
                                { name: '\u200B', value: `${lootArr[2]}`, inline: true },
                            )
                        } else if (lootArr.length == 2) {
                            Embed.addFields(
                                { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>`, inline: true },
                                { name: '\u200B', value: `${lootArr[1]}`, inline: true },
                            )
                        } else {
                            Embed.addFields(
                                { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>`, inline: true },
                            )
                        };
                    };
                } else {
                    if (!arenaResults[message.author.id + message.guild.id]) arenaResults[message.author.id + message.guild.id] = {"wins": 0, "losses": 0};
                    let desc = "";
                    if (r === "w") {
                        desc = `<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n_Merlin... Everyone... I'm so...\nsorry..._`;
                        arenaResults[message.author.id + message.guild.id].wins++;
                    } else if (r === "l") {
                        desc = `💀 **${myChar.name}** lost 💀\n_Until the Selection is made true,\nI shall not fall._`;
                        arenaResults[message.author.id + message.guild.id].losses++;
                    };
                    fs.writeFile('Storage/arenaResults.json', JSON.stringify(arenaResults), (err) => {
                        if (err) console.error(err);
                    });
                    Embed.setColor(0xbbffff)
                    .setTitle(`Battle Arena`)
                    .setDescription(desc)
                    .setFooter(`Total wins: ${arenaResults[message.author.id + message.guild.id].wins}`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                };
                return Embed;
            };

            async function newFight() {
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setThumbnail(myChar.image)
                    .setFooter(`Enemy EP: ${eEP}`)
                    if (cmd === "d" || cmd === "dungeon") {
                        Embed.setTitle(`Dungeon Floor ${floor} ${enemy.boss ? "(Boss)" : ""}`)
                        .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) 💖\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) 💖\n${hpbar(myHP, myHPd)}`)
                        .setImage(enemy.image[Math.floor(Math.random()*enemy.image.length)])
                    } else {
                        Embed.setTitle(`Battle Arena`)
                        .setDescription(`I accept your challenge\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) 💖\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) 💖\n${hpbar(myHP, myHPd)}`)
                        .setImage(enemy.image)
                    };
                    message.channel.send(Embed).then(msg => {
                        msg.react("⚔️").then(r => {
                            msg.react("🛡️");
                            
                            let turn = 1;
                            let round = 1;
                            let abilityUsed = 0;
                            let notice = ["", "", ""];
                            let abilities = {
                                "64": {
                                    usage: 999,
                                    selected: "fushi",
                                    fushi: 1,
                                    parona: 0, // #65
                                    gugu: 0,   // #66
                                    march: 0,  // #67
                                    ability: () => {
                                        // Fushi transforms randomly in one of 3 characters who each have their own stats.
                                        if (!inventory[message.author.id + message.guild.id].filter((e) => e == 65 || e == 66 || e == 67).length) return message.channel.send("You don't have any of the characters **Parona**, **Gugu** or **March** to transform into");
                                        
                                        if (abilities["64"].selected == "fushi") {
                                            let pick;
                                            let obtained = [];
                                            if (inventory[message.author.id + message.guild.id].includes(65)) obtained.push("parona");
                                            if (inventory[message.author.id + message.guild.id].includes(66)) obtained.push("gugu");
                                            if (inventory[message.author.id + message.guild.id].includes(67)) obtained.push("march");
                                            let rand = Math.random();
                                            if (obtained.length === 3) {
                                                if (rand < 1/3) {
                                                    pick = 2;
                                                } else if (rand > 2/3) {
                                                    pick = 1;
                                                } else {
                                                    pick = 0;
                                                };
                                            } else if (obtained.length === 2) {
                                                if (rand < 0.5) {
                                                    pick = 1;
                                                } else {
                                                    pick = 0;
                                                };
                                            } else {
                                                pick = 0;
                                            };
                                            let pID;
                                            if (obtained[pick] === "parona") {
                                                pID = 65;
                                            } else if (obtained[pick] === "gugu") {
                                                pID = 66;
                                            } else {
                                                pID = 67;
                                            };

                                            abilities["64"].selected = obtained[pick];

                                            let newStats = getStats(pID);
                                            if (abilities["64"][obtained[pick]] === 0) abilities["64"][obtained[pick]] = newStats[0];
                                            abilities["64"].fushi = myHP;
                                            myHPd = newStats[0];
                                            myHP = abilities["64"][obtained[pick]];
                                            myATK = newStats[1];
                                            myDEF = newStats[2];

                                            notice.push(`\n✨ **${myChar.name}** transformed into **${characters[pID].name}**!`);
                                            Embed.setThumbnail(characters[pID].image).setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        } else {
                                            abilities["64"][abilities["64"].selected] = myHP;
                                            abilities["64"].selected = "fushi";

                                            myHPd = myHPt;
                                            myHP = abilities["64"].fushi;
                                            myATK = myATKd;
                                            myDEF = myDEFd;

                                            notice.push(`\n✨ **${myChar.name}** transformed back`);
                                            Embed.setThumbnail(myChar.image).setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        };

                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        setTimeout(attack, aDelay);
                                    },
                                },
                                "238": {
                                    usage: 3,
                                    used: 0,
                                    ability: () => {
                                        // Rimuru has a chance of 100%/60%/30%/10%/0% to instantly kill the enemy
                                        abilities["238"].used++;
                                        if (myEP/eEP > 2) {
                                            eHP = 0;
                                        } else if (myEP/eEP > 1.5) {
                                            if (Math.random() < 0.6) eHP = 0;
                                        } else if (myEP/eEP > 1.1) {
                                            if (Math.random() < 0.3) eHP = 0;
                                        } else if (myEP/eEP > 0.8) {
                                            if (Math.random() < 0.1) eHP = 0;
                                        };
                                        if (eHP == 0) {
                                            notice.push(`\n✨ **${myChar.name}** used Beelzebub to consume **${enemy.name}**!`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                        } else {
                                            notice.push(`\n✨ Attempt failed${(myEP/eEP > 0.8 && abilities["238"].used < abilities[myChar.id].usage) ? ". Repeat next round?" : ""}`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                            setTimeout(attack, aDelay);
                                        };
                                    },
                                },
                                "274": {
                                    usage: 1,
                                    ability: () => {
                                        // Eren increases his stats by 15% of his max HP, current DEF and current ATK
                                        myHP += Math.floor(3*myHPd/20);
                                        if (myHP > myHPd) myHPd = myHP;
                                        myATK += Math.floor(3*myATK/20);
                                        myDEF += Math.floor(3*myDEF/20);
                                        notice.push(`\n✨ **${myChar.name}** has transformed into a Titan!\n<:blank:917804200363171860> All stats are raised by **+15%**`);
                                        Embed.setThumbnail("https://i.ibb.co/YfnG2Tn/at.png").setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        setTimeout(attack, aDelay);
                                    },
                                },
                                "405": {
                                    usage: 1,
                                    ability: () => {
                                        // Saber unleashes an attack with 250% the normal damage. She needs to wait 4 rounds first.
                                        if (round <= 3) {
                                            turn = 1;
                                            abilityUsed--;
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                            return message.channel.send(`**${myChar.name}** needs ${4-round} more ${round == 3 ? "round" : "rounds"} to prepare`)
                                        };
                                        let dmg = Math.floor(((2.5*myATK) * Math.pow(0.99818, eDEF)) * (1 - (0.2*Math.random())));
                                        eHP -= dmg;
                                        if (eHP < 0) {
                                            eHP = 0;
                                        } else {
                                            setTimeout(attack, aDelay);
                                        };
                                        notice.push(`\n✨ **${myChar.name}** used Excalibur! She has dealt **${dmg}** damage`);
                                        Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                    },
                                },
                                "733": {
                                    usage: 1,
                                    ability: () => {
                                        // Albedo (GI) increases his ATK by 50% of his current DEF
                                        myATK += Math.floor(myDEF/2);
                                        notice.push(`\n✨ **${myChar.name}** has increased his **ATK** by half of his **DEF** (**+${Math.floor(myDEF/2)}**)`);
                                        Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        setTimeout(attack, aDelay);
                                    },
                                },
                                "1824": {
                                    usage: 1,
                                    ability: () => {
                                        // Ryuuko sacrifices 30% of her current HP for a 60% ATK increase of lost HP
                                        let sacrifice = Math.floor(myHP*0.3);
                                        myHP -= sacrifice;
                                        myATK += Math.floor(sacrifice*0.6);
                                        notice.push(`\n✨ **${myChar.name}** sacrificed **${sacrifice}**HP for **${Math.floor(sacrifice*0.6)}**ATK`);
                                        Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        turn = 1;
                                    },
                                },
                                "2079": {
                                    usage: 1,
                                    ability: () => {
                                        // Albedo increases DEF by 100% and ATK by 20% of current DEF
                                        let raiseDef = myDEF;
                                        let raiseAtk = Math.floor(myDEF/5);
                                        myDEF += raiseDef;
                                        myATK += raiseAtk;
                                        notice.push(`\n✨ **${myChar.name}** equipped Hermes Trismegistus!\n<:blank:917804200363171860> She has gained **+${raiseDef}**DEF and **+${raiseAtk}**ATK`);
                                        Embed.setThumbnail("https://i.ibb.co/S7v6Qmx/a.png").setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        setTimeout(attack, aDelay);
                                    },
                                },
                                "2080": {
                                    usage: 10,
                                    ability: () => {
                                        // Shalltear drains 20% of enemy HP and adds it to herself.
                                        let drain = Math.floor(eHP/5);
                                        eHP -= drain;
                                        myHP += drain;
                                        if (myHP > myHPd) myHP = myHPd;
                                        if (eHP < 0) {
                                            eHP = 0;
                                        } else {
                                            setTimeout(attack, aDelay);
                                        };
                                        notice.push(`\n✨ **${myChar.name}** has drained **${drain}**HP from **${enemy.name}**`);
                                        Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                    },
                                },
                                "2360": {
                                    usage: 3,
                                    usedround: -1,
                                    revive: 0,
                                    revivehp: 30,
                                    update: () => {
                                        abilities["2360"].revive /= 2;
                                        abilities["2360"].revivehp /= 2;
                                    },
                                    ability: () => {
                                        // C.C. decreases enemy DEF by 20%. +14/28/42% chance of revival with 30/35/40% HP
                                        if (round - abilities["2360"].usedround > 1) {
                                            abilities["2360"].usedround = round;

                                            let decrease = Math.floor(eDEF*0.2);
                                            eDEF -= decrease;
    
                                            abilities["2360"].revive += 14;
                                            abilities["2360"].revivehp += 10;
    
                                            setTimeout(attack, aDelay);
                                            notice.push(`\n✨ **${myChar.name}** used her Code of Immortality for a **${abilities["2360"].revive}**% chance of revival\n<:blank:917804200363171860> **${enemy.name}**'s DEF decreased by **-${decrease}**`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                        } else {
                                            turn = 1;
                                            abilityUsed--;
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                            return message.channel.send(`You need to wait 1 more round`)
                                        };
                                    },
                                },
                            };
                            
                            if (abilities[myChar.id]) msg.react("✨");
                            msg.react("⏩");

                            
                            function displayNotice() {
                                return notice[notice.length-3] + notice[notice.length-2] + notice[notice.length-1];
                            };

                            const atkFilter = (reaction, user1) => reaction.emoji.name === "⚔️" && user1.id === message.author.id;
                            const defFilter = (reaction, user1) => reaction.emoji.name === "🛡️" && user1.id === message.author.id;
                            var abilityFilter;
                            if (abilities[myChar.id]) abilityFilter = (reaction, user1) => reaction.emoji.name === "✨" && user1.id === message.author.id;
                            const skipFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                            
                            const atk = msg.createReactionCollector(atkFilter, {time: 120000});
                            const def = msg.createReactionCollector(defFilter, {time: 120000});
                            var ability;
                            if (abilities[myChar.id]) ability = msg.createReactionCollector(abilityFilter, {time: 120000});
                            const skip = msg.createReactionCollector(skipFilter, {time: 120000});

                            function attack() {
                                let eDmg = Math.floor((eATK * Math.pow(0.99818, myDEF)) * (1 - (0.2*Math.random())));
                                if (eHP > 0) myHP -= eDmg;
                                if (myHP < 0) myHP = 0;
                                notice.push(`\n⚔️ **${enemy.name}** has dealt **${eDmg}** damage`);
                                Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                msg.edit(Embed);

                                if (myHP <= 0 || eHP <= 0) {
                                    if (myHP <= 0) {
                                        if ((abilities[myChar.id] ? abilities[myChar.id].revive : false) && Math.random() < (parseInt(abilities[myChar.id].revive) / 100)) {
                                            myHP += Math.floor((myHPd/100) * abilities[myChar.id].revivehp);
                                            abilities["2360"].update();
                                            notice.push(`\n✨ **${myChar.name}** survived! Restored **${myHP}**HP`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                        } else {
                                            atk.stop(), def.stop(), skip.stop();
                                            if (abilities[myChar.id]) ability.stop();

                                            notice.push(`\n💀 **${myChar.name}** lost`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("l"))
                                        };
                                    } else {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (abilities[myChar.id]) ability.stop();

                                        notice.push(`\n🎉 **${myChar.name}** won`);
                                        Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        turn = 1;
                                        resolve(matchResult("w"))
                                    };
                                };
                                turn = 1;
                                round++;
                            };
    
                            atk.on('collect', r => {
                                if (turn == 1) {
                                    if (Math.random() < 0.02 + (0.07*(eEP/myEP))) {
                                        notice.push(`\n🛡️ **${enemy.name}** blocked your attack!`);
                                        setTimeout(attack, aDelay);
                                        turn = 0;
                                    } else {
                                        let dmg = Math.floor((myATK * Math.pow(0.99818, eDEF)) * (1 - (0.2*Math.random())));
                                        if (Math.random() < 0.06 + 0.01*(myDEF/eDEF)) {
                                            dmg *= 2;
                                            notice.push(`\n⚔️ **${myChar.name}** has dealt a critical hit! **${dmg}** damage`);
                                        } else {
                                            notice.push(`\n⚔️ **${myChar.name}** has dealt **${dmg}** damage`);
                                        };
                                        eHP -= dmg;
                                        if (eHP < 0) {
                                            eHP = 0;
                                        } else {
                                            setTimeout(attack, aDelay);
                                        };
                                        turn = 0;
                                    };
                                    
                                    
                                    Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("⚔️").users.remove(message.author);
    
                                    if (myHP <= 0 || eHP <= 0) {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (abilities[myChar.id]) ability.stop();
                                        if (myHP <= 0) {
                                            notice.push(`\n💀 **${myChar.name}** lost`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("l"))
                                        } else {
                                            notice.push(`\n🎉 **${myChar.name}** won`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("w"))
                                        };
                                    };
                                } else {
                                    message.channel.send("Please wait a moment");
                                    msg.reactions.resolve("⚔️").users.remove(message.author);
                                };
                            });

                            def.on('collect', r => {
                                if (turn == 1) {
                                    myDEF +=  40 + Math.floor((myDEFd/5)*(1-(0.2*Math.random())));
                                    notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${40 + Math.floor((myDEFd/5)*(1-(0.2*Math.random())))}**`);
                                    turn = 0;
                                    if (Math.random() > 0.2) {
                                        setTimeout(attack, aDelay);
                                    } else {
                                        setTimeout(() => {
                                            notice.push(`\n🛡️ **${myChar.name}** has blocked **${enemy.name}'s** attack!`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            round++;
                                        }, aDelay)
                                    };
                                    
                                    Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("🛡️").users.remove(message.author);
    
                                    if (myHP <= 0 || eHP <= 0) {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (abilities[myChar.id]) ability.stop();
                                        if (myHP <= 0) {
                                            notice.push(`\n💀 **${myChar.name}** lost`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("l"))
                                        } else {
                                            notice.push(`\n🎉 **${myChar.name}** won`);
                                            Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("w"))
                                        };
                                    };
                                } else {
                                    message.channel.send("Please wait a moment");
                                    msg.reactions.resolve("🛡️").users.remove(message.author);
                                };
                            });
                            
                            if (abilities[myChar.id]) {
                                ability.on('collect', r => {
                                    if (abilityUsed < abilities[myChar.id].usage) {
                                        if (turn == 1) {
                                            turn = 0;
                                            abilityUsed++;
                                            abilities[myChar.id].ability();

                                            if (myHP <= 0 || eHP <= 0) {
                                                atk.stop(), def.stop(), ability.stop(), skip.stop();
                                                if (myHP <= 0) {
                                                    notice.push(`\n💀 **${myChar.name}** lost`);
                                                    Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                                    msg.edit(Embed);
                                                    turn = 1;
                                                    resolve(matchResult("l"))
                                                } else {
                                                    notice.push(`\n🎉 **${myChar.name}** won`);
                                                    Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                                    msg.edit(Embed);
                                                    turn = 1;
                                                    resolve(matchResult("w"))
                                                };
                                            };
                                        } else {
                                            message.channel.send("Please wait a moment");
                                        };
                                    } else {
                                        message.channel.send(`You can use **${myChar.name}**'s ability only ${abilities[myChar.id].usage == 1 ? "once" : `${abilities[myChar.id].usage} times`} per fight.`)
                                    };
                                    msg.reactions.resolve("✨").users.remove(message.author);
                                });
                            };
    
                            skip.on('collect', r => {
                                if (turn == 1) {
                                    notice.push(`\n⏩ Skipping to results...`);
                                    Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("⏩").users.remove(message.author);
                                    turn = 0;
                                    while (eHP > 0 && myHP > 0) {
                                        if (Math.random() > 0.02 + (0.1*(eEP/myEP))) eHP -= Math.floor((myATK * Math.pow(0.99818, eDEF)) * (1 - (0.2*Math.random())));
                                        if (eHP < 0) eHP = 0;
                                        if (eHP > 0) myHP -= Math.floor((eATK * Math.pow(0.99818, myDEF)) * (1 - (0.2*Math.random())));
                                        if (myHP < 0) myHP = 0;
                                    };
                                    
                                    setTimeout(() => {
                                        if (myHP <= 0 || eHP <= 0) {
                                            atk.stop(), def.stop(), skip.stop();
                                            if (abilities[myChar.id]) ability.stop();
                                            if (myHP <= 0) {
                                                notice.push(`\n💀 **${myChar.name}** lost`);
                                                Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                                msg.edit(Embed);
                                                turn = 1;
                                                resolve(matchResult("l"))
                                            } else {
                                                notice.push(`\n🎉 **${myChar.name}** won`);
                                                Embed.setDescription(`${cmd === "arena" ? "I accept your challenge" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!`}\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                                msg.edit(Embed);
                                                turn = 1;
                                                resolve(matchResult("w"))
                                            };
                                        };
                                    }, aDelay);
                                } else {
                                    turn = 1;
                                    message.channel.send("Please wait a moment");
                                    msg.reactions.resolve("⏩").users.remove(message.author);
                                };
                            });

                        });
                    });

                });
                if (cmd === "d" || cmd === "dungeon") {
                    fs.writeFile('Storage/dungeonFloors.json', JSON.stringify(dungeonFloors), (err) => {
                        if (err) console.error(err);
                    });
                    fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                        if (err) console.error(err);
                    });
                    fs.writeFile('Storage/shards.json', JSON.stringify(shards), (err) => {
                        if (err) console.error(err);
                    });
                };
                message.channel.send(result);
            };
            if (cmd === "d" || cmd === "dungeon") {
                newFight();
            } else {
                message.channel.send("Very well..");
                setTimeout(() => {message.channel.send("I'll give it everything I've got!")}, 1800)
                setTimeout(newFight, 3600);
            };
            return;
        };

        // Arena
        if (cmd === "arena") {

            if (!args[0]) return message.channel.send("Welcome to the Arena! Challenge your friends with `" + prefix + "arena <@user>` using your favorite waifus/husbandos!");
            if (!battleChar[message.author.id + message.guild.id]) return message.channel.send("You have to choose a character to fight with first. Use `" + prefix + "select <char name>` to choose one.");
            if (!inventory[message.author.id + message.guild.id].includes(battleChar[message.author.id + message.guild.id])) return message.channel.send("You have to choose a battle character first. Use `" + prefix + "select <char name>` to choose one.");

            if (!message.mentions.users.first()) return message.channel.send("Please mention someone to challenge. Use `" + prefix + "arena <@user>`")
            let user = message.mentions.users.first();
            if (user.id === message.author.id) return message.channel.send("Please, don't fight yourself <:Heh:869656740667469864>")
            if (user.bot && user.id !== "695286837568340119") return message.channel.send("You can't fight bots... or.. maybe you want.. ");
            if (!battleChar[user.id + message.guild.id]) return message.channel.send(user.username + " has to choose a character to fight with first. Use `" + prefix + "select <char name>` to choose one.");
            if (!inventory[user.id + message.guild.id].includes(battleChar[user.id + message.guild.id])) return message.channel.send(user.username + " has to choose a character to fight with first. Use `" + prefix + "select <char name>` to choose one.");

            let bets = 0;
            if (args[1] && !isNaN(args[1])) {
                if (parseInt(args[1]) > 100000000) return message.channel.send("You can't bet more than **100000000**<:coins:872926669055356939>")
                if (!coins[message.author.id + message.guild.id]) coins[message.author.id + message.guild.id] = 0;
                if (!coins[user.id + message.guild.id]) coins[user.id + message.guild.id] = 0;
                args[1] = Math.floor(args[1]);
                if (parseInt(args[1]) < 1) return message.channel.send(`You can't bet **${args[1]}**<:coins:872926669055356939>`)
                if (parseInt(args[1]) > coins[message.author.id + message.guild.id]) return message.channel.send(`You don't have **${args[1]}**<:coins:872926669055356939>`);
                if (parseInt(args[1]) > coins[user.id + message.guild.id]) return message.channel.send(`${user.username} doesn't have **${args[1]}**<:coins:872926669055356939>`);
                bets = parseInt(args[1]);
            };

            if (!arenaResults[message.author.id + message.guild.id]) arenaResults[message.author.id + message.guild.id] = { "wins": 0, "losses": 0 };
            if (!arenaResults[user.id + message.guild.id]) arenaResults[user.id + message.guild.id] = { "wins": 0, "losses": 0 };

            let myChar = characters[battleChar[message.author.id + message.guild.id]];
            let eChar = characters[battleChar[user.id + message.guild.id]];

            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            if (!charlvl[message.author.id + message.guild.id][myChar.id]) charlvl[message.author.id + message.guild.id][myChar.id] = 1;
            if (!charlvl[user.id + message.guild.id]) charlvl[user.id + message.guild.id] = {};
            if (!charlvl[user.id + message.guild.id][eChar.id]) charlvl[user.id + message.guild.id][eChar.id] = 1;
            
            let currLvl = charlvl[message.author.id + message.guild.id][myChar.id];
            let currLvle = charlvl[user.id + message.guild.id][eChar.id];

            let myHP = baseHP(myChar.id);
            let myATK = baseATK(myChar.id);
            let myDEF = baseDEF(myChar.id);
            let eHP = baseHP(eChar.id);
            let eATK = baseATK(eChar.id);
            let eDEF = baseDEF(eChar.id);

            let rm;
            if (!ref[message.author.id + message.guild.id][myChar.id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][myChar.id];
            };
            if (rm > 5) rm = 5;
            
            switch (myChar.rarity) {
                case "SS" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((5+(2*((myHP-180)/60)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((2.4+(0.35*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((1.25+(0.25*((myDEF-50)/30)))*(currLvl-1)); break;
                case "S" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((3.9+(0.6*((myHP-150)/50)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((1.9+(0.3*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((1+(0.2*((myDEF-50)/30)))*(currLvl-1)); break;
                case "A" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((3.3+(0.4*((myHP-120)/60)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((1.6+(0.25*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((0.8+(0.15*((myDEF-50)/30)))*(currLvl-1)); break;
                case "B" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((2.8+(0.4*((myHP-100)/50)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((1.2+(0.3*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((0.6+(0.2*((myDEF-50)/30)))*(currLvl-1)); break;
                case "C" : myHp = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((2.4+(0.4*((myHP-80)/40)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((0.9+(0.35*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((0.5+(0.15*((myDEF-50)/30)))*(currLvl-1)); break;
                case "D" : myHP = Math.floor((1+0.25*(rm-1))*myHP) + Math.round((2+(0.5*((myHP-70)/30)))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*myATK) + Math.round((0.75+(0.25*((myATK-50)/30)))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*myDEF) + Math.round((0.4+(0.5*((myDEF-50)/30)))*(currLvl-1)); break;
                default : myHP = 1; myATK = 1; myDEF = 1; break;
            };
            let myEP = Math.floor(((myHP/Math.pow(0.99818,myDEF)) / (100/myATK))*100) / 100;
            let myHPd = myHP;
            let myHPt = myHP;
            let myATKd = myATK;
            let myDEFd = myDEF;

            if (!ref[user.id + message.guild.id][eChar.id]) {
                rm = 0;
            } else {
                rm = ref[user.id + message.guild.id][eChar.id];
            };
            if (rm > 5) rm = 5;
            
            switch (eChar.rarity) {
                case "SS" : eHP = Math.floor((1+0.25*(rm-1))*eHP) + Math.round((5+(2*((eHP-180)/60)))*(currLvle-1)); eATK = Math.floor((1+0.25*(rm-1))*eATK) + Math.round((2.4+(0.35*((eATK-50)/30)))*(currLvle-1)); eDEF = Math.floor((1+0.25*(rm-1))*eDEF) + Math.round((1.25+(0.25*((eDEF-50)/30)))*(currLvle-1)); break;
                case "S" : eHP = Math.floor((1+0.25*(rm-1))*eHP) + Math.round((3.9+(0.6*((eHP-150)/50)))*(currLvle-1)); eATK = Math.floor((1+0.25*(rm-1))*eATK) + Math.round((1.9+(0.3*((eATK-50)/30)))*(currLvle-1)); eDEF = Math.floor((1+0.25*(rm-1))*eDEF) + Math.round((1+(0.2*((eDEF-50)/30)))*(currLvle-1)); break;
                case "A" : eHP = Math.floor((1+0.25*(rm-1))*eHP) + Math.round((3.3+(0.4*((eHP-120)/60)))*(currLvle-1)); eATK = Math.floor((1+0.25*(rm-1))*eATK) + Math.round((1.6+(0.25*((eATK-50)/30)))*(currLvle-1)); eDEF = Math.floor((1+0.25*(rm-1))*eDEF) + Math.round((0.8+(0.15*((eDEF-50)/30)))*(currLvle-1)); break;
                case "B" : eHP = Math.floor((1+0.25*(rm-1))*eHP) + Math.round((2.8+(0.4*((eHP-100)/50)))*(currLvle-1)); eATK = Math.floor((1+0.25*(rm-1))*eATK) + Math.round((1.2+(0.3*((eATK-50)/30)))*(currLvle-1)); eDEF = Math.floor((1+0.25*(rm-1))*eDEF) + Math.round((0.6+(0.2*((eDEF-50)/30)))*(currLvle-1)); break;
                case "C" : eHP = Math.floor((1+0.25*(rm-1))*eHP) + Math.round((2.4+(0.4*((eHP-80)/40)))*(currLvle-1)); eATK = Math.floor((1+0.25*(rm-1))*eATK) + Math.round((0.9+(0.35*((eATK-50)/30)))*(currLvle-1)); eDEF = Math.floor((1+0.25*(rm-1))*eDEF) + Math.round((0.5+(0.15*((eDEF-50)/30)))*(currLvle-1)); break;
                case "D" : eHP = Math.floor((1+0.25*(rm-1))*eHP) + Math.round((2+(0.5*((eHP-70)/30)))*(currLvle-1)); eATK = Math.floor((1+0.25*(rm-1))*eATK) + Math.round((0.75+(0.25*((eATK-50)/30)))*(currLvle-1)); eDEF = Math.floor((1+0.25*(rm-1))*eDEF) + Math.round((0.4+(0.5*((eDEF-50)/30)))*(currLvle-1)); break;
                default : eHP = 1; eATK = 1; eDEF = 1; break;
            };
            let eEP = Math.floor(((eHP/Math.pow(0.99818,eDEF)) / (100/eATK))*100) / 100;
            let eHPd = eHP;
            let eHPt = eHP;
            let eATKd = eATK;
            let eDEFd = eDEF;

            function hpbar(cur, initial) {
                if (cur/initial > 0.9 && cur/initial <= 1) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barR:872111210571628605>";
                if (cur/initial > 0.8 && cur/initial <= 0.9) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barRh:872111194188705848>";
                if (cur/initial > 0.7 && cur/initial <= 0.8) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.6 && cur/initial <= 0.7) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.5 && cur/initial <= 0.6) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.4 && cur/initial <= 0.5) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.3 && cur/initial <= 0.4) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.2 && cur/initial <= 0.3) return "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0.1 && cur/initial <= 0.2) return "<:barL:872111285741969438><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial > 0 && cur/initial <= 0.1) return "<:barL:872111285741969438><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (cur/initial <= 0) return "<:barLh:872111263747035177><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            };

            let aDelay = 1200;
            if (animationDelay[message.author.id + message.guild.id]) aDelay = parseInt(animationDelay[message.author.id + message.guild.id]);

            function matchResult(r) {
                const EmbedR = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`Battle Arena`)
                if (r === "w") {
                    arenaResults[message.author.id + message.guild.id].wins++;
                    arenaResults[user.id + message.guild.id].losses++;
                    if (bets) coins[message.author.id + message.guild.id] += bets, coins[user.id + message.guild.id] -= bets;
                    EmbedR.setDescription(`<:stars_v2:917023655840591963> **${message.author.username}** won! <:stars_v2:917023655840591963>\n${bets ? `Added **${bets}**<:coins:872926669055356939> to your balance.\n` : ""}Better luck next time ${user.username}.`).setThumbnail(myChar.image).setFooter(`Total wins: ${arenaResults[message.author.id + message.guild.id].wins}`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048");
                };
                if (r === "l") {
                    arenaResults[message.author.id + message.guild.id].losses++;
                    arenaResults[user.id + message.guild.id].wins++;
                    if (bets) coins[message.author.id + message.guild.id] -= bets, coins[user.id + message.guild.id] += bets;
                    EmbedR.setDescription(`<:stars_v2:917023655840591963> **${user.username}** won! <:stars_v2:917023655840591963>\n${bets ? `Added **${bets}**<:coins:872926669055356939> to your balance.\n` : ""}Better luck next time ${message.author.username}.`).setThumbnail(eChar.image).setFooter(`Total wins: ${arenaResults[user.id + message.guild.id].wins}`, user.displayAvatarURL({ dynamic: true }) + "?size=2048");
                };
                return EmbedR;
            };

            async function newFight() {
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setTitle(`Battle Arena`)
                    .setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) 💖\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) 💖\n${hpbar(myHP, myHPd)}`)
                    .setImage(eChar.image)
                    .setThumbnail(myChar.image)
                    .setFooter(`Turn: ${user.username}`)
                    message.channel.send(Embed).then(msg => {
                        msg.react("⚔️").then(r => {
                            msg.react("🛡️");
                            
                            let turn = 1;
                            let round = 1;
                            let abilityUsed = 0;
                            let abilityUsed2 = 0;
                            let notice = ["", "", ""];
                            let abilities = {
                                "64": {
                                    usage: 999,
                                    selected: "fushi",
                                    fushi: 1,
                                    parona: 0, // #65
                                    gugu: 0,   // #66
                                    march: 0,  // #67
                                    ability: () => {
                                        // Fushi transforms randomly in one of 3 characters who each have their own stats.
                                        if (!inventory[message.author.id + message.guild.id].filter((e) => e == 65 || e == 66 || e == 67).length) return message.channel.send("You don't have any of the characters **Parona**, **Gugu** or **March** to transform into");
                                        
                                        if (abilities["64"].selected == "fushi") {
                                            let pick;
                                            let obtained = [];
                                            if (inventory[message.author.id + message.guild.id].includes(65)) obtained.push("parona");
                                            if (inventory[message.author.id + message.guild.id].includes(66)) obtained.push("gugu");
                                            if (inventory[message.author.id + message.guild.id].includes(67)) obtained.push("march");
                                            let rand = Math.random();
                                            if (obtained.length === 3) {
                                                if (rand < 1/3) {
                                                    pick = 2;
                                                } else if (rand > 2/3) {
                                                    pick = 1;
                                                } else {
                                                    pick = 0;
                                                };
                                            } else if (obtained.length === 2) {
                                                if (rand < 0.5) {
                                                    pick = 1;
                                                } else {
                                                    pick = 0;
                                                };
                                            } else {
                                                pick = 0;
                                            };
                                            let pID;
                                            if (obtained[pick] === "parona") {
                                                pID = 65;
                                            } else if (obtained[pick] === "gugu") {
                                                pID = 66;
                                            } else {
                                                pID = 67;
                                            };

                                            abilities["64"].selected = obtained[pick];

                                            let newStats = getStats(pID);
                                            if (abilities["64"][obtained[pick]] === 0) abilities["64"][obtained[pick]] = newStats[0];
                                            abilities["64"].fushi = myHP;
                                            myHPd = newStats[0];
                                            myHP = abilities["64"][obtained[pick]];
                                            myATK = newStats[1];
                                            myDEF = newStats[2];

                                            notice.push(`\n✨ **${myChar.name}** transformed into **${characters[pID].name}**!`);
                                            Embed.setThumbnail(characters[pID].image).setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        } else {
                                            abilities["64"][abilities["64"].selected] = myHP;
                                            abilities["64"].selected = "fushi";

                                            myHPd = myHPt;
                                            myHP = abilities["64"].fushi;
                                            myATK = myATKd;
                                            myDEF = myDEFd;

                                            notice.push(`\n✨ **${myChar.name}** transformed back`);
                                            Embed.setThumbnail(myChar.image).setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        };

                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        turn = 1;
                                    },
                                },
                                "238": {
                                    usage: 3,
                                    used: 0,
                                    ability: () => {
                                        // Rimuru has a chance of 100%/60%/30%/10%/0% to instantly kill the enemy
                                        abilities["238"].used++;
                                        if (myEP/eEP > 2) {
                                            eHP = 0;
                                        } else if (myEP/eEP > 1.5) {
                                            if (Math.random() < 0.6) eHP = 0;
                                        } else if (myEP/eEP > 1.1) {
                                            if (Math.random() < 0.3) eHP = 0;
                                        } else if (myEP/eEP > 0.8) {
                                            if (Math.random() < 0.1) eHP = 0;
                                        };
                                        if (eHP == 0) {
                                            notice.push(`\n✨ **${myChar.name}** used Beelzebub to consume **${eChar.name}**!`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                        } else {
                                            notice.push(`\n✨ Attempt failed${(myEP/eEP > 0.8 && abilities["238"].used < abilities[myChar.id].usage) ? ". Repeat next round?" : ""}`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                            turn = 1;
                                        };
                                    },
                                },
                                "274": {
                                    usage: 1,
                                    ability: () => {
                                        // Eren increases his stats by 15% of his max HP, current DEF and current ATK
                                        myHP += Math.floor(3*myHPd/20);
                                        if (myHP > myHPd) myHPd = myHP;
                                        myATK += Math.floor(3*myATK/20);
                                        myDEF += Math.floor(3*myDEF/20);
                                        notice.push(`\n✨ **${myChar.name}** has transformed into a Titan!\n<:blank:917804200363171860> All stats are raised by **+15%**`);
                                        Embed.setThumbnail("https://i.ibb.co/YfnG2Tn/at.png").setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        turn = 1;
                                    },
                                },
                                "405": {
                                    usage: 1,
                                    ability: () => {
                                        // Saber unleashes an attack with 250% the normal damage. She needs to wait 4 rounds first.
                                        if (round <= 3) {
                                            turn = 0;
                                            abilityUsed--;
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                            return message.channel.send(`**${myChar.name}** needs ${4-round} more ${round == 3 ? "round" : "rounds"} to prepare`)
                                        };
                                        let dmg = Math.floor(((2.5*myATK) * Math.pow(0.99818, eDEF)) * (1 - (0.2*Math.random())));
                                        eHP -= dmg;
                                        if (eHP < 0) {
                                            eHP = 0;
                                        } else {
                                            turn = 1;
                                        };
                                        notice.push(`\n✨ **${myChar.name}** used Excalibur! She has dealt **${dmg}** damage`);
                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                    },
                                },
                                "733": {
                                    usage: 1,
                                    ability: () => {
                                        // Albedo (GI) increases his ATK by 50% of his current DEF
                                        myATK += Math.floor(myDEF/2);
                                        notice.push(`\n✨ **${myChar.name}** has increased his **ATK** by half of his **DEF** (**+${Math.floor(myDEF/2)}**)`);
                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        turn = 1;
                                    },
                                },
                                "1824": {
                                    usage: 1,
                                    ability: () => {
                                        // Ryuuko sacrifices 30% of her current HP for a 60% ATK increase of lost HP
                                        let sacrifice = Math.floor(myHP*0.3);
                                        myHP -= sacrifice;
                                        myATK += Math.floor(sacrifice*0.6);
                                        notice.push(`\n✨ **${myChar.name}** sacrificed **${sacrifice}**HP for **${Math.floor(sacrifice*0.6)}**ATK`);
                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        turn = 0;
                                    },
                                },
                                "2079": {
                                    usage: 1,
                                    ability: () => {
                                        // Albedo increases DEF by 100% and ATK by 20% of current DEF
                                        let raiseDef = myDEF;
                                        let raiseAtk = Math.floor(myDEF/5);
                                        myDEF += raiseDef;
                                        myATK += raiseAtk;
                                        notice.push(`\n✨ **${myChar.name}** equipped Hermes Trismegistus!\n<:blank:917804200363171860> She has gained **+${raiseDef}**DEF and **+${raiseAtk}**ATK`);
                                        Embed.setThumbnail("https://i.ibb.co/S7v6Qmx/a.png").setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        turn = 1;
                                    },
                                },
                                "2080": {
                                    usage: 10,
                                    ability: () => {
                                        // Shalltear drains 20% of enemy HP and adds it to herself.
                                        let drain = Math.floor(eHP/5);
                                        eHP -= drain;
                                        myHP += drain;
                                        if (myHP > myHPd) myHP = myHPd;
                                        if (eHP < 0) {
                                            eHP = 0;
                                        } else {
                                            turn = 1;
                                        };
                                        notice.push(`\n✨ **${myChar.name}** has drained **${drain}**HP from **${eChar.name}**`);
                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                    },
                                },
                                "2360": {
                                    usage: 3,
                                    usedround: -1,
                                    revive: 0,
                                    revivehp: 30,
                                    update: () => {
                                        abilities["2360"].revive /= 2;
                                        abilities["2360"].revivehp /= 2;
                                    },
                                    ability: () => {
                                        // C.C. decreases enemy DEF by 20%. +14/28/42% chance of revival with 30/35/40% HP
                                        if (round - abilities["2360"].usedround > 1) {
                                            abilities["2360"].usedround = round;

                                            let decrease = Math.floor(eDEF*0.2);
                                            eDEF -= decrease;
    
                                            abilities["2360"].revive += 14;
                                            abilities["2360"].revivehp += 10;
    
                                            turn = 1;
                                            notice.push(`\n✨ **${myChar.name}** used her Code of Immortality for a **${abilities["2360"].revive}**% chance of revival\n<:blank:917804200363171860> **${eChar.name}**'s DEF decreased by **-${decrease}**`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                        } else {
                                            turn = 0;
                                            abilityUsed--;
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                            return message.channel.send(`You need to wait 1 more round`)
                                        };
                                    },
                                },
                            };

                            let abilities2 = {
                                "64": {
                                    usage: 999,
                                    selected: "fushi",
                                    fushi: 1,
                                    parona: 0, // #65
                                    gugu: 0,   // #66
                                    march: 0,  // #67
                                    ability: () => {
                                        // Fushi transforms randomly in one of 3 characters who each have their own stats.
                                        if (!inventory[user.id + message.guild.id].filter((e) => e == 65 || e == 66 || e == 67).length) return message.channel.send("You don't have any of the characters **Parona**, **Gugu** or **March** to transform into");
                                        
                                        if (abilities2["64"].selected == "fushi") {
                                            let pick;
                                            let obtained = [];
                                            if (inventory[user.id + message.guild.id].includes(65)) obtained.push("parona");
                                            if (inventory[user.id + message.guild.id].includes(66)) obtained.push("gugu");
                                            if (inventory[user.id + message.guild.id].includes(67)) obtained.push("march");
                                            let rand = Math.random();
                                            if (obtained.length === 3) {
                                                if (rand < 1/3) {
                                                    pick = 2;
                                                } else if (rand > 2/3) {
                                                    pick = 1;
                                                } else {
                                                    pick = 0;
                                                };
                                            } else if (obtained.length === 2) {
                                                if (rand < 0.5) {
                                                    pick = 1;
                                                } else {
                                                    pick = 0;
                                                };
                                            } else {
                                                pick = 0;
                                            };
                                            let pID;
                                            if (obtained[pick] === "parona") {
                                                pID = 65;
                                            } else if (obtained[pick] === "gugu") {
                                                pID = 66;
                                            } else {
                                                pID = 67;
                                            };

                                            abilities2["64"].selected = obtained[pick];

                                            if (!charlvl[user.id + message.guild.id]) charlvl[user.id + message.guild.id] = {};
                                            if (!charlvl[user.id + message.guild.id][pID]) charlvl[user.id + message.guild.id][pID] = 1;
                                            let currLvlf = charlvl[user.id + message.guild.id][id];
                                
                                            let hp = baseHP(pID);
                                            let atk = baseATK(pID);
                                            let def = baseDEF(pID);
                                            let rm;
                                            if (!ref[user.id + message.guild.id][pID]) {
                                                rm = 0;
                                            } else {
                                                rm = ref[user.id + message.guild.id][pID];
                                            };
                                            if (rm > 5) rm = 5;
                                            
                                            switch (characters[id].rarity) {
                                                case "SS" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((5+(2*((hp-180)/60)))*(currLvlf-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((2.4+(0.35*((atk-50)/30)))*(currLvlf-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1.25+(0.25*((def-50)/30)))*(currLvlf-1)); break;
                                                case "S" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.9+(0.6*((hp-150)/50)))*(currLvlf-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.9+(0.3*((atk-50)/30)))*(currLvlf-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1+(0.2*((def-50)/30)))*(currLvlf-1)); break;
                                                case "A" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.3+(0.4*((hp-120)/60)))*(currLvlf-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.6+(0.25*((atk-50)/30)))*(currLvlf-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.8+(0.15*((def-50)/30)))*(currLvlf-1)); break;
                                                case "B" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.8+(0.4*((hp-100)/50)))*(currLvlf-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.2+(0.3*((atk-50)/30)))*(currLvlf-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.6+(0.2*((def-50)/30)))*(currLvlf-1)); break;
                                                case "C" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.4+(0.4*((hp-80)/40)))*(currLvlf-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.9+(0.35*((atk-50)/30)))*(currLvlf-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.5+(0.15*((def-50)/30)))*(currLvlf-1)); break;
                                                case "D" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2+(0.5*((hp-70)/30)))*(currLvlf-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.75+(0.25*((atk-50)/30)))*(currLvlf-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.4+(0.5*((def-50)/30)))*(currLvlf-1)); break;
                                                default : hp = 1; atk = 1; def = 1; break;
                                            };
                                            let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (100/atk))*100) / 100;

                                            let newStats = [hp, atk, def, ep];
                                            if (abilities2["64"][obtained[pick]] === 0) abilities2["64"][obtained[pick]] = newStats[0];
                                            abilities2["64"].fushi = eHP;
                                            eHPd = newStats[0];
                                            eHP = abilities2["64"][obtained[pick]];
                                            eATK = newStats[1];
                                            eDEF = newStats[2];

                                            notice.push(`\n✨ **${eChar.name}** transformed into **${characters[pID].name}**!`);
                                            Embed.setImage(characters[pID].image).setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        } else {
                                            abilities2["64"][abilities2["64"].selected] = myHP;
                                            abilities2["64"].selected = "fushi";

                                            eHPd = eHPt;
                                            eHP = abilities2["64"].fushi;
                                            eATK = eATKd;
                                            eDEF = eDEFd;

                                            notice.push(`\n✨ **${myChar.name}** transformed back`);
                                            Embed.setImage(eChar.image).setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        };

                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(user);
                                        turn = 0;
                                    },
                                },
                                "238": {
                                    usage: 3,
                                    used: 0,
                                    ability: () => {
                                        // Rimuru has a chance of 100%/60%/30%/10%/0% to instantly kill the enemy
                                        abilities2["238"].used++;
                                        if (eEP/myEP > 2) {
                                            myHP = 0;
                                        } else if (eEP/myEP > 1.5) {
                                            if (Math.random() < 0.6) myHP = 0;
                                        } else if (eEP/myEP > 1.1) {
                                            if (Math.random() < 0.3) myHP = 0;
                                        } else if (eEP/myEP > 0.8) {
                                            if (Math.random() < 0.1) myHP = 0;
                                        };
                                        if (myHP == 0) {
                                            notice.push(`\n✨ **${eChar.name}** used Beelzebub to consume **${myChar.name}**!`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(user);
                                        } else {
                                            notice.push(`\n✨ Attempt failed${(eEP/myEP > 0.8 && abilities2["238"].used < abilities2[eChar.id].usage) ? ". Repeat next round?" : ""}`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(user);
                                            turn = 0;
                                        };
                                    },
                                },
                                "274": {
                                    usage: 1,
                                    ability: () => {
                                        // Eren increases his stats by 15% of his max HP, current DEF and current ATK
                                        eHP += Math.floor(3*eHPd/20);
                                        if (eHP > eHPd) eHPd = eHP;
                                        eATK += Math.floor(3*eATK/20);
                                        eDEF += Math.floor(3*eDEF/20);
                                        notice.push(`\n✨ **${eChar.name}** has transformed into a Titan!\n<:blank:917804200363171860> All stats are raised by **+15%**`);
                                        Embed.setImage("https://i.ibb.co/YfnG2Tn/at.png").setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(user);
                                        turn = 0;
                                    },
                                },
                                "405": {
                                    usage: 1,
                                    ability: () => {
                                        // Saber unleashes an attack with 250% the normal damage. She needs to wait 4 rounds first.
                                        if (round <= 3) {
                                            turn = 1;
                                            abilityUsed2--;
                                            msg.reactions.resolve("✨").users.remove(user);
                                            return message.channel.send(`**${eChar.name}** needs ${4-round} more ${round == 3 ? "round" : "rounds"} to prepare`)
                                        };
                                        let dmg = Math.floor(((2.5*eATK) * Math.pow(0.99818, myDEF)) * (1 - (0.2*Math.random())));
                                        myHP -= dmg;
                                        if (myHP < 0) {
                                            myHP = 0;
                                        } else {
                                            turn = 0;
                                        };
                                        notice.push(`\n✨ **${eChar.name}** used Excalibur! She has dealt **${dmg}** damage`);
                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(user);
                                    },
                                },
                                "733": {
                                    usage: 1,
                                    ability: () => {
                                        // Albedo (GI) increases his ATK by 50% of his current DEF
                                        eATK += Math.floor(eDEF/2);
                                        notice.push(`\n✨ **${eChar.name}** has increased his **ATK** by half of his **DEF** (**+${Math.floor(eDEF/2)}**)`);
                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(user);
                                        turn = 0;
                                    },
                                },
                                "1824": {
                                    usage: 1,
                                    ability: () => {
                                        // Ryuuko sacrifices 30% of her current HP for a 60% ATK increase of lost HP
                                        let sacrifice = Math.floor(eHP*0.3);
                                        eHP -= sacrifice;
                                        eATK += Math.floor(sacrifice*0.6);
                                        notice.push(`\n✨ **${eChar.name}** sacrificed **${sacrifice}**HP for **${Math.floor(sacrifice*0.6)}**ATK`);
                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(user);
                                        turn = 1;
                                    },
                                },
                                "2079": {
                                    usage: 1,
                                    ability: () => {
                                        // Albedo increases DEF by 100% and ATK by 20% of current DEF
                                        let raiseDef = eDEF;
                                        let raiseAtk = Math.floor(eDEF/5);
                                        eDEF += raiseDef;
                                        eATK += raiseAtk;
                                        notice.push(`\n✨ **${eChar.name}** equipped Hermes Trismegistus!\n<:blank:917804200363171860> She has gained **+${raiseDef}**DEF and **+${raiseAtk}**ATK`);
                                        Embed.setImage("https://i.ibb.co/S7v6Qmx/a.png").setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(user);
                                        turn = 0;
                                    },
                                },
                                "2080": {
                                    usage: 10,
                                    ability: () => {
                                        // Shalltear drains 20% of enemy HP and adds it to herself.
                                        let drain = Math.floor(myHP/5);
                                        myHP -= drain;
                                        eHP += drain;
                                        if (eHP > eHPd) eHP = eHPd;
                                        if (myHP < 0) {
                                            myHP = 0;
                                        } else {
                                            turn = 0;
                                        };
                                        notice.push(`\n✨ **${eChar.name}** has drained **${drain}**HP from **${myChar.name}**`);
                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(user);
                                    },
                                },
                                "2360": {
                                    usage: 3,
                                    usedround: -1,
                                    revive: 0,
                                    revivehp: 30,
                                    update: () => {
                                        abilities2["2360"].revive /= 2;
                                        abilities2["2360"].revivehp /= 2;
                                    },
                                    ability: () => {
                                        // C.C. decreases enemy DEF by 20%. +14/28/42% chance of revival with 30/35/40% HP
                                        if (round - abilities2["2360"].usedround > 1) {
                                            abilities2["2360"].usedround = round;

                                            let decrease = Math.floor(myDEF*0.2);
                                            myDEF -= decrease;
    
                                            abilities2["2360"].revive += 14;
                                            abilities2["2360"].revivehp += 10;
    
                                            turn = 0;
                                            notice.push(`\n✨ **${eChar.name}** used her Code of Immortality for a **${abilities2["2360"].revive}**% chance of revival\n<:blank:917804200363171860> **${myChar.name}**'s DEF decreased by **-${decrease}**`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(user);
                                        } else {
                                            turn = 1;
                                            abilityUsed2--;
                                            msg.reactions.resolve("✨").users.remove(user);
                                            return message.channel.send(`You need to wait 1 more round`)
                                        };
                                    },
                                },
                            };
                            
                            if (abilities[myChar.id] || abilities[eChar.id]) msg.react("✨");
                            
                            function displayNotice() {
                                return notice[notice.length-3] + notice[notice.length-2] + notice[notice.length-1];
                            };

                            // Player 2
                            const atkFilter = (reaction, user1) => reaction.emoji.name === "⚔️" && user1.id === user.id;
                            const defFilter = (reaction, user1) => reaction.emoji.name === "🛡️" && user1.id === user.id;
                            var abilityFilter;
                            if (abilities[myChar.id] || abilities[eChar.id]) abilityFilter = (reaction, user1) => reaction.emoji.name === "✨" && user1.id === user.id;
                            
                            const atk = msg.createReactionCollector(atkFilter, {time: 120000});
                            const def = msg.createReactionCollector(defFilter, {time: 120000});
                            var ability;
                            if (abilities[myChar.id] || abilities[eChar.id]) ability = msg.createReactionCollector(abilityFilter, {time: 120000});

                            // Player 1
                            const atkFilter2 = (reaction, user1) => reaction.emoji.name === "⚔️" && user1.id === message.author.id;
                            const defFilter2 = (reaction, user1) => reaction.emoji.name === "🛡️" && user1.id === message.author.id;
                            var abilityFilter2;
                            if (abilities[myChar.id] || abilities[eChar.id]) abilityFilter2 = (reaction, user1) => reaction.emoji.name === "✨" && user1.id === message.author.id;
                            
                            const atk2 = msg.createReactionCollector(atkFilter2, {time: 120000});
                            const def2 = msg.createReactionCollector(defFilter2, {time: 120000});
                            var ability2;
                            if (abilities[myChar.id] || abilities[eChar.id]) ability2 = msg.createReactionCollector(abilityFilter2, {time: 120000});
    
                            atk.on('collect', r => {
                                if (turn == 1) {
                                    let dmg = Math.floor((eATK * Math.pow(0.99818, myDEF)) * (1 - (0.2*Math.random())));
                                    if (Math.random() < 0.06 + 0.01*(eDEF/myDEF)) {
                                        dmg *= 2;
                                        notice.push(`\n⚔️ **${eChar.name}** has dealt a critical hit! **${dmg}** damage`);
                                    } else {
                                        notice.push(`\n⚔️ **${eChar.name}** has dealt **${dmg}** damage`);
                                    };
                                    myHP -= dmg;
                                    if (myHP < 0) myHP = 0;
                                    turn = 0;
                                    
                                    Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("⚔️").users.remove(user);
    
                                    if (myHP <= 0) {
                                        if ((abilities[myChar.id] ? abilities[myChar.id].revive : false) && Math.random() < (parseInt(abilities[myChar.id].revive) / 100)) {
                                            myHP += Math.floor((myHPd/100) * abilities[myChar.id].revivehp);
                                            abilities["2360"].update();
                                            notice.push(`\n✨ **${myChar.name}** survived! Restored **${myHP}**HP`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                        } else {
                                            atk.stop(), def.stop();
                                            if (abilities[myChar.id]) ability.stop();

                                            notice.push(`\n🎉 **${eChar.name}** won`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("l"));
                                        };
                                    } else if (eHP <= 0) {
                                        if ((abilities2[eChar.id] ? abilities2[eChar.id].revive : false) && Math.random() < (parseInt(abilities2[eChar.id].revive) / 100)) {
                                            eHP += Math.floor((eHPd/100) * abilities2[eChar.id].revivehp);
                                            abilities2["2360"].update();
                                            notice.push(`\n✨ **${eChar.name}** survived! Restored **${eHP}**HP`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                        } else {
                                            atk.stop(), def.stop();
                                            if (abilities[myChar.id]) ability.stop();

                                            notice.push(`\n🎉 **${myChar.name}** won`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("w"));
                                        };
                                    };

                                } else {
                                    message.channel.send(`Please wait for ${message.author.username} to make a move`);
                                    msg.reactions.resolve("⚔️").users.remove(user);
                                };
                            });

                            def.on('collect', r => {
                                if (turn == 1) {
                                    eDEF +=  40 + Math.floor((eDEFd/5)*(1-(0.2*Math.random())));
                                    notice.push(`\n🛡️ **${eChar.name}** has increased DEF by **${40 + Math.floor((eDEFd/5)*(1-(0.2*Math.random())))}**`);
                                    turn = 0;
                                    
                                    Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("🛡️").users.remove(user);
    
                                    if (myHP <= 0 || eHP <= 0) {
                                        atk.stop(), def.stop();
                                        if (abilities[myChar.id] || abilities[eChar.id]) ability.stop();
                                        if (myHP <= 0) {
                                            notice.push(`\n🎉 **${eChar.name}** won`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("l"))
                                        } else {
                                            notice.push(`\n🎉 **${myChar.name}** won`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("w"))
                                        };
                                    };
                                } else {
                                    message.channel.send(`Please wait for ${message.author.username} to make a move`);
                                    msg.reactions.resolve("🛡️").users.remove(user);
                                };
                            });
                            
                            if (abilities[myChar.id] || abilities[eChar.id]) {
                                ability.on('collect', r => {
                                    if (abilities[eChar.id]) {
                                        if (abilityUsed2 < abilities2[eChar.id].usage) {
                                            if (turn == 1) {
                                                turn = 0;
                                                abilityUsed2++;
                                                abilities2[eChar.id].ability();
    
                                                if (myHP <= 0) {
                                                    if ((abilities[myChar.id] ? abilities[myChar.id].revive : false) && Math.random() < (parseInt(abilities[myChar.id].revive) / 100)) {
                                                        myHP += Math.floor((myHPd/100) * abilities[myChar.id].revivehp);
                                                        abilities["2360"].update();
                                                        notice.push(`\n✨ **${myChar.name}** survived! Restored **${myHP}**HP`);
                                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                                        msg.edit(Embed);
                                                    } else {
                                                        atk.stop(), def.stop();
                                                        if (abilities[myChar.id]) ability.stop();
            
                                                        notice.push(`\n🎉 **${eChar.name}** won`);
                                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                                        msg.edit(Embed);
                                                        turn = 1;
                                                        resolve(matchResult("l"));
                                                    };
                                                } else if (eHP <= 0) {
                                                    if ((abilities2[eChar.id] ? abilities2[eChar.id].revive : false) && Math.random() < (parseInt(abilities2[eChar.id].revive) / 100)) {
                                                        eHP += Math.floor((eHPd/100) * abilities2[eChar.id].revivehp);
                                                        abilities2["2360"].update();
                                                        notice.push(`\n✨ **${eChar.name}** survived! Restored **${eHP}**HP`);
                                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                                        msg.edit(Embed);
                                                    } else {
                                                        atk.stop(), def.stop();
                                                        if (abilities[myChar.id]) ability.stop();
            
                                                        notice.push(`\n🎉 **${myChar.name}** won`);
                                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                                        msg.edit(Embed);
                                                        turn = 1;
                                                        resolve(matchResult("w"));
                                                    };
                                                };
                                            } else {
                                                message.channel.send(`Please wait for ${message.author.username} to make a move`);
                                            };
                                        } else {
                                            message.channel.send(`You can use **${eChar.name}**'s ability only ${abilities2[eChar.id].usage == 1 ? "once" : `${abilities2[eChar.id].usage} times`} per fight.`)
                                        };
                                    } else {
                                        message.channel.send(`**${eChar.name}** does not have an ability`)
                                    };
                                    msg.reactions.resolve("✨").users.remove(user);
                                });
                            };
    
                            atk2.on('collect', r => {
                                if (turn == 0) {
                                    let dmg = Math.floor((myATK * Math.pow(0.99818, eDEF)) * (1 - (0.2*Math.random())));
                                    if (Math.random() < 0.06 + 0.01*(myDEF/eDEF)) {
                                        dmg *= 2;
                                        notice.push(`\n⚔️ **${myChar.name}** has dealt a critical hit! **${dmg}** damage`);
                                    } else {
                                        notice.push(`\n⚔️ **${myChar.name}** has dealt **${dmg}** damage`);
                                    };
                                    eHP -= dmg;
                                    if (eHP < 0) eHP = 0;
                                    turn = 1;
                                    round++;
                                    
                                    Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("⚔️").users.remove(message.author);
    
                                    if (myHP <= 0) {
                                        if ((abilities[myChar.id] ? abilities[myChar.id].revive : false) && Math.random() < (parseInt(abilities[myChar.id].revive) / 100)) {
                                            myHP += Math.floor((myHPd/100) * abilities[myChar.id].revivehp);
                                            abilities["2360"].update();
                                            notice.push(`\n✨ **${myChar.name}** survived! Restored **${myHP}**HP`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                        } else {
                                            atk.stop(), def.stop();
                                            if (abilities[myChar.id]) ability.stop();

                                            notice.push(`\n🎉 **${eChar.name}** won`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("l"));
                                        };
                                    } else if (eHP <= 0) {
                                        if ((abilities2[eChar.id] ? abilities2[eChar.id].revive : false) && Math.random() < (parseInt(abilities2[eChar.id].revive) / 100)) {
                                            eHP += Math.floor((eHPd/100) * abilities2[eChar.id].revivehp);
                                            abilities2["2360"].update();
                                            notice.push(`\n✨ **${eChar.name}** survived! Restored **${eHP}**HP`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                        } else {
                                            atk.stop(), def.stop();
                                            if (abilities[myChar.id]) ability.stop();

                                            notice.push(`\n🎉 **${myChar.name}** won`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("w"));
                                        };
                                    };
                                } else {
                                    message.channel.send(`Please wait for ${user.username} to make a move`);
                                    msg.reactions.resolve("⚔️").users.remove(message.author);
                                };
                            });

                            def2.on('collect', r => {
                                if (turn == 0) {
                                    myDEF +=  40 + Math.floor((myDEFd/5)*(1-(0.2*Math.random())));
                                    notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${40 + Math.floor((myDEFd/5)*(1-(0.2*Math.random())))}**`);
                                    turn = 1;
                                    round++;
                                    
                                    Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("🛡️").users.remove(message.author);
    
                                    if (myHP <= 0 || eHP <= 0) {
                                        atk.stop(), def.stop();
                                        if (abilities[myChar.id] || abilities[eChar.id]) ability.stop();
                                        if (myHP <= 0) {
                                            notice.push(`\n🎉 **${eChar.name}** won`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            turn = 0;
                                            resolve(matchResult("l"))
                                        } else {
                                            notice.push(`\n🎉 **${myChar.name}** won`);
                                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                            msg.edit(Embed);
                                            turn = 0;
                                            resolve(matchResult("w"))
                                        };
                                    };
                                } else {
                                    message.channel.send(`Please wait for ${user.username} to make a move`);
                                    msg.reactions.resolve("🛡️").users.remove(message.author);
                                };
                            });
                            
                            if (abilities[myChar.id] || abilities[eChar.id]) {
                                ability2.on('collect', r => {
                                    if (abilities[myChar.id]) {
                                        if (abilityUsed < abilities[myChar.id].usage) {
                                            if (turn == 0) {
                                                turn = 1;
                                                round++;
                                                abilityUsed++;
                                                abilities[myChar.id].ability();
    
                                                if (myHP <= 0) {
                                                    if ((abilities[myChar.id] ? abilities[myChar.id].revive : false) && Math.random() < (parseInt(abilities[myChar.id].revive) / 100)) {
                                                        myHP += Math.floor((myHPd/100) * abilities[myChar.id].revivehp);
                                                        abilities["2360"].update();
                                                        notice.push(`\n✨ **${myChar.name}** survived! Restored **${myHP}**HP`);
                                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                                        msg.edit(Embed);
                                                    } else {
                                                        atk.stop(), def.stop();
                                                        if (abilities[myChar.id]) ability.stop();
            
                                                        notice.push(`\n🎉 **${eChar.name}** won`);
                                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                                        msg.edit(Embed);
                                                        turn = 1;
                                                        resolve(matchResult("l"));
                                                    };
                                                } else if (eHP <= 0) {
                                                    if ((abilities2[eChar.id] ? abilities2[eChar.id].revive : false) && Math.random() < (parseInt(abilities2[eChar.id].revive) / 100)) {
                                                        eHP += Math.floor((eHPd/100) * abilities2[eChar.id].revivehp);
                                                        abilities2["2360"].update();
                                                        notice.push(`\n✨ **${eChar.name}** survived! Restored **${eHP}**HP`);
                                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                                        msg.edit(Embed);
                                                    } else {
                                                        atk.stop(), def.stop();
                                                        if (abilities[myChar.id]) ability.stop();
            
                                                        notice.push(`\n🎉 **${myChar.name}** won`);
                                                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${eChar.name}**!\n\n${eChar.name}'s HP (**${eHP}**${"/"}${eHPd}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eHPd)}\n${myChar.name}'s HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`).setFooter(`Turn: ${turn === 1 ? user.username : message.author.username}`);
                                                        msg.edit(Embed);
                                                        turn = 1;
                                                        resolve(matchResult("w"));
                                                    };
                                                };
                                            } else {
                                                message.channel.send(`Please wait for ${user.username} to make a move`);
                                            };
                                        } else {
                                            message.channel.send(`You can use **${myChar.name}**'s ability only ${abilities[myChar.id].usage == 1 ? "once" : `${abilities[myChar.id].usage} times`} per fight.`)
                                        };
                                    } else {
                                        message.channel.send(`**${myChar.name}** does not have an ability`)
                                    };
                                    msg.reactions.resolve("✨").users.remove(message.author);
                                });
                            };

                        });
                    });

                });
                fs.writeFile('Storage/arenaResults.json', JSON.stringify(arenaResults), (err) => {
                    if (err) console.error(err);
                });
                fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                    if (err) console.error(err);
                });
                message.channel.send(result);
            };

            message.channel.send(`${user.toString()} ${message.author.username} challenges you to a battle${bets ? ` over **${bets}**<:coins:872926669055356939>` : ""}. Do you accept?`).then(msg2 => {
                msg2.react("☑️").then(rr => {
                    msg2.react("❎");

                    const confirmFilter = (reaction, user2) => reaction.emoji.name === "☑️" && user2.id === user.id;
                    const cancelFilter = (reaction, user2) => reaction.emoji.name === "❎" && (user2.id === user.id || user2.id === message.author.id);
                    const confirm = msg2.createReactionCollector(confirmFilter, {time: 30000});
                    const cancel = msg2.createReactionCollector(cancelFilter, {time: 30000});

                    confirm.on('collect', rr => {
                        confirm.stop();
                        cancel.stop();
                        newFight();
                    });

                    cancel.on('collect', rr => {
                        message.channel.send("Action cancelled")
                        confirm.stop();
                        cancel.stop();
                    });
                });
            });
            
        };


        // Shards
        if (cmd === "shards") {
            if (!shards[message.author.id + message.guild.id]) return message.channel.send("You don't have any Shards. You can obtain them in the `" + prefix + "dungeon`");

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${message.author.username}'s inventory`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("Shards are used to `" + prefix + "refine` characters\nObtainable only in the `" + prefix + "dungeon`")
            .addFields(
                { name: 'Shards', value: `<:ss_shard:917203009543503892>x${shards[message.author.id + message.guild.id]["ss"]}\n<:b_shard:917202862851899392>x${shards[message.author.id + message.guild.id]["b"]}`, inline: true },
                { name: '\u200B', value: `<:s_shard:917202925514817566>x${shards[message.author.id + message.guild.id]["s"]}\n<:c_shard:917202862499582002>x${shards[message.author.id + message.guild.id]["c"]}`, inline: true },
                { name: '\u200B', value: `<:a_shard:917202904862052392>x${shards[message.author.id + message.guild.id]["a"]}\n<:d_shard:917202840563363891>x${shards[message.author.id + message.guild.id]["d"]}`, inline: true },
            )
            .setThumbnail((favChar[message.author.id + message.guild.id] || favChar[message.author.id + message.guild.id] === 0) ? characters[favChar[message.author.id + message.guild.id]].image : characters[inventory[message.author.id + message.guild.id][Math.floor(Math.random() * inventory[message.author.id + message.guild.id].length)]].image)
            message.channel.send(Embed);
        };

        // Shard converter
        if (cmd === "convert" || cmd === "conv") {
            if (!shards[message.author.id + message.guild.id]) return message.channel.send("You don't have any Shards. You can obtain them in the `" + prefix + "dungeon`");
            let arg = 1;
            if (message.content.includes(",") && ((!Number.isInteger(message.content.split(",")[1]) && message.content.split(",")[1] > 0) || message.content.split(",")[1].toLowerCase().replace(/\s/g, '') == "max")) {
                arg = message.content.split(",")[1].toLowerCase().replace(/\s/g, '')
                args = message.content.split(",")[0].split(" ").filter((e) => e != "");
                args.shift();
            };
            if (!args[0] || !args[1] || !args[2] || args[1].toLowerCase() !== "to" || !["ss","s","a","b","c","d"].includes(args[0].toLowerCase()) || !["ss","s","a","b","c","d"].includes(args[2].toLowerCase())) return message.channel.send("Please mention which shards you want to convert.\nExample usage: `" + prefix + "convert S to SS`");

            let values = {"d":1,"c":2,"b":3,"a":4,"s":5,"ss":6};
            let dif = values[args[2].toLowerCase()] - values[args[0].toLowerCase()];
            if (dif == 0) return message.channel.send("You can't convert the same type to itself");
            if (dif < 0) return message.channel.send("You can't convert shards to lower tiers");
            
            if (isNaN(arg)) arg = Math.floor(shards[message.author.id + message.guild.id][args[0].toLowerCase()] / Math.pow(4, dif))
            if (arg < 1 || !Number.isInteger(parseInt(arg))) return message.channel.send(`You can't convert ${arg} shards`);
            if (arg > 100000) return message.channel.send(`You can't convert more than 100000 shards at once`);

            let sEmojis = {"d":"<:d_shard:917202840563363891>","c":"<:c_shard:917202862499582002>","b":"<:b_shard:917202862851899392>","a":"<:a_shard:917202904862052392>","s":"<:s_shard:917202925514817566>","ss":"<:ss_shard:917203009543503892>"};
            if (shards[message.author.id + message.guild.id][args[0].toLowerCase()] < (Math.pow(4, dif) * parseInt(arg))) return message.channel.send(`You don't have enough ${args[0].toUpperCase()} shards (**${shards[message.author.id + message.guild.id][args[0].toLowerCase()]}**/${Math.pow(4, dif) * parseInt(arg)}${sEmojis[args[0].toLowerCase()]})`);

            // If he has enough shards:
            message.channel.send(`Are you sure you want to convert ${Math.pow(4, dif) * parseInt(arg)} ${sEmojis[args[0].toLowerCase()]} to ${arg} ${sEmojis[args[2].toLowerCase()]}?`).then(msg => {
                msg.react("☑️").then(r => {
                    msg.react("❎");

                    const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                    const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                    const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                    const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});

                    confirm.on('collect', r => {
                        shards[message.author.id + message.guild.id][args[0].toLowerCase()] -= (Math.pow(4, dif) * parseInt(arg));
                        shards[message.author.id + message.guild.id][args[2].toLowerCase()] += parseInt(arg);

                        fs.writeFile('Storage/shards.json', JSON.stringify(shards), (err) => {
                            if (err) console.error(err);
                        });
                        message.channel.send(`Converted ${Math.pow(4, dif) * parseInt(arg)} ${sEmojis[args[0].toLowerCase()]} to ${arg} ${sEmojis[args[2].toLowerCase()]}`);
                        confirm.stop();
                        cancel.stop();
                    });

                    cancel.on('collect', r=> {
                        message.channel.send("Action cancelled");
                        confirm.stop();
                        cancel.stop();
                    });

                });
            });
        };

        // Refine
        if (cmd === "refine" || cmd === "ref") {
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");

            if (!args[0]) return message.channel.send("Please provide a name or ID");

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1].toString();

            let fArray;

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") {
                    fArray = characters[args[0]];
                } else {
                    let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                    if (fastCheck[0] !== undefined) {
                        fArray = fastCheck[0];
                    } else {
                        fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                        let i = 0;
                        
                        for (j=0; j < args.length; j++) {
                            let argsW = args[j].length;
            
                            while (argsW > 0) {
                                fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                                argsW--;
                                i++;
                            };
            
                            i = 0;
                            if (fArray.length < 2) {
                                j = args.length;
                            };
                        };
            
                        if (fArray.length === 0) {
                            return message.channel.send("No match found");
                        };
                        if (fArray.length > 1) {
                            return message.channel.send(fArray.length + " matches found");
                        };
                    };
                };
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            } else {
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                if (fastCheck[0] !== undefined) {
                    fArray = fastCheck[0];
                } else {
                    fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

                    let i = 0;
                    
                    for (j=0; j < args.length; j++) {
                        let argsW = args[j].length;
        
                        while (argsW > 0) {
                            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                            argsW--;
                            i++;
                        };
        
                        i = 0;
                        if (fArray.length < 2) {
                            j = args.length;
                        };
                    };
        
                    if (fArray.length === 0) {
                        return message.channel.send("No match found");
                    };
                    if (fArray.length > 1) {
                        return message.channel.send(fArray.length + " matches found");
                    };
                    fArray = fArray[0];
                };
            };

            if (!ref[message.author.id + message.guild.id]) ref[message.author.id + message.guild.id] = {};
            if (!ref[message.author.id + message.guild.id][fArray.id]) ref[message.author.id + message.guild.id][fArray.id] = 0;
            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            if (!charlvl[message.author.id + message.guild.id][fArray.id]) charlvl[message.author.id + message.guild.id][fArray.id] = 1;

            let currLvl = charlvl[message.author.id + message.guild.id][fArray.id];

            if (ref[message.author.id + message.guild.id][fArray.id] > 4) return message.channel.send(`**${fArray.name}** has already reached the max refinement level`)

            let bhp = baseHP(fArray.id);
            let batk = baseATK(fArray.id);
            let bdef = baseDEF(fArray.id);

            let hp = bhp;
            let atk = batk;
            let def = bdef;
            let rm;
            if (!ref[message.author.id + message.guild.id][fArray.id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][fArray.id];
            };
            if (rm > 5) rm = 5;
            
            switch (fArray.rarity) {
                case "SS" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((5+(2*((hp-180)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((2.4+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1.25+(0.25*((def-50)/30)))*(currLvl-1)); break;
                case "S" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.9+(0.6*((hp-150)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.9+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((1+(0.2*((def-50)/30)))*(currLvl-1)); break;
                case "A" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((3.3+(0.4*((hp-120)/60)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.6+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.8+(0.15*((def-50)/30)))*(currLvl-1)); break;
                case "B" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.8+(0.4*((hp-100)/50)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((1.2+(0.3*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.6+(0.2*((def-50)/30)))*(currLvl-1)); break;
                case "C" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2.4+(0.4*((hp-80)/40)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.9+(0.35*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.5+(0.15*((def-50)/30)))*(currLvl-1)); break;
                case "D" : hp = Math.floor((1+0.25*(rm-1))*hp) + Math.round((2+(0.5*((hp-70)/30)))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*atk) + Math.round((0.75+(0.25*((atk-50)/30)))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*def) + Math.round((0.4+(0.5*((def-50)/30)))*(currLvl-1)); break;
                default : hp = 1; atk = 1; def = 1; break;
            };
            let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (100/atk))*100) / 100;

            let hp2 = bhp;
            let atk2 = batk;
            let def2 = bdef;
            rm++;
            switch (fArray.rarity) {
                case "SS" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((5+(2*((hp2-180)/60)))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((2.4+(0.35*((atk2-50)/30)))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((1.25+(0.25*((def2-50)/30)))*(currLvl-1)); break;
                case "S" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((3.9+(0.6*((hp2-150)/50)))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((1.9+(0.3*((atk2-50)/30)))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((1+(0.2*((def2-50)/30)))*(currLvl-1)); break;
                case "A" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((3.3+(0.4*((hp2-120)/60)))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((1.6+(0.25*((atk2-50)/30)))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((0.8+(0.15*((def2-50)/30)))*(currLvl-1)); break;
                case "B" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((2.8+(0.4*((hp2-100)/50)))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((1.2+(0.3*((atk2-50)/30)))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((0.6+(0.2*((def2-50)/30)))*(currLvl-1)); break;
                case "C" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((2.4+(0.4*((hp2-80)/40)))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((0.9+(0.35*((atk2-50)/30)))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((0.5+(0.15*((def2-50)/30)))*(currLvl-1)); break;
                case "D" : hp2 = Math.floor((1+0.25*(rm-1))*hp2) + Math.round((2+(0.5*((hp2-70)/30)))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*atk2) + Math.round((0.75+(0.25*((atk2-50)/30)))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*def2) + Math.round((0.4+(0.5*((def2-50)/30)))*(currLvl-1)); break;
                default : hp2 = 1; atk2 = 1; def2 = 1; break;
            };
            let ep2 = Math.floor(((hp2/Math.pow(0.99818,def2)) / (100/atk2))*100) / 100;
            
            let useShard;
            let shardStr;
            let shardEmoji;
            let price = 0;
            switch (fArray.rarity) {
                case "SS" : useShard = "ss"; shardStr = "<:ss_shard:917203009543503892>"; shardEmoji = "<:ss_shard:917203009543503892>"; price = 3000; break;
                case "S" : useShard = "s"; shardStr = "<:s_shard:917202925514817566>"; shardEmoji = "<:s_shard:917202925514817566>"; price = 1000; break;
                case "A" : useShard = "a"; shardStr = "<:a_shard:917202904862052392>"; shardEmoji = "<:a_shard:917202904862052392>"; price = 500; break;
                case "B" : useShard = "b"; shardStr = "<:b_shard:917202862851899392>"; shardEmoji = "<:b_shard:917202862851899392>"; price = 300; break;
                case "C" : useShard = "c"; shardStr = "<:c_shard:917202862499582002>"; shardEmoji = "<:c_shard:917202862499582002>"; price = 250; break;
                case "D" : useShard = "d"; shardStr = "<:d_shard:917202840563363891>"; shardEmoji = "<:d_shard:917202840563363891>"; price = 200; break;
                default : useShard = "ss"; shardStr = "<:ss_shard:917203009543503892>"; shardEmoji = ""; price = 9999999; break;
            };

            if (!shards[message.author.id + message.guild.id]) return message.channel.send("You don't have any shards");
            if (shards[message.author.id + message.guild.id][useShard] < 16) return message.channel.send(`You don't have enough shards (**${shards[message.author.id + message.guild.id][useShard]}**/16${shardEmoji})`);
            if (coins[message.author.id + message.guild.id] < price) return message.channel.send(`You don't have enough coins. You need ${price}`);

            const Embed = new MessageEmbed()
            .setTitle(`${fArray.name}`)
            .setColor(0xbbffff)
            .setDescription(`Raising <:refinement:869132309125824552> for ${shardStr}**x16** and **${price}**<:coins:872926669055356939>`)
            .addFields(
                { name: 'HP ️️️💖', value: `${hp} -> **${hp2}**`, inline: true },
                { name: 'ATK ️️⚔️', value: `${atk} -> **${atk2}**`, inline: true },
                { name: 'DEF ️️️🛡️', value: `${def} -> **${def2}**`, inline: true },
            )
            .setThumbnail(fArray.image)
            .setFooter(`EP: ${ep} -> ${ep2}`)
            message.channel.send(Embed).then(msg => {
                msg.react("☑️").then(r => {
                    msg.react("❎");

                    const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                    const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                    const confirm = msg.createReactionCollector(confirmFilter, {time: 30000});
                    const cancel = msg.createReactionCollector(cancelFilter, {time: 30000});

                    confirm.on('collect', r => {
                        coins[message.author.id + message.guild.id] -= price;
                        shards[message.author.id + message.guild.id][useShard] -= 16;
                        ref[message.author.id + message.guild.id][fArray.id]++;

                        fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                            if (err) console.error(err);
                        });
                        fs.writeFile('Storage/shards.json', JSON.stringify(shards), (err) => {
                            if (err) console.error(err);
                        });
                        fs.writeFile('Storage/ref.json', JSON.stringify(ref), (err) => {
                            if (err) console.error(err);
                        });
                        message.channel.send(`Raised **${fArray.name}**'s refinement level successfully!`);
                        confirm.stop();
                        cancel.stop();
                    });

                    cancel.on('collect', r=> {
                        message.channel.send("Action cancelled")
                        confirm.stop();
                        cancel.stop();
                    });

                });
            });

        };

        // Level
        if (cmd === "level" || cmd === "lvl") {

            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();

            if (!xp[user.id + message.guild.id] && user.id === message.author.id) return message.channel.send("You haven't started playing the game yet");
            if (!xp[user.id + message.guild.id] && user.id !== message.author.id) return message.channel.send(`**${user.username}** hasn't started playing the game yet`);

            let xpr = xp[user.id + message.guild.id];
            let level = 0;
            for (i=1; xpr >= 0; i++) {
                xpr -= Math.floor(5*Math.log(i)*Math.log(i)*Math.log(i)*Math.log(i) + 30);
                level++;
            };

            const inv = [];
            for (i=0; i < inventory[user.id + message.guild.id].length; i++) {
                inv.push(inventory[user.id + message.guild.id][i]);
            };
            const uniq =  inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) {
                thumbnail = characters[favChar[user.id + message.guild.id]].image;
                if (premium[user.id] > 3) if (customSettings[user.id + message.guild.id] && customSettings[user.id + message.guild.id].cimg[favChar[user.id + message.guild.id]]) thumbnail = customSettings[user.id + message.guild.id].cimg[favChar[user.id + message.guild.id]];
            };

            let xpTotal = Math.floor(5*Math.log(level)*Math.log(level)*Math.log(level)*Math.log(level) + 30);
            let percent = Math.floor(((xpTotal+xpr)/(xpTotal))*1000);
            let bar = "";
            if (percent >= 0 && percent < 125) bar = "<:barLh:872111263747035177><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 125 && percent < 250) bar = "<:barL:872111285741969438><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 250 && percent < 375) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 375 && percent < 500) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 500 && percent < 625) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 625 && percent < 750) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 750 && percent < 875) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 875 && percent < 1000) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barRh:872111194188705848>";

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s Level`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("Current level: **" + level + "**\nXP required to level up: **" + -xpr + "**\n" + bar)
            .setThumbnail(thumbnail)
            message.channel.send(Embed);
        };

        // Change Base (Premium)
        if (cmd === "setbase" || cmd === "base") {
            return;
        };

        // Find Characters
        if (cmd === "find") {

            if (!args[0]) return message.channel.send("Please provide a name or ID");

            let char;

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1] && !(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") {
                char = characters[args[0]];
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1] && !(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") {
                return message.channel.send("The ID must be smaller than " + characters.length);
            } else {
                let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
                if (fastCheck[0] !== undefined) {
                    char = fastCheck[0];
                } else {
                    let fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));
                    let i = 0;
    
                    for (j=0; j < args.length; j++) {
                        let argsW = args[j].length;
    
                        while (argsW > 0) {
                            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                            argsW--;
                            i++;
                        };
    
                        i = 0;
                        if (fArray.length < 2) j = args.length;
                    };
    
                    if (fArray.length === 0) return message.channel.send("No match found");
                    if (fArray.length > 1) return message.channel.send(fArray.length + " matches found");
                    char = fArray[0];
                };
            };

            let users = [];
            for (i=0; i < Object.keys(inventory).length; i++) {
                if (Object.keys(inventory)[i].slice(18, 37) === message.guild.id) {
                    let fChar = inventory[Object.keys(inventory)[i]].filter((e) => e === char.id);
                    if (fChar.length === 1) {
                        users.push(`**${ccgUsers[Object.keys(inventory)[i].slice(0, 18)]}** has **1** copy`);
                    };
                    if (fChar.length > 1) {
                        users.push(`**${ccgUsers[Object.keys(inventory)[i].slice(0, 18)]}** has **${fChar.length}** copies`);
                    };
                };
            };

            if (users.length < 1) return message.channel.send(`No one here has a copy of **${char.name}**`);

            if (users.length < 16) {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`Found ${users.length} ${users.length > 1 ? "Players" : "Player"}`)
                .setDescription(users)
                .setThumbnail(char.image)
                message.channel.send(Embed);
            } else {
                let pagesTotal = Math.ceil(users.length / 15);
                let currPage = 1;
                
                let left = users.length % 15;
                let showUsersF = [];
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showUsersF.push(users[i]);
                };

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`Found ${users.length} ${users.length > 1 ? "Players" : "Player"}`)
                .setDescription(showUsersF)
                .setThumbnail(char.image)
                message.channel.send(Embed).then(msg => {
                    msg.react("⏪").then(r => {
                        msg.react("⏩");

                        const prevFilter = (reaction, user1) => reaction.emoji.name === "⏪" && user1.id === message.author.id;
                        const nextFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                        const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                        const next = msg.createReactionCollector(nextFilter, {time: 60000});

                        prev.on('collect', r => {
                            if (currPage > 1) {
                                currPage--;
                            } else {
                                currPage = pagesTotal;
                            };
                            let showUsersF = [];
                            if (currPage < pagesTotal || left === 0) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showUsersF.push(users[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showUsersF.push(users[i]);
                                };
                            };
                            Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏪").users.remove(message.author);
                        });

                        next.on('collect', r => {
                            if (currPage < pagesTotal) {
                                currPage++;
                            } else {
                                currPage = 1;
                            };
                            let showUsersF = [];
                            if (currPage < pagesTotal || left === 0) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showUsersF.push(users[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showUsersF.push(users[i]);
                                };
                            };
                            Embed.setDescription(showUsersF).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏩").users.remove(message.author);
                        });

                    });
                });
            };

        };

        // Owned Characters
        if (cmd === "im" || cmd === "imy" || cmd === "infomy") {

            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters");
            if (!args[0]) return message.channel.send("Please provide a name or ID");

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1].toString();

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") {
                    if (inventory[message.author.id + message.guild.id].some((e) => e === characters[args[0]].id)) {
                        return displayIm(characters[args[0]]);
                    } else {
                        return message.channel.send("You don't own this card");
                    };
                };
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            };

            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                if (inventory[message.author.id + message.guild.id].some((e) => e === fastCheck[0].id)) {
                    return displayIm(fastCheck[0]);
                } else {
                    return message.channel.send("You don't own this card");
                };
            };

            let fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

            let i = 0;
            
            for (j=0; j < args.length; j++) {
                let argsW = args[j].length;

                while (argsW > 0) {
                    fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                    argsW--;
                    i++;
                };

                i = 0;
                if (fArray.length < 2) {
                    j = args.length;
                };
            };
            
            if (fArray.length === 0) {
                return message.channel.send("No match found");
            };

            if (fArray.length > 1) {
                return message.channel.send(fArray.length + " matches found");
            };
            if (inventory[message.author.id + message.guild.id].some((e) => e === fArray[0].id)) {
                displayIm(fArray[0]);
            } else {
                message.channel.send("You don't own this card")
            };
            return;
        };

        // Charakter search
        if (cmd === "info" || cmd === "i") {

            if (!args[0]) return message.channel.send("Please provide a name or ID");

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1].toString();

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") return display(characters[args[0]]);
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            };
            
            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) return display(fastCheck[0]);

            let fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

            let i = 0;
            for (j=0; j < args.length; j++) {
                let argsW = args[j].length;

                while (argsW > 0) {
                    fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                    argsW--;
                    i++;
                };

                i = 0;
                if (fArray.length < 2) j = args.length;
            };

            if (fArray.length === 0) return message.channel.send("No match found");
            if (fArray.length > 1) return message.channel.send(fArray.length + " matches found");
            display(fArray[0]);
        };

        // Recommend anime
        if (cmd === "recommendations"|| cmd === "recommend" || cmd === "rec") {
            message.channel.send(auniq[Math.floor(Math.random() * auniq.length)]);
        };

        // Anime search
        if (cmd === "search" || cmd === "s") {
            
            if (!args[0]) return message.channel.send("Please provide a title");
            if (!inventory[message.author.id + message.guild.id]) inventory[message.author.id + message.guild.id] = [];

            const uniq = inventory[message.author.id + message.guild.id].reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]]);
            };

            let fastCheck = characters.filter((e) => e.anime.toLowerCase() === args.join(' ').toLowerCase() || e.anialias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (!fastCheck.length) {
                fastCheck = characters.filter((e) => e.anime.toLowerCase().match(/\b(\w)/g).join('') === args.join(' ').toLowerCase() || e.anialias.some((a => a.toLowerCase().match(/\b(\w)/g).join('') === args.join(' ').toLowerCase())));
                for (i=0; i < fastCheck.length; i++) {
                    if (fastCheck[i].anime != fastCheck[0].anime) fastCheck = [];
                };
            };
            if (fastCheck[0] !== undefined) {

                let charNames = [];
                for (i=0; i < fastCheck.length; i++) {
                    charNames.push(fastCheck[i].name);
                };

                let ssChars = fastCheck.filter((b) => b.rarity === "SS");
                let sChars = fastCheck.filter((b) => b.rarity === "S");
                let aChars = fastCheck.filter((b) => b.rarity === "A");
                let bChars = fastCheck.filter((b) => b.rarity === "B");
                let cChars = fastCheck.filter((b) => b.rarity === "C");
                let dChars = fastCheck.filter((b) => b.rarity === "D");

                function tierNames (t, arr) {
                    for (h=0; h < t.length; h++) {
                        if (uniq.some((b) => b === t[h].id)) {
                            arr.push(`${t[h].name} <a:check:873196253276700682>`);
                        } else {
                            arr.push(t[h].name);
                        };
                    };
                    return arr;
                };

                let ssCharsN = [];
                let sCharsN = [];
                let aCharsN = [];
                let bCharsN = [];
                let cCharsN = [];
                let dCharsN = [];

                let desc = "";
                
                if (ssChars[0]) desc += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNames(ssChars, ssCharsN).join("\n> ");
                if (sChars[0]) desc += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNames(sChars, sCharsN).join("\n> ");
                if (aChars[0]) desc += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNames(aChars, aCharsN).join("\n> ");
                if (bChars[0]) desc += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNames(bChars, bCharsN).join("\n> ");
                if (cChars[0]) desc += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNames(cChars, cCharsN).join("\n> ");
                if (dChars[0]) desc += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNames(dChars, dCharsN).join("\n> ");

                let charsOwned = chars.filter((b) => b.anime === fastCheck[0].anime);
                let allChars = ssChars.concat(sChars).concat(aChars).concat(bChars).concat(cChars).concat(dChars);

                if (charNames.length < 16) {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setTitle(`**${fastCheck[0].anime}** (` + charsOwned.length + "/" + charNames.length + ")")
                    .setThumbnail(allChars[0].image)
                    .setDescription(desc)
                    .setFooter(`Page 1/1`)
                    message.channel.send(Embed);
                } else {
                    let pagesTotal = Math.ceil(charNames.length / 15);
                    let currPage = 1;
                    
                    let left = allChars.length % 15;
                    let showChars = [];
                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                        showChars.push(allChars[i]);
                    };
                    
                    let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                    let sFiltered = showChars.filter((b) => b.rarity === "S");
                    let aFiltered = showChars.filter((b) => b.rarity === "A");
                    let bFiltered = showChars.filter((b) => b.rarity === "B");
                    let cFiltered = showChars.filter((b) => b.rarity === "C");
                    let dFiltered = showChars.filter((b) => b.rarity === "D");

                    let ssFiltrN = [];
                    let sFiltrN = [];
                    let aFiltrN = [];
                    let bFiltrN = [];
                    let cFiltrN = [];
                    let dFiltrN = [];

                    let description = "";

                    if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNames(ssFiltered, ssFiltrN).join("\n> ");
                    if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNames(sFiltered, sFiltrN).join("\n> ");
                    if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNames(aFiltered, aFiltrN).join("\n> ");
                    if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNames(bFiltered, bFiltrN).join("\n> ");
                    if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNames(cFiltered, cFiltrN).join("\n> ");
                    if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNames(dFiltered, dFiltrN).join("\n> ");

                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setTitle(`**${fastCheck[0].anime}** (` + charsOwned.length + "/" + charNames.length + ")")
                    .setThumbnail(allChars[0].image)
                    .setDescription(description)
                    .setFooter(`Page ${currPage}/${pagesTotal}`)
                    message.channel.send(Embed).then(msg => {
                        msg.react("⏪").then(r => {
                            msg.react("⏩");

                            const prevFilter = (reaction, user) => reaction.emoji.name === "⏪" && user.id === message.author.id;
                            const nextFilter = (reaction, user) => reaction.emoji.name === "⏩" && user.id === message.author.id;
                            const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                            const next = msg.createReactionCollector(nextFilter, {time: 60000});

                            prev.on('collect', r => {
                                if (currPage > 1) {
                                    currPage--;
                                } else {
                                    currPage = pagesTotal;
                                };

                                let showChars = [];
                                if (currPage < pagesTotal || left === 0) {
                                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                        showChars.push(allChars[i]);
                                    };
                                } else {
                                    for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                        showChars.push(allChars[i]);
                                    };
                                };

                                let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                                let sFiltered = showChars.filter((b) => b.rarity === "S");
                                let aFiltered = showChars.filter((b) => b.rarity === "A");
                                let bFiltered = showChars.filter((b) => b.rarity === "B");
                                let cFiltered = showChars.filter((b) => b.rarity === "C");
                                let dFiltered = showChars.filter((b) => b.rarity === "D");
            
                                let ssFiltrN = [];
                                let sFiltrN = [];
                                let aFiltrN = [];
                                let bFiltrN = [];
                                let cFiltrN = [];
                                let dFiltrN = [];
            
                                let description = "";
            
                                if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNames(ssFiltered, ssFiltrN).join("\n> ");
                                if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNames(sFiltered, sFiltrN).join("\n> ");
                                if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNames(aFiltered, aFiltrN).join("\n> ");
                                if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNames(bFiltered, bFiltrN).join("\n> ");
                                if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNames(cFiltered, cFiltrN).join("\n> ");
                                if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNames(dFiltered, dFiltrN).join("\n> ");

                                Embed.setDescription(description).setFooter(`Page ${currPage}/${pagesTotal}`);
                                msg.edit(Embed);
                                msg.reactions.resolve("⏪").users.remove(message.author);
                            });

                            next.on('collect', r => {
                                if (currPage < pagesTotal) {
                                    currPage++;
                                } else {
                                    currPage = 1;
                                };

                                let showChars = [];
                                if (currPage < pagesTotal || left === 0) {
                                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                        showChars.push(allChars[i]);
                                    };
                                } else {
                                    for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                        showChars.push(allChars[i]);
                                    };
                                };

                                let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                                let sFiltered = showChars.filter((b) => b.rarity === "S");
                                let aFiltered = showChars.filter((b) => b.rarity === "A");
                                let bFiltered = showChars.filter((b) => b.rarity === "B");
                                let cFiltered = showChars.filter((b) => b.rarity === "C");
                                let dFiltered = showChars.filter((b) => b.rarity === "D");
            
                                let ssFiltrN = [];
                                let sFiltrN = [];
                                let aFiltrN = [];
                                let bFiltrN = [];
                                let cFiltrN = [];
                                let dFiltrN = [];
            
                                let description = "";
            
                                if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNames(ssFiltered, ssFiltrN).join("\n> ");
                                if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNames(sFiltered, sFiltrN).join("\n> ");
                                if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNames(aFiltered, aFiltrN).join("\n> ");
                                if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNames(bFiltered, bFiltrN).join("\n> ");
                                if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNames(cFiltered, cFiltrN).join("\n> ");
                                if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNames(dFiltered, dFiltrN).join("\n> ");

                                Embed.setDescription(description).setFooter(`Page ${currPage}/${pagesTotal}`);
                                msg.edit(Embed);
                                msg.reactions.resolve("⏩").users.remove(message.author);
                            });

                        });
                    });

                };
            } else {
                message.channel.send("Please use the full name or try an alias");
            };
        };

        // Anime search Image
        if (cmd === "si") {
            
            if (!args[0]) return message.channel.send("Please provide a title");
            if (!inventory[message.author.id + message.guild.id]) inventory[message.author.id + message.guild.id] = [];

            const uniq = inventory[message.author.id + message.guild.id].reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]]);
            };

            let fastCheck = characters.filter((e) => e.anime.toLowerCase() === args.join(' ').toLowerCase() || e.anialias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (!fastCheck.length) {
                fastCheck = characters.filter((e) => e.anime.toLowerCase().match(/\b(\w)/g).join('') === args.join(' ').toLowerCase() || e.anialias.some((a => a.toLowerCase().match(/\b(\w)/g).join('') === args.join(' ').toLowerCase())));
                for (i=0; i < fastCheck.length; i++) {
                    if (fastCheck[i].anime != fastCheck[0].anime) fastCheck = [];
                };
            };
            if (fastCheck[0] !== undefined) {

                let ssChars = fastCheck.filter((b) => b.rarity === "SS");
                let sChars = fastCheck.filter((b) => b.rarity === "S");
                let aChars = fastCheck.filter((b) => b.rarity === "A");
                let bChars = fastCheck.filter((b) => b.rarity === "B");
                let cChars = fastCheck.filter((b) => b.rarity === "C");
                let dChars = fastCheck.filter((b) => b.rarity === "D");

                let allChars = ssChars.concat(sChars).concat(aChars).concat(bChars).concat(cChars).concat(dChars);
                let charsOwned = chars.filter((b) => b.anime === fastCheck[0].anime);

                let aTitle = splitTitle(fastCheck[0].anime);

                let pagesTotal = allChars.length;
                let currPage = 1;
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setThumbnail(rarity(allChars[currPage-1].rarity))
                .setDescription(`**${allChars[currPage-1].name}**${uniq.includes(allChars[currPage-1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage-1].id}`)
                .setImage(allChars[currPage-1].image)
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                message.channel.send(Embed).then(msg => {
                    msg.react("⏪").then(r => {
                        msg.react("⏩");

                        const prevFilter = (reaction, user) => reaction.emoji.name === "⏪" && user.id === message.author.id;
                        const nextFilter = (reaction, user) => reaction.emoji.name === "⏩" && user.id === message.author.id;
                        const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                        const next = msg.createReactionCollector(nextFilter, {time: 60000});

                        prev.on('collect', r => {
                            currPage > 1 ? currPage-- : currPage = pagesTotal;
                            Embed.setThumbnail(rarity(allChars[currPage-1].rarity)).setDescription(`**${allChars[currPage-1].name}**${uniq.includes(allChars[currPage-1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage-1].id}`).setImage(allChars[currPage-1].image).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏪").users.remove(message.author);
                        });

                        next.on('collect', r => {
                            currPage < pagesTotal ? currPage++ : currPage = 1;
                            Embed.setThumbnail(rarity(allChars[currPage-1].rarity)).setDescription(`**${allChars[currPage-1].name}**${uniq.includes(allChars[currPage-1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage-1].id}`).setImage(allChars[currPage-1].image).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏩").users.remove(message.author);
                        });

                    });
                });

            } else {
                message.channel.send("Please use the full name or try an alias");
            };
        };

        // List Rarity
        if (cmd === "list") {
            if (!args[0]) return message.channel.send("Please specify which characters you want to list.\nUsage: `" + prefix + "list <rarity>`");
            args[0] = args[0].toUpperCase();
            if (!(args[0] == "SS" || args[0] == "S" || args[0] == "A" || args[0] == "B" || args[0] == "C" || args[0] == "D")) return message.channel.send("The rarities are **SS**, **S**, **A**, **B**, **C** and **D**. Please search for one of them.");

            let chars = characters.filter((e) => e.rarity == args[0]);

            let userInv = inventory[message.author.id + message.guild.id];
            let userInvUniq = userInv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let userChars = [];
            for (i=0; i < userInvUniq.length; i++) {
                if (characters[userInvUniq[i]].rarity == args[0]) userChars.push(characters[userInvUniq[i]]);
            };

            let anime = [];
            for (i=0; i < chars.length; i++) {
                anime.push(chars[i].anime);
            };
            let uniq = anime.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            uniq = uniq.sort();

            let showChars = [];
            for (i=0; i < uniq.length; i++) {
                let charsInAnime = chars.filter((e) => e.anime === uniq[i]);
                if (charsInAnime.length < 1) return;
                charsInAnime.sort();
                showChars.push(`**${uniq[i]}**`);
                for (j=0; j < charsInAnime.length; j++) {
                    if (userChars.some((e) => e.id == charsInAnime[j].id)) {
                        showChars.push("> " + charsInAnime[j].name + " <a:check:873196253276700682>");
                    } else {
                        showChars.push("> " + charsInAnime[j].name);
                    };
                };
                showChars.push("");
            };
            
            let pagesTotal = Math.ceil(showChars.length / 15);
            let currPage = 1;
            if (!isNaN(parseInt(args[1])) && parseInt(args[1]) <= pagesTotal) {
                currPage = parseInt(args[1]);
            };
            let left = showChars.length % 15;

            let showCharsF = [];
            if (currPage < pagesTotal || left === 0) {
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showCharsF.push(showChars[i]);
                };
            } else {
                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                    showCharsF.push(showChars[i]);
                };
            };

            let tier = "";
            switch (args[0]) {
                case "SS" : tier = "<:SSTier:869316489931546644>"; break;
                case "S" : tier = "<:STier:869316518675095552>"; break;
                case "A" : tier = "<:ATier:869316558013464627>"; break;
                case "B" : tier = "<:BTier:869316586803179571>"; break;
                case "C" : tier = "<:CTier:869316602858991657>"; break;
                case "D" : tier = "<:DTier:869316616071032843>"; break;
                default : tier = ""; break;
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`${tier} **Tier Characters** (${userChars.length}/${chars.length})`)
            .setThumbnail(chars[Math.floor(Math.random() * chars.length)].image)
            .setDescription(showCharsF)
            .setFooter(`Page ${currPage}/${pagesTotal}`)
            message.channel.send(Embed).then(msg => {
                msg.react("⏪").then(r => {
                    msg.react("⏩");

                    const prevFilter = (reaction, user) => reaction.emoji.name === "⏪" && user.id === message.author.id;
                    const nextFilter = (reaction, user) => reaction.emoji.name === "⏩" && user.id === message.author.id;
                    const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                    const next = msg.createReactionCollector(nextFilter, {time: 60000});

                    prev.on('collect', r => {
                        if (currPage > 1) {
                            currPage--;
                        } else {
                            currPage = pagesTotal;
                        };

                        let showCharsF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showCharsF.push(showChars[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showCharsF.push(showChars[i]);
                            };
                        };

                        Embed.setDescription(showCharsF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏪").users.remove(message.author);
                    });

                    next.on('collect', r => {
                        if (currPage < pagesTotal) {
                            currPage++;
                        } else {
                            currPage = 1;
                        };

                        let showCharsF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showCharsF.push(showChars[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showCharsF.push(showChars[i]);
                            };
                        };

                        Embed.setDescription(showCharsF).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏩").users.remove(message.author);
                    });
                });
            });
        };

        // List all anime
        if (cmd === "anime" || cmd === "a") {
            
            let uniq = auniq
            uniq = uniq.sort();

            const inv = [];
            if (inventory[message.author.id + message.guild.id]) {
                for (i=0; i < inventory[message.author.id + message.guild.id].length; i++) {
                    inv.push(inventory[message.author.id + message.guild.id][i]);
                };
            };
            const uniqInv = inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let chars = [];
            for (i=0; i < uniqInv.length; i++) {
                chars.push(characters[uniqInv[i]]);
            };

            let aniCompleted = 0;
            for (i=0; i < uniq.length; i++) {
                let animeCheck = characters.filter((e) => e.anime === uniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === uniq[i]).length;
                if (animeCheck === invCheck) {
                    aniCompleted++;
                };
            };

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (!isNaN(parseInt(args[0])) && parseInt(args[0]) <= pagesTotal) {
                currPage = parseInt(args[0]);
            };

            let left = uniq.length % 15;
            let showAnime = [];
            if (currPage < pagesTotal || left === 0) {
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                    let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                    if (charsOwned.length === charsInTotal.length) {
                        showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                    } else {
                        showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                    };
                };
            } else {
                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                    let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                    let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                    if (charsOwned.length === charsInTotal.length) {
                        showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                    } else {
                        showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                    };
                };
            };


            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`**Anime Included** (${aniCompleted}/${uniq.length})`)
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .setDescription(showAnime)
            .setFooter(`Page ${currPage}/${pagesTotal}`)
            message.channel.send(Embed).then(msg => {
                msg.react("⏪").then(r => {
                    msg.react("⏩");

                    const prevFilter = (reaction, user) => reaction.emoji.name === "⏪" && user.id === message.author.id;
                    const nextFilter = (reaction, user) => reaction.emoji.name === "⏩" && user.id === message.author.id;
                    const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                    const next = msg.createReactionCollector(nextFilter, {time: 60000});

                    prev.on('collect', r => {
                        if (currPage > 1) {
                            currPage--;
                        } else {
                            currPage = pagesTotal;
                        };

                        let showAnime = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                                let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                                if (charsOwned.length === charsInTotal.length) {
                                    showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                                } else {
                                    showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                                };
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                                let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                                if (charsOwned.length === charsInTotal.length) {
                                    showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                                } else {
                                    showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                                };
                            };
                        };

                        Embed.setDescription(showAnime).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏪").users.remove(message.author);
                    });

                    next.on('collect', r => {
                        if (currPage < pagesTotal) {
                            currPage++;
                        } else {
                            currPage = 1;
                        };

                        let showAnime = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                                let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                                if (charsOwned.length === charsInTotal.length) {
                                    showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                                } else {
                                    showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                                };
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                                let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                                if (charsOwned.length === charsInTotal.length) {
                                    showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                                } else {
                                    showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                                };
                            };
                        };

                        Embed.setDescription(showAnime).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏩").users.remove(message.author);
                    });
                });
            });
            
        };

        
        // Poke sicherung
        if (cmd === "did") {
            let errFound = "";
            for (let testChar of characters) {
                for (let chrs of characters) {
                    if (testChar.id !== chrs.id) {
                        if (testChar.name === chrs.name) errFound += `${testChar.name} on line #${testChar.id}\n`;
                    };
                };
            };
            if (errFound) {
                message.channel.send(`Yes, he did!\n\n${errFound}`);
            } else {
                message.channel.send(`All's fine!`);
            };
        };


    }
};