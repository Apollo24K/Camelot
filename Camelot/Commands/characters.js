const { rejects } = require("assert");
const { MessageEmbed, Message } = require("discord.js");
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = "!";

var fs = require('fs');
const { resolve } = require("path");
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

module.exports = {
    name: 'characters',
    description: 'Characters',
    execute(message, args) {

        if (!ccgUsers[message.author.id] || ccgUsers[message.author.id] !== message.author.tag) {
            ccgUsers[message.author.id] = message.author.tag;
            fs.writeFile('Storage/ccgUsers.json', JSON.stringify(ccgUsers), (err) => {
                if (err) console.error(err);
            });
        };

        function sha24(c) {
            // strongest ang, then agn
            let input = characters[c].name + characters[c].anime + characters[c].gender;
            input = input.replace(/\s/g, '');
            let z = "";
            for (i=0; i < input.length; i++) {
                z += input[i].charCodeAt(0).toString(10);
            };
            let phrase = toString(z.length);
            let y = "";
            for (i=0; i < phrase.length; i++) {
                y += phrase[i].charCodeAt(0).toString(10);
            };
            if (z.length + y.length <= 256) {
                input = z + "0".repeat(256 - (z.length + y.length)) + y;
            } else {
                input = input.slice(0, -((z.length + y.length)-256));
            };
            input = input.slice(232) + input.slice(0, -24);
            let p = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61];
            for (i=0; i < 18; i++) {
                input = input.slice(64-p[i], 96-p[i]) + input.slice(0, 64-p[i]) + input.slice(96-p[i]);
            };
            for (i=0; i < 18; i++) {
                input = input.slice(96-p[i], 128-p[i]) + input.slice(0, 96-p[i]) + input.slice(128-p[i]);
            };
            for (i=0; i < input.length; i++) {
                if (input[i] === "0") {
                    input = input.slice(0, i) + z[(i % z.length)] + input.slice(i+1);
                };
            };
            input = input.slice(0,242);
            return input;
        };

        function getStats(id) {
            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            if (!charlvl[message.author.id + message.guild.id][id]) charlvl[message.author.id + message.guild.id][id] = 1;

            let currLvl = charlvl[message.author.id + message.guild.id][id];

            // HP 1-10
            let sha = 1+parseInt(sha24(id)[1]);
            // ATK 1-9
            function sumDigits(n) {
                let numArr = n.toString().split("");
                let sum = numArr.reduce(function(a, b){
                    return parseInt(a) + parseInt(b);
                }, 0);
                return sum;
            };
            let qs = sumDigits(sha24(id));
            while(qs > 9) {
                qs = sumDigits(qs)
            };
            // DEF 1-9
            let vDef = "";
            for (i=0; i < characters[id].name.length; i++) {
                vDef += characters[id].name[i].charCodeAt(0).toString(10);
            };
            vDef = sumDigits(vDef);
            while(vDef > 9) {
                vDef = sumDigits(vDef)
            };
            let hp, atk, def, rm;
            if (!ref[message.author.id + message.guild.id][id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][id];
            };
            if (rm > 5) rm = 5;
            
            switch (characters[id].rarity) {
                case "SS" : hp = Math.floor((1+0.25*(rm-1))*(180 + (6*sha))) + Math.round((5+(0.2*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(50 + Math.round(30/qs))) + Math.round((2.4+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(32 + Math.round(10/vDef))) + Math.round((1.25+(0.25/vDef))*(currLvl-1)); break;
                case "S" : hp = Math.floor((1+0.25*(rm-1))*(150 + (5*sha))) + Math.round((3.9+(0.06*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(40 + Math.round(15/qs))) + Math.round((1.9+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(24 + Math.round(10/vDef))) + Math.round((1+(0.2/vDef))*(currLvl-1)); break;
                case "A" : hp = Math.floor((1+0.25*(rm-1))*(120 + (6*sha))) + Math.round((3.3+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(35 + Math.round(15/qs))) + Math.round((1.6+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(18 + Math.round(8/vDef))) + Math.round((0.8+(0.15/vDef))*(currLvl-1)); break;
                case "B" : hp = Math.floor((1+0.25*(rm-1))*(100 + (5*sha))) + Math.round((2.8+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(30 + Math.round(10/qs))) + Math.round((1.2+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(15 + Math.round(7/vDef))) + Math.round((0.6+(0.2/vDef))*(currLvl-1)); break;
                case "C" : hp = Math.floor((1+0.25*(rm-1))*(80 + (4*sha))) + Math.round((2.4+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(25 + Math.round(10/qs))) + Math.round((0.9+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(12 + Math.round(6/vDef))) + Math.round((0.5+(0.15/vDef))*(currLvl-1)); break;
                case "D" : hp = Math.floor((1+0.25*(rm-1))*(70 + (3*sha))) + Math.round((2+(0.05*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(20 + Math.round(10/qs))) + Math.round((0.75+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(10 + Math.round(5/vDef))) + Math.round((0.4+(0.5/vDef))*(currLvl-1)); break;
                default : hp = 1; atk = 1; def = 1; break;
            };
            let ep = Math.floor(((hp/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def)) / (100/atk))*100) / 100;
            return [hp, atk, def, ep];
        };

        function rarity(a) {
            if (a === "SS") {
                return "https://i.ibb.co/GdhDTj1/n3qj4i2.png";
            } else if (a === "S") {
                return "https://i.ibb.co/8KZJLLZ/aSXEB8J.png";
            } else if (a === "A") {
                return "https://i.ibb.co/8MTkwzf/MNNSMIP.png";
            } else if (a === "B") {
                return "https://i.ibb.co/WswjB19/HHgIQsZ.png";
            } else if (a === "C") {
                return "https://i.ibb.co/ZHRxzFB/bF4Uwq7.png";
            } else if (a === "D") {
                return "https://i.ibb.co/Yp26KZG/qHR5lBz.png";
            } else {
                return "https://i.ibb.co/j6Vhb5B/zPpfb14.jpg";
            };
        };

        class charInfo {
            constructor(name, alias, anime, anialias, gender, image, id, rarity) {
                this._name = name;
                this._alias = alias;
                this._anime = anime;
                this._anialias = anialias;
                this._gender = gender;
                this._image = image;
                this._id = id;
                this._rarity = rarity;
            };
            display() {
                let animeL = this.anime;
                if (this.anime.length > 30) {
                    let spaceIndex = this.anime.slice(0,30).lastIndexOf(" ")
                    animeL = this.anime.slice(0,spaceIndex) + "\n" + this.anime.slice(spaceIndex)
                };
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setImage(this.image)
                .setThumbnail(rarity(this.rarity))
                .setDescription("**" + this.name + "**" + "\n" + animeL)
                .setFooter(`ID: #${this.id}`)
                message.channel.send(Embed);
            };
            displayMy() {

                let animeL = this.anime;
                if (this.anime.length > 30) {
                    let spaceIndex = this.anime.slice(0,30).lastIndexOf(" ")
                    animeL = this.anime.slice(0,spaceIndex) + "\n" + this.anime.slice(spaceIndex)
                };
                const dupes = inventory[message.author.id + message.guild.id].filter((e) => e === this.id);
                let copy;
                if (dupes.length < 2) {
                    copy = "copy";
                } else {
                    copy = "copies"
                };
                let refinement = "";
                if (!ref[message.author.id + message.guild.id][this.id] || ref[message.author.id + message.guild.id][this.id] < 1) {
                    refinement = "<:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (ref[message.author.id + message.guild.id][this.id] < 2) {
                    refinement = "<:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (ref[message.author.id + message.guild.id][this.id] < 3) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (ref[message.author.id + message.guild.id][this.id] < 4) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (ref[message.author.id + message.guild.id][this.id] < 5) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136>";
                } else {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552>";
                };

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setImage(this.image)
                .setThumbnail(rarity(this.rarity))
                .setDescription("**" + this.name + "**" + "\n" + animeL + "\n\n**Ref**. " + refinement)
                .setFooter("You have " + (dupes.length) + ` ${copy} of this`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                message.channel.send(Embed);
            };
            displayIm() {

                let animeL = this.anime;
                if (this.anime.length > 30) {
                    let spaceIndex = this.anime.slice(0,30).lastIndexOf(" ")
                    animeL = this.anime.slice(0,spaceIndex) + "\n" + this.anime.slice(spaceIndex)
                };
                const dupes = inventory[message.author.id + message.guild.id].filter((e) => e === this.id);
                let copy;
                if (dupes.length < 2) {
                    copy = "copy";
                } else {
                    copy = "copies"
                };
                let refinement = "";
                if (!ref[message.author.id + message.guild.id][this.id] || ref[message.author.id + message.guild.id][this.id] < 1) {
                    refinement = "<:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (ref[message.author.id + message.guild.id][this.id] < 2) {
                    refinement = "<:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (ref[message.author.id + message.guild.id][this.id] < 3) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (ref[message.author.id + message.guild.id][this.id] < 4) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (ref[message.author.id + message.guild.id][this.id] < 5) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136>";
                } else {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552>";
                };

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setImage(this.image)
                .setThumbnail(rarity(this.rarity))
                .setDescription("**" + this.name + "**" + "\n" + animeL + "\n\n**Ref**. " + refinement)
                .setFooter("You have " + (dupes.length) + ` ${copy} of this`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                message.channel.send(Embed);
            };
            base() {

                // HP 1-10
                let sha = 1+parseInt(sha24(this.id)[1]);
                // ATK 1-9
                function sumDigits(n) {
                    let numArr = n.toString().split("");
                    let sum = numArr.reduce(function(a, b){
                        return parseInt(a) + parseInt(b);
                    }, 0);
                    return sum;
                };
                let qs = sumDigits(sha24(this.id));
                while(qs > 9) {
                    qs = sumDigits(qs)
                };
                // DEF 1-9
                let vDef = "";
                for (i=0; i < this.name.length; i++) {
                    vDef += this.name[i].charCodeAt(0).toString(10);
                };
                vDef = sumDigits(vDef);
                while(vDef > 9) {
                    vDef = sumDigits(vDef)
                };

                let hp;
                let atk;
                let def;
                switch (this.rarity) {
                    case "SS" : hp = 180 + (6*sha); atk = 50 + Math.round(30/qs); def = 32 + Math.round(10/vDef); break;
                    case "S" : hp = 150 + (5*sha); atk = 40 + Math.round(15/qs); def = 24 + Math.round(10/vDef); break;
                    case "A" : hp = 120 + (6*sha); atk = 35 + Math.round(15/qs); def = 18 + Math.round(8/vDef); break;
                    case "B" : hp = 100 + (5*sha); atk = 30 + Math.round(10/qs); def = 15 + Math.round(7/vDef); break;
                    case "C" : hp = 80 + (4*sha); atk = 25 + Math.round(10/qs); def = 12 + Math.round(6/vDef); break;
                    case "D" : hp = 70 + (3*sha); atk = 20 + Math.round(10/qs); def = 10 + Math.round(5/vDef); break;
                    default : hp = 1; atk = 1; def = 1; break;
                };

                let ep = Math.floor(((hp/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def)) / (100/atk))*100) / 100;

                let animeL = this.anime;
                if (this.anime.length > 30) {
                    let spaceIndex = this.anime.slice(0,30).lastIndexOf(" ")
                    animeL = this.anime.slice(0,spaceIndex) + "\n" + this.anime.slice(spaceIndex)
                };
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setImage(this.image)
                .setThumbnail(rarity(this.rarity))
                .setDescription("**" + this.name + "**" + "\n" + animeL + "\n")
                .addFields(
                    { name: 'HP ️️️💖', value: hp, inline: true },
                    { name: 'ATK ️️⚔️', value: atk, inline: true },
                    { name: 'DEF ️️️🛡️', value: def, inline: true },
                )
                .setFooter(`EP: ${ep}`)
                message.channel.send(Embed);
            };

            get name() {
                return this._name;
            };
            get alias() {
                return this._alias;
            };
            get anime() {
                return this._anime;
            };
            get anialias() {
                return this._anialias;
            }
            get gender() {
                return this._gender;
            };
            get image() {
                return this._image;
            };
            get id() {
                return this._id;
            };
            get rarity() {
                return this._rarity;
            };
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
                return Math.floor(((this.hp(fl)/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),this.def(fl))) / (100/this.atk(fl)))*100) / 100;
            };
            stats(fl) {
                let eHp = this.hp(fl);
                let eAtk = this.atk(fl);
                let eDef = this.def(fl);
                let eEp = Math.floor(((eHp/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),eDef)) / (100/eAtk))*100) / 100;
                return [eHp, eAtk, eDef, eEp]
            };
            heal() {
                return Math.floor(this._hp/10);
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
            new enemyInfo("Ice Golem", "Golem", "an Ice Golem", false, "1430-1580", "220-270", "270-285", ["https://i.ibb.co/bN7RBX3/igg.png"], [44,46,47,48,49,51,52,53,54]),
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


        const characters = [
            new charInfo("Donquixote Rosinante", ["Corazon"], "One Piece", ["OP"], "M", "https://i.ibb.co/j8wGtS7/lbg3UeV.png", 0, "SS"),
            new charInfo("Nezuko Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/7jv2fY2/lAThmyr.png", 1, "SS"),
            new charInfo("Nino Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "F", "https://i.ibb.co/Tq9X5xm/k0CY0zg.png", 2, "S"),
            new charInfo("Miku Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "F", "https://i.ibb.co/jZ6ZV8N/YBkHZ1D.png", 3, "S"),
            new charInfo("Itsuki Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "F", "https://i.ibb.co/ygCD0tH/zGURdtZ.png", 4, "A"),
            new charInfo("Yotsuba Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "F", "https://i.ibb.co/qJK42nD/2VgyqAm.png", 5, "B"),
            new charInfo("Ichika Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "F", "https://i.ibb.co/4sVksLK/1SpSENc.png", 6, "B"),
            new charInfo("Fuutarou Uesugi", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "M", "https://i.ibb.co/4RRYdqr/C16wbDI.png", 7, "B"),
            new charInfo("Raiha Uesugi", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "F", "https://i.ibb.co/0s7FRgJ/qb5AL7S.png", 8, "C"),
            new charInfo("Isanari Uesugi", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "M", "https://i.ibb.co/Gnd52V3/FXG4kPy.png", 9, "D"),
            new charInfo("Maruo Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "M", "https://i.ibb.co/CW4vvVM/Di6ChiN.png", 10, "D"),
            new charInfo("Matsui", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets", "QQ"], "F", "https://i.ibb.co/610tXCC/xSvNNhu.png", 11, "D"),
            new charInfo("Victorique de Blois", ["The Golden Fairy", "Gray Wolf", "Monstre Charmant"], "Gosick", [], "F", "https://i.ibb.co/WDXv3xW/CzoxzRi.png", 12, "A"),
            new charInfo("Kazuya Kujou", ["The Black Reaper", "Baby Squirrel"], "Gosick", [], "M", "https://i.ibb.co/yYRSW7j/yR8KV9T.png", 13, "B"),
            new charInfo("Cordelia Gallo", [], "Gosick", [], "F", "https://i.ibb.co/vh9jJyZ/Tyj2oiE.png", 14, "D"),
            new charInfo("Brian Roscoe", [], "Gosick", [], "M", "https://i.ibb.co/3dddn3W/xmmaaSg.png", 15, "D"),
            new charInfo("Grevil de Blois", ["Pointy Head"], "Gosick", [], "M", "https://i.ibb.co/NnXk109/Gtrm63p.png", 16, "C"),
            new charInfo("Cecile Lafitte", [], "Gosick", [], "F", "https://i.ibb.co/V3jnP7Q/zEYYK0p.png", 17, "C"),
            new charInfo("Avril Bradley", [], "Gosick", [], "F", "https://i.ibb.co/YpCws6Q/jLggZGx.png", 18, "D"),
            new charInfo("Ambrose", [], "Gosick", [], "M", "https://i.ibb.co/RDwQJLZ/qDKFDC2.png", 19, "D"),
            new charInfo("Albert de Blois", [], "Gosick", [], "M", "https://i.ibb.co/02YbSxm/FjKzWUp.png", 20, "D"),
            new charInfo("Izumi Miyamura", ["Miyamura Izumi"], "Horimiya", [], "M", "https://i.ibb.co/cc4D2dV/DmQ4GTu.png", 21, "A"),
            new charInfo("Kyousuke Hori", [], "Horimiya", [], "M", "https://i.ibb.co/sWv3zhx/40oXTnX.png", 22, "D"),
            new charInfo("Yuki Yoshikawa", ["Yoshikawa Yuki"], "Horimiya", [], "F", "https://i.ibb.co/X2WYTWZ/lR1DeLm.png", 23, "A"),
            new charInfo("Kyouko Hori", ["Hori Kyouko"], "Horimiya", [], "F", "https://i.ibb.co/BKTjQbQ/ptPDIdN.png", 24, "S"),
            new charInfo("Honoka Sawada", [], "Horimiya", [], "F", "https://i.ibb.co/LJXJT52/TsYGnEj.png", 25, "B"),
            new charInfo("Tooru Ishikawa", [], "Horimiya", [], "M", "https://i.ibb.co/QD7Hp3W/xN5ahlV.png", 26, "C"),
            new charInfo("Akane Yanagi", [], "Horimiya", [], "M", "https://i.ibb.co/2ktvFMS/nGctW1M.png", 27, "D"),
            new charInfo("Remi Ayasaki", [], "Horimiya", [], "F", "https://i.ibb.co/xzj6733/c89Ykp6.png", 28, "B"),
            new charInfo("Shuu Iura", [], "Horimiya", [], "M", "https://i.ibb.co/fDJ36Lv/0HGcmqI.png", 29, "D"),
            new charInfo("Sakura Kouno", [], "Horimiya", [], "F", "https://i.ibb.co/5sfbvjg/GWXtjHZ.png", 30, "D"),
            new charInfo("Kouichi Shindou", [], "Horimiya", [], "M", "https://i.ibb.co/C0mBZxJ/aTgvaln.png", 31, "D"),
            new charInfo("Yume", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/cyvMhsj/uViM4Px.png", 32, "B"),
            new charInfo("Merry", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/7YP86yN/LwMW67M.png", 33, "A"),
            new charInfo("Haruhiro", ["Hal"], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/CKSvfvb/teozchH.png", 34, "C"),
            new charInfo("Manato", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/wrkZL39/XjqMQq9.png", 35, "C"),
            new charInfo("Ranta", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/NN56gw4/gUPRek1.png", 36, "C"),
            new charInfo("Shihoru", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/qypcKvw/3yisyUF.png", 37, "B"),
            new charInfo("Moguzo", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/nRFpH1W/FMq2r44.png", 38, "C"),
            new charInfo("Barbara", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/BrFDZjM/4GF6SHD.png", 39, "D"),
            new charInfo("Renji", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/ftCbDnv/kQ6gh4o.png", 40, "C"),
            new charInfo("Chibi", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/st5WxgV/6HYneZF.png", 41, "D"),
            new charInfo("Choco", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/2SYpbKy/zAyBN0F.png", 42, "C"),
            new charInfo("Aka Onda", [], "Rec", [], "F", "https://i.ibb.co/tbVxSJw/GCZGr6J.png", 43, "B"),
            new charInfo("Fumihiko Matsumaru", [], "Rec", [], "M", "https://i.ibb.co/MPYVfrf/R1HhmuN.png", 44, "D"),
            new charInfo("Tanaka (Rec)", [], "Rec", [], "F", "https://i.ibb.co/st3Cyh7/pio3oZz.png", 45, "D"),
            new charInfo("Yoshio Hatakeda", [], "Rec", [], "M", "https://i.ibb.co/G7n3bbF/tq57MkG.png", 46, "D"),
            new charInfo("Hyakkimaru", [], "Dororo", [], "M", "https://i.ibb.co/C5YtK1s/xBSmo3h.png", 47, "A"),
            new charInfo("Dororo", [], "Dororo", [], "F", "https://i.ibb.co/zPHLP8c/tyhcXQZ.png", 48, "A"),
            new charInfo("Mio", [], "Dororo", [], "F", "https://i.ibb.co/VSJtDY0/FjgZFIA.png", 49, "C"),
            new charInfo("Jukai", [], "Dororo", [], "M", "https://i.ibb.co/9wQkMQG/CMOKmMu.png", 50, "D"),
            new charInfo("Tahoumaru", [], "Dororo", [], "M", "https://i.ibb.co/J31pN7x/rjOU6h5.png", 51, "D"),
            new charInfo("Shichika Yasuri", [], "Katanagatari", [], "M", "https://i.ibb.co/wRSWZY6/7HbQTwq.png", 52, "C"),
            new charInfo("Togame", [], "Katanagatari", [], "F", "https://i.ibb.co/r4dkLYG/17UfgzO.png", 53, "B"),
            new charInfo("Nanami Yasuri", [], "Katanagatari", [], "F", "https://i.ibb.co/6yCxBvN/uKfujyB.png", 54, "C"),
            new charInfo("Hitei", [], "Katanagatari", [], "F", "https://i.ibb.co/RhKhZ6P/VzFnIEd.png", 55, "C"),
            new charInfo("Emonzaemon Souda", [], "Katanagatari", [], "M", "https://i.ibb.co/PtzC7NS/nUGJEIl.png", 56, "D"),
            new charInfo("Rinne Higaki", [], "Katanagatari", [], "M", "https://i.ibb.co/mb4P7MD/PUOy7jE.png", 57, "D"),
            new charInfo("Meisai Tsuruga", [], "Katanagatari", [], "F", "https://i.ibb.co/t2fHSKr/DnQ0Hi0.png", 58, "C"),
            new charInfo("Houou Maniwa", [], "Katanagatari", [], "M", "https://i.ibb.co/Sv5fWw7/j2y2k5y.png", 59, "D"),
            new charInfo("Zanki Kiguchi", [], "Katanagatari", [], "F", "https://i.ibb.co/pntdb38/3ozpmGT.png", 60, "D"),
            new charInfo("Kyouken Maniwa", [], "Katanagatari", [], "F", "https://i.ibb.co/p3zbxjJ/NvW06O5.png", 61, "C"),
            new charInfo("Hakuhei Sabi", [], "Katanagatari", [], "M", "https://i.ibb.co/cLY4YHy/tahoP8r.png", 62, "C"),
            new charInfo("Ginkaku Uneri", [], "Katanagatari", [], "M", "https://i.ibb.co/gWYPgNk/fjx6qck.png", 63, "D"),
            new charInfo("Fushi", [], "Fumetsu no Anata e", ["To Your Eternity"], "M", "https://i.ibb.co/Lh5mp0f/LZPJ0gY.png", 64, "SS"),
            new charInfo("Parona", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/sbpGkbn/9Sfze53.png", 65, "A"),
            new charInfo("Gugu", [], "Fumetsu no Anata e", ["To Your Eternity"], "M", "https://i.ibb.co/z4Tb8HC/wzoaRMk.png", 66, "S"),
            new charInfo("March", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/bJYbgH6/LVaAF6d.png", 67, "B"),
            new charInfo("Rynn Cropp", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/3YhHLGR/38Rsjgl.png", 68, "C"),
            new charInfo("Tonari Dalton", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/VmY1QhC/8pY6nN6.png", 69, "C"),
            new charInfo("Pyoran", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/tp2Xy6L/R8DptII.png", 70, "D"),
            new charInfo("Hayase", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/smfSp0Y/5zNO8wY.png", 71, "D"),
            new charInfo("Yuuki Asuna", ["Asuna Yuuki"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/7WG0jr6/hFfvuHy.png", 72, "SS"),
            new charInfo("Kirigaya Kazuto", ["Kirito", "Kazuto Kirigaya", "Beater"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/PWdgj7z/xCuvs7C.png", 73, "A"),
            new charInfo("Alice Zuberg", ["Synthesis Thirty"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/rM4MQ81/a.png", 74, "S"),
            new charInfo("Konno Yuuki", ["Yuuki Konno"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/qWbcsRK/CkxbsJb.png", 75, "S"),
            new charInfo("Kirigaya Suguha", ["Leafa", "Suguha Kirigaya"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/QpXJXnN/rUglxLU.png", 76, "A"),
            new charInfo("Sinon", ["Asada Shino"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/Bs2WmLY/GPA9sj0.png", 77, "A"),
            new charInfo("Eugeo", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/hBDfcm2/oKmV7V4.png", 78, "B"),
            new charInfo("Quinella", ["Administrator"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/Yd50wkd/He45omC.png", 79, "B"),
            new charInfo("Yui", ["Yui-MHCP001"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/Zg3xSx3/HlT0odh.png", 80, "B"),
            new charInfo("Klein", ["Tsuboi Ryoutarou"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/LdncKWM/KXY2HyV.png", 81, "B"),
            new charInfo("Andrew Gilbert Mills", ["Agil"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/D5y3zpY/QHkQbPU.png", 82, "C"),
            new charInfo("Silica", ["Keiko Ayano"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/jMNHWmy/ID6omse.png", 83, "B"),
            new charInfo("Lisbeth", ["Rika Shinozaki"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/yWr5G13/UzVvmcY.png", 84, "B"),
            new charInfo("Kayaba Akihiko", ["Akihiko Kayaba", "Heathcliff"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/Cw4cMGX/OnkWRSG.png", 85, "B"),
            new charInfo("Vassago Casals", ["PoH"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/9pzCSKk/52CWt3v.png", 86, "D"),
            new charInfo("Kuradeel", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/W3qjTSF/Zssooan.jpg", 87, "D"),
            new charInfo("Sugou Nobuyuki", ["Oberon"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/Cv2yHrf/HDYuWj2.png", 88, "D"),
            new charInfo("Death Gun", ["Shinkawa Shouichi", "Sterben", "XaXa"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/x72VQ0p/iKl6G63.png", 89, "C"),
            new charInfo("Gabriel Miller", ["Subtilizer", "Veta"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/dgHcT9Q/KISlyKD.png", 90, "C"),
            new charInfo("Lipia Zancale", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/PM9N4Dy/d3zNKfT.png", 91, "D"),
            new charInfo("Sachi", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/WF4R5rs/DnH3cIH.png", 92, "C"),
            new charInfo("Argo", ["Hosaka Carina Tomo", "The Rat"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/z5tFyVw/5nTBcal.png", 93, "D"),
            new charInfo("Sakuya", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/fx0pFsq/bYAu5m3.png", 94, "D"),
            new charInfo("Alicia Rue", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/yktyTjg/f45e09Q.png", 95, "D"),
            new charInfo("Eugene", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/SBTpdkx/BMMaZn1.jpg", 96, "D"),
            new charInfo("Selka Zuberg", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/LnkGBZb/Nm4sDFj.png", 97, "C"),
            new charInfo("Tiese Shtolienen", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/zbwwSyD/Yu8dWaa.png", 98, "C"),
            new charInfo("Ronye Arabel", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/NN131XR/AKrjstX.png", 99, "D"),
            new charInfo("Yuna (SAO)", ["Shigemura Yuuna", "Yuuna Shigemura"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/mC2JFnY/RTVsVH4.png", 100, "A"),
            new charInfo("Sortiliena Serlut", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/KKRXXRW/heufWsG.png", 101, "C"),
            new charInfo("Nochizawa Eiji", ["Nautilus"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/2qvpPF1/ZsmBzFD.png", 102, "C"),
            new charInfo("Shigemura Tetsuhiro", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/8m6zc9j/j0VrPyF.png", 103, "D"),
            new charInfo("Philia", ["Takemiya Kotone"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/sqhSDnw/sJcmx8P.png", 104, "B"),
            new charInfo("Strea", ["Strea-MHCP002"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/wsqTs8x/uJ6lYHt.png", 105, "C"),
            new charInfo("Rain", ["Karatachi Nijika"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/7XkcyRk/WWTxIC1.png", 106, "B"),
            new charInfo("Premiere", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/xSdhY7L/pkoPdhC.png", 107, "D"),
            new charInfo("Kureha", ["Takamine Momiji"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/55TyCgp/cqlBTcf.png", 108, "B"),
            new charInfo("Kohiruimaki Karen", ["LLENN", "Pink Devil"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/YfxPD92/cbdT6ad.png", 109, "C"),
            new charInfo("Pitohui", ["Kanzaki Elsa"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/1G1fnwt/9tHgE6y.png", 110, "D"),
            new charInfo("Asougi Goushi", ["M (SAO)"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/wg3Fw3j/QKjKICa.png", 111, "D"),
            new charInfo("Kaori Miyazono", ["Kao-chan", "Miyazono Kaori"], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/ZNrTyQY/gVq44JT.png", 112, "S"),
            new charInfo("Arima Kousei", ["Kousei Arima"], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/YhHJsMc/6iImUfB.png", 113, "S"),
            new charInfo("Sawabe Tsubaki", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/pKbMf3X/1SqCLnI.png", 114, "A"),
            new charInfo("Watari Ryota", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/pZ9fZmr/FFMF3lp.png", 115, "B"),
            new charInfo("Aiza Takeshi", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/df2ZJ6M/8QmEfjs.png", 116, "C"),
            new charInfo("Igawa Emi", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/vZP5M3J/KZblVRy.png", 117, "B"),
            new charInfo("Arima Saki", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/g7RndcV/7KIKwWl.png", 118, "D"),
            new charInfo("Seto Hiroko", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/0cjz0CY/2pJStwH.png", 119, "C"),
            new charInfo("Aiza Nagi", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/nfT2v8k/QXVYRT3.png", 120, "C"),
            new charInfo("Kashiwagi Nao", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/cJNqQG6/24nxkMt.png", 121, "C"),
            new charInfo("Miike Toshiya", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/4YNx72f/FFr2NYm.jpg", 122, "D"),
            new charInfo("Seto Koharu", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/7k2cRWM/d7rZiLs.png", 123, "D"),
            new charInfo("Ochiai Yuriko", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/y0LgSSP/SyexScK.jpg", 124, "D"),
            new charInfo("Takayanagi Akira", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/1rVMMq1/Oe9mAHj.jpg", 125, "D"),
            new charInfo("Miyazono Ryouko", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/51Q3tjt/l22dDM8.png", 126, "D"),
            new charInfo("Miyazono Yoshiyuki", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/TYp8YXv/PMzvQiD.png", 127, "D"),
            new charInfo("Hanako Honda", [], "Asobi Asobase", [], "F", "https://i.ibb.co/LYmTKbr/9tEqv2e.png", 128, "A"),
            new charInfo("Olivia (Asobi)", [], "Asobi Asobase", [], "F", "https://i.ibb.co/LkFC2rg/sYEz9dV.png", 129, "A"),
            new charInfo("Kasumi Nomura", [], "Asobi Asobase", [], "F", "https://i.ibb.co/1XNJwSf/hdM5wJ2.png", 130, "A"),
            new charInfo("Maeda", [], "Asobi Asobase", [], "M", "https://i.ibb.co/SV6Dmx6/3chkI9X.png", 131, "D"),
            new charInfo("Tsugumi Aozora", [], "Asobi Asobase", [], "F", "https://i.ibb.co/KKJhR4n/oowniNN.png", 132, "C"),
            new charInfo("Tokuko Sharekoube", [], "Asobi Asobase", [], "F", "https://i.ibb.co/8MWWzTd/OYJc6c0.png", 133, "D"),
            new charInfo("Akira Takizawa", ["Air King"], "Eden of The East", ["Higashi no Eden", "HnE", "EotE"], "M", "https://i.ibb.co/f0Ftsff/dCj636b.png", 134, "B"),
            new charInfo("Saki Morimi", [], "Eden of The East", ["Higashi no Eden", "HnE", "EotE"], "F", "https://i.ibb.co/gF0YrKX/30TbbbV.png", 135, "B"),
            new charInfo("Kuroha Shiratori", ["Diana (HnE)"], "Eden of The East", ["Higashi no Eden", "HnE", "EotE"], "F", "https://i.ibb.co/3kVbQFk/kWRNreN.png", 136, "D"),
            new charInfo("Kazuomi Hirasawa", [], "Eden of The East", ["Higashi no Eden", "HnE", "EotE"], "M", "https://i.ibb.co/BcLhYRK/IHAz1vH.png", 137, "C"),
            new charInfo("Yutaka Itazu", [], "Eden of The East", ["Higashi no Eden", "HnE", "EotE"], "M", "https://i.ibb.co/rMSzvb2/WrqyVBo.png", 138, "C"),
            new charInfo("Mikuru Katsuhara", ["Micchon", "Mittan"], "Eden of The East", ["Higashi no Eden", "HnE", "EotE"], "F", "https://i.ibb.co/7b2Q7fX/DRYnY7x.png", 139, "C"),
            new charInfo("Satoshi Ohsugi", [], "Eden of The East", ["Higashi no Eden", "HnE", "EotE"], "M", "https://i.ibb.co/T2CWw6w/iSrdd5K.png", 140, "D"),
            new charInfo("Yuusei Kondou", [], "Eden of The East", ["Higashi no Eden", "HnE", "EotE"], "M", "https://i.ibb.co/fQdxdLT/aCz13fn.png", 141, "D"),
            new charInfo("Tachibana Kanade", ["Kanade Tachibana"], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/fpmXh3P/tu4umn4.png", 142, "SS"),
            new charInfo("Yuri Nakamura", ["Yurippe"], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/GsFjhRb/wJ2IjyU.png", 143, "A"),
            new charInfo("Yui (AB)", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/b3f30Dn/QyH97El.png", 144, "A"),
            new charInfo("Yuzuru Otonashi", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/dKSYwWc/At0ieyA.png", 145, "B"),
            new charInfo("Hideki Hinata", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/M8T6w81/KOwG8xW.png", 146, "B"),
            new charInfo("T.K.", ["TK"], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/LCNsn8y/i5MGzc8.png", 147, "D"),
            new charInfo("Masami Iwasawa", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/YbHtxV5/rZRcZD7.png", 148, "B"),
            new charInfo("Ayato Naoi", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/xSFVDJ8/tAYHNF0.png", 149, "C"),
            new charInfo("Shiina", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/Twg65tb/ydmVgC7.png", 150, "C"),
            new charInfo("Noda", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/mXLQBqC/ewP4giE.png", 151, "D"),
            new charInfo("Fujimaki", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/4T6gGxk/X0YIBZr.png", 152, "D"),
            new charInfo("Hisako", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/RSKxpLw/EeFoyiH.png", 153, "C"),
            new charInfo("Hitomi", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/JqnLHH9/tWHKPwz.png", 154, "D"),
            new charInfo("Miyuki Irie", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/NFgYMqr/EXYL5fS.png", 155, "C"),
            new charInfo("Yusa", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/BjzzxjP/hewh7sE.png", 156, "C"),
            new charInfo("Hatsune Otonashi", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/ySMx7ms/ZSd0g5p.png", 157, "D"),
            new charInfo("Zenitsu Agatsuma", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/GCPH418/P54BqWy.png", 158, "S"),
            new charInfo("Tanjirou Kamado", ["Kamado Tanjirou", "Gonpachirou Kamaboko", "Kamaboko Gonpachirou", "Monjirou"], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/K9Qc2Vc/RqsLOue.png", 159, "S"),
            new charInfo("Mitsuri Kanroji", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/pRcqJ9M/HCvkjV3.png", 160, "A"),
            new charInfo("Shinobu Kochou", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/x7KjSp2/pzCg8Pn.png", 161, "S"),
            new charInfo("Kanao Tsuyuri", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/HGnmtJq/Ukj0VSo.png", 162, "A"),
            new charInfo("Giyuu Tomioka", ["Tomioka Giyuu"], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/hDkQcdn/tb3UHR6.png", 163, "A"),
            new charInfo("Inosuke Hashibira", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/5BDY6vs/lwTCWVV.png", 164, "A"),
            new charInfo("Kyoujurou Rengoku", ["Rengoku Kyoujurou"], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/BPgv1Pq/0r7isIJ.png", 165, "B"),
            new charInfo("Kibutsuji Muzan", ["Muzan Kibutsuji"], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/5LXDPLL/HtDM46i.png", 166, "B"),
            new charInfo("Muichirou Tokitou", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/jW7PKJw/MNvq0XX.png", 167, "C"),
            new charInfo("Enmu", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/HrdqhqT/UuHSWtS.png", 168, "B"),
            new charInfo("Aoi Kanzaki", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/Sm5F0ZQ/C7Ge5lQ.png", 169, "C"),
            new charInfo("Gotou", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/KLDYW8L/dSVQChd.png", 170, "D"),
            new charInfo("Hisa", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/1nDj6mq/iKea5EB.png", 171, "D"),
            new charInfo("Kozo Kanamori", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/5KhLZ6V/CKaRrPu.png", 172, "D"),
            new charInfo("Hotaru Haganezuka", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/B6Cf0qM/YkVIfBc.png", 173, "C"),
            new charInfo("Gyoumei Himejima", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/r0k24xg/1f6Ikuo.png", 174, "C"),
            new charInfo("Shigeru Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/RcGBSKW/vH4emSW.png", 175, "D"),
            new charInfo("Rokuta Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/NxQsbBn/UFX3ISW.png", 176, "D"),
            new charInfo("Takeo Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/Q9HtWj2/U23adFJ.png", 177, "D"),
            new charInfo("Hanako Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/JtgGd5B/GgK79YJ.png", 178, "D"),
            new charInfo("Kie Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/tC8g1Pg/xWFKqPe.png", 179, "D"),
            new charInfo("Tanjuurou Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/B2nw7xJ/uIi3njP.png", 180, "C"),
            new charInfo("Kamanue", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/K7DNs4J/8fQK1V5.png", 181, "D"),
            new charInfo("Kazumi", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/D5PQY8s/kgp0Cgq.png", 182, "D"),
            new charInfo("Kiyoshi", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/HGSV5d1/p2YTsPS.png", 183, "D"),
            new charInfo("Kanae Kochou", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/7S77tv0/x4WBwVX.png", 184, "B"),
            new charInfo("Jigorou Kuwajima", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/q9vyhqf/IuhUD1o.png", 185, "C"),
            new charInfo("Makomo", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/zVbxNmn/VKpog7E.png", 186, "C"),
            new charInfo("Murata", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/n6MpVJY/6NwWhzA.png", 187, "D"),
            new charInfo("Sumi Nakahara", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/Y0DwB0K/YU1rRRg.png", 188, "D"),
            new charInfo("Rui", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/K52YKBB/bWwcoY8.png", 189, "B"),
            new charInfo("Sabito", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/89VsmZn/mVzAKFB.png", 190, "B"),
            new charInfo("Genya Shinazugawa", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/3R5C6TT/GznXxvV.png", 191, "C"),
            new charInfo("Shoichi", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/wKXDz9x/C68Eo0G.png", 192, "D"),
            new charInfo("Susamaru", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/SNpnkrQ/2uuvtgW.png", 193, "D"),
            new charInfo("Naho Takada", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/BwtsbBS/kSBodEb.png", 194, "D"),
            new charInfo("Tamayo", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/q59tQKd/BfrASpa.png", 195, "C"),
            new charInfo("Kiyo Terauchi", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/yFLjpWM/rOHiAPZ.png", 196, "D"),
            new charInfo("Kagaya Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/0tTvtcB/cefiLm7.png", 197, "C"),
            new charInfo("Kiriya Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/znNfBwN/szZXunC.png", 198, "C"),
            new charInfo("Nichika Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/mSs5Fnt/K5WlWIb.png", 199, "C"),
            new charInfo("Hinaki Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/Fh8zR4P/P29sjf4.png", 200, "C"),
            new charInfo("Kanata Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "F", "https://i.ibb.co/c2s7wnq/TZJQbMj.png", 201, "C"),
            new charInfo("Sakonji Urokodaki", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/C7BYKD4/XmRUdTM.png", 202, "B"),
            new charInfo("Tengen Uzui", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/TLN5KsD/1xiLGWM.png", 203, "C"),
            new charInfo("Yahaba", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/tPKH7m0/Xy5tquR.png", 204, "D"),
            new charInfo("Yushirou", [], "Demon Slayer", ["Kimetsu no Yaiba", "DS", "KnY"], "M", "https://i.ibb.co/480pCJQ/hYbg0YY.png", 205, "C"),
            new charInfo("Tsunemori Akane", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/k016sS9/pXXmN8N.png", 206, "A"),
            new charInfo("Kogami Shinya", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/VgBTpR1/5zXd1Sf.png", 207, "A"),
            new charInfo("Makishima Shogo", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/njJPzqg/KvDyljr.png", 208, "A"),
            new charInfo("Ginoza Nobuchika", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/521WDX1/mO0sVao.png", 209, "A"),
            new charInfo("Kunidzuka Yayoi", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/mhJRSJd/kyIqsJC.png", 210, "B"),
            new charInfo("Kagari Shuusei", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/3Wz6ffn/zaejTyA.png", 211, "B"),
            new charInfo("Masaoka Tomomi", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/pw7Y2jK/yDCcguq.png", 212, "B"),
            new charInfo("Karanomori Shion", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/5LwcXsy/RlJd7TX.png", 213, "B"),
            new charInfo("Saiga Jouji", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/PCLYrkK/DC2WgbE.png", 214, "C"),
            new charInfo("Aoyanagai Risa", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/84wNzh2/BX10k9n.png", 215, "C"),
            new charInfo("Funahara Yuki", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/KGs9p9N/Lz0p9uJ.jpg", 216, "D"),
            new charInfo("Kasei Joushuu", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/hCDpVwk/alGkWkk.png", 217, "C"),
            new charInfo("Tougane Sakuya", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/56gnQF4/xrwtsFp.png", 218, "C"),
            new charInfo("Shimotsuki Mika", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/txLNPzz/4qvTIJ9.png", 219, "C"),
            new charInfo("Kamui Kirito", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/0X6Kk0Y/Dw8ahfi.png", 220, "C"),
            new charInfo("Aikawa Tsubaki", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/N1N1wHf/2V8tIUJ.jpg", 221, "D"),
            new charInfo("Hasuike Kaede", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/bdbSPNB/JBaKD9R.jpg", 222, "D"),
            new charInfo("Suzuki Moe", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/hgpfqgD/oHdYKzf.jpg", 223, "D"),
            new charInfo("Hinakawa Shou", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/vHSrQb7/5Ptm39A.png", 224, "C"),
            new charInfo("Sugou Teppei", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/MkZF9FW/DsdKgAf.jpg", 225, "D"),
            new charInfo("Tougane Misako", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/z832P7S/VeMImBi.jpg", 226, "D"),
            new charInfo("Shindou Arata", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/WnzWR8C/dGwremD.png", 227, "B"),
            new charInfo("Ignatov Kei Mikhail", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/d0LTm9W/LjR1Dha.jpg", 228, "D"),
            new charInfo("Vivy", ["Diva"], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/Wk4RX0L/bG5XdmT.png", 229, "A"),
            new charInfo("Matsumoto", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "M", "https://i.ibb.co/zNCgjDK/9A3u1JT.png", 230, "B"),
            new charInfo("Estella", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/LPLPmL7/CagOcrE.png", 231, "B"),
            new charInfo("Kakitani Yugo", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "M", "https://i.ibb.co/y4DrmbS/7X3MU6x.png", 232, "C"),
            new charInfo("Ophelia", ["The Small Theater Fairy"], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/dM4Wy0m/jHxmNYv.png", 233, "C"),
            new charInfo("Elizabeth", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/6yjg4hY/6R3dM7c.png", 234, "B"),
            new charInfo("Grace", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/6vJtmdC/OdNq6aP.png", 235, "D"),
            new charInfo("Dr. Matsumoto", ["Matsumoto Osamu"], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "M", "https://i.ibb.co/X72Tf9w/1GmozYl.png", 236, "C"),
            new charInfo("Tatsuya Saeki", ["Dr. Saeki"], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "M", "https://i.ibb.co/T0HQp0B/jq58oU2.png", 237, "C"),
            new charInfo("Rimuru Tempest", ["Mikami Satoru", "Slime-san"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/tXPbFpL/c0MS7Ca.png", 238, "SS"),
            new charInfo("Veldora Tempest", ["Storm Dragon Veldora"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/HFsTLNd/XxQxKMy.png", 239, "B"),
            new charInfo("Milim Nava", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/Bjnwd9T/jrEQxi5.png", 240, "S"),
            new charInfo("Diablo (TenSura)", ["Noir"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/jVTFnD6/DCcH6VN.png", 241, "A"),
            new charInfo("Shuna", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/RcYpbhQ/H4KIyKo.png", 242, "A"),
            new charInfo("Shion", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/bLnLcCz/jy6qWqU.png", 243, "A"),
            new charInfo("Benimaru", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/zm32Kh4/1VScZEU.png", 244, "A"),
            new charInfo("Souei", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/jZtXhpN/qT7ZhmU.png", 245, "B"),
            new charInfo("Hakurou", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/5KcxMG6/fjxtCp1.png", 246, "C"),
            new charInfo("Gobuta", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/87z0f5j/orAd8Rs.png", 247, "C"),
            new charInfo("Chloe Aubert", ["Aubert Chloe"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/tJgm4TM/ckVpOkn.png", 248, "C"),
            new charInfo("Carrion", ["Beast King"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/qFYXrwS/YmkX4ze.jpg", 249, "C"),
            new charInfo("Clayman", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/7RYvFjx/2DNWa7H.png", 250, "B"),
            new charInfo("Gazel Dwargo", ["Heroic King"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/93Fr4Hh/PcfMucQ.png", 251, "D"),
            new charInfo("Ellen (TenSura)", ["Eren (TenSura)", "Elyune H. Grimwald"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/S7wknY1/zTodkIe.png", 252, "C"),
            new charInfo("Fuse", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/6BPb8Xh/IdP3PxQ.png", 253, "D"),
            new charInfo("Gabiru", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/Z24J8h5/BdQ3YDn.png", 254, "C"),
            new charInfo("Geld", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/GvvqWhS/PfMP0Ou.png", 255, "D"),
            new charInfo("Gido", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/X2Ypjnd/vrJ9XZr.png", 256, "D"),
            new charInfo("Shizue Izawa", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/N2d5spR/35orED4.png", 257, "A"), // absolut unsicher mit der Rarity
            new charInfo("Yuuki Kagurazaka", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/MDJ9JQb/SU6Z8dT.png", 258, "C"),
            new charInfo("Kaijin", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/W3jHzzw/6VQCnWP.png", 259, "C"),
            new charInfo("Kurobee", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/9nV4jrL/4ierWgO.png", 260, "D"),
            new charInfo("Lamrys", ["Ramiris", "Fairy of the Labyrinth"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/P9fyyGy/8UNLwvT.png", 261, "B"),
            new charInfo("Laplace", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/YPZgpr0/HeIAcz7.png", 262, "C"),
            new charInfo("Ranga", ["Tempest Wolf", "Star Wolf"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/34xrrHs/fkRaNnj.png", 263, "C"), 
            new charInfo("Rigurd", ["Rigur"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/LQs7QBY/6eYfoKN.png", 264, "B"),
            new charInfo("Treyni", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/n3P9ckW/UO4PJBf.png", 265, "B"),
            new charInfo("Vesta", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/kSnwSLJ/Z6jpQCw.png", 266, "D"),
            new charInfo("Albis", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/6DZ0nLJ/Nfrkyma.png", 267, "D"),
            new charInfo("Grucius", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/RDzYtRV/YdaNnTt.jpg", 268, "C"),
            new charInfo("Mjurran", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/bHgxpCt/a352v1q.jpg", 269, "C"),
            new charInfo("Suphia", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/GxjBJWb/kUNHI9R.png", 270, "D"),
            new charInfo("Taguchi Shougo", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/HzvdSZp/f9VyvCv.jpg", 271, "D"),
            new charInfo("Mizutani Kirara", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/q5hrbV6/aqw5Vqs.jpg", 272, "D"),
            new charInfo("Tachibana Kyouya", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/bL0yH2z/1ENFf7y.jpg", 273, "D"),
            new charInfo("Eren Yeager", ["Attack Titan", "Eren Jäger", "Yeager Eren"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/0rYJMQ7/ern.png", 274, "SS"),
            new charInfo("Mikasa Ackerman", ["Ackerman Mikasa"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/JFQjmC9/m.png", 275, "S"),
            new charInfo("Armin Arlert", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/80RCmJq/arm.png", 276, "S"),
            new charInfo("Sasha Braus", ["Potato Girl", "Sasha Brouse", "Sasha Blouse"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/tLk51vW/sasha.png", 277, "A"),
            new charInfo("Oluo Bozado", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/Yk1jR28/uL7ycmW.png", 278, "D"),
            new charInfo("Reiner Braun", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/rcpWXrY/g9I8IAy.png", 279, "B"),
            new charInfo("Riko Brzenska", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/bPgNj0c/3AdFVPt.png", 280, "D"),
            new charInfo("Mina Carolina", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/WpLTfzt/RHyPKnw.png", 281, "C"),
            new charInfo("Ian Dietrich", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/JpxnbFr/PvDSmLI.png", 282, "D"),
            new charInfo("Nile Dok", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/tzSrFrX/F1aclTJ.png", 283, "C"),
            new charInfo("Marlo Freudenberg", ["Marlowe Freudenberg"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/sC2J0yj/w47LO3q.png", 284, "C"),
            new charInfo("Hannes", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/9v3GvBG/S5f5O3g.png", 285, "C"),
            new charInfo("Bertolt Hoover", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/XS7XYgW/1EuTnEL.png", 286, "B"),
            new charInfo("Jean Kirstein", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/MpWzwRS/Dftcmdx.png", 287, "A"),
            new charInfo("Krista Lenz", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/Ss6jJW0/1ENFf7y.png", 288, "A"),
            new charInfo("Annie Leonhart", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/FxsL291/Ut1luXj.png", 289, "B"),
            new charInfo("Levi", ["Levi Ackerman"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/QHkd2nf/6ixQuad.png", 290, "SS"),
            new charInfo("Nick (AoT)", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/Vj8PmJB/213227.jpg", 291, "D"),
            new charInfo("Pixis Dot", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/gPd51nX/TNthRiD.png", 292, "B"),
            new charInfo("Petra Ral", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/QJbbx2S/we.png", 293, "C"),
            new charInfo("Anka Rheinberger", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/LngxGf6/lZPFHfQ.png", 294, "D"),
            new charInfo("Keith Shadis", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/yWGZKX1/D33gAp6.png", 295, "C"),
            new charInfo("Erwin Smith", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/bJfbypV/ezgif-6-ff759d55a63a.png", 296, "A"),
            new charInfo("Connie Springer", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/5BvSTXD/7HOPXFT.png", 297, "A"),
            new charInfo("Kitts Verman", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/wrz1vRQ/206475.jpg", 298, "D"),
            new charInfo("Thomas Wagner", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/fnch3B9/ezgif-6-c05bea048abf.png", 299, "D"),
            new charInfo("Grisha Yeager", ["Dr. Yeager"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/MPXK1Yb/a.png", 300, "B"),
            new charInfo("Carla Yeager", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/K2vfcwD/Fj5Tgwg.png", 301, "C"),
            new charInfo("Ymir", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/dmGfYTc/vHe8y7O.png", 302, "B"),
            new charInfo("Mike Zacharias", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/z5sfrXH/13waInL.png", 303, "C"),
            new charInfo("Darius Zackly", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/9rMcdZC/213239.jpg", 304, "D"),
            new charInfo("Hange Zoë", ["Hange Zoe"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/jyHr2c4/h.png", 305, "A"),
            new charInfo("Zeke", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/QQ5ypbX/z.png", 306, "A"),
            new charInfo("Kenny Ackerman", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/Zx8r3Ky/ezgif-6-e945a66032b8.png", 307, "C"),
            new charInfo("Alma", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/Fg9yPSW/360458.webp", 308, "D"),
            new charInfo("Uri Reiss", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/PZhzVKL/ADyimgt.png", 309, "B"),
            new charInfo("Rodd Reiss", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/rdHSxJZ/Kq7bn1x.png", 310, "D"),
            new charInfo("Frieda Reiss", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/5F4pk1J/4UQanBD.png", 311, "C"),
            new charInfo("Hitch Dreyse", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/8xYcJqx/2hRvscu.png", 312, "C"),
            new charInfo("Pieck Finger", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/TbJZcsB/p.png", 313, "A"),
            new charInfo("Eren Kruger", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/HT36rzM/oEf7pd2.png", 314, "C"),
            new charInfo("Fay Yeager", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/V2dL4bW/lovenCV.png", 315, "D"),
            new charInfo("Gabi Braun", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/x7Q5znN/who9X4j.png", 316, "C"),
            new charInfo("Porco Galliard", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/pdGKyFn/mWZCF9i.png", 317, "B"),
            new charInfo("Colt Grice", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/QrPPnyR/hXC7ICw.png", 318, "C"),
            new charInfo("Falco Grice", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/R05hBH9/431391.webp", 319, "B"),
            new charInfo("Onyankopon", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/yRBpwxw/MzRzbOI.png", 320, "C"),
            new charInfo("Willy Tybur", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/fCQD7QM/fOPvCC1.png", 321, "B"),
            new charInfo("Lara Tybur", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/ngDyGbF/Xew1e6n.png", 322, "C"),
            new charInfo("Yelena", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/swNmmdT/WeA0EW6.png", 323, "B"),
            new charInfo("Zofia", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/b3ZFPCc/ezgif-6-c1193bf08ef4.png", 324, "C"),
            new charInfo("Berner Moblit", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/Qbz4tZ4/UxkPfjg.png", 325, "D"),
            new charInfo("Marco Bott", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/F5vp4yC/zU1Hmmo.png", 326, "D"),
            new charInfo("Dirk", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/P578Byx/mahJshT.png", 327, "D"),
            new charInfo("Floch Forster", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/HYYxZyx/VrFJKyb.png", 328, "B"),
            new charInfo("Marlo Freudenberg", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/FnYBnmV/onCpMnm.png", 329, "C"),
            new charInfo("Dina Fritz", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/d0zVBjR/5Ob1MPz.png", 330, "D"),
            new charInfo("Tom Ksaver", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/x8vvZWS/ntoC5Pg.png", 331, "D"),
            new charInfo("Kiyomi Azumabito", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/0rgjjKM/k.png", 332, "D"),
            new charInfo("Nicolo", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/k994z8j/qryyfxp.png", 333, "C"),
            new charInfo("Udo", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/LPc49fP/2THLbB8.png", 334, "C"),
            new charInfo("Artur Braus", ["Artur Blouse"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/3vJdDWx/4PmvEgX.jpg", 335, "D"),
            new charInfo("Tsukasa Yuzaki", ["Tsukuyomi Tsukasa"], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/1ZwSPDj/t.png", 336, "S"),
            new charInfo("Nasa Yuzaki", [], "Tonikaku Kawaii", ["Tonikawa"], "M", "https://i.ibb.co/5M0d7Mb/gH6SKVI.png", 337, "A"),
            new charInfo("Kaname Arisugawa", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/F4vzxhT/0SUUehn.png", 338, "B"),
            new charInfo("Aya Arisugawa", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/X2sRJdV/iYNBR9k.png", 339, "C"),
            new charInfo("Aurora (TK)", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/nkXVGvy/tpkvkcE.png", 340, "D"),
            new charInfo("Charlotte (TK)", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/0q2Dj4C/G48nFnv.png", 341, "C"),
            new charInfo("Chitose Kaginoji", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/r4c06Zh/3eyNoW0.png", 342, "C"),
            new charInfo("Enishi Yuzaki", [], "Tonikaku Kawaii", ["Tonikawa"], "M", "https://i.ibb.co/16dmPn0/e.png", 343, "D"),
            new charInfo("Kanoka Yuzaki", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/349KKnn/XPomdzj.png", 344, "D"),
            new charInfo("Kyouya Hashiba", ["Hashiba Kyouya"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "M", "https://i.ibb.co/fQmgM5w/koZkXYi.png", 345, "B"),
            new charInfo("Kawasegawa Eiko", [], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "F", "https://i.ibb.co/m4DFYst/wcIRD55.png", 346, "B"),
            new charInfo("Kogure Nanako", ["N@NA"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "F", "https://i.ibb.co/QN20JhG/FZegI4Q.png", 347, "B"),
            new charInfo("Rokuonji Tsurayuki", ["Kawagoe Kyouchi"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "M", "https://i.ibb.co/vwkcQng/TUDzCXT.png", 348, "C"),
            new charInfo("Shino Aki", ["Shinoaki", "Shino Akishima"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "F", "https://i.ibb.co/k9Scs3y/d7Ccx2T.png", 349, "A"),
            new charInfo("Miyoki Hashiba", ["Hashiba Miyoki"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "F", "https://i.ibb.co/12GKPQb/idiUOjD.png", 350, "D"),
            new charInfo("Dalian", ["Dariane"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/jHxcfTr/LlDgTgM.png", 351, "A"),
            new charInfo("Hugh Anthony Disward", ["Huey"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/dp1fRJH/CM9lIgn.png", 352, "B"),
            new charInfo("Aira", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/j8hsjvH/oEII0vH.png", 353, "D"),
            new charInfo("Mildred Dewar", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/BnvKF8N/10XTVWX.png", 354, "D"),
            new charInfo("Paula Dickinson", ["Paula Lents"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/Zhrr9MS/doV4Boy.jpg", 355, "D"),
            new charInfo("Viola Duplessis", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/8N8SMcp/81FhqLH.jpg", 356, "D"),
            new charInfo("Fiona", ["Inu Musume"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/h92zD8L/eRGT4DJ.png", 357, "C"),
            new charInfo("Flamberge", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/3TrKFby/fnGqNI7.png", 358, "B"),
            new charInfo("Martin Geese", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/s5cj3Nq/ECMHQtJ.jpg", 359, "D"),
            new charInfo("Gianni", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/3cvtp4Z/0agARX5.jpg", 360, "D"),
            new charInfo("Ilas", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/TgGMd0F/Qb5eDmu.jpg", 361, "D"),
            new charInfo("Armand Jeremiah", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/wRKjHkL/nCorkeu.png", 362, "C"),
            new charInfo("Kamhout Hal", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/ck2mFNC/uZ0f4H3.png", 363, "C"),
            new charInfo("Lenny Lents", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/mTJ2hVk/image.png", 364, "D"),
            new charInfo("Estella Lilburn", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/GTt3Fks/image.png", 365, "D"),
            new charInfo("Merlgar", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/19z9zsX/image.png", 366, "D"),
            new charInfo("Moskin", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/18ssq0h/image.png", 367, "D"),
            new charInfo("Mabel Nash", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/ZVM9S0F/image.png", 368, "C"),
            new charInfo("Patricia Nash", ["Patti"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/HCtgMvt/image.png", 369, "D"),
            new charInfo("Nos", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/X5GZJ3c/image.png", 370, "D"),
            new charInfo("Oobaba", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/MPL5P7w/image.png", 371, "D"),
            new charInfo("Raziel", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/R4gBKvm/r.png", 372, "C"),
            new charInfo("Salut", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/m5YFjp6/image.png", 373, "D"),
            new charInfo("Camilla Sauer Keynes", ["Kamilla Sauer Keynes"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/BwS6T9g/image.png", 374, "B"),
            new charInfo("Lianna Scholes", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/5FqRZ5P/image.png", 375, "D"),
            new charInfo("Christabel Sistine", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/F7gwgDD/a.png", 376, "C"),
            new charInfo("Laticia Serkis", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/kc7WPqk/image.png", 377, "D"),
            new charInfo("Shoka no shoujo", ["Bookshelf girl"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/P1dGNDd/image.png", 378, "B"),
            new charInfo("Vance", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/V35FNJt/image.png", 379, "D"),
            new charInfo("Mitsuha Miyamizu", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/pbS1wx3/image.png", 380, "S"),
            new charInfo("Taki Tachibana", [], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/TkP3bMP/image.png", 381, "S"),
            new charInfo("Tsukasa Fujii", [], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/gtyVLx1/image.png", 382, "B"),
            new charInfo("Toshiki Miyamizu", [], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/Qdsm1ns/image.png", 383, "D"),
            new charInfo("Yotsuha Miyamizu", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/w0jLfTh/image.png", 384, "B"),
            new charInfo("Futaba Miyamizu", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/nQVrHLt/341157.jpg", 385, "C"),
            new charInfo("Hitoha Miyamizu", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/f4c1P4W/zg8Iihs.png", 386, "D"),
            new charInfo("Sayaka Natori", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/b79dMCW/PFKKN6X.png", 387, "C"),
            new charInfo("Miki Okudera", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/k8J9rxk/image.png", 388, "A"),
            new charInfo("Shinta Takagi", [], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/vXmf57f/image.png", 389, "D"),
            new charInfo("Katsuhiko Teshigawara", ["Tessie"], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/H7wqvMT/5C1X8Bh.png", 390, "B"),
            new charInfo("Yukari Yukino", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/jLn6pKT/image.png", 391, "C"),
            new charInfo("Chizuru Ichinose", ["Mizuhara Chizuru"], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/qsSJ0rZ/Tz8m5bT.png", 392, "S"),
            new charInfo("Kazuya Kinoshita", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/NKFByMT/image.png", 393, "A"),
            new charInfo("Sayuri Ichinose", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/rMpptB7/image.png", 394, "D"),
            new charInfo("Yoshiaki Kibe", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/zQLG62F/image.png", 395, "C"),
            new charInfo("Kazuo Kinoshita", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/H4DK1Zq/image.png", 396, "D"),
            new charInfo("Nagomi Kinoshita", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/4twztRk/JWg5tyk.png", 397, "D"),
            new charInfo("Harumi Kinoshita", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/9YGdfY4/image.png", 398, "D"),
            new charInfo("Shun Kuribayashi", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/JpzCFfW/image.png", 399, "C"),
            new charInfo("Mami Nanami", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/d4b5vGP/jwxS4xS.png", 400, "A"),
            new charInfo("Sumi Sakurasawa", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/mXSzLN3/image.png", 401, "A"),
            new charInfo("Ruka Sarashina", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/191TXZH/image.png", 402, "B"),
            new charInfo("Takeshi Sasano", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/2g1vvZ7/image.png", 403, "D"),
            new charInfo("Sonoko Shimae", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/rZ7n57N/s.png", 404, "D"),
            new charInfo("Artoria Pendragon", ["Saber"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/zrGGH50/3rLQUle.png", 405, "SS"),
            new charInfo("Kiritsugu Emiya", ["Emiya Kiritsugu"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/BTm0JqW/image.png", 406, "A"),
            new charInfo("Shirou Emiya", ["Emiya Shirou"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/VWygTSf/EB4Z1ib.png", 407, "B"),
            new charInfo("Gilgamesh", ["King of Heroes", "King of Kings", "Golden King"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/bWt37rG/lX3zwmJ.png", 408, "S"),
            new charInfo("Enkidu", ["Chains of Heaven"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/WpyYk8m/image.png", 409, "A"),
            new charInfo("Kirei Kotomine", ["Kotomine Kirei"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/4Pvfj4v/image.png", 410, "B"),
            new charInfo("Irisviel von Einzbern", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/jDFX3xF/image.png", 411, "A"),
            new charInfo("Rin Tohsaka", ["Rin Toosaka", "Tohsaka Rin"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/yk5Y5Mq/image.png", 412, "S"),
            new charInfo("Alexander the Great", ["Iskandar", "King of Conquerors", "Rider"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ZV2ZWpH/image.png", 413, "A"),
            new charInfo("Illyasviel von Einzbern", ["Illya"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/mShNyVP/image.png", 414, "B"),
            new charInfo("Sakura Matou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/pz1320d/JROxIug.png", 415, "A"),
            new charInfo("Diarmuid Ua Duibhne", ["Duirmuid O'Dyna"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/GdWRjc3/image.png", 416, "B"),
            new charInfo("Hassan-i-Sabbah", ["Hassan i Sabbah", "Assassin"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/7gXZYBQ/image.png", 417, "D"),
            new charInfo("Berserker", ["Lancelot"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Yk032Q2/C.png", 418, "B"),
            new charInfo("Gilles de Rais", ["Bluebeard"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/wJHxYHq/image.png", 419, "D"),
            new charInfo("Kayneth El-Melloi Archibald", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/n1Nbch9/image.png", 420, "C"),
            new charInfo("Gráinne", ["Grainne"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/d53pxFt/image.png", 421, "D"),
            new charInfo("Maiya Hisau", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/JKwskQW/image.png", 422, "B"),
            new charInfo("Natalia Kamiński", ["Natalia Kaminski"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/250xLRp/image.png", 423, "C"),
            new charInfo("Risei Kotomine", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/pwx5RYD/image.png", 424, "D"),
            new charInfo("Kotone", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/30mHy50/image.png", 425, "D"),
            new charInfo("Leysritt", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/LP1BXSZ/image.png", 426, "D"),
            new charInfo("Leysritt (Kaleid)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/F46rJf7/IL6qfHc.png", 427, "C"),
            new charInfo("Martha Mackenzie", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/Xydz9X0/image.png", 428, "D"),
            new charInfo("Glen Mackenzie", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/DWrzYmF/image.png", 429, "D"),
            new charInfo("Matou Zouken", ["Zouken Matou"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/qRvcYzt/image.png", 430, "C"),
            new charInfo("Kariya Matou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/W5bN61H/image.png", 431, "C"),
            new charInfo("Sola-Ui Nuada-Re Sophia-Ri", ["Sola Ui Nuada Re Sophia Ri"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/ck9VZpN/image.png", 432, "C"),
            new charInfo("Tokiomi Tohsaka", ["Tokiomi Toosaka"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/rckTzSg/image.png", 433, "C"),
            new charInfo("Aoi Tohsaka", ["Aoi Zenjou", "Aoi Toosaka"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/hVB5C8t/image.png", 434, "D"),
            new charInfo("Ryuunosuke Uryuu", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/8DbgxXC/image.png", 435, "D"),
            new charInfo("Waver Velvet", ["Lord El-Melloi II"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/YQyPsQc/image.png", 436, "B"),
            new charInfo("Jubstacheit von Einzbern", ["Acht"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/7WXZXGZ/image.png", 437, "D"),
            new charInfo("Archer", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0tzKKXS/image.png", 438, "A"),
            new charInfo("Cú Chulainn", ["Lancer", "Cu Chulainn"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/qWvFwrR/SZqJfoZ.png", 439, "A"),
            new charInfo("Sasaki Kojirou", ["Assassin (stay night)"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/fqhsXdB/image.png", 440, "B"),
            new charInfo("Heracles", ["Berserker (stay night)", "Megalos"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/5v0QcyZ/image.png", 441, "C"),
            new charInfo("Medea", ["Caster"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/kJPkQSN/78FDr46.png", 442, "A"),
            new charInfo("Fujimura Taiga", ["Fuji-nee", "Fuji nee"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/7gKbNCV/image.png", 443, "C"),
            new charInfo("Kane Himuro", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/zs6kxfj/image.png", 444, "D"),
            new charInfo("Souichirou Kuzuki", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/PgNzJzw/image.png", 445, "D"),
            new charInfo("Kaede Makidera", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/zsHtC8G/image.png", 446, "D"),
            new charInfo("Shinji Matou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ThW7dZ5/image.png", 447, "B"),
            new charInfo("Ayako Mitsuzuri", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/WyG2KH4/image.png", 448, "C"),
            new charInfo("Medusa", ["Rider (stay night)"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/Z619qdC/image.png", 449, "A"),
            new charInfo("Ryuudou Issei", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/FWGBCJL/image.png", 450, "D"),
            new charInfo("Yukika Saegusa", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/NWrLgp6/image.png", 451, "D"),
            new charInfo("Sella", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/PC04TYb/image.png", 452, "D"),
            new charInfo("Sella (Kaleid)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/JqRQt2w/image.png", 453, "C"),
            new charInfo("Shin Assassin", ["Hassan of the Cursed Arm", "True Assassin"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Nt1Cqqg/image.png", 454, "D"),
            new charInfo("Arthur Pendragon", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/DKvZV38/image.png", 455, "C"),
            new charInfo("Ayaka Sajou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/nLy17Kc/image.png", 456, "C"),
            new charInfo("Misaya Reiroukan", ["Cherubim", "Lady of the Wolves"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/18Hw9jr/image.png", 457, "B"),
            new charInfo("Manaka Sajou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/mD3vJbD/image.png", 458, "D"),
            new charInfo("Aro Isemi", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0rF57C0/image.png", 459, "D"),
            new charInfo("Okita Souji", ["Sakura Saber"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/xms7CRJ/image.png", 460, "SS"),
            new charInfo("Oda Nobunaga", ["Majin Archer", "Demon Archer"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/qnnPytj/image.png", 461, "S"),
            new charInfo("Nagao Kagetora", ["Lancer of Eight Flowers"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/P5cby4G/image.png", 462, "C"),
            new charInfo("Okita Souji (alter)", ["Sakura Saber (alter)", "Okitan", "Okita Souji Alter", "Sakura Saber Alter"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/CbFmGNp/image.png", 463, "S"),
            new charInfo("Okada Izou", ["Ghost of Tosa"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/rthNVmq/image.png", 464, "B"),
            new charInfo("Oryou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/FVBwnM3/AKAUUUP.png", 465, "C"),
            new charInfo("Sakamoto Ryouma", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/svDdND3/image.png", 466, "C"),
            new charInfo("Mori Nagayoshi", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0DRFvgP/image.png", 467, "C"),
            new charInfo("Major Reiter", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/7Vm5rRT/image.png", 468, "D"),
            new charInfo("Jeanne d'Arc", ["Ruler", "The Maid of Orléans", "Maid of Orléans"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/hBkCfpW/image.png", 469, "S"),
            new charInfo("Jeanne d'Arc (alter)", ["Jalter", "Jeanne d'Arc Alter"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/SVh0X5h/sw.png", 470, "A"),
            new charInfo("Sieg", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/dfzrXXJ/image.png", 471, "B"),
            new charInfo("Astolfo", ["Rider of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/W3bt90N/image.png", 472, "A"),
            new charInfo("Mordred", ["Saber of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/sJDrwPM/image.png", 473, "S"),
            new charInfo("Karna", ["Lancer of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ZK8qXyv/image.png", 474, "B"),
            new charInfo("Merlin", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/QcGYyGx/image.png", 475, "A"),
            new charInfo("Atalanta", ["Archer of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/LP02hLL/image.png", 476, "B"),
            new charInfo("Semiramis", ["Assassin of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/pKWVdvf/s.png", 477, "B"),
            new charInfo("Spartacus", ["Berserker of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Z8ws4j2/image.png", 478, "D"),
            new charInfo("William Shakespeare", ["Caster of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/CwW57kP/image.png", 479, "C"),
            new charInfo("Achilles", ["Rider of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ysZzBFh/image.png", 480, "C"),
            new charInfo("Rocco Belfeban", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/09FyjRL/image.png", 481, "D"),
            new charInfo("Flatt Escardos", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/XsfSh9T/image.png", 482, "D"),
            new charInfo("Caules Forvedge Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ckM83R8/image.png", 483, "D"),
            new charInfo("Fiore Forvedge Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/kQ1hwst/image.png", 484, "D"),
            new charInfo("Roche Frain Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ZxpPB9Y/image.png", 485, "D"),
            new charInfo("Victor Frankenstein", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/FVDHm5w/image.png", 486, "D"),
            new charInfo("Celenike Icecolle Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/DYv3ddN/image.png", 487, "D"),
            new charInfo("Shirou Kotomine", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/YLyTDsC/image.png", 488, "B"),
            new charInfo("Chiron", ["Archer of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0GJf96B/image.png", 489, "C"),
            new charInfo("Jack the Ripper", ["Assassin of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/wpLPyGJ/image.png", 490, "C"),
            new charInfo("Frankenstein", ["Berserker of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/BctZhCZ/image.png", 491, "B"),
            new charInfo("Avicebron", ["Caster of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ZxZXzWQ/image.png", 492, "D"),
            new charInfo("Vlad III", ["Lancer of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/1K1DxqB/image.png", 493, "C"),
            new charInfo("Siegfried", ["Saber of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/4gzT260/image.png", 494, "C"),
            new charInfo("Laeticia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/C8fwrVc/image.png", 495, "D"),
            new charInfo("Gordes Musik Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/vBRQCcZ/image.png", 496, "D"),
            new charInfo("Darnic Prestone Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/6JbrPDc/image.png", 497, "D"),
            new charInfo("Reika Rikudou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/FzCMkq1/image.png", 498, "C"),
            new charInfo("Isabelle Romée", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/xzCv2VZ/image.png", 499, "D"),
            new charInfo("Morgan le Fay", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/nwkbWqZ/fay.png", 500, "A"),
            new charInfo("Sergio", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ssZXh06/image.png", 501, "D"),
            new charInfo("Kairi Shishigou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/S6rk1Kw/image.png", 502, "B"),
            new charInfo("Tool", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/GM9XBRV/image.png", 503, "D"),
            new charInfo("Nero Claudius", ["Nero Claudius Caesar Augustus Germanicus", "Saber Nero", "Red Saber"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/g309TzJ/image.png", 504, "S"),
            new charInfo("Hakuno Kishinami (M)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/YLDT7p7/image.png", 505, "C"),
            new charInfo("Hakuno Kishinami (F)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/0ZsyJLZ/5r0qmme.png", 506, "B"),
            new charInfo("Francis Drake", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/CKsng16/aoY6cjy.png", 507, "B"),
            new charInfo("Dan Blackmore", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Nss6wSs/image.png", 508, "D"),
            new charInfo("Rani VIII", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/WV2Ggcc/khzGjbi.png", 509, "C"),
            new charInfo("Artoria Pendragon (alter)", ["Saber (alter)", "Saber alter", "Salter"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/h8z6CM6/image.png", 510, "S"),
            new charInfo("Gudao", ["Ritsuka Fujimaru (M)"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/3kWs5w3/image.png", 511, "B"),
            new charInfo("Mash Kyrielight", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/ZzGZpRw/XHlBAuF.png", 512, "A"),
            new charInfo("Romani Archaman", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/c1HDYYB/image.png", 513, "C"),
            new charInfo("Olga Marie Animusphere", ["Olga-Marie Arsimilat Animusphere", "Olga Marie Arsimilat Animusphere", "Olgamally"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/qpsnzL8/ZCVq7e0.png", 514, "B"),
            new charInfo("Lev Lainur Flauros", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/zJQmyZw/image.png", 515, "D"),
            new charInfo("Ushiwakamaru", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/6mWwhGj/3gAIRkH.png", 516, "B"),
            new charInfo("Gudako", ["Ritsuka Fujimaru (F)"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/BjKfzT4/2oZ1mvk.png", 517, "B"),
            new charInfo("Scáthach", ["Scathach"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/9ZHVNyw/s.png", 518, "A"),
            new charInfo("Hans Christian Andersen", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Ykgtv9b/image.png", 519, "D"),
            new charInfo("Thomas Alva Edison", ["Thomas Edison"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/G0S5Nqj/NZVFINJ.png", 520, "C"),
            new charInfo("Sherlock Holmes", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/dQ3Vkf9/qTL9Nt7.png", 521, "D"),
            new charInfo("Brynhildr", ["Sigrdrífa", "Sigrdrifa"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/pKGV8cX/DzCZHX3.png", 522, "C"),
            new charInfo("Miyamoto Musashi", ["Musashi Miyamoto", "Shinmen Takezou", "Miyamoto Iori"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/SNYrq9R/image.png", 523, "SS"),
            new charInfo("Ryouma Sakamoto", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0F44LB7/image.png", 524, "D"),
            new charInfo("Nikola Tesla", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/qYd7Xmb/hfspEhh.png", 525, "C"),
            new charInfo("Tristan", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/BKbVmJc/zdXyQts.png", 526, "D"),
            new charInfo("Abigail Williams", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/RYR0nTN/XhcLYBE.png", 527, "C"),
            new charInfo("Artoria Pendragon (lancer)", ["Lartoria", "Lion King", "The Lion King", "Artoria Lancer"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/D7Fdhs4/a13G1wY.png", 528, "A"),
            new charInfo("Artoria Pendragon (lancer alter)", ["Lalter", "Artoria Lancer Alter"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/89RH6zJ/8ugAUqe.png", 529, "A"),
            new charInfo("Tamamo no Mae", ["Blue Caster"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/P5QDmHb/JHOBEuT.png", 530, "A"),
            new charInfo("Gray", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/jfcmK8s/DlLrWaF.png", 531, "B"),
            new charInfo("Reines El-Melloi Archisorte", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/L6Gm7T7/YfeyRKn.png", 532, "C"),
            new charInfo("Luviagelita Edelfelt", ["Luvia"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/TYTrXN8/image.png", 533, "B"),
            new charInfo("Melvin Weins", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/SrwLt1H/image.png", 534, "D"),
            new charInfo("Yvette L. Lehrman", ["Yvette Lehrman"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/jGXbBLK/wOolhq5.png", 535, "C"),
            new charInfo("Hishiri Adashino", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/g3rB5MH/89JoOKG.png", 536, "D"),
            new charInfo("Mary Lil Fargo", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/LCN5rSP/image.png", 537, "D"),
            new charInfo("Alec Fargo", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/nkWVrGW/image.png", 538, "D"),
            new charInfo("Trisha Fellows", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/ysv0h3X/image.png", 539, "D"),
            new charInfo("Gaurika", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/VS7rbRr/image.png", 540, "D"),
            new charInfo("Hephaestion", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/GQ4vF3T/image.png", 541, "D"),
            new charInfo("Fernando Li", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/KyJwS8C/image.png", 542, "D"),
            new charInfo("Bram Nuada-Re Sophia-Ri", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/QJWYSyt/image.png", 543, "D"),
            new charInfo("Wills Pelham Codrington", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/6RWN7KF/image.png", 544, "D"),
            new charInfo("Jean-Mario Supinerra", ["Jean Mario Supinerra"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/xHp4R1K/image.png", 545, "D"),
            new charInfo("Ishtar", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/Kr6h5JJ/46txCUb.png", 546, "S"),
            new charInfo("Ereshkigal", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/ryDMtyz/D4TINe2.png", 547, "S"),
            new charInfo("Gorgon", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/j3NGk9F/hbOpFkb.png", 548, "C"),
            new charInfo("Leonardo da Vinci", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/k9VxQsR/QcyKi6O.png", 549, "A"),
            new charInfo("Angra Mainyu", ["Aŋra Mainiiu", "Avenger", "All the World's Evil"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/n8PGV4L/Pv5dClp.png", 550, "B"),
            new charInfo("Dustin", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/KNpJMNP/image.png", 551, "D"),
            new charInfo("Jaguar Man", ["Jaguarman", "Jaguar Warrior"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/tJ3rvB2/Bd7685l.png", 552, "C"),
            new charInfo("Leonidas I", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/x6QHLb0/image.png", 553, "D"),
            new charInfo("Solomon", ["Mage King", "King Solomon"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/zZ5x0h3/image.png", 554, "C"),
            new charInfo("Quetzalcoatl", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/jkDyJ6d/FkUXGFN.png", 555, "B"),
            new charInfo("Meuniere", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/VNDymcv/image.png", 556, "D"),
            new charInfo("Wolfgang Amadeus Mozart", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Ph8bPwL/BgRbVHJ.png", 557, "C"),
            new charInfo("Benkei Musashibou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/phP8x8B/image.png", 558, "D"),
            new charInfo("Siduri", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/mhkxmk4/Sq9DC4e.png", 559, "C"),
            new charInfo("Tiamat", ["Femme Fatale"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/qk3VLR4/CYgGTed.png", 560, "B"),
            new charInfo("Miyu Edelfelt", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/G77jzw4/qD1YBJ5.png", 561, "C"),
            new charInfo("Tatsuko Gakumazawa", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/nfKgx6w/ZHov6wn.png", 562, "D"),
            new charInfo("Mimi Katsura", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/P1hHn4V/aPkHLfs.png", 563, "D"),
            new charInfo("Suzuka Kurihara", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/wLnDbKj/as.png", 564, "D"),
            new charInfo("Nanaki Moriyama", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/FnwNrs3/image.png", 565, "D"),
            new charInfo("Chloe von Einzbern", ["Dark Illya"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/Hq0v0Ly/eUx283L.png", 566, "B"),
            new charInfo("Caren Hortensia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/VJg18sX/2nJhywr.png", 567, "C"),
            new charInfo("Hibari Kurihara", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/3RDd6df/image.png", 568, "D"),
            new charInfo("Nanami Moriyama", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/bFP3tjw/image.png", 569, "D"),
            new charInfo("Bazett Fraga McRemitz", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/7vSzR8h/nmm4l69.png", 570, "B"),
            new charInfo("Julian Ainsworth", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/thRZQKK/8g0NetZ.png", 571, "D"),
            new charInfo("Erika Ainsworth", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/3WbFm2p/N23mumO.png", 572, "D"),
            new charInfo("Angelica Ainsworth", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/mz9ckHM/AY5q3UL.png", 573, "C"),
            new charInfo("Beatrice Flowerchild", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/WFx5jrM/tUJT3Hb.png", 574, "D"),
            new charInfo("Tanaka (Kaleid)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/F4NdTN1/oo.png", 575, "C"),
            new charInfo("Sigma", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/g6p5mJD/image.png", 576, "D"),
            new charInfo("Roxy Migurdia", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/QFBrTMK/pCalWuu.png", 577, "A"),
            new charInfo("Rudeus Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/GQ9DLQr/65ZVVJF.png", 578, "A"),
            new charInfo("Paul Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/vZ8cDvP/BFN7Xdg.png", 579, "B"),
            new charInfo("Zenith Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/J73TW7J/DYg6HCd.png", 580, "B"),
            new charInfo("Norn Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/6wWkB6S/GjJj8e5.png", 581, "C"), 
            new charInfo("Aisha Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/CVTsw93/S9L9GMS.png", 582, "C"),
            new charInfo("Lilia Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/vBgtpRy/wmoGh8q.png", 583, "C"),
            new charInfo("Sylphiette", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/bHF7sbc/Z47FYrJ.png", 584, "B"),
            new charInfo("Eris Boreas Greyrat", ["Mad Dog"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/s3KDwZb/larhiCh.png", 585, "A"),
            new charInfo("Philip Boreas Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/dKhbBjv/A4Ks9pF.png", 586, "D"),
            new charInfo("Sauros Boreas Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/746NBHQ/2EbWv0F.png", 587, "D"),
            new charInfo("Ghislaine Dedoldia", ["King's Hound"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/hVMx77n/zBEVqt3.png", 588, "C"),
            new charInfo("Ruijerd Superdia", ["Dead End", "Watch Dog"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/tZQ982P/CxqkQzW.png", 589, "A"),
            new charInfo("Kishirika Kishirisu", ["Demon Emperor of Demon Eyes", "The Immortal Demon Empress"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/TwpX737/ZkDoOHE.png", 590, "C"),
            new charInfo("Elinalise Dragonroad", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/7XCVgRB/LK2bwHv.png", 591, "C"),
            new charInfo("Geese", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/0s26bBj/lKESqgB.png", 592, "D"),
            new charInfo("Zanoba Shirone", ["Head Ripping Prince"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/thbNcJK/hsOEIpw.png", 593, "C"),
            new charInfo("Orsted", ["Dragon God"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/sPrw6v8/sGpVxFB.png", 594, "B"),
            new charInfo("Nanahoshi Shizuka", ["Silent Seven Stars"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/tmmc4qP/p1cGZVF.png", 595, "D"),
            new charInfo("Hinata Shouyou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/Qbx3LD7/pXGeQpu.png", 596, "S"),
            new charInfo("Kageyama Tobio", ["King of the Court"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/QC3StBr/PFeMDn7.png", 597, "S"),
            new charInfo("Nishinoya Yuu", ["Karasuno's Guardian Duty"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/vBT3RpN/NGnX4Si.png", 598, "S"),
            new charInfo("Aihara Mao", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/7SPfxbM/image.png", 599, "D"),
            new charInfo("Aone Takanobu", ["The Iron Wall"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/WkDnPtB/uY0xBnJ.png", 600, "B"),
            new charInfo("Azumane Asahi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/k5DjYb7/hFlu4Ua.png", 601, "A"),
            new charInfo("Ennoshita Chikara", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/vq2t1f2/RA1kJEe.png", 602, "B"),
            new charInfo("Fukunaga Shouhei", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/GtRZz2S/mzHImxC.png", 603, "D"),
            new charInfo("Futakuchi Kenji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/BnHTPKd/wRIBkH4.png", 604, "B"),
            new charInfo("Hanamaki Takahiro", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/kJBYzK9/Eee2SJi.png", 605, "D"),
            new charInfo("Hinata Natsu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/VB7cL2V/image.png", 606, "D"),
            new charInfo("Ikejiri Hayato", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tQgbYdP/TaOAGip.png", 607, "D"),
            new charInfo("Inuoka Sou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/Y7nGsXD/0kLucNf.png", 608, "D"),
            new charInfo("Iwaizumi Hajime", ["Iwa-chan"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/q1RbNb8/7E97UUT.png", 609, "B"), 
            new charInfo("Izumi Yukitaka", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/5s3vKGn/a34FXfo.png", 610, "D"),
            new charInfo("Kai Nobuyuki", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/L0FZ2wj/O7xXOTQ.png", 611, "D"),
            new charInfo("Kamasaki Yasushi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/PgYcH8M/0Cq5i8y.png", 612, "D"),
            new charInfo("Kindaichi Yuutarou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/1r7S5cB/Y5PDiYz.png", 613, "C"),
            new charInfo("Kinoshita Hisashi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/zfF7cJ6/mdfG2cq.png", 614, "C"),
            new charInfo("Kozume Kenma", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/PC4DBTj/2NfknZT.png", 615, "A"),
            new charInfo("Kunimi Akira", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/q9Kp70z/Im9mDdi.png", 616, "C"),
            new charInfo("Kuroo Tetsurou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/RGXNDsY/vhROhIx.png", 617, "A"),
            new charInfo("Matsukawa Issei", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/M1t0vD3/V6c72Gm.png", 618, "D"),
            new charInfo("Michimiya Yui", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/Fx3kfFd/eAp8ikQ.png", 619, "C"),
            new charInfo("Moniwa Kaname", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/ZSJ82R7/r3GFT0N.png", 620, "D"),
            new charInfo("Narita Kazuhito", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/phgK4bp/U4eM6CY.png", 621, "D"),
            new charInfo("Nekomata Yasufumi", ["Nekomata-sensei"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/0M9zQ3J/neKhnZj.png", 622, "C"),
            new charInfo("Oikawa Tooru", ["Grand King"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/gjjCzNC/2rcay8n.png", 623, "S"),
            new charInfo("Sasaya Takehito", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/L5PcC3M/mtSsmI4.png", 624, "D"),
            new charInfo("Sawamura Daichi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tpjDBR1/Sl05lAY.png", 625, "B"),
            new charInfo("Shimada Makoto", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/ymT0RWh/u6Mf1Xp.png", 626, "D"),
            new charInfo("Shimizu Kiyoko", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/bgLw5Gf/3nDKpU5.png", 627, "B"),
            new charInfo("Sugawara Koushi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/0YF0PgM/mgI1W1H.png", 628, "A"),
            new charInfo("Takeda Ittetsu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/kSs5ZLG/0NG4rdn.png", 629, "B"),
            new charInfo("Tanaka Ryuunosuke", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/3CZPWRr/wZFn37f.png", 630, "B"),
            new charInfo("Tsukishima Kei", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/YbfgJyp/lLNKA4a.png", 631, "A"),
            new charInfo("Ukai Keishin", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/34ZP38S/plhOhKt.png", 632, "B"),
            new charInfo("Ushijima Wakatoshi", ["Ushiwaka"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tHYLkBP/YH87Ui9.png", 633, "B"),
            new charInfo("Watari Shinji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/kQgcpXw/0JBc13k.png", 634, "D"),
            new charInfo("Yaku Morisuke", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/dGp5H45/SUyw3We.png", 635, "C"),
            new charInfo("Yamaguchi Tadashi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/NSZ13jy/kgG1tod.png", 636, "B"),
            new charInfo("Yamamoto Taketora", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/w79gRbS/tBMB3E4.png", 637, "C"),
            new charInfo("Akaashi Keiji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/pZwP07f/bMKgceK.png", 638, "B"),
            new charInfo("Bokuto Koutarou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tDLr9Nf/QlvrG1f.png", 639, "A"),
            new charInfo("Goura Masaki", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/C1TZnm7/402015.jpg", 640, "D"),
            new charInfo("Haiba Lev", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/CKPPDzw/oBNrmnR.png", 641, "C"),
            new charInfo("Koganegawa Kanji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/8gP3cKR/IJlc9OV.png", 642, "C"), 
            new charInfo("Kyoutani Kentarou", ["Mad Dog (HQ)"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/72BL5CJ/uupKrTB.png", 643, "C"),
            new charInfo("Misaki Hana", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/5xBz5f0/ssJbjoE.png", 644, "D"),
            new charInfo("Ogano Daiki", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/YWhS3yN/402018.jpg", 645, "D"),
            new charInfo("Oiwake Takurou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/dJdbbJ6/kJLArHu.png", 646, "D"),
            new charInfo("Shirofuke Yukie", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/bXGwSDp/oW0RwLs.png", 647, "C"),
            new charInfo("Suzumeda Kaori", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/x3MWwXG/image.png", 648, "D"),
            new charInfo("Tanaka Saeko", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/7v0Z2df/xX5gycq.png", 649, "C"),
            new charInfo("Terushima Yuuji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/NmjwBKv/1tWnHqx.png", 650, "C"),
            new charInfo("Tsukishima Akiteru", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/zP0S4L5/Ib4DLwA.png", 651, "D"),
            new charInfo("Ukai Ikkei", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tJZ9XVQ/UocTJ3V.png", 652, "B"),
            new charInfo("Yachi Hitoka", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/tzF57Mb/BGupgwo.png", 653, "B"),
            new charInfo("Goshiki Tsutomu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/RP6MQSC/SayviQ0.png", 654, "C"),
            new charInfo("Semi Eita", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/Zmy3H1V/ywJzt3r.png", 655, "D"),
            new charInfo("Tendou Satori", ["Guess Monster"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/vkkWG0z/GTWzdLF.png", 656, "C"),
            new charInfo("Washijou Tanji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tmbPn71/qY5SiVh.png", 657, "C"),
            new charInfo("Sakusa Kiyoomi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/TWczCVc/2zCMdGe.png", 658, "D"),
            new charInfo("Kita Shinsuke", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/VqgxftR/e983AdX.png", 659, "C"),
            new charInfo("Miya Osamu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/59ptT4s/KjdMNp3.png", 660, "C"),
            new charInfo("Miya Atsumu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/Xp6g1wY/Yq3Drxu.png", 661, "B"),
            new charInfo("Ojiro Aran", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/hVMWcy0/3xZ5ri7.png", 662, "D"),
            new charInfo("Suna Rintarou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/HLycKTY/6VsHc47.png", 663, "D"),
            new charInfo("Udai Tenma", ["Little Giant"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/99ZFsQL/wCDYxmq.png", 664, "C"),
            new charInfo("Itou Miyabi", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/dDMzF30/fYxbrFZ.png", 665, "D"),
            new charInfo("Shiraishi Urara", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/rGd3dWw/BgTKcyu.png", 666, "S"),
            new charInfo("Odagiri Nene", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/mTGfRW3/VGnYQrT.png", 667, "A"),
            new charInfo("Miyamura Toranosuke", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "M", "https://i.ibb.co/7XmqkPw/Ox4ccbM.png", 668, "B"),
            new charInfo("Yamada Ryuu", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "M", "https://i.ibb.co/QYYHJx1/Hf41jUE.png", 669, "B"),
            new charInfo("Asuka Mikoto", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/88yWSTx/0yTvRLe.png", 670, "C"),
            new charInfo("Igarashi Ushio", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "M", "https://i.ibb.co/qFLGTDV/4y3qe7j.png", 671, "D"),
            new charInfo("Miyamura Leona", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/bXL5RQP/9pRYVM1.png", 672, "B"),
            new charInfo("Ootsuka Meiko", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/p2YnK4F/ik4Z4rr.png", 673, "C"),
            new charInfo("Saionji Rika", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/ZT8tSqN/30JaydH.png", 674, "C"),
            new charInfo("Sarushima Maria", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/r46CGP0/MAcaR6o.png", 675, "B"),
            new charInfo("Takigawa Noa", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/DbzNVZb/XMcTm9h.png", 676, "A"),
            new charInfo("Tamaki Shinichi", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "M", "https://i.ibb.co/S3Syx28/Qgw9n9C.png", 677, "D"),
            new charInfo("Nancy", ["Haruko Nijino"], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "F", "https://i.ibb.co/RcNgvHh/VJAGLuM.png", 678, "D"),
            new charInfo("Tsubaki Kentaro", [], "Yamada-kun to 7-nin no Majo", ["Yamada-kun", "Yamada kun", "Yamada-kun and the Seven Witches"], "M", "https://i.ibb.co/pWyXxSz/34rflB0.png", 679, "D"),
            new charInfo("Baal", ["Raiden Shogun", "Electro Archon", "God of Eternity"], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/BtZh10B/r.png", 680, "S"),
            new charInfo("Amber", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/7JkjN3Q/ue7VSMC.png", 681, "B"),
            new charInfo("Barbara (GI)", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/p0gvRts/m0ctSVP.png", 682, "A"),
            new charInfo("Bennett", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/hdp2f9Y/LJUJLJg.png", 683, "C"),
            new charInfo("Beidou", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/z5GFmFx/AKSPeOq.png", 684, "B"),
            new charInfo("Chongyun", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/FgR9Rpm/lmaBHJi.png", 685, "D"),
            new charInfo("Diluc", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/6mw4Nk1/QOAelHZ.png", 686, "A"),
            new charInfo("Diona", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/yyZb1P8/REfmjko.png", 687, "D"),
            new charInfo("Eula", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/2jvRVjd/EtcvEfq.png", 688, "A"),
            new charInfo("Fischl", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/1Qd7Z1k/2lQlxUL.png", 689, "C"),
            new charInfo("Ganyu", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/61X4gFy/G.png", 690, "A"),
            new charInfo("Hu Tao", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/10yXngs/xw5Mmqb.png", 691, "S"),
            new charInfo("Jean", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/3FqxgfP/BrKoASe.png", 692, "C"),
            new charInfo("Kaedehara Kazuha", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/sWsbTw3/ssNAsnb.png", 693, "A"),
            new charInfo("Kaeya", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/xGHQhZv/YiIUQpn.png", 694, "D"),
            new charInfo("Kamisato Ayaka", ["Ayaka Kamisato"], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/0r9gnLs/A.png", 695, "B"),
            new charInfo("Keqing", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/5Y4LW99/e.png", 696, "S"),
            new charInfo("Klee", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/rQ4FG2P/l6iJOaM.png", 697, "C"),
            new charInfo("Lisa", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/Gsrtjz4/s5S091B.png", 698, "C"),
            new charInfo("Mona", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/5hTw5vW/zVkUMFV.png", 699, "B"),
            new charInfo("Dainsleif", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/XCgHYvg/I3lrCCJ.png", 700, "A"),
            new charInfo("Ningguang", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/qCsV8PF/rLP7NAU.png", 701, "B"),
            new charInfo("Noelle", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/wMH8fgV/n.png", 702, "C"),
            new charInfo("Qiqi", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/09CzTpS/gZqjFMo.png", 703, "C"),
            new charInfo("Razor", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/G5XKtdd/eniJ4A0.png", 704, "C"),
            new charInfo("Rosaria", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/XWv48Dx/R.png", 705, "B"),
            new charInfo("Sucrose", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/bm4LcFT/MHzWAkH.png", 706, "C"),
            new charInfo("Tartaglia", ["Childe"], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/p2PvT7y/xrMbCZs.png", 707, "B"),
            new charInfo("Aether", ["Traveler (M)"], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/LnkJ8QP/bX0DkSG.png", 708, "A"),
            new charInfo("Lumine", ["Traveler (F)"], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/r3wDmB9/VICB7l7.png", 709, "A"),
            new charInfo("Venti", ["Barbatos (GI)", "Windborne Bard", "Tone-Deaf Bard", "Gof of Freedom", "Anemo Archon"], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/v4fc6Yk/v.png", 710, "A"),
            new charInfo("Xiangling", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/d2VS1hm/x.png", 711, "D"),
            new charInfo("Xiao", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/BctLyx8/UcuTqsx.png", 712, "A"),
            new charInfo("Xingqiu", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/N1tgMNT/POSWeo7.png", 713, "C"),
            new charInfo("Xinyan", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/hXpnyp3/yLJjI5C.png", 714, "D"),
            new charInfo("Yanfei", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/qmSCFSk/64xOS6p.png", 715, "B"),
            new charInfo("Zhongli", ["Vago Mundo", "Rex Lapis", "Morax", "God of Contracts", "Geo Archon"], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/9v6wBTN/rQSSAyX.png", 716, "A"),
            new charInfo("Aloy", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/DLCh9gY/J1eJaAv.png", 717, "D"),
            new charInfo("Paimon", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/vkQQXxQ/QKR5hqi.png", 718, "B"),
            new charInfo("Scaramouche", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/JmhdrcM/eel3kSQ.png", 719, "B"),
            new charInfo("La Signora", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/XyvCr9n/jDXkIhG.png", 720, "B"),
            new charInfo("Dottore", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/pLHYtBq/7Vn5UDK.png", 721, "D"),
            new charInfo("Collei", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/nLvdKX1/TYF7bnK.png", 722, "D"),
            new charInfo("Baizhu", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/TTLBJw7/FxsMa2V.png", 723, "C"),
            new charInfo("Vennessa", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/ftfccZ9/bAgtrdz.png", 724, "C"),
            new charInfo("Cyno", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/HC5hJ3X/JAC5Tzz.png", 725, "C"),
            new charInfo("Yaoyao", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/PrkHQ5R/lTKKjG4.png", 726, "D"),
            new charInfo("Lyney", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/LrpWHxP/4TZpIBG.png", 727, "C"),
            new charInfo("Lynette", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/zrRDvkj/Xy3Ppp0.png", 728, "C"),
            new charInfo("Katheryne", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/M9yJf5W/k.png", 729, "C"),
            new charInfo("Cicin Mage", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/H7tJ0cc/c.png", 730, "D"),
            new charInfo("Iansan", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/v3Cb9nF/KjqI0HC.png", 731, "D"),
            new charInfo("Timmie", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/qRN343j/T.png", 732, "D"),
            new charInfo("Albedo (GI)", ["Kreideprinz"], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/PC1m5F3/a.png", 733, "SS"),
            new charInfo("Yae Miko", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/PMjb0Gd/y.png", 734, "B"),
            new charInfo("Yoimiya", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/hCJFphF/y.png", 735, "B"),
            new charInfo("Thoma", [], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/0CzJx51/t.png", 736, "C"),
            new charInfo("Sangonomiya Kokomi", ["Kokomi Sangonomiya"], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/wKXQ1N4/k.png", 737, "C"),
            new charInfo("Kujou Sara", ["Sara Kujou"], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/rcZM8Z3/sa.png", 738, "B"),
            new charInfo("Kazari", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/L1C53Jt/k.png", 739, "D"),
            new charInfo("Shiro", ["Queen of Imanity"], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/KK8NPXq/n.png", 740, "SS"),
            new charInfo("Stephanie Dola", [], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/yPRJCfm/96o05YH.png", 741, "A"),
            new charInfo("Sora", ["King of Imanity"], "No Game No Life", ["NGNL", "No Game, No Life"], "M", "https://i.ibb.co/bHWT9rv/yNEKsMP.png", 742, "S"),
            new charInfo("Ino Hatsuse", [], "No Game No Life", ["NGNL", "No Game, No Life"], "M", "https://i.ibb.co/HFdHH6J/RZFftyv.png", 743, "D"),
            new charInfo("Izuna Hatsuse", [], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/qmrgdjh/54yTAQd.png", 744, "C"),
            new charInfo("Jibril", [], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/27qf7Tv/hMoclAp.png", 745, "S"),
            new charInfo("Fiel Nirvalen", ["Feel Nirvalen"], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/Lr25fLz/xlkiYhI.png", 746, "C"),
            new charInfo("Tet", [], "No Game No Life", ["NGNL", "No Game, No Life"], "M", "https://i.ibb.co/kmn9sZH/9dgYib3.png", 747, "C"),
            new charInfo("Zell Chlammy", ["Zell Kurami"], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/34fjSp6/bTjmzOg.png", 748, "B"),
            new charInfo("Miko (NGNL)", [], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/7CzGRf2/O3fBz1p.png", 749, "D"),
            new charInfo("Dol Couronne", [], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/r0q7FqZ/cO0fGbW.png", 750, "C"),
            new charInfo("Azriel", [], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/vdhRPnd/LLh6isH.png", 751, "D"),
            new charInfo("Think Nirvalen", ["Shinku Nilvalen"], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/dc1GdsY/890QS6a.png", 752, "D"),
            new charInfo("Schwi Dola", ["Shuvi"], "No Game No Life", ["NGNL", "No Game, No Life"], "F", "https://i.ibb.co/fq9qctB/S.png", 753, "A"),
            new charInfo("Riku Dola", [], "No Game No Life", ["NGNL", "No Game, No Life"], "M", "https://i.ibb.co/0cCGNLb/ORgnPc1.png", 754, "B"),
            new charInfo("Diphda Alisha", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "F", "https://i.ibb.co/k4x4h4H/JrS9t6a.png", 755, "A"),
            new charInfo("Edna", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "F", "https://i.ibb.co/fSXvS6B/Fi6HjxI.png", 756, "B"),
            new charInfo("Lailah", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "F", "https://i.ibb.co/306dqzt/8V8Dnrw.png", 757, "B"),
            new charInfo("Mikleo", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "M", "https://i.ibb.co/g9KyrNr/ixc2Vfg.png", 758, "B"),
            new charInfo("Sorey", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "M", "https://i.ibb.co/gz6YYXY/OxZNGQ3.png", 759, "A"),
            new charInfo("Crowe Velvet", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "F", "https://i.ibb.co/0yZ0DSh/310345.webp", 760, "C"),
            new charInfo("Dezel", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "M", "https://i.ibb.co/1KpS9rs/gwukUUI.png", 761, "C"),
            new charInfo("Lunarre", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "M", "https://i.ibb.co/9bgKQ5B/dkjNqy4.png", 762, "D"),
            new charInfo("Maltran", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "F", "https://i.ibb.co/G2P2hgz/lAEPwxb.png", 763, "D"),
            new charInfo("Rose", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "F", "https://i.ibb.co/0tNLLj2/Z65FF3X.png", 764, "C"),
            new charInfo("Symonne", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "F", "https://i.ibb.co/Y7zB7PV/whynxYK.png", 765, "D"),
            new charInfo("Zaveid", [], "Tales of Zestiria the X", ["Tales of Zestiria", "Tales of Zestiria the Cross", "ToZ"], "M", "https://i.ibb.co/JBVc0gp/MBXJ4xa.png", 766, "D"),
            new charInfo("Megumin", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/gPMfRNJ/M.png", 767, "SS"),
            new charInfo("Aqua", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/W6d0Qzf/jncpWAH.png", 768, "S"),
            new charInfo("Darkness", ["Dustiness Ford Lalatina"], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/2Kg98NL/eDEiVIJ.png", 769, "S"),
            new charInfo("Kazuma Satou", ["Satou Kazuma"], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/Sm4tMQw/UnutIVO.png", 770, "S"),
            new charInfo("Chris", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/XShp1kv/k5dPbGD.png", 771, "B"),
            new charInfo("Eris", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/XpvcFYy/m1UhK8o.png", 772, "A"),
            new charInfo("Wiz", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/CzktsZ6/KrmcwUa.png", 773, "S"),
            new charInfo("Yunyun", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/x3rswtZ/F1M9RMh.png", 774, "A"),
            new charInfo("Chomusuke", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/xjx9qYd/6hABPBz.png", 775, "C"),
            new charInfo("Vanir", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/LzLHCTz/jutVeBf.png", 776, "B"),
            new charInfo("Komekko", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/Xxr5C04/xKsmdpe.png", 777, "C"),
            new charInfo("Luna (KS)", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/Qmfz5m4/FSzmkMl.png", 778, "B"),
            new charInfo("Nerimaki", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/sVhrvr5/yUgL1kC.png", 779, "C"),
            new charInfo("Arue", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/XkFDd8n/JQ6r3JC.png", 780, "C"),
            new charInfo("Cecily", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/gyZjxMw/nZezEAQ.png", 781, "C"),
            new charInfo("Belzerg Stylish Sword Iris", ["Iris (KS)"], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/JyFkMYB/3iF88Td.png", 782, "B"),
            new charInfo("Sena", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/VMZXLH3/zFNWNa1.png", 783, "C"),
            new charInfo("Arnes", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/k16HXG1/laT6BEG.png", 784, "C"),
            new charInfo("Funifura", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/5x0NB4n/fBHUJVT.png", 785, "C"),
            new charInfo("Dodonko", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/W5FM0XY/hBnk9ot.png", 786, "D"),
            new charInfo("Sylphina Dustiness Ford", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/JthMh1C/aMmlB4z.png", 787, "D"),
            new charInfo("Tenshi", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/ZKWDbr4/gCB67d7.png", 788, "C"),
            new charInfo("Wolbach", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/54sHZhH/A8d7Sf2.png", 789, "D"),
            new charInfo("Lean", ["Riin"], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/nfbPnsr/3v261BY.png", 790, "C"),
            new charInfo("Seresdina", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/J3pCLpN/YbWkk84.png", 791, "D"),
            new charInfo("Yuiyui", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/K6L36t8/XcCDDCt.png", 792, "D"),
            new charInfo("Rain (KS)", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/qCSVP7J/72nMod4.png", 793, "D"),
            new charInfo("Dust (KS)", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/Pgw2NwR/11KnKlc.png", 794, "D"),
            new charInfo("Fio (KS)", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/yXfPYYJ/EB2PpSv.png", 795, "D"),
            new charInfo("Shinfornea Claire", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/zXhcKXr/HhhJBaF.png", 796, "D"),
            new charInfo("Kyouya Mitsurugi", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/h1jMJ1M/Ng7WHNk.png", 797, "D"),
            new charInfo("Beldia", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/PzXNKsd/G8f5wRY.png", 798, "D"),
            new charInfo("Deadscream Bloody Mary", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/bFZPMVQ/4TIHchm.png", 799, "D"),
            new charInfo("Arakuremono", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/YpLmCXf/Iq8wwPD.png", 800, "C"),
            new charInfo("Hans (KS)", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/rFsbFKX/6dI9JqB.png", 801, "D"),
            new charInfo("Hyoizaburo", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/3hGFDsf/3pNY1tq.png", 802, "D"),
            new charInfo("Cedre", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/HzQmv9h/image.png", 803, "D"),
            new charInfo("Clemea", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "F", "https://i.ibb.co/xz0b2Z2/image.png", 804, "D"),
            new charInfo("Heinz", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/LvR3Wkr/image.png", 805, "D"),
            new charInfo("Keith", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/B20pB5Y/image.png", 806, "D"),
            new charInfo("Taylor", [], "KonoSuba", ["God's Blessings on this Wonderful World", "Kono Subarashii Sekai ni Shukufuku wo!"], "M", "https://i.ibb.co/QX8HKFZ/image.png", 807, "D"),
            new charInfo("Kiyoshi Fujino", [], "Prison School", ["Kangoku Gakuen"], "M", "https://i.ibb.co/hDVc3TT/ZcuRcVL.png", 808, "B"),
            new charInfo("Meiko Shiraki", [], "Prison School", ["Kangoku Gakuen"], "F", "https://i.ibb.co/SNLfrzV/289071.webp", 809, "C"),
            new charInfo("Takehito Morokuzu", ["Gakuto"], "Prison School", ["Kangoku Gakuen"], "M", "https://i.ibb.co/NLhksRF/sTKaf5Y.png", 810, "D"),
            new charInfo("Jouji Nezu", [], "Prison School", ["Kangoku Gakuen"], "M", "https://i.ibb.co/Z8wGGGs/image.png", 811, "C"),
            new charInfo("Reiji Andou", ["Andrei"], "Prison School", ["Kangoku Gakuen"], "M", "https://i.ibb.co/gzwSVQn/image.png", 812, "C"),
            new charInfo("Shingo Wakamoto", [], "Prison School", ["Kangoku Gakuen"], "M", "https://i.ibb.co/znYTsNJ/image.png", 813, "B"),
            new charInfo("Hana Midorikawa", [], "Prison School", ["Kangoku Gakuen"], "F", "https://i.ibb.co/FhJFRzL/image.png", 814, "C"),
            new charInfo("Kurihara", [], "Prison School", ["Kangoku Gakuen"], "M", "https://i.ibb.co/YBQSC4d/image.png", 815, "D"),
            new charInfo("Mari Kurihara", [], "Prison School", ["Kangoku Gakuen"], "F", "https://i.ibb.co/yXSBv4C/image.png", 816, "C"),
            new charInfo("Risa Bettou", [], "Prison School", ["Kangoku Gakuen"], "F", "https://i.ibb.co/1289VQz/image.png", 817, "D"),
            new charInfo("Chiyo Kurihara", [], "Prison School", ["Kangoku Gakuen"], "F", "https://i.ibb.co/w4c19Xk/image.png", 818, "B"),
            new charInfo("Kate Takenomiya", [], "Prison School", ["Kangoku Gakuen"], "F", "https://i.ibb.co/hY3jQPy/oyr4B5x.png", 819, "D"),
            new charInfo("Mayumi Tanaka", [], "Prison School", ["Kangoku Gakuen"], "F", "https://i.ibb.co/9HvKcSQ/image.png", 820, "D"),
            new charInfo("Anzu Yokoyama", [], "Prison School", ["Kangoku Gakuen"], "F", "https://i.ibb.co/kQFF3pH/image.png", 821, "D"),
            new charInfo("Mitsuko Yokoyama", ["Rube Goldberg of Klutzes"], "Prison School", ["Kangoku Gakuen"], "F", "https://i.ibb.co/QDfryvj/image.png", 822, "D"),
            new charInfo("Kintarou Ooe", ["Golden Boy", "Ooe Kintarou"], "Golden Boy", [], "M", "https://i.ibb.co/VjbqPY1/image.png", 823, "A"),
            new charInfo("Madame President", [], "Golden Boy", [], "F", "https://i.ibb.co/cDQ1njb/image.png", 824, "B"),
            new charInfo("Reiko Terayama", [], "Golden Boy", [], "F", "https://i.ibb.co/tJ7Fxf9/image.png", 825, "B"),
            new charInfo("Ayuko Hayami", [], "Golden Boy", [], "F", "https://i.ibb.co/T80s1sv/image.png", 826, "C"),
            new charInfo("Naoko Katsuda", [], "Golden Boy", [], "F", "https://i.ibb.co/s2HfyZp/image.png", 827, "C"),
            new charInfo("Chie", [], "Golden Boy", [], "F", "https://i.ibb.co/JF7rhGR/image.png", 828, "C"),
            new charInfo("Noriko Katsuda", [], "Golden Boy", [], "F", "https://i.ibb.co/C0p4kqK/image.png", 829, "D"),
            new charInfo("Yuka Kanzaki", [], "Golden Boy", [], "F", "https://i.ibb.co/6H0QpbP/ZcuRcVL.png", 830, "C"),
            new charInfo("Juzo Katsuda", [], "Golden Boy", [], "M", "https://i.ibb.co/CKSr3CT/image.png", 831, "D"),
            new charInfo("Hiroshi Kogure", [], "Golden Boy", [], "M", "https://i.ibb.co/HDXmZR7/image.png", 832, "D"),
            new charInfo("Sagata", [], "Golden Boy", [], "M", "https://i.ibb.co/fMhJ2T5/image.png", 833, "D"),
            new charInfo("Wakamoto", [], "Golden Boy", [], "M", "https://i.ibb.co/QDGjppb/image.png", 834, "D"),
            new charInfo("Nagatoro Hayase", ["Hayacchi", "Hayase Nagatoro", "Nagatoro"], "Ijiranaide, Nagatoro-san", ["Nagatoro", "Don't Toy with Me, Miss Nagatoro", "Please don't bully me, Nagatoro", "Ijiranaide Nagatoro-san"], "F", "https://i.ibb.co/phPHXNr/se1vUIh.png", 835, "S"),
            new charInfo("Naoto Hachiouji", ["Paisen"], "Ijiranaide, Nagatoro-san", ["Nagatoro", "Don't Toy with Me, Miss Nagatoro", "Please don't bully me, Nagatoro", "Ijiranaide Nagatoro-san"], "M", "https://i.ibb.co/SxMdP4v/image.png", 836, "A"),
            new charInfo("Maki Gamou", [], "Ijiranaide, Nagatoro-san", ["Nagatoro", "Don't Toy with Me, Miss Nagatoro", "Please don't bully me, Nagatoro", "Ijiranaide Nagatoro-san"], "F", "https://i.ibb.co/fGfpbRm/cTzfz0S.png", 837, "B"),
            new charInfo("Yoshi", [], "Ijiranaide, Nagatoro-san", ["Nagatoro", "Don't Toy with Me, Miss Nagatoro", "Please don't bully me, Nagatoro", "Ijiranaide Nagatoro-san"], "F", "https://i.ibb.co/vQKGtdb/iwUlzv5.png", 838, "B"),
            new charInfo("Sakura (IN)", [], "Ijiranaide, Nagatoro-san", ["Nagatoro", "Don't Toy with Me, Miss Nagatoro", "Please don't bully me, Nagatoro", "Ijiranaide Nagatoro-san"], "F", "https://i.ibb.co/YXK3fSB/34yTZU7.png", 839, "C"),
            new charInfo("Sana Sunomiya", [], "Ijiranaide, Nagatoro-san", ["Nagatoro", "Don't Toy with Me, Miss Nagatoro", "Please don't bully me, Nagatoro", "Ijiranaide Nagatoro-san"], "F", "https://i.ibb.co/Z8rYfw2/5smlDz0.png", 840, "B"),
            new charInfo("Ane Toro", [], "Ijiranaide, Nagatoro-san", ["Nagatoro", "Don't Toy with Me, Miss Nagatoro", "Please don't bully me, Nagatoro", "Ijiranaide Nagatoro-san"], "F", "https://i.ibb.co/pddpzBD/2mbbGyK.png", 841, "D"),
            new charInfo("Miyagi", [], "I sold my life for ten thousand yen per year", ["I sold my life", "Three Days of Happiness", "Mikkakan no Koufuku", "Jumyou wo Kaitotte Moratta. Ichinen ni Tsuki, Ichimanen de."], "F", "https://i.ibb.co/L0tfDjb/bhkPbVb.png", 842, "A"),
            new charInfo("Kusunoki", [], "I sold my life for ten thousand yen per year", ["I sold my life", "Three Days of Happiness", "Mikkakan no Koufuku", "Jumyou wo Kaitotte Moratta. Ichinen ni Tsuki, Ichimanen de."], "M", "https://i.ibb.co/Vq8tjBt/KokqgL0.png", 843, "B"),
            new charInfo("Thorfinn", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/PtMxS2C/Xwc3m9Y.png", 844, "S"),
            new charInfo("Askeladd", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/5Ky2cmj/bcP8Xjq.png", 845, "A"),
            new charInfo("Canute", ["Cnut the Great"], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/9GLGDnC/L2wI0NP.png", 846, "B"),
            new charInfo("Asgeir", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/Q8XWHzm/image.png", 847, "D"),
            new charInfo("Atli", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/THcyjpf/image.png", 848, "D"),
            new charInfo("Björn", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/RbC6Ky7/image.png", 849, "B"),
            new charInfo("Erikson Leif", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/R4tdQmz/yRIFJgn.png", 850, "D"),
            new charInfo("Floki", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/Mk2khRj/image.png", 851, "C"),
            new charInfo("Forkbeard Sweyn", ["Sweyn Forkbeard"], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/JpKrfj6/image.png", 852, "D"),
            new charInfo("Helga", [], "Vinland Saga", ["Vinland", "VS"], "F", "https://i.ibb.co/MkfMQmt/0j4Cwiv.png", 853, "D"),
            new charInfo("Ragnar", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/qnrv0br/gg2dAzD.png", 854, "C"), 
            new charInfo("Thorkell", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/J2sG95W/Uj6BqSZ.png", 855, "B"),
            new charInfo("Thors", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/HqbgH5J/u1lHBGR.png", 856, "A"),
            new charInfo("Ylva", [], "Vinland Saga", ["Vinland", "VS"], "F", "https://i.ibb.co/85YMJ4b/Dl3Lgnk.png", 857, "C"),
            new charInfo("Einar", [], "Vinland Saga", ["Vinland", "VS"], "M", "https://i.ibb.co/n7WXB25/5wncqUc.png", 858, "C"),
            new charInfo("Hild", [], "Vinland Saga", ["Vinland", "VS"], "F", "https://i.ibb.co/vccjRTd/wAvQTBr.png", 859, "D"),
            new charInfo("Gudrid", [], "Vinland Saga", ["Vinland", "VS"], "F", "https://i.ibb.co/b23SDx4/JCvTSA5.png", 860, "D"),
            new charInfo("Zero Two", ["002", "02"], "Darling in the FranXX", ["DarliFra", "DitF"], "F", "https://i.ibb.co/Bg9bRS3/6kWGaYD.png", 861, "SS"),
            new charInfo("Futoshi", [], "Darling in the FranXX", ["DarliFra", "DitF"], "M", "https://i.ibb.co/CKQZGT5/wrjvgAR.png", 862, "C"),
            new charInfo("Gurou", ["Goro"], "Darling in the FranXX", ["DarliFra", "DitF"], "M", "https://i.ibb.co/CBjyXQG/2SBGk8X.png", 863, "B"),
            new charInfo("Hiro", ["016"], "Darling in the FranXX", ["DarliFra", "DitF"], "M", "https://i.ibb.co/bJMLs2b/ehz6lGf.png", 864, "A"), 
            new charInfo("Ichigo", ["015"], "Darling in the FranXX", ["DarliFra", "DitF"], "F", "https://i.ibb.co/1MpWT4J/zD6rRXu.png", 865, "S"),
            new charInfo("Ikuno", [], "Darling in the FranXX", ["DarliFra", "DitF"], "F", "https://i.ibb.co/16WWkB8/P0zh2ja.png", 866, "B"),
            new charInfo("Kokoro", [], "Darling in the FranXX", ["DarliFra", "DitF"], "F", "https://i.ibb.co/WcksNvJ/z4QqmTM.png", 867, "A"),
            new charInfo("Miku (DitF)", [], "Darling in the FranXX", ["DarliFra", "DitF"], "F", "https://i.ibb.co/2dxFDb9/RzOvwRK.png", 868, "B"),
            new charInfo("Mitsuru", [], "Darling in the FranXX", ["DarliFra", "DitF"], "M", "https://i.ibb.co/WHyNwTP/UGtOGbs.png", 869, "C"),
            new charInfo("Zorome", [], "Darling in the FranXX", ["DarliFra", "DitF"], "M", "https://i.ibb.co/GdGzKkK/86KTpjC.png", 870, "C"),
            new charInfo("Dr. Franxx", ["Werner Frank"], "Darling in the FranXX", ["DarliFra", "DitF"], "M", "https://i.ibb.co/WkNfMKZ/tkT84HT.png", 871, "D"),
            new charInfo("Hachi", [], "Darling in the FranXX", ["DarliFra", "DitF"], "M", "https://i.ibb.co/w4y1Fzd/GMQxE6v.png", 872, "D"),
            new charInfo("Princess of Klaxosaurs", ["001", "01", "Kyouryuu no Hime", "Klaxosaurs"], "Darling in the FranXX", ["DarliFra", "DitF"], "F", "https://i.ibb.co/CbjhLVK/gET9FED.png", 873, "B"),
            new charInfo("Nana (DitF)", [], "Darling in the FranXX", ["DarliFra", "DitF"], "F", "https://i.ibb.co/MgnLVYN/WfxuE6A.png", 874, "C"),
            new charInfo("Naomi", [], "Darling in the FranXX", ["DarliFra", "DitF"], "F", "https://i.ibb.co/NZJP3Dz/rntwX9w.png", 875, "D"),
            new charInfo("Nine Alpha", ["9'α", "9α", "9'a", "9a"], "Darling in the FranXX", ["DarliFra", "DitF"], "M", "https://i.ibb.co/5RShZDs/rLSlJHY.png", 876, "D"),
            new charInfo("Mai Sakurajima", ["Sakurajima Mai", "Bunny Girl Senpai"], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/vDsX6gM/BlkYYIG.png", 877, "SS"),
            new charInfo("Sakuta Azusagawa", ["Azusagawa Sakuta"], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "M", "https://i.ibb.co/2k2H7dP/ZAMaWER.png", 878, "S"),
            new charInfo("Futaba Rio", ["Rio Futaba"], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/jTr0QYW/EM3NM8X.png", 879, "A"),
            new charInfo("Kaede Azusagawa", ["Azusagawa Kaede"], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/hCN2cdr/RUEyCUd.png", 880, "A"),
            new charInfo("Tomoe Koga", ["Koga Tomoe"], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/W3rk3RG/Qo6YbdE.png", 881, "B"),
            new charInfo("Shouko Makinohara", ["Makinohara Shouko"], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/C93bw4m/i7mFZ4j.png", 882, "B"),
            new charInfo("Nodoka Toyohama", [], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/N7vYYYZ/hl35PjG.png", 883, "B"),
            new charInfo("Yuuma Kunimi", [], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "M", "https://i.ibb.co/XxP6Zpp/s63nxte.png", 884, "C"),
            new charInfo("Saki Kamisato", [], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/Fbs07BH/image.png", 885, "D"),
            new charInfo("Ryouko Hanawa", [], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/4FF50ny/image.png", 886, "D"),
            new charInfo("Uzuki Hirokawa", [], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/MRCLG5m/1qNO0t5.png", 887, "C"),
            new charInfo("Kotomi Kano", ["Kano Kotomi"], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/TKQrMLD/image.png", 888, "D"),
            new charInfo("Rena Kashiba", [], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/BN7jcx2/image.png", 889, "C"),
            new charInfo("Yousuke Maesawa", [], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "M", "https://i.ibb.co/frwqRg9/image.png", 890, "D"),
            new charInfo("Fumika Nanjou", [], "Bunny Girl Senpai", ["Bunny Girl", "Rascal Does Not Dream of Bunny Girl Senpai", "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai"], "F", "https://i.ibb.co/ZVdYNS8/image.png", 891, "D"),
            new charInfo("Morgiana", ["Morg"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/x3kmLPj/7QNG1O6.png", 892, "S"),
            new charInfo("Aladdin", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/9nf59RK/blWWY11.png", 893, "S"),
            new charInfo("Alibaba Saluja", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/ZNj56rh/DuU9jk7.png", 894, "S"),
            new charInfo("Fatima", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/FV0YTkZ/186745.jpg", 895, "D"),
            new charInfo("Ja'far", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/89Ymc8n/izu0u1g.png", 896, "A"),
            new charInfo("Pisti", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/VN4dqq3/zAPlgEd.png", 897, "C"),
            new charInfo("Ka Koubun", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/Wntx3rZ/image.png", 898, "D"),
            new charInfo("Leila", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/TRvPb58/kkMIXF1.png", 899, "D"),
            new charInfo("Judar", ["Black Magi"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/gjfN7Qk/mJ8HEoa.png", 900, "A"),
            new charInfo("Masrur", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/rw4s5Hy/image.png", 901, "B"),
            new charInfo("Dunya Musta'sim", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/CvFw2Wp/BBg7Pb3.png", 902, "C"),
            new charInfo("Kouen Ren", ["Entei the Fire Lord"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/d0Dywhn/nEzI5cl.png", 903, "B"),
            new charInfo("Hakuei Ren", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/PTfFG1V/NoGkOdI.png", 904, "B"),
            new charInfo("Hakuryuu Ren", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/7R1knWS/YQqLxgm.png", 905, "A"),
            new charInfo("Kougyoku Ren", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/MMVwy72/G2Toe5r.png", 906, "B"),
            new charInfo("Gyouken Ren", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/chjMrVC/Teyt3oS.png", 907, "C"),
            new charInfo("Kouha Ren", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/kxyQ4Tb/gynD828.png", 908, "C"),
            new charInfo("Sahsa", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/sQQ0c5y/hj4AlmI.png", 909, "D"),
            new charInfo("Sinbad", ["High King of the Seven Seas"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/vVtfv0z/image.png", 910, "S"),
            new charInfo("Spartos", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/cF2QSmj/kh4rKqF.png", 911, "D"),
            new charInfo("Titus Alexius", ["Sir Scheherazade"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/fNQdQcq/l0Zxb3v.png", 912, "B"),
            new charInfo("Muu Alexius", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/D43ShWP/RgCHVW6.png", 913, "C"),
            new charInfo("Marga", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/ygHmCFX/JK1N5Vc.png", 914, "C"),
            new charInfo("Myers", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/hcqdg8w/y7y9TyV.png", 915, "D"),
            new charInfo("Yunan", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/JKLxHjP/Io9PmTX.png", 916, "B"),
            new charInfo("Yamraiha", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/xh2LswV/UKT4mfZ.png", 917, "B"),
            new charInfo("Satoru Gojou", ["Gojou Satoru", "Satoru Gojo", "Gojo Satoru"], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/dB6MnXB/G.png", 918, "SS"),
            new charInfo("Yuuji Itadori", ["Itadori Yuuji"], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/PGZQL2Y/YU1JTSU.png", 919, "S"),
            new charInfo("Nobara Kugisaki", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/WxscBdJ/n.png", 920, "S"),
            new charInfo("Megumi Fushiguro", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/109JDBj/M.png", 921, "A"),
            new charInfo("Sukuna Ryoumen", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/Drby0J6/image.png", 922, "B"),
            new charInfo("Toge Inumaki", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/JQPCH7P/image.png", 923, "B"),
            new charInfo("Kento Nanami", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/z4c4RJ5/image.png", 924, "C"),
            new charInfo("Maki Zenin", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/7R8mBZk/image.png", 925, "B"),
            new charInfo("Aoi Toudou", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/sFc51Rk/image.png", 926, "B"),
            new charInfo("Panda (JJK)", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/zb2MMqX/image.png", 927, "C"),
            new charInfo("Chousou", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/NSZ8BhG/image.png", 928, "D"),
            new charInfo("Esou", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/n8McS6g/image.png", 929, "D"),
            new charInfo("Tsumiki Fushiguro", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/wsVXPh9/image.png", 930, "C"),
            new charInfo("Yoshinobu Gakuganji", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/pZJywrr/image.png", 931, "D"),
            new charInfo("Suguru Getou", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/wL0nMTQ/image.png", 932, "B"),
            new charInfo("Shouko Ieiri", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/z6CpTY2/image.png", 933, "D"),
            new charInfo("Iguchi", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/2j9hsd8/image.png", 934, "D"),
            new charInfo("Takuma Ino", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/s21wxCX/image.png", 935, "D"),
            new charInfo("Utahime Iori", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/C1Tm1ZX/image.png", 936, "C"),
            new charInfo("Shouta Itou", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/RNqDtXR/image.png", 937, "D"),
            new charInfo("Noritoshi Kamo", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/t8YC01P/image.png", 938, "B"),
            new charInfo("Juuzou Kumiya", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/Bs9qz5L/image.png", 939, "D"),
            new charInfo("Mahito", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/jy86QS8/image.png", 940, "C"),
            new charInfo("Mei Mei", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/FWdbdMX/image.png", 941, "C"),
            new charInfo("Kasumi Miwa", ["Miwa Kasumi"], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/z8YffCW/image.png", 942, "A"),
            new charInfo("Mechamaru", ["Koukichi Muta"], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/RSsTyq7/image.png", 943, "D"),
            new charInfo("Momo Nishimiya", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/Ch03Ft3/image.png", 944, "B"),
            new charInfo("Akari Nitta", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/6y7y8dN/image.png", 945, "C"),
            new charInfo("Sasaki (JJK)", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/xzyGKLz/image.png", 946, "D"),
            new charInfo("Haruta Shigemo", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/GvKyqjX/image.png", 947, "D"),
            new charInfo("Takagi", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/m9fgrT1/image.png", 948, "D"),
            new charInfo("Yuki Tsukumo", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/16d2RT4/image.png", 949, "C"),
            new charInfo("Masamichi Yaga", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/KNmwYGg/image.png", 950, "C"),
            new charInfo("Uraume", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/tKZxHNd/image.png", 951, "D"),
            new charInfo("Nagi Yoshino", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/PGRkT2n/n.png", 952, "D"),
            new charInfo("Junpei Yoshino", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/C7JwNxn/image.png", 953, "B"),
            new charInfo("Naobito Zenin", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "M", "https://i.ibb.co/nn0bKcm/image.png", 954, "D"),
            new charInfo("Mai Zenin", [], "Jujutsu Kaisen", ["JJK", "Sorcery Fight"], "F", "https://i.ibb.co/stBHzmD/image.png", 955, "C"),
            new charInfo("Uramichi Omota", [], "Uramichi Oniisan", ["Life Lessons with Uramichi-Oniisan"], "M", "https://i.ibb.co/X350qKM/zeYNpF5.png", 956, "B"),
            new charInfo("Utano Tadano", [], "Uramichi Oniisan", ["Life Lessons with Uramichi-Oniisan"], "F", "https://i.ibb.co/kqkrr6y/boxxZjU.png", 957, "B"),
            new charInfo("Iketeru Daga", ["Daga Iketeru"], "Uramichi Oniisan", ["Life Lessons with Uramichi-Oniisan"], "M", "https://i.ibb.co/GtmDs39/image.png", 958, "B"),
            new charInfo("Tobikichi Usahara", [], "Uramichi Oniisan", ["Life Lessons with Uramichi-Oniisan"], "M", "https://i.ibb.co/qBGKmj3/s.png", 959, "C"),
            new charInfo("Mitsuo Kumatani", [], "Uramichi Oniisan", ["Life Lessons with Uramichi-Oniisan"], "M", "https://i.ibb.co/y8M7DVp/m.png", 960, "C"),
            new charInfo("Hanbee Kikaku", [], "Uramichi Oniisan", ["Life Lessons with Uramichi-Oniisan"], "M", "https://i.ibb.co/w4wjZNw/image.png", 961, "D"),
            new charInfo("Furitsuke Capellini", [], "Uramichi Oniisan", ["Life Lessons with Uramichi-Oniisan"], "M", "https://i.ibb.co/71LNMTy/image.png", 962, "D"),
            new charInfo("Matahiko Nekota", [], "Uramichi Oniisan", ["Life Lessons with Uramichi-Oniisan"], "M", "https://i.ibb.co/rs5B5Fx/image.png", 963, "D"),
            new charInfo("Saito Uebu", [], "Uramichi Oniisan", ["Life Lessons with Uramichi-Oniisan"], "M", "https://i.ibb.co/RjRwtqy/image.png", 964, "D"),
            new charInfo("Chisa Kotegawa", [], "Grand Blue", ["Grand Blue Dreaming"], "F", "https://i.ibb.co/59MPv1w/image.png", 965, "S"),
            new charInfo("Nanaka Kotegawa", [], "Grand Blue", ["Grand Blue Dreaming"], "F", "https://i.ibb.co/zmwn9cK/image.png", 966, "A"),
            new charInfo("Kouhei Imamura", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/rfkGBLz/image.png", 967, "B"),
            new charInfo("Iori Kitahara", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/vXHGDpP/nrp97v9.png", 968, "A"),
            new charInfo("Azusa Hamaoka", [], "Grand Blue", ["Grand Blue Dreaming"], "F", "https://i.ibb.co/FHYfLYh/3ptIGVk.png", 969, "A"),
            new charInfo("Aina Yoshiwara", ["Cakey"], "Grand Blue", ["Grand Blue Dreaming"], "F", "https://i.ibb.co/cTWLhMb/uHycIBw.png", 970, "B"),
            new charInfo("Tokita Shinji", ["Tokki", "Shinji Tokita"], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/0GfcQFN/5R2P2Yy.png", 971, "B"),
            new charInfo("Kotobuki Ryuujirou", ["Bukki", "Ryuujirou Kotobuki"], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/r398Nd4/4as8kYJ.png", 972, "B"),
            new charInfo("Rie Oohashi", [], "Grand Blue", ["Grand Blue Dreaming"], "F", "https://i.ibb.co/wK2Q3wz/image.png", 973, "C"),
            new charInfo("Yuu Mitarai", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/Rb7NgTH/image.png", 974, "D"),
            new charInfo("Anzai", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/DDfBz63/image.png", 975, "D"),
            new charInfo("Azuma", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/GPGLqmm/image.png", 976, "D"),
            new charInfo("Kenta Fujiwara", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/Jt1fXpQ/image.png", 977, "D"),
            new charInfo("Kanako Iida", [], "Grand Blue", ["Grand Blue Dreaming"], "F", "https://i.ibb.co/tbxNW1B/i.png", 978, "C"),
            new charInfo("Kiyoko Kamio", [], "Grand Blue", ["Grand Blue Dreaming"], "F", "https://i.ibb.co/VD6VSsz/l.png", 979, "C"),
            new charInfo("Toshio Kotegawa", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/g6kjKY5/image.png", 980, "D"),
            new charInfo("Kudou", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/fSWDHcD/image.png", 981, "D"),
            new charInfo("Mizuki Kaya", ["Kaya Mizuki"], "Grand Blue", ["Grand Blue Dreaming"], "F", "https://i.ibb.co/R4qtGLS/1.png", 982, "C"),
            new charInfo("Hajime Nojima", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/BwcHsFG/image.png", 983, "C"),
            new charInfo("Keiko Suzuki", [], "Grand Blue", ["Grand Blue Dreaming"], "F", "https://i.ibb.co/XDFBYZm/a.png", 984, "C"),
            new charInfo("Shinichirou Yamamoto", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/s3V28Ry/image.png", 985, "D"),
            new charInfo("Yokote", [], "Grand Blue", ["Grand Blue Dreaming"], "M", "https://i.ibb.co/fpbP8p2/image.png", 986, "D"),
            new charInfo("Abdullah (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/HTD56pD/image.png", 987, "D"),
            new charInfo("A.O", [], "One Piece", ["OP"], "M", "https://i.ibb.co/1dGC3kS/image.png", 988, "D"),
            new charInfo("Absalom", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7WTj6bq/image.png", 989, "C"),
            new charInfo("Acilia", [], "One Piece", ["OP"], "F", "https://i.ibb.co/cbXd3h6/image.png", 990, "D"),
            new charInfo("Agotogi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/pJJXKr5/image.png", 991, "D"),
            new charInfo("Aisa (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/B2W4YdS/image.png", 992, "D"),
            new charInfo("Akumai", [], "One Piece", ["OP"], "M", "https://i.ibb.co/CMzRbX6/image.png", 993, "D"),
            new charInfo("Aladdin (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/VjVwLKH/image.png", 994, "D"),
            new charInfo("Albion", ["Gashed Albion"], "One Piece", ["OP"], "M", "https://i.ibb.co/gRfNXQ9/image.png", 995, "D"),
            new charInfo("Brook", ["Soul King"], "One Piece", ["OP"], "M", "https://i.ibb.co/S3C7J57/pVIBqiJ.png", 996, "A"),
            new charInfo("Franky", ["Cyborg Franky"], "One Piece", ["OP"], "M", "https://i.ibb.co/ftbQdF7/tIDNkl1.png", 997, "A"),
            new charInfo("Chopper", ["Tony Tony Chopper", "Chopper Tony Tony"], "One Piece", ["OP"], "M", "https://i.ibb.co/6X9P8b3/goqMHeA.png", 998, "A"),
            new charInfo("Nami", ["Cat Burglar"], "One Piece", ["OP"], "F", "https://i.ibb.co/B6nfhdP/n.png", 999, "SS"),
            new charInfo("Monkey D. Luffy", ["Luffy", "Ruffy", "Mugiwara", "Mugiwara no Luffy", "Strawhat", "Straw Hat", "Luffytaro", "The Fifth Emperor", "Fifth Emperor"], "One Piece", ["OP"], "M", "https://i.ibb.co/y6LTkYZ/L.png", 1000, "SS"),
            new charInfo("Roronoa Zoro", ["Zoro", "Zoro Roronoa", "Lorenor Zorro"], "One Piece", ["OP"], "M", "https://i.ibb.co/S6nXn4H/TuDlHDr.png", 1001, "SS"),
            new charInfo("Nico Robin", ["Robin"], "One Piece", ["OP"], "F", "https://i.ibb.co/kqjcRzb/GwCXkZn.png", 1002, "S"),
            new charInfo("Sanji", ["Vinsmoke Sanji", "Black Leg"], "One Piece", ["OP"], "M", "https://i.ibb.co/w7ySWDP/s.png", 1003, "S"),
            new charInfo("Jinbe", ["Knight of the Sea"], "One Piece", ["OP"], "M", "https://i.ibb.co/JFQkjRS/Go5xriR.png", 1004, "A"),
            new charInfo("Usopp", ["God Usopp", "Sogeking", "Lysop"], "One Piece", ["OP"], "M", "https://i.ibb.co/BLz6DNW/u.png", 1005, "S"),
            new charInfo("Ally (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/WsgD1qr/image.png", 1006, "D"),
            new charInfo("Alpaca-Man", [], "One Piece", ["OP"], "M", "https://i.ibb.co/v4RyZTd/image.png", 1007, "D"),
            new charInfo("Alvida", ["Lady Alvida"], "One Piece", ["OP"], "F", "https://i.ibb.co/741FWkf/A.png", 1008, "C"),
            new charInfo("Amadob", [], "One Piece", ["OP"], "M", "https://i.ibb.co/jfbnYtr/image.png", 1009, "D"),
            new charInfo("Jean Ango", [], "One Piece", ["OP"], "M", "https://i.ibb.co/t3ww4wp/image.png", 1010, "D"),
            new charInfo("Aphelandra", [], "One Piece", ["OP"], "F", "https://i.ibb.co/QbJgHrR/image.png", 1011, "C"),
            new charInfo("Arlong", [], "One Piece", ["OP"], "M", "https://i.ibb.co/5kSqDKc/image.png", 1012, "B"),
            new charInfo("Asahija", [], "One Piece", ["OP"], "M", "https://i.ibb.co/t2YLBC3/image.png", 1013, "D"),
            new charInfo("Aswa", [], "One Piece", ["OP"], "F", "https://i.ibb.co/j4dK9Vr/image.png", 1014, "D"),
            new charInfo("Atmos", [], "One Piece", ["OP"], "M", "https://i.ibb.co/xs2mq2c/image.png", 1015, "D"),
            new charInfo("Attach", [], "One Piece", ["OP"], "M", "https://i.ibb.co/NNvrBqW/image.png", 1016, "D"),
            new charInfo("Babanuki", [], "One Piece", ["OP"], "M", "https://i.ibb.co/ZHcTvG4/image.png", 1017, "D"),
            new charInfo("Baby 5", [], "One Piece", ["OP"], "F", "https://i.ibb.co/p1nZKX7/image.png", 1018, "B"),
            new charInfo("Bakezo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/t4vp5dj/image.png", 1019, "D"),
            new charInfo("Banchina", [], "One Piece", ["OP"], "F", "https://i.ibb.co/r6KLSQL/image.png", 1020, "C"),
            new charInfo("Bao Huang", [], "One Piece", ["OP"], "F", "https://i.ibb.co/VwV99yt/b.png", 1021, "C"),
            new charInfo("Bariete", [], "One Piece", ["OP"], "M", "https://i.ibb.co/xLxsgYD/image.png", 1022, "D"),
            new charInfo("Bartholomew Kuma", ["PX-0", "PX0", "Bartholomäus Bär"], "One Piece", ["OP"], "M", "https://i.ibb.co/3CfCsyL/image.png", 1023, "B"),
            new charInfo("Bartolomeo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/tBsWLny/image.png", 1024, "C"),
            new charInfo("Bastille", [], "One Piece", ["OP"], "M", "https://i.ibb.co/TwwjPg5/image.png", 1025, "D"),
            new charInfo("Belladonna", [], "One Piece", ["OP"], "F", "https://i.ibb.co/c23ZNR0/image.png", 1026, "D"),
            new charInfo("Bellamy", [], "One Piece", ["OP"], "M", "https://i.ibb.co/QfPbXhF/image.png", 1027, "C"),
            new charInfo("Bellemere", [], "One Piece", ["OP"], "F", "https://i.ibb.co/W3YQyRW/image.png", 1028, "B"),
            new charInfo("Beckman Benn", [], "One Piece", ["OP"], "M", "https://i.ibb.co/fHSpxVS/image.png", 1029, "B"),
            new charInfo("Bon Clay", ["Bentham", "Mr. 2", "Bon Kurei"], "One Piece", ["OP"], "M", "https://i.ibb.co/QHF1bGy/4JkwVBE.png", 1030, "C"),
            new charInfo("Bepo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/dKbwQXZ/image.png", 1031, "C"),
            new charInfo("Belo Betty", [], "One Piece", ["OP"], "F", "https://i.ibb.co/0hqdVbN/yeURx0l.png", 1032, "C"),
            new charInfo("Bian", [], "One Piece", ["OP"], "F", "https://i.ibb.co/DzJWh2t/image.png", 1033, "C"),
            new charInfo("Bingo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/phm7MH7/image.png", 1034, "D"),
            new charInfo("Bins", [], "One Piece", ["OP"], "M", "https://i.ibb.co/wdxtcvn/image.png", 1035, "D"),
            new charInfo("Bishamon", [], "One Piece", ["OP"], "M", "https://i.ibb.co/qDbYnxY/image.png", 1036, "D"),
            new charInfo("Biyo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/ZM8MLhd/image.png", 1037, "D"),
            new charInfo("Black Maria", [], "One Piece", ["OP"], "F", "https://i.ibb.co/zVcd1NK/b.png", 1038, "B"),
            new charInfo("Blackback", [], "One Piece", ["OP"], "M", "https://i.ibb.co/NNYbJ3h/image.png", 1039, "D"),
            new charInfo("Blenheim", [], "One Piece", ["OP"], "M", "https://i.ibb.co/mtcHzz8/image.png", 1040, "D"),
            new charInfo("Gilly Blue", ["Blue Gilly"], "One Piece", ["OP"], "M", "https://i.ibb.co/DMXZCf9/image.png", 1041, "C"),
            new charInfo("Kizaru", ["Borsalino"], "One Piece", ["OP"], "M", "https://i.ibb.co/xJzsqmR/image.png", 1042, "B"),
            new charInfo("Blue Fan", [], "One Piece", ["OP"], "F", "https://i.ibb.co/pLCV76D/image.png", 1043, "D"),
            new charInfo("Bluejam", [], "One Piece", ["OP"], "M", "https://i.ibb.co/195KSNr/image.png", 1044, "D"),
            new charInfo("Blueno", ["Bruno (OP)"], "One Piece", ["OP"], "M", "https://i.ibb.co/StpTZZ9/image.png", 1045, "D"),
            new charInfo("Bobbin", [], "One Piece", ["OP"], "M", "https://i.ibb.co/6FbMqcF/image.png", 1046, "D"),
            new charInfo("Bogart", [], "One Piece", ["OP"], "M", "https://i.ibb.co/31SmxNJ/image.png", 1047, "D"),
            new charInfo("Bomba", [], "One Piece", ["OP"], "M", "https://i.ibb.co/HHy2Pyc/image.png", 1048, "D"),
            new charInfo("Daz Bones", ["Mr. 1"], "One Piece", ["OP"], "M", "https://i.ibb.co/CtfYSCQ/image.png", 1049, "C"),
            new charInfo("Bongou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/2MhSD90/image.png", 1050, "D"),
            new charInfo("Boo (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Y0hz6SM/image.png", 1051, "D"),
            new charInfo("Boodle", [], "One Piece", ["OP"], "M", "https://i.ibb.co/QMLxc40/image.png", 1052, "C"),
            new charInfo("Bouche", [], "One Piece", ["OP"], "M", "https://i.ibb.co/r5PVJC2/image.png", 1053, "D"),
            new charInfo("Braham", [], "One Piece", ["OP"], "M", "https://i.ibb.co/hBfCv7x/image.png", 1054, "D"),
            new charInfo("Brannew", [], "One Piece", ["OP"], "M", "https://i.ibb.co/VTWYVb5/image.png", 1055, "C"),
            new charInfo("Brogy", [], "One Piece", ["OP"], "M", "https://i.ibb.co/wzZ2GHY/image.png", 1056, "C"),
            new charInfo("Buchi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/dfXstsK/image.png", 1057, "D"),
            new charInfo("Buckin", [], "One Piece", ["OP"], "F", "https://i.ibb.co/zQ2CJsd/image.png", 1058, "D"),
            new charInfo("Buffalo (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/XY3qbqS/image.png", 1059, "D"),
            new charInfo("Buggy", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7kk5W0y/image.png", 1060, "B"),
            new charInfo("Bungou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/HHBppR2/image.png", 1061, "D"),
            new charInfo("Joe Bunny", [], "One Piece", ["OP"], "M", "https://i.ibb.co/NVGZbY5/image.png", 1062, "D"),
            new charInfo("Byron", [], "One Piece", ["OP"], "M", "https://i.ibb.co/qph2zHR/image.png", 1063, "D"),
            new charInfo("Cabaji", [], "One Piece", ["OP"], "M", "https://i.ibb.co/p1kJp8J/image.png", 1064, "C"),
            new charInfo("Calgara", [], "One Piece", ["OP"], "M", "https://i.ibb.co/VqWd3S2/image.png", 1065, "D"),
            new charInfo("Capone Bege", ["Capone Gang Bege", `Capone "Gang" Bege`], "One Piece", ["OP"], "M", "https://i.ibb.co/BzMpwJW/image.png", 1066, "C"),
            new charInfo("Capone Pez", [], "One Piece", ["OP"], "M", "https://i.ibb.co/kGq7K8r/image.png", 1067, "D"),
            new charInfo("Caribou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7z37TSw/image.png", 1068, "C"),
            new charInfo("Boa Hancock", ["Snake Princess", "Pirate Empress"], "One Piece", ["OP"], "F", "https://i.ibb.co/SNrmTF7/b.png", 1069, "S"),
            new charInfo("Boa Sandersonia", [], "One Piece", ["OP"], "F", "https://i.ibb.co/DzMtwvV/image.png", 1070, "B"),
            new charInfo("Boa Marigold", [], "One Piece", ["OP"], "F", "https://i.ibb.co/FgNyC9Z/image.png", 1071, "C"),
            new charInfo("Capote", [], "One Piece", ["OP"], "M", "https://i.ibb.co/nr4ZDsv/image.png", 1072, "D"),
            new charInfo("Carmel", ["Mother Carmel"], "One Piece", ["OP"], "F", "https://i.ibb.co/jwHcYFY/image.png", 1073, "D"),
            new charInfo("Carne", [], "One Piece", ["OP"], "M", "https://i.ibb.co/dJKq3F9/image.png", 1074, "D"),
            new charInfo("Carrot", [], "One Piece", ["OP"], "F", "https://i.ibb.co/9vqh1jX/E6PUg7y.png", 1075, "A"),
            new charInfo("Karoo", ["Carue"], "One Piece", ["OP"], "M", "https://i.ibb.co/1b9Ptpw/image.png", 1076, "C"),
            new charInfo("Catacombo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/5RppwfQ/image.png", 1077, "D"),
            new charInfo("Cavendish", [], "One Piece", ["OP"], "M", "https://i.ibb.co/wd8gT40/image.png", 1078, "C"),
            new charInfo("Chabo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/yNKynVp/image.png", 1079, "D"),
            new charInfo("Chaka", [], "One Piece", ["OP"], "M", "https://i.ibb.co/bsjb7mT/image.png", 1080, "D"),
            new charInfo("Chao", [], "One Piece", ["OP"], "M", "https://i.ibb.co/xHjykrP/image.png", 1081, "D"),
            new charInfo("Charloss", [], "One Piece", ["OP"], "M", "https://i.ibb.co/gVY6JTg/image.png", 1082, "D"),
            new charInfo("Charlotte Perospero", ["Perospero Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/Ttmkbq0/image.png", 1083, "B"),
            new charInfo("Charlotte Chiffon", ["Chiffon Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/wSf4yM0/image.png", 1084, "C"),
            new charInfo("Charlotte Pudding", ["Pudding Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/7KwhN7s/image.png", 1085, "A"),
            new charInfo("Big Mom", ["Linlin Charlotte", "Charlotte Linlin"], "One Piece", ["OP"], "F", "https://i.ibb.co/ZWn10dQ/image.png", 1086, "B"),
            new charInfo("Charlotte Praline", ["Praline Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/wM9CW6p/image.png", 1087, "D"),
            new charInfo("Charlotte Amande", ["Amande Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/2ZXcqPp/image.png", 1088, "C"),
            new charInfo("Charlotte Cracker", ["Cracker Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/L0yrtyz/image.png", 1089, "B"),
            new charInfo("Charlotte Opera", ["Opera Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/PT0fQRF/image.png", 1090, "D"),
            new charInfo("Charlotte Lola", ["Lola Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/9sVrB1p/image.png", 1091, "D"),
            new charInfo("Charlotte Katakuri", ["Katakuri Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/cNN3qSC/k.png", 1092, "A"),
            new charInfo("Charlotte Mont-d'Or", ["Mont-d'Or Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/RpgDMsP/image.png", 1093, "D"),
            new charInfo("Charlotte Brûlée", ["Brûlée Charlotte", "Charlotte Brulee", "Brulee Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/KrZVjhV/image.png", 1094, "D"),
            new charInfo("Charlotte Galette", ["Galette Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/Trwg8G5/image.png", 1095, "C"),
            new charInfo("Charlotte Moscato", ["Moscato Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/vD9rdBd/image.png", 1096, "D"),
            new charInfo("Charlotte Marnier", ["Marnier Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/wR4JkWR/image.png", 1097, "D"),
            new charInfo("Charlotte Dacquoise", ["Dacquoise Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/4KGG6Dj/image.png", 1098, "D"),
            new charInfo("Charlotte Myukuru", ["Myukuru Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/YjpPtY6/image.png", 1099, "D"),
            new charInfo("Charlotte Smoothie", ["Smoothie Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/TH7NXHw/image.png", 1100, "C"),
            new charInfo("Charlotte Oven", ["Oven Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/p332NmL/image.png", 1101, "B"),
            new charInfo("Charlotte Custard", ["Custard Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/MhXCwMs/image.png", 1102, "D"),
            new charInfo("Charlotte Mobile", ["Mobile Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/CsY2WvT/image.png", 1103, "D"),
            new charInfo("Charlotte Joconde", ["Joconde Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/ZWtS1JM/image.png", 1104, "D"),
            new charInfo("Charlotte Akimeg", ["Akimeg Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/VC9Rqz1/image.png", 1105, "D"),
            new charInfo("Charlotte Nutmeg", ["Nutmeg Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/Z1mpKSc/image.png", 1106, "D"),
            new charInfo("Charlotte Newgo", ["Newgo Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/fCnYwfX/image.png", 1107, "D"),
            new charInfo("Charlotte Tablet", ["Tablet Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/Pm2ypqH/image.png", 1108, "D"),
            new charInfo("Charlotte Chiboust", ["Chiboust Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/v1Z5NKC/image.png", 1109, "D"),
            new charInfo("Charlotte Newichi", ["Newichi Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/SsJNBLQ/image.png", 1110, "D"),
            new charInfo("Charlotte Daifuku", ["Daifuku Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/tzhCBfc/EENXF8j.png", 1111, "C"),
            new charInfo("Charlotte Newshi", ["Newshi Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/NYB1mRc/image.png", 1112, "D"),
            new charInfo("Charlotte Newji", ["Newji Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/b5zSCm3/image.png", 1113, "D"),
            new charInfo("Charlotte Effiler", ["Effiler Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/DpRqdnK/image.png", 1114, "D"),
            new charInfo("Charlotte Monder", ["Monder Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/mtcnypd/image.png", 1115, "D"),
            new charInfo("Charlotte Poire", ["Poire Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/LNv5627/image.png", 1116, "D"),
            new charInfo("Charlotte Allmeg", ["Allmeg Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/dfd27C6/image.png", 1117, "D"),
            new charInfo("Charlotte Fuyumeg", ["Fuyumeg Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/48mYLtN/image.png", 1118, "D"),
            new charInfo("Charlotte Compo", ["Compo Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/LZnxgvb/image.png", 1119, "D"),
            new charInfo("Charlotte Yuen", ["Yuen Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/xjcGyj8/image.png", 1120, "D"),
            new charInfo("Charlotte Joscarpone", ["Joscarpone Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/G9zmNRg/image.png", 1121, "D"),
            new charInfo("Charlotte Anglais", ["Anglais Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/618dKLd/image.png", 1122, "D"),
            new charInfo("Charlotte Anana", ["Anana Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/kyvg0Wz/image.png", 1123, "D"),
            new charInfo("Charlotte Cabaletta", ["Cabaletta Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/26zNYXq/image.png", 1124, "D"),
            new charInfo("Charlotte Cornstarch", ["Cornstarch Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/G2JSmDn/image.png", 1125, "D"),
            new charInfo("Charlotte Cadenza", ["Cadenza Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/7QLB7PF/image.png", 1126, "D"),
            new charInfo("Charlotte Counter", ["Counter Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/cxdLQkH/image.png", 1127, "D"),
            new charInfo("Charlotte Mascarpone", ["Mascarpone Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/1R75hpg/image.png", 1128, "D"),
            new charInfo("Charlotte Cinnamon", ["Cinnamon Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/6RcGK91/image.png", 1129, "C"),
            new charInfo("Charlotte Mash", ["Mash Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/nRTVZNV/image.png", 1130, "D"),
            new charInfo("Charlotte Nusstorte", ["Nusstorte Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/41QT4CK/image.png", 1131, "D"),
            new charInfo("Charlotte Raisin", ["Raisin Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/Lgf6LSZ/image.png", 1132, "D"),
            new charInfo("Charlotte Citron", ["Citron Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/S5gd4hV/image.png", 1133, "D"),
            new charInfo("Charlotte Harumeg", ["Harumeg Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/9NktZML/image.png", 1134, "D"),
            new charInfo("Charlotte Compote", ["Compote Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/V33LgCr/image.png", 1135, "D"),
            new charInfo("Charlotte Bavarois", ["Bavarois Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/tBF8CjS/image.png", 1136, "D"),
            new charInfo("Charlotte Flampe", ["Flampe Charlotte"], "One Piece", ["OP"], "F", "https://i.ibb.co/Qk3gjL5/image.png", 1137, "C"),
            new charInfo("Charlotte Snack", ["Snack Charlotte"], "One Piece", ["OP"], "M", "https://i.ibb.co/fH0Hh74/image.png", 1138, "C"),
            new charInfo("Chess", [], "One Piece", ["OP"], "M", "https://i.ibb.co/cN9fDGn/image.png", 1139, "D"),
            new charInfo("Chew", [], "One Piece", ["OP"], "M", "https://i.ibb.co/1L4Y9Ys/image.png", 1140, "C"),
            new charInfo("Chimney", [], "One Piece", ["OP"], "F", "https://i.ibb.co/mSmC2rx/image.png", 1141, "D"),
            new charInfo("Don Chinjao", [], "One Piece", ["OP"], "M", "https://i.ibb.co/BwQmtkN/image.png", 1142, "C"),
            new charInfo("Chocolat", ["Impostor Nami"], "One Piece", ["OP"], "F", "https://i.ibb.co/52BTCWp/image.png", 1143, "D"),
            new charInfo("Chome", [], "One Piece", ["OP"], "F", "https://i.ibb.co/cCYBYSh/image.png", 1144, "D"),
            new charInfo("Chouchou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/k6YzsK2/image.png", 1145, "D"),
            new charInfo("Clover", [], "One Piece", ["OP"], "M", "https://i.ibb.co/KhMxrBh/image.png", 1146, "C"),
            new charInfo("Caesar Clown", ["Gangsta Gastino"], "One Piece", ["OP"], "M", "https://i.ibb.co/khWRRbr/image.png", 1147, "B"),
            new charInfo("Cocoa", ["Impostor Robin"], "One Piece", ["OP"], "F", "https://i.ibb.co/3FrMbvG/image.png", 1148, "D"),
            new charInfo("Concelot", [], "One Piece", ["OP"], "M", "https://i.ibb.co/wJDNrw0/image.png", 1149, "D"),
            new charInfo("Conis", [], "One Piece", ["OP"], "F", "https://i.ibb.co/VSgXVQf/image.png", 1150, "C"),
            new charInfo("Corgi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/1YNzL4K/image.png", 1151, "D"),
            new charInfo("Coribou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/kKwBSX0/image.png", 1152, "D"),
            new charInfo("Cosette", [], "One Piece", ["OP"], "F", "https://i.ibb.co/hWPbM7M/image.png", 1153, "C"),
            new charInfo("Cosmos", [], "One Piece", ["OP"], "F", "https://i.ibb.co/9p8Gs03/image.png", 1154, "D"),
            new charInfo("Cotton", [], "One Piece", ["OP"], "F", "https://i.ibb.co/sgW7Lt1/image.png", 1155, "D"),
            new charInfo("Crocodile", ["Sir Crocodile", "Mr. 0"], "One Piece", ["OP"], "M", "https://i.ibb.co/0nvQPVP/image.png", 1156, "B"),
            new charInfo("Crocus", [], "One Piece", ["OP"], "M", "https://i.ibb.co/4fnShfG/image.png", 1157, "C"),
            new charInfo("Curiel", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vw97V3P/image.png", 1158, "D"),
            new charInfo("Dadan Curly", [], "One Piece", ["OP"], "F", "https://i.ibb.co/9vkMt7T/image.png", 1159, "C"),
            new charInfo("Dagama", [], "One Piece", ["OP"], "M", "https://i.ibb.co/k3X2vqm/image.png", 1160, "D"),
            new charInfo("Daifugo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/txwsRjJ/image.png", 1161, "D"),
            new charInfo("Daigin", [], "One Piece", ["OP"], "M", "https://i.ibb.co/4tGCwBG/image.png", 1162, "D"),
            new charInfo("Daikoku", [], "One Piece", ["OP"], "M", "https://i.ibb.co/MkKwjWn/image.png", 1163, "D"),
            new charInfo("Daisy (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/fxN6QBB/image.png", 1164, "D"),
            new charInfo("Dalmatian", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Tv6FqBm/image.png", 1165, "D"),
            new charInfo("Dalton", [], "One Piece", ["OP"], "M", "https://i.ibb.co/m5nSBPP/image.png", 1166, "C"),
            new charInfo("Damask", [], "One Piece", ["OP"], "M", "https://i.ibb.co/VJFQDt2/image.png", 1167, "D"),
            new charInfo("Daruma", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vD8PxNq/image.png", 1168, "D"),
            new charInfo("Domino", [], "One Piece", ["OP"], "F", "https://i.ibb.co/zPsHL9q/image.png", 1169, "C"),
            new charInfo("Delacuaji", [], "One Piece", ["OP"], "M", "https://i.ibb.co/xgwqsRQ/image.png", 1170, "D"),
            new charInfo("Dellinger", [], "One Piece", ["OP"], "M", "https://i.ibb.co/tQ9HSM1/image.png", 1171, "C"),
            new charInfo("Demaro Black", ["Impostor Luffy"], "One Piece", ["OP"], "M", "https://i.ibb.co/xgww5zh/image.png", 1172, "D"),
            new charInfo("Den (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/CJtVqCQ/image.png", 1173, "D"),
            new charInfo("Devil Dias", [], "One Piece", ["OP"], "M", "https://i.ibb.co/fGs2yW0/image.png", 1174, "D"),
            new charInfo("Catarina Devon", [], "One Piece", ["OP"], "F", "https://i.ibb.co/Gdt9bZ5/image.png", 1175, "D"),
            new charInfo("Diamante", [], "One Piece", ["OP"], "M", "https://i.ibb.co/K2Xk1dd/image.png", 1176, "C"),
            new charInfo("Barrels Diez", [], "One Piece", ["OP"], "M", "https://i.ibb.co/yfLVxtf/image.png", 1177, "D"),
            new charInfo("Doberman", [], "One Piece", ["OP"], "M", "https://i.ibb.co/HVJhXxQ/image.png", 1178, "D"),
            new charInfo("Doc Q", [], "One Piece", ["OP"], "M", "https://i.ibb.co/PQrV4Jm/image.png", 1179, "C"),
            new charInfo("Doma (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Ssr41qH/image.png", 1180, "D"),
            new charInfo("Donquixote Doflamingo", ["Doflamingo", "Joker (OP)"], "One Piece", ["OP"], "M", "https://i.ibb.co/bW13Qn5/image.png", 1181, "A"),
            new charInfo("Donquixote Homing", [], "One Piece", ["OP"], "M", "https://i.ibb.co/YkNQb7y/image.png", 1182, "D"),
            new charInfo("Donquixote Mjosgard", [], "One Piece", ["OP"], "M", "https://i.ibb.co/TwkYpHp/image.png", 1183, "D"),
            new charInfo("Dorry", [], "One Piece", ["OP"], "M", "https://i.ibb.co/fQF2XQk/image.png", 1184, "C"),
            new charInfo("Dosun", [], "One Piece", ["OP"], "M", "https://i.ibb.co/ry50sGW/image.png", 1185, "D"),
            new charInfo("Dracule Mihawk", ["Hawk-Eyes", "Hawk Eyes", "Mihawk Dracule"], "One Piece", ["OP"], "M", "https://i.ibb.co/XC46ST9/M.png", 1186, "A"),
            new charInfo("Drip (OP)", ["Impostor Sanji"], "One Piece", ["OP"], "M", "https://i.ibb.co/XDCvKhQ/image.png", 1187, "D"),
            new charInfo("Duval", [], "One Piece", ["OP"], "M", "https://i.ibb.co/TL4J2QD/image.png", 1188, "D"),
            new charInfo("Whitebeard", ["Edward Newgate"], "One Piece", ["OP"], "M", "https://i.ibb.co/GMb4zsg/image.png", 1189, "A"),
            new charInfo("Edward Weevil", ["Weevil Edward"], "One Piece", ["OP"], "M", "https://i.ibb.co/v3DPyXs/image.png", 1190, "C"),
            new charInfo("Elizabello II", [], "One Piece", ["OP"], "M", "https://i.ibb.co/r5JB8gb/image.png", 1191, "D"),
            new charInfo("Elmy", [], "One Piece", ["OP"], "F", "https://i.ibb.co/LdCz159/image.png", 1192, "D"),
            new charInfo("Ivankov Emporio", ["Okama King"], "One Piece", ["OP"], "M", "https://i.ibb.co/KKw9JYN/5KnPuZx.png", 1193, "C"),
            new charInfo("Enel", [], "One Piece", ["OP"], "M", "https://i.ibb.co/4R4gGJJ/image.png", 1194, "B"),
            new charInfo("Enishida", [], "One Piece", ["OP"], "F", "https://i.ibb.co/HHm3R2L/image.png", 1195, "D"),
            new charInfo("Epoida", [], "One Piece", ["OP"], "M", "https://i.ibb.co/wMjV1fD/image.png", 1196, "D"),
            new charInfo("Epony", [], "One Piece", ["OP"], "F", "https://i.ibb.co/0Q0BbJq/image.png", 1197, "D"),
            new charInfo("Erik (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/N1TMSYD/image.png", 1198, "D"),
            new charInfo("Farafra", [], "One Piece", ["OP"], "M", "https://i.ibb.co/x5zmt62/image.png", 1199, "D"),
            new charInfo(`Eustass "Captain" Kid`, ["Eustass Captain Kid", "Eustass Kid", "Kid Eustass"], "One Piece", ["OP"], "M", "https://i.ibb.co/NKLWhYg/image.png", 1200, "A"),
            new charInfo("Du Feld", [], "One Piece", ["OP"], "M", "https://i.ibb.co/z2KyDYJ/image.png", 1201, "D"),
            new charInfo("Fisher Tiger", [], "One Piece", ["OP"], "M", "https://i.ibb.co/WFM947Y/image.png", 1202, "B"),
            new charInfo("Flapper", [], "One Piece", ["OP"], "M", "https://i.ibb.co/F4wCZW2/image.png", 1203, "D"),
            new charInfo("Fossa", [], "One Piece", ["OP"], "M", "https://i.ibb.co/68fWrW0/image.png", 1204, "D"),
            new charInfo("Foxy", [], "One Piece", ["OP"], "M", "https://i.ibb.co/2Kp03CP/image.png", 1205, "C"),
            new charInfo("Fukaboshi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/4Js7KqH/image.png", 1206, "C"),
            new charInfo("Fukurokuju", [], "One Piece", ["OP"], "M", "https://i.ibb.co/yQrrzRb/image.png", 1207, "C"),
            new charInfo("Fukurou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/f0MxNBm/image.png", 1208, "D"),
            new charInfo("Fullbody", [], "One Piece", ["OP"], "M", "https://i.ibb.co/LpwKM0r/image.png", 1209, "C"),
            new charInfo("Kelly Funk", [], "One Piece", ["OP"], "M", "https://i.ibb.co/NSPnmQN/image.png", 1210, "D"),
            new charInfo("Bobby Funk", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Z22M2JK/image.png", 1211, "D"),
            new charInfo("Gaimon", [], "One Piece", ["OP"], "M", "https://i.ibb.co/N26jdQG/image.png", 1212, "D"),
            new charInfo("Galdino", ["Mr. 3"], "One Piece", ["OP"], "M", "https://i.ibb.co/cQvZMZ2/image.png", 1213, "C"),
            new charInfo("Gambia", [], "One Piece", ["OP"], "M", "https://i.ibb.co/NFhQtWZ/image.png", 1214, "D"),
            new charInfo("Gan Fall", [], "One Piece", ["OP"], "M", "https://i.ibb.co/0yt6bZS/image.png", 1215, "D"),
            new charInfo("Gancho", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7pMLyNL/image.png", 1216, "D"),
            new charInfo("Gatz", [], "One Piece", ["OP"], "M", "https://i.ibb.co/r6Cm4gQ/image.png", 1217, "C"),
            new charInfo("Gedatsu", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vqxbXFd/image.png", 1218, "D"),
            new charInfo("Gekko Moriah", [], "One Piece", ["OP"], "M", "https://i.ibb.co/4FqxtLY/image.png", 1219, "B"),
            new charInfo("Genzou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/bQtwNzQ/image.png", 1220, "C"),
            new charInfo("Genbou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/XX5HHpm/image.png", 1221, "D"),
            new charInfo("Gerth", [], "One Piece", ["OP"], "F", "https://i.ibb.co/Hz2Z5P8/G.png", 1222, "D"),
            new charInfo("Giberson", [], "One Piece", ["OP"], "M", "https://i.ibb.co/C6B65xw/image.png", 1223, "D"),
            new charInfo("Gin (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/pXQFR0x/image.png", 1224, "C"),
            new charInfo("Gina", [], "One Piece", ["OP"], "F", "https://i.ibb.co/GR4QW33/image.png", 1225, "D"),
            new charInfo("Ginko (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/r4g88dH/image.png", 1226, "D"),
            new charInfo("Ginrummy", [], "One Piece", ["OP"], "F", "https://i.ibb.co/FX5Thb6/image.png", 1227, "D"),
            new charInfo("Giovanni", [], "One Piece", ["OP"], "M", "https://i.ibb.co/WHSzRkB/image.png", 1228, "D"),
            new charInfo("Gladius", [], "One Piece", ["OP"], "M", "https://i.ibb.co/CJjBFZj/image.png", 1229, "C"),
            new charInfo("Gloriosa", ["Elder Nyon"], "One Piece", ["OP"], "F", "https://i.ibb.co/0nkHffR/image.png", 1230, "D"),
            new charInfo("Glove", [], "One Piece", ["OP"], "M", "https://i.ibb.co/fx1g1BC/image.png", 1231, "D"),
            new charInfo("Goldberg", [], "One Piece", ["OP"], "M", "https://i.ibb.co/VppLY5n/B.png", 1232, "D"),
            new charInfo("Gorilla", [], "One Piece", ["OP"], "M", "https://i.ibb.co/s36hK13/image.png", 1233, "D"),
            new charInfo("Gold Roger", ["Gol D. Roger", "Pirate King"], "One Piece", ["OP"], "M", "https://i.ibb.co/gmmrnDN/oTKpNRQ.png", 1234, "S"),
            new charInfo("Gotty", [], "One Piece", ["OP"], "M", "https://i.ibb.co/h7vZP8C/image.png", 1235, "D"),
            new charInfo("Grabar", [], "One Piece", ["OP"], "M", "https://i.ibb.co/6bdDTTh/image.png", 1236, "D"),
            new charInfo("Gyoru", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Wcvv8G0/image.png", 1237, "D"),
            new charInfo("Gyro", [], "One Piece", ["OP"], "M", "https://i.ibb.co/JKMLsYr/image.png", 1238, "D"),
            new charInfo("Gyukimaru", [], "One Piece", ["OP"], "M", "https://i.ibb.co/mqPrr7p/422506.jpg", 1239, "D"),
            new charInfo("Hack", [], "One Piece", ["OP"], "M", "https://i.ibb.co/dPctTWh/image.png", 1240, "D"),
            new charInfo("Hajrudin", [], "One Piece", ["OP"], "M", "https://i.ibb.co/6gMwbZW/image.png", 1241, "C"),
            new charInfo("Ham Burger", [], "One Piece", ["OP"], "M", "https://i.ibb.co/dJwnMDw/image.png", 1242, "D"),
            new charInfo("Hammond", [], "One Piece", ["OP"], "M", "https://i.ibb.co/8cSV1CN/image.png", 1243, "D"),
            new charInfo("Hanger", [], "One Piece", ["OP"], "M", "https://i.ibb.co/LrptywL/image.png", 1244, "D"),
            new charInfo("Hannyabal", [], "One Piece", ["OP"], "M", "https://i.ibb.co/f4CqR4j/image.png", 1245, "C"),
            new charInfo("Haredas", [], "One Piece", ["OP"], "M", "https://i.ibb.co/hRv7DYK/image.png", 1246, "D"),
            new charInfo("Harisenbon", [], "One Piece", ["OP"], "M", "https://i.ibb.co/D4d6PfH/image.png", 1247, "D"),
            new charInfo("Haruta", [], "One Piece", ["OP"], "M", "https://i.ibb.co/FKCSxpP/image.png", 1248, "D"),
            new charInfo("Hatchan", [], "One Piece", ["OP"], "M", "https://i.ibb.co/kHL0K09/image.png", 1249, "D"),
            new charInfo("Hiluluk", ["Dr. Hiluluk", "Hiriluk", "Dr. Hiriluk"], "One Piece", ["OP"], "M", "https://i.ibb.co/c6q75Rv/2IpI5KK.png", 1250, "B"),
            new charInfo("Basil Hawkins", [], "One Piece", ["OP"], "M", "https://i.ibb.co/g3ZtM6h/image.png", 1251, "B"),
            new charInfo("Heat", [], "One Piece", ["OP"], "M", "https://i.ibb.co/YWnHWjF/image.png", 1252, "D"),
            new charInfo("Helmeppo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/RBX4C6P/image.png", 1253, "C"),
            new charInfo("Heppoko", [], "One Piece", ["OP"], "M", "https://i.ibb.co/VTL4KJg/image.png", 1254, "D"),
            new charInfo("Heracles (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/xMkgsc8/image.png", 1255, "D"),
            new charInfo("Hewitt", [], "One Piece", ["OP"], "M", "https://i.ibb.co/pKT7cpn/image.png", 1256, "D"),
            new charInfo("Brownbeard", ["Chadros Higelyges"], "One Piece", ["OP"], "M", "https://i.ibb.co/Js12jsS/image.png", 1257, "D"),
            new charInfo("Higuma", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7jQ7B20/image.png", 1258, "C"),
            new charInfo("Hildon", [], "One Piece", ["OP"], "M", "https://i.ibb.co/1QDNbHh/image.png", 1259, "D"),
            new charInfo("Hina (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/7nWtTpg/image.png", 1260, "C"),
            new charInfo("Hiramera", [], "One Piece", ["OP"], "F", "https://i.ibb.co/dmwSw4y/image.png", 1261, "D"),
            new charInfo("Tenguyama Hitetsu", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Dtcg24K/image.png", 1262, "D"),
            new charInfo("Hocker", [], "One Piece", ["OP"], "M", "https://i.ibb.co/DYBnhjW/image.png", 1263, "D"),
            new charInfo("Hogback", ["Dr. Hogback"], "One Piece", ["OP"], "M", "https://i.ibb.co/tmZrzhr/image.png", 1264, "D"),
            new charInfo("Holdem", [], "One Piece", ["OP"], "M", "https://i.ibb.co/9pPN71c/SEhgQDV.png", 1265, "C"),
            new charInfo("Hou (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/w0FTWyd/image.png", 1266, "D"),
            new charInfo("Hyogoro", [], "One Piece", ["OP"], "M", "https://i.ibb.co/4grvCqN/image.png", 1267, "C"),
            new charInfo("Hyoutauros", ["Leopardtaurus"], "One Piece", ["OP"], "M", "https://i.ibb.co/wr8Y8KT/image.png", 1268, "D"),
            new charInfo("Hyouzou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/SrsSdGf/image.png", 1269, "D"),
            new charInfo("Iceburg", [], "One Piece", ["OP"], "M", "https://i.ibb.co/DMCrFyg/image.png", 1270, "C"),
            new charInfo("Ichika (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/JCrLWTq/image.png", 1271, "D"),
            new charInfo("Ideo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/YWjLh4R/image.png", 1272, "D"),
            new charInfo("Igaram", ["Mr. 8", "Igarappoi"], "One Piece", ["OP"], "M", "https://i.ibb.co/yf8zdfK/image.png", 1273, "D"),
            new charInfo("Im", ["Imu", "Im-sama", "Imu-sama", "Im sama", "Imu sama"], "One Piece", ["OP"], "M", "https://i.ibb.co/ctkJfcD/image.png", 1274, "B"),
            new charInfo("Inazuma", [], "One Piece", ["OP"], "M", "https://i.ibb.co/G5bLzJz/image.png", 1275, "D"),
            new charInfo("Inhel", [], "One Piece", ["OP"], "M", "https://i.ibb.co/kBpfcJf/image.png", 1276, "D"),
            new charInfo("Inuarashi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/j6p0BSj/image.png", 1277, "B"),
            new charInfo("Ippon-Matsu", ["Ippon Matsu"], "One Piece", ["OP"], "M", "https://i.ibb.co/p492KY3/image.png", 1278, "D"),
            new charInfo("Ishilly", [], "One Piece", ["OP"], "F", "https://i.ibb.co/CKs8bcY/image.png", 1279, "C"),
            new charInfo("Fujitora", ["Isshou"], "One Piece", ["OP"], "M", "https://i.ibb.co/6Rr2zwm/image.png", 1280, "B"),
            new charInfo("Izou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/xgmVqMb/image.png", 1281, "C"),
            new charInfo("Jabra", [], "One Piece", ["OP"], "M", "https://i.ibb.co/bJ9n4wR/image.png", 1282, "D"),
            new charInfo("Jack (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/W3P7bd4/image.png", 1283, "C"),
            new charInfo("Jaguar D. Saul", ["Saul D. Jaguar"], "One Piece", ["OP"], "M", "https://i.ibb.co/hDcxyjx/image.png", 1284, "C"),
            new charInfo("Shin Jaiya", [], "One Piece", ["OP"], "F", "https://i.ibb.co/hfkD059/image.png", 1285, "D"),
            new charInfo("Jalmack", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vkSXytT/image.png", 1286, "D"),
            new charInfo("Jango", [], "One Piece", ["OP"], "M", "https://i.ibb.co/z7PX1PP/image.png", 1287, "D"),
            new charInfo("Jarl", ["Mountain Beard"], "One Piece", ["OP"], "M", "https://i.ibb.co/1qzL48c/image.png", 1288, "D"),
            new charInfo("Jean Bart", [], "One Piece", ["OP"], "M", "https://i.ibb.co/br141f3/image.png", 1289, "D"),
            new charInfo("Jeet", [], "One Piece", ["OP"], "M", "https://i.ibb.co/LQWLtYP/image.png", 1290, "D"),
            new charInfo("Jero", [], "One Piece", ["OP"], "M", "https://i.ibb.co/bgH2fkD/image.png", 1291, "D"),
            new charInfo("Jerry (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/gTxPV7P/image.png", 1292, "D"),
            new charInfo("Jesus Burgess", [], "One Piece", ["OP"], "M", "https://i.ibb.co/ZHwfWHm/image.png", 1293, "C"),
            new charInfo("Jewelry Bonney", [], "One Piece", ["OP"], "F", "https://i.ibb.co/5rLjHn7/B.png", 1294, "A"),
            new charInfo("Jigra", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vhTVrdk/image.png", 1295, "D"),
            new charInfo("John Giant", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Z8NvsR7/image.png", 1296, "D"),
            new charInfo("Johnny (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/nPgzNLG/image.png", 1297, "C"),
            new charInfo("Hody Jones", [], "One Piece", ["OP"], "M", "https://i.ibb.co/87s7dbL/image.png", 1298, "C"),
            new charInfo("Jora", [], "One Piece", ["OP"], "F", "https://i.ibb.co/m6h8wsK/image.png", 1299, "D"),
            new charInfo("Kaidou", ["Kaido", "Hundred Beasts", "Strongest Creature in the World"], "One Piece", ["OP"], "M", "https://i.ibb.co/vqT5vBx/K.png", 1300, "A"),
            new charInfo("Jorl", ["Waterfall Beard"], "One Piece", ["OP"], "M", "https://i.ibb.co/Yd8H5cS/image.png", 1301, "D"),
            new charInfo("Jozu", ["Diamond Jozu"], "One Piece", ["OP"], "M", "https://i.ibb.co/87gJNZ0/image.png", 1302, "D"),
            new charInfo("Kabu", [], "One Piece", ["OP"], "M", "https://i.ibb.co/jTrh9fw/image.png", 1303, "D"),
            new charInfo("Kadar", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Sy6Hsnb/image.png", 1304, "D"),
            new charInfo("Kairen", [], "One Piece", ["OP"], "F", "https://i.ibb.co/NFh8Rhc/image.png", 1305, "D"),
            new charInfo("Kaku", [], "One Piece", ["OP"], "M", "https://i.ibb.co/F5XZbWx/image.png", 1306, "C"),
            new charInfo("Kalifa", [], "One Piece", ["OP"], "F", "https://i.ibb.co/7t2Cy24/image.png", 1307, "C"),
            new charInfo("Kamakiri", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vVGGnkR/image.png", 1308, "D"),
            new charInfo("Kaneshiro", [], "One Piece", ["OP"], "M", "https://i.ibb.co/PrV8Cr6/image.png", 1309, "D"),
            new charInfo("Kanjuurou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Vq1St3B/image.png", 1310, "C"),
            new charInfo("Kappa", [], "One Piece", ["OP"], "M", "https://i.ibb.co/THKy3f8/image.png", 1311, "D"),
            new charInfo("Karasu", [], "One Piece", ["OP"], "M", "https://i.ibb.co/0sKSXmP/image.png", 1312, "B"),
            new charInfo("Karma (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/10MMM5W/image.png", 1313, "D"),
            new charInfo("Kasagoba", ["Kasagon"], "One Piece", ["OP"], "M", "https://i.ibb.co/y6SSYvx/image.png", 1314, "D"),
            new charInfo("Kashii", [], "One Piece", ["OP"], "M", "https://i.ibb.co/9t8DRXv/image.png", 1315, "D"),
            new charInfo("Kawamatsu", [], "One Piece", ["OP"], "M", "https://i.ibb.co/M63nkx3/image.png", 1316, "C"),
            new charInfo("Kaya", [], "One Piece", ["OP"], "F", "https://i.ibb.co/7Yx8923/image.png", 1317, "B"),
            new charInfo("Keimi", [], "One Piece", ["OP"], "F", "https://i.ibb.co/HdjNrC6/image.png", 1318, "B"),
            new charInfo("Kiba", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7GxfyFv/image.png", 1319, "D"),
            new charInfo("Kibin", [], "One Piece", ["OP"], "M", "https://i.ibb.co/WKMS9TR/image.png", 1320, "D"),
            new charInfo("Kikyou", [], "One Piece", ["OP"], "F", "https://i.ibb.co/GnDnhk8/image.png", 1321, "C"),
            new charInfo("Killer", [], "One Piece", ["OP"], "M", "https://i.ibb.co/qnhcxJ5/image.png", 1322, "B"),
            new charInfo("Kinderella", [], "One Piece", ["OP"], "F", "https://i.ibb.co/t8WKzGs/image.png", 1323, "D"),
            new charInfo("Kinemon", ["Foxfire Kinemon"], "One Piece", ["OP"], "M", "https://i.ibb.co/VgZpWpt/image.png", 1324, "A"),
            new charInfo("King", ["King the Wildfire"], "One Piece", ["OP"], "M", "https://i.ibb.co/QfR4vmF/image.png", 1325, "B"),
            new charInfo("Kingdew", [], "One Piece", ["OP"], "M", "https://i.ibb.co/2jvnJSV/image.png", 1326, "D"),
            new charInfo("Kirintauros", ["Giraffetaurus"], "One Piece", ["OP"], "M", "https://i.ibb.co/PtCMpYj/image.png", 1327, "D"),
            new charInfo("Kitton", [], "One Piece", ["OP"], "M", "https://i.ibb.co/zsfDJyJ/image.png", 1328, "D"),
            new charInfo("Kiwi", [], "One Piece", ["OP"], "F", "https://i.ibb.co/NKxYPpm/image.png", 1329, "D"),
            new charInfo("Klabautermann", [], "One Piece", ["OP"], "M", "https://i.ibb.co/f8ChKw3/image.png", 1330, "C"),
            new charInfo("Kobe", [], "One Piece", ["OP"], "M", "https://i.ibb.co/cyW0wX3/image.png", 1331, "D"),
            new charInfo("Koby", ["Korby"], "One Piece", ["OP"], "M", "https://i.ibb.co/1bQdMRt/image.png", 1332, "A"),
            new charInfo("Koala", [], "One Piece", ["OP"], "F", "https://i.ibb.co/x5CbmZF/K.png", 1333, "A"),
            new charInfo("Kohza", ["Korza", "Cohza", "Corza", "Koza", "Coza"], "One Piece", ["OP"], "M", "https://i.ibb.co/1LjRb2w/image.png", 1334, "C"),
            new charInfo("Banzaburo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/HV3q24g/9tEqv2e.png", 1335, "D"),
            new charInfo("Kokoro (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/V3D6z3z/image.png", 1336, "D"),
            new charInfo("Komane", [], "One Piece", ["OP"], "F", "https://i.ibb.co/N1bhb5M/image.png", 1337, "D"),
            new charInfo("Komurasaki", ["Kozuki Hiyori", "Hiyori Kozuki"], "One Piece", ["OP"], "F", "https://i.ibb.co/TwkJCGN/image.png", 1338, "B"),
            new charInfo("Kong", [], "One Piece", ["OP"], "M", "https://i.ibb.co/WtcJQLB/image.png", 1339, "C"),
            new charInfo("Koushirou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/YTHzy08/image.png", 1340, "D"),
            new charInfo("Kozuki Momonosuke", ["Momonosuke Kozuki"], "One Piece", ["OP"], "M", "https://i.ibb.co/X5m84qr/PZmCbBw.png", 1341, "B"),
            new charInfo("Kozuki Oden", ["Oden Kozuki"], "One Piece", ["OP"], "M", "https://i.ibb.co/JpqnZYx/453b0Nr.png", 1342, "A"),
            new charInfo("Kozuki Toki", ["Toki Kozuki"], "One Piece", ["OP"], "F", "https://i.ibb.co/DzSgtPQ/T.png", 1343, "C"),
            new charInfo("Don Krieg", [], "One Piece", ["OP"], "M", "https://i.ibb.co/GsNzMBx/image.png", 1344, "C"),
            new charInfo("Kuina", [], "One Piece", ["OP"], "F", "https://i.ibb.co/8dMmyq9/image.png", 1345, "B"),
            new charInfo("Kumadori", [], "One Piece", ["OP"], "M", "https://i.ibb.co/w6dPvjb/image.png", 1346, "D"),
            new charInfo("Kumagoro", [], "One Piece", ["OP"], "M", "https://i.ibb.co/yySWJYv/image.png", 1347, "D"),
            new charInfo("Kuni", [], "One Piece", ["OP"], "M", "https://i.ibb.co/9nYbF81/image.png", 1348, "D"),
            new charInfo("Kureha", ["Dr. Kureha"], "One Piece", ["OP"], "F", "https://i.ibb.co/j884y5h/image.png", 1349, "C"),
            new charInfo("Kuro (OP)", ["Klahadore"], "One Piece", ["OP"], "M", "https://i.ibb.co/qxx3YmH/image.png", 1350, "D"),
            new charInfo("Kuromarimo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/zRxNWrn/image.png", 1351, "D"),
            new charInfo("Kuroobi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/yYtkDXF/image.png", 1352, "C"),
            new charInfo("Kurozumi Orochi", ["Orochi Kurozumi"], "One Piece", ["OP"], "M", "https://i.ibb.co/TqCFJKP/image.png", 1353, "C"),
            new charInfo("Kuween", ["Kyuiin"], "One Piece", ["OP"], "F", "https://i.ibb.co/r7fWz2L/image.png", 1354, "D"),
            new charInfo("Aokiji", ["Kuzan"], "One Piece", ["OP"], "M", "https://i.ibb.co/TPLnStq/image.png", 1355, "A"),
            new charInfo("Kyoshiro", ["Denjiro"], "One Piece", ["OP"], "M", "https://i.ibb.co/y4y88fB/image.png", 1356, "B"),
            new charInfo("Kyros", [], "One Piece", ["OP"], "M", "https://i.ibb.co/b3BQ4ch/image.png", 1357, "B"),
            new charInfo("Laboon", [], "One Piece", ["OP"], "M", "https://i.ibb.co/SQpLQm0/image.png", 1358, "D"),
            new charInfo("Lacroix", [], "One Piece", ["OP"], "M", "https://i.ibb.co/8jzPppk/image.png", 1359, "D"),
            new charInfo("Lacueva", [], "One Piece", ["OP"], "M", "https://i.ibb.co/zN8pT72/image.png", 1360, "D"),
            new charInfo("Lafitte", [], "One Piece", ["OP"], "M", "https://i.ibb.co/6ZS2x1D/image.png", 1361, "B"),
            new charInfo("Laki", [], "One Piece", ["OP"], "F", "https://i.ibb.co/h9sQwkC/image.png", 1362, "D"),
            new charInfo("Lao G", [], "One Piece", ["OP"], "M", "https://i.ibb.co/cksx1R7/image.png", 1363, "D"),
            new charInfo("Leo (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/sjCb4Zs/image.png", 1364, "C"),
            new charInfo("Tank Lepanto", [], "One Piece", ["OP"], "M", "https://i.ibb.co/QrMC5X0/image.png", 1365, "D"),
            new charInfo("Lily (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/1nBQVNX/image.png", 1366, "D"),
            new charInfo("Lindbergh", [], "One Piece", ["OP"], "M", "https://i.ibb.co/y0c94fq/image.png", 1367, "C"),
            new charInfo("Lines", [], "One Piece", ["OP"], "M", "https://i.ibb.co/RpYX79w/image.png", 1368, "D"),
            new charInfo("Doughty Lip", ["Lip Service Doughty"], "One Piece", ["OP"], "M", "https://i.ibb.co/vjLNj4y/image.png", 1369, "D"),
            new charInfo("Little Oars Jr.", ["Little Oars Jr"], "One Piece", ["OP"], "M", "https://i.ibb.co/g4TjYk4/image.png", 1370, "D"),
            new charInfo("Lucky Roo", ["Roo Lucky"], "One Piece", ["OP"], "M", "https://i.ibb.co/qBFMcH4/image.png", 1371, "B"),
            new charInfo("Machvise", [], "One Piece", ["OP"], "M", "https://i.ibb.co/80B7QFX/image.png", 1372, "D"),
            new charInfo("Macro", [], "One Piece", ["OP"], "M", "https://i.ibb.co/4FN7qR7/image.png", 1373, "D"),
            new charInfo("Madillo-Man", [], "One Piece", ["OP"], "M", "https://i.ibb.co/rmBZm6K/image.png", 1374, "D"),
            new charInfo("Magellan", [], "One Piece", ["OP"], "M", "https://i.ibb.co/qr2YWfj/image.png", 1375, "B"),
            new charInfo("Magra", [], "One Piece", ["OP"], "M", "https://i.ibb.co/SdsbHvc/image.png", 1376, "D"),
            new charInfo("Maidy", [], "One Piece", ["OP"], "F", "https://i.ibb.co/7G1WF9N/image.png", 1377, "D"),
            new charInfo("Makino", [], "One Piece", ["OP"], "F", "https://i.ibb.co/8gv2RfZ/image.png", 1378, "A"),
            new charInfo("Manboshi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/BwG1vgT/image.png", 1379, "D"),
            new charInfo("Mani", [], "One Piece", ["OP"], "F", "https://i.ibb.co/9TfYTqd/image.png", 1380, "D"),
            new charInfo("Manjaro", ["Impostor Zoro"], "One Piece", ["OP"], "M", "https://i.ibb.co/LttcPwW/image.png", 1381, "D"),
            new charInfo("Mansherry", [], "One Piece", ["OP"], "F", "https://i.ibb.co/d7pqpyK/image.png", 1382, "D"),
            new charInfo("Marco", ["Marco the Phoenix"], "One Piece", ["OP"], "M", "https://i.ibb.co/tD0fvqC/m.png", 1383, "A"),
            new charInfo("Margarita", [], "One Piece", ["OP"], "F", "https://i.ibb.co/zX1pPcK/image.png", 1384, "D"),
            new charInfo("Marguerite", [], "One Piece", ["OP"], "F", "https://i.ibb.co/BynSPMR/image.png", 1385, "B"),
            new charInfo("Marie (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/Y3RLDqc/image.png", 1386, "D"),
            new charInfo("Marshall D. Teach", ["Black Beard", "Blackbeard"], "One Piece", ["OP"], "M", "https://i.ibb.co/kXjWf4G/image.png", 1387, "A"),
            new charInfo("Mashikaku", [], "One Piece", ["OP"], "M", "https://i.ibb.co/m4mkvr2/image.png", 1388, "D"),
            new charInfo("Masira", [], "One Piece", ["OP"], "M", "https://i.ibb.co/njXHNfC/image.png", 1389, "D"),
            new charInfo("Maujii", [], "One Piece", ["OP"], "M", "https://i.ibb.co/T4RkT5N/image.png", 1390, "D"),
            new charInfo("Maynard", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vs1MtQG/image.png", 1391, "D"),
            new charInfo("McGuy", [], "One Piece", ["OP"], "M", "https://i.ibb.co/3SXSbGd/image.png", 1392, "D"),
            new charInfo("McKinley", [], "One Piece", ["OP"], "M", "https://i.ibb.co/gvhwmKw/image.png", 1393, "D"),
            new charInfo("Meadows", [], "One Piece", ["OP"], "M", "https://i.ibb.co/WD28tkV/image.png", 1394, "D"),
            new charInfo("Mero", [], "One Piece", ["OP"], "F", "https://i.ibb.co/hKMvFsc/image.png", 1395, "C"),
            new charInfo("Merry (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/zJR3ZBg/image.png", 1396, "D"),
            new charInfo("Mikazuki", [], "One Piece", ["OP"], "M", "https://i.ibb.co/q17VNnM/image.png", 1397, "D"),
            new charInfo("Milky", [], "One Piece", ["OP"], "F", "https://i.ibb.co/16gVWjz/image.png", 1398, "D"),
            new charInfo("Minatomo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/BZynwFt/image.png", 1399, "D"),
            new charInfo("Monet", [], "One Piece", ["OP"], "F", "https://i.ibb.co/P5ZjgfG/M.png", 1400, "S"),
            new charInfo("Miss Father's Day", [], "One Piece", ["OP"], "F", "https://i.ibb.co/pj3ZR97/image.png", 1401, "D"),
            new charInfo("Miss Goldenweek", [], "One Piece", ["OP"], "F", "https://i.ibb.co/b1H4PH1/image.png", 1402, "D"),
            new charInfo("Miss Merry Christmas", [], "One Piece", ["OP"], "F", "https://i.ibb.co/Vg4JzKf/image.png", 1403, "D"),
            new charInfo("Miss Monday", [], "One Piece", ["OP"], "F", "https://i.ibb.co/xLSCFfc/image.png", 1404, "D"),
            new charInfo("Miss Valentine", [], "One Piece", ["OP"], "F", "https://i.ibb.co/nM4W8tF/image.png", 1405, "C"),
            new charInfo("Miyagi (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/XtC3ms1/image.png", 1406, "D"),
            new charInfo("Mocha", [], "One Piece", ["OP"], "F", "https://i.ibb.co/fD5dwsD/image.png", 1407, "D"),
            new charInfo("Moda", [], "One Piece", ["OP"], "F", "https://i.ibb.co/PTFzjv2/image.png", 1408, "C"),
            new charInfo("Mohji", [], "One Piece", ["OP"], "M", "https://i.ibb.co/QHrLxnx/image.png", 1409, "D"),
            new charInfo("Momonga (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/VMsK2cs/image.png", 1410, "C"),
            new charInfo("Monjii", [], "One Piece", ["OP"], "M", "https://i.ibb.co/qNgyJKr/image.png", 1411, "D"),
            new charInfo("Garp", ["Monkey D. Garp"], "One Piece", ["OP"], "M", "https://i.ibb.co/t2hgvtg/image.png", 1412, "B"),
            new charInfo("Dragon", ["Monkey D. Dragon"], "One Piece", ["OP"], "M", "https://i.ibb.co/nQfdHzC/image.png", 1413, "A"),
            new charInfo("Norland Montblanc", ["Montblanc Norland"], "One Piece", ["OP"], "M", "https://i.ibb.co/6PLyq6r/image.png", 1414, "B"),
            new charInfo("Cricket Montblanc", ["Montblanc Cricket"], "One Piece", ["OP"], "M", "https://i.ibb.co/4KWWyPT/image.png", 1415, "D"),
            new charInfo("Moodie", [], "One Piece", ["OP"], "F", "https://i.ibb.co/Sy3hV6Y/image.png", 1416, "D"),
            new charInfo("Morgan", [], "One Piece", ["OP"], "M", "https://i.ibb.co/ctqfYD2/image.png", 1417, "C"),
            new charInfo("Morgans", ["Big News Morgans", `"Big News" Morgans`], "One Piece", ["OP"], "M", "https://i.ibb.co/xMfrd2P/image.png", 1418, "C"),
            new charInfo("Morley", [], "One Piece", ["OP"], "M", "https://i.ibb.co/f8QZmdG/image.png", 1419, "D"),
            new charInfo("Morollon", [], "One Piece", ["OP"], "F", "https://i.ibb.co/tZ6mGFL/image.png", 1420, "D"),
            new charInfo("Mounblutain", ["Impostor Usopp", "Impostor Sogeking"], "One Piece", ["OP"], "M", "https://i.ibb.co/dDYDTK9/image.png", 1421, "D"),
            new charInfo("Mozambia", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Zz2Qrq6/image.png", 1422, "D"),
            new charInfo("Mozu", [], "One Piece", ["OP"], "F", "https://i.ibb.co/d73THc5/image.png", 1423, "D"),
            new charInfo("Ikaros Much", [], "One Piece", ["OP"], "M", "https://i.ibb.co/jvDV3x5/image.png", 1424, "D"),
            new charInfo("Mummy (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/8xGdQvb/image.png", 1425, "D"),
            new charInfo("Musse", [], "One Piece", ["OP"], "F", "https://i.ibb.co/mzk7z3Z/image.png", 1426, "C"),
            new charInfo("Myure", [], "One Piece", ["OP"], "F", "https://i.ibb.co/xftQKCd/image.png", 1427, "D"),
            new charInfo("Nako", [], "One Piece", ["OP"], "M", "https://i.ibb.co/JcwTVZn/image.png", 1428, "C"),
            new charInfo("Namur", [], "One Piece", ["OP"], "M", "https://i.ibb.co/6gbx7Ny/image.png", 1429, "D"),
            new charInfo("Sally Nantokanette", [], "One Piece", ["OP"], "F", "https://i.ibb.co/k6b40zt/image.png", 1430, "D"),
            new charInfo("Nefertari Vivi", ["Vivi Nefertari", "Miss Wednesday"], "One Piece", ["OP"], "F", "https://i.ibb.co/5h1fdP6/V.png", 1431, "S"),
            new charInfo("Nefertari Titi", ["Titi Nefertari"], "One Piece", ["OP"], "F", "https://i.ibb.co/fS5bkt1/6s70Cg7.png", 1432, "C"),
            new charInfo("Nefertari Cobra", ["Cobra Nefertari"], "One Piece", ["OP"], "M", "https://i.ibb.co/fkPTgjc/image.png", 1433, "C"),
            new charInfo("Maria Negikuma", [], "One Piece", ["OP"], "F", "https://i.ibb.co/Qmmf33d/image.png", 1434, "D"),
            new charInfo("Nekomamushi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/YQCZSvW/image.png", 1435, "B"),
            new charInfo("Neptune (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/zhdvgLD/image.png", 1436, "C"),
            new charInfo("Nerine", [], "One Piece", ["OP"], "F", "https://i.ibb.co/qrJTyGR/image.png", 1437, "D"),
            new charInfo("Nero (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/6m4VPr5/image.png", 1438, "D"),
            new charInfo("Nezumi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/hCn5Sy0/image.png", 1439, "D"),
            new charInfo("Nico Olvia", [], "One Piece", ["OP"], "F", "https://i.ibb.co/fvnw2sR/image.png", 1440, "B"),
            new charInfo("Nika", [], "One Piece", ["OP"], "F", "https://i.ibb.co/txvJdj9/image.png", 1441, "D"),
            new charInfo("Ninjin", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vVCpbZv/image.png", 1442, "D"),
            new charInfo("Nitro", [], "One Piece", ["OP"], "M", "https://i.ibb.co/ZKqDxq7/image.png", 1443, "D"),
            new charInfo("Noble Croc", [], "One Piece", ["OP"], "M", "https://i.ibb.co/61Y68zG/image.png", 1444, "D"),
            new charInfo("Nojiko", [], "One Piece", ["OP"], "F", "https://i.ibb.co/Z84Z9g0/image.png", 1445, "A"),
            new charInfo("Nora Gitsune", ["Imposter Chopper"], "One Piece", ["OP"], "M", "https://i.ibb.co/d5JcSYx/image.png", 1446, "D"),
            new charInfo("Nubon", [], "One Piece", ["OP"], "M", "https://i.ibb.co/jDNBxX1/image.png", 1447, "D"),
            new charInfo("Yainu Nugire", ["Nugire Yainu"], "One Piece", ["OP"], "M", "https://i.ibb.co/61s155N/image.png", 1448, "D"),
            new charInfo("O-Tsuru", [], "One Piece", ["OP"], "F", "https://i.ibb.co/NxWf3Wq/image.png", 1449, "D"),
            new charInfo("Tama", ["O-Tama", "oTama"], "One Piece", ["OP"], "F", "https://i.ibb.co/CnSGwSB/image.png", 1450, "C"),
            new charInfo("Oars", [], "One Piece", ["OP"], "M", "https://i.ibb.co/SN6SmBk/image.png", 1451, "D"),
            new charInfo("Octopako", [], "One Piece", ["OP"], "F", "https://i.ibb.co/4Yzsw84/image.png", 1452, "D"),
            new charInfo("Skybreeder Ohm", ["Ohm Skybreeder"], "One Piece", ["OP"], "M", "https://i.ibb.co/x56wd5s/image.png", 1453, "D"),
            new charInfo("Oimo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/sbzJR08/image.png", 1454, "D"),
            new charInfo("Kikunojo", ["Kiku", "O-Kiku", "Okiku"], "One Piece", ["OP"], "M", "https://i.ibb.co/0Cf9Pyy/rzMACQD.png", 1455, "B"),
            new charInfo("Onigumo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/CPLLLcL/image.png", 1456, "D"),
            new charInfo("Orlumbus", [], "One Piece", ["OP"], "M", "https://i.ibb.co/sRt879s/image.png", 1457, "D"),
            new charInfo("Otohime", [], "One Piece", ["OP"], "F", "https://i.ibb.co/Bc3Jh7R/image.png", 1458, "C"),
            new charInfo("Outlook III", [], "One Piece", ["OP"], "M", "https://i.ibb.co/NCycgKJ/image.png", 1459, "D"),
            new charInfo("Pagaya", [], "One Piece", ["OP"], "M", "https://i.ibb.co/HnyXKPN/image.png", 1460, "D"),
            new charInfo("Page One", ["Pay-Pay"], "One Piece", ["OP"], "M", "https://i.ibb.co/G2VByPn/VaL6hQY.png", 1461, "B"),
            new charInfo("Palms", [], "One Piece", ["OP"], "M", "https://i.ibb.co/gSTz3qF/image.png", 1462, "D"),
            new charInfo("Pandaman", [], "One Piece", ["OP"], "M", "https://i.ibb.co/3rstr5T/xhHZjTy.png", 1463, "C"),
            new charInfo("Papaneel", [], "One Piece", ["OP"], "M", "https://i.ibb.co/wKLcHL2/image.png", 1464, "D"),
            new charInfo("Pappug", [], "One Piece", ["OP"], "M", "https://i.ibb.co/xX32V32/image.png", 1465, "D"),
            new charInfo("Patty", [], "One Piece", ["OP"], "M", "https://i.ibb.co/dpL5Pvh/image.png", 1466, "D"),
            new charInfo("Paulie", [], "One Piece", ["OP"], "M", "https://i.ibb.co/HKRN164/image.png", 1467, "D"),
            new charInfo("Peachbeard", [], "One Piece", ["OP"], "M", "https://i.ibb.co/h27jWJx/image.png", 1468, "D"),
            new charInfo("Perona", ["Ghost Princess"], "One Piece", ["OP"], "F", "https://i.ibb.co/TcKv0MM/Perona.png", 1469, "A"),
            new charInfo("Pearl (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/NrYV87x/image.png", 1470, "D"),
            new charInfo("Drug Peclo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/FJTR8TW/image.png", 1471, "D"),
            new charInfo("Pedro", [], "One Piece", ["OP"], "M", "https://i.ibb.co/DbC5wFx/image.png", 1472, "B"),
            new charInfo("Peepley Lulu", [], "One Piece", ["OP"], "M", "https://i.ibb.co/PwzDYpm/image.png", 1473, "D"),
            new charInfo("Pekoms", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Zdh9s6m/image.png", 1474, "C"),
            new charInfo("Pell", ["Peru"], "One Piece", ["OP"], "M", "https://i.ibb.co/YPNJNcP/image.png", 1475, "C"),
            new charInfo("Penguin (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/YjrVKNp/image.png", 1476, "C"),
            new charInfo("Peppoko", [], "One Piece", ["OP"], "M", "https://i.ibb.co/PjfB1nK/image.png", 1477, "D"),
            new charInfo("Peterman", [], "One Piece", ["OP"], "M", "https://i.ibb.co/9r28tXN/image.png", 1478, "D"),
            new charInfo("Pica", [], "One Piece", ["OP"], "M", "https://i.ibb.co/wMmw2xQ/image.png", 1479, "C"),
            new charInfo("Pickles", [], "One Piece", ["OP"], "M", "https://i.ibb.co/j9CZbGh/image.png", 1480, "D"),
            new charInfo("Pepper", ["Piiman"], "One Piece", ["OP"], "M", "https://i.ibb.co/8mfmF9b/image.png", 1481, "D"),
            new charInfo("Avalo Pizarro", [], "One Piece", ["OP"], "M", "https://i.ibb.co/GdTZ85f/image.png", 1482, "C"),
            new charInfo("Poppoko", [], "One Piece", ["OP"], "M", "https://i.ibb.co/LnBTn4Y/image.png", 1483, "D"),
            new charInfo("Porche", [], "One Piece", ["OP"], "F", "https://i.ibb.co/vs0LwVC/image.png", 1484, "C"),
            new charInfo("Porchemy", [], "One Piece", ["OP"], "M", "https://i.ibb.co/yyBcj4S/image.png", 1485, "D"),
            new charInfo("Poro", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Z1PYFHc/image.png", 1486, "D"),
            new charInfo("Ramba", [], "One Piece", ["OP"], "M", "https://i.ibb.co/KDcGx43/image.png", 1487, "D"),
            new charInfo("Rampo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/W53dRDZ/image.png", 1488, "D"),
            new charInfo("Potsun", [], "One Piece", ["OP"], "M", "https://i.ibb.co/fCSM2qx/image.png", 1489, "D"),
            new charInfo("Pound", [], "One Piece", ["OP"], "M", "https://i.ibb.co/2jCM3rn/image.png", 1490, "D"),
            new charInfo("Prometheus", [], "One Piece", ["OP"], "M", "https://i.ibb.co/RjcPGcd/image.png", 1491, "D"),
            new charInfo("Pudding Pudding", [], "One Piece", ["OP"], "M", "https://i.ibb.co/BsXSM4K/image.png", 1492, "D"),
            new charInfo("Queen", [], "One Piece", ["OP"], "M", "https://i.ibb.co/85ZXGkC/image.png", 1493, "B"),
            new charInfo("Raideen", [], "One Piece", ["OP"], "M", "https://i.ibb.co/ZXRDShP/image.png", 1494, "D"),
            new charInfo("Raijin", [], "One Piece", ["OP"], "M", "https://i.ibb.co/yhcQ7kb/image.png", 1495, "D"),
            new charInfo("Raizou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/kqyS34q/mY6zAny.png", 1496, "C"),
            new charInfo("Rakuda", [], "One Piece", ["OP"], "M", "https://i.ibb.co/59xF677/image.png", 1497, "D"),
            new charInfo("Rakuyou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/2Fvm4WV/image.png", 1498, "C"),
            new charInfo("Portgas D. Rouge", ["Rouge"], "One Piece", ["OP"], "F", "https://i.ibb.co/cQZmXXf/R.png", 1499, "A"),
            new charInfo("Portgas D. Ace", ["Ace"], "One Piece", ["OP"], "M", "https://i.ibb.co/XSnRfXR/Ace.png", 1500, "SS"),
            new charInfo("Ran (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/R4dVfSt/image.png", 1501, "D"),
            new charInfo("Randolph", [], "One Piece", ["OP"], "M", "https://i.ibb.co/c84Chz1/image.png", 1502, "D"),
            new charInfo("Rebecca", [], "One Piece", ["OP"], "F", "https://i.ibb.co/12ctyxf/wWTgzsT.png", 1503, "S"),
            new charInfo("Richie", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7jdgBrR/image.png", 1504, "D"),
            new charInfo("Rika (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/qNhP6Cr/image.png", 1505, "D"),
            new charInfo("Riku Doldo III", [], "One Piece", ["OP"], "M", "https://i.ibb.co/8rLsD3K/R.png", 1506, "D"),
            new charInfo("Rindou", [], "One Piece", ["OP"], "F", "https://i.ibb.co/7YR19pm/image.png", 1507, "D"),
            new charInfo("Tegata Ringana", [], "One Piece", ["OP"], "M", "https://i.ibb.co/68FMHSZ/image.png", 1508, "D"),
            new charInfo("Ripper", [], "One Piece", ["OP"], "M", "https://i.ibb.co/q5CprSw/image.png", 1509, "C"),
            new charInfo("Ririka", [], "One Piece", ["OP"], "F", "https://i.ibb.co/wNXMt2Q/image.png", 1510, "D"),
            new charInfo("Rivers", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vdSmsSd/image.png", 1511, "D"),
            new charInfo("Rob Lucci", [], "One Piece", ["OP"], "M", "https://i.ibb.co/XC6nk8p/image.png", 1512, "B"),
            new charInfo("Rockstar", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Vx2GVzh/image.png", 1513, "D"),
            new charInfo("Roddy", [], "One Piece", ["OP"], "M", "https://i.ibb.co/MsqPJ8V/image.png", 1514, "D"),
            new charInfo("Sabo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/rkyJtGd/Sabo.png", 1515, "S"),
            new charInfo("Rodo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/8YBVs3Y/R.png", 1516, "D"),
            new charInfo("Rokkaku", [], "One Piece", ["OP"], "M", "https://i.ibb.co/ysQjjkm/image.png", 1517, "D"),
            new charInfo("Ronse", [], "One Piece", ["OP"], "M", "https://i.ibb.co/6FF0WSR/image.png", 1518, "D"),
            new charInfo("Roshio", [], "One Piece", ["OP"], "M", "https://i.ibb.co/1GyNzRB/image.png", 1519, "D"),
            new charInfo("Ross", [], "One Piece", ["OP"], "M", "https://i.ibb.co/CQYK7hs/image.png", 1520, "D"),
            new charInfo("Roswald", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Fsnvvh0/image.png", 1521, "D"),
            new charInfo("Nelson Royal", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Yb11HWJ/image.png", 1522, "D"),
            new charInfo("Ryuuboshi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/3TPyFqJ/image.png", 1523, "C"),
            new charInfo("Ryuma", ["Ryuuma"], "One Piece", ["OP"], "M", "https://i.ibb.co/fx0gGdd/R.png", 1524, "B"),
            new charInfo("Sadi", [], "One Piece", ["OP"], "F", "https://i.ibb.co/1G4HN9J/image.png", 1525, "C"),
            new charInfo("Don Sai", [], "One Piece", ["OP"], "M", "https://i.ibb.co/q9hytBK/image.png", 1526, "C"),
            new charInfo("Akainu", ["Sakazuki"], "One Piece", ["OP"], "M", "https://i.ibb.co/3F3Zfp0/image.png", 1527, "A"),
            new charInfo("Saldeath", ["Saru Desu"], "One Piece", ["OP"], "M", "https://i.ibb.co/s1zJhLP/image.png", 1528, "D"),
            new charInfo("Sancrin", [], "One Piece", ["OP"], "M", "https://i.ibb.co/R07PHyX/image.png", 1529, "D"),
            new charInfo("Sanjuan Wolf", [], "One Piece", ["OP"], "M", "https://i.ibb.co/gJMscMF/image.png", 1530, "C"),
            new charInfo("Sanka", [], "One Piece", ["OP"], "F", "https://i.ibb.co/GtmhM1g/image.png", 1531, "D"),
            new charInfo("Sapi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/C2VKnD3/image.png", 1532, "D"),
            new charInfo("Sarahebi", [], "One Piece", ["OP"], "F", "https://i.ibb.co/qJLFdsZ/image.png", 1533, "D"),
            new charInfo("Sarkies", [], "One Piece", ["OP"], "M", "https://i.ibb.co/9GRzbwP/image.png", 1534, "D"),
            new charInfo("Sasaki (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/4mjgphR/VHryjMs.png", 1535, "B"),
            new charInfo("Scarlett", [], "One Piece", ["OP"], "F", "https://i.ibb.co/3pkczpV/pcPUC90.png", 1536, "C"),
            new charInfo("Scotch", [], "One Piece", ["OP"], "M", "https://i.ibb.co/bNkvcNR/image.png", 1537, "D"),
            new charInfo("Scratchmen Apoo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Ykd3sTx/image.png", 1538, "C"),
            new charInfo("Seamars", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Zg7f7t7/image.png", 1539, "D"),
            new charInfo("Seira", [], "One Piece", ["OP"], "F", "https://i.ibb.co/4gPw4z3/image.png", 1540, "D"),
            new charInfo("Sengoku", [], "One Piece", ["OP"], "M", "https://i.ibb.co/88yHqcS/image.png", 1541, "A"),
            new charInfo("Senor Pink", [], "One Piece", ["OP"], "M", "https://i.ibb.co/WFHmPBc/image.png", 1542, "A"),
            new charInfo("Sentoumaru", [], "One Piece", ["OP"], "M", "https://i.ibb.co/VNzFtY2/image.png", 1543, "B"),
            new charInfo("Seto", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7zHs2dm/image.png", 1544, "D"),
            new charInfo("Shachi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Mpb7Xfg/image.png", 1545, "C"),
            new charInfo("Shakuyaku", ["Shakky"], "One Piece", ["OP"], "M", "https://i.ibb.co/LrkghZM/image.png", 1546, "D"),
            new charInfo("Sham", [], "One Piece", ["OP"], "M", "https://i.ibb.co/chJYS8k/image.png", 1547, "D"),
            new charInfo("Shalria", ["Shalulia", "Shaluria"], "One Piece", ["OP"], "F", "https://i.ibb.co/d0p5c2K/S.png", 1548, "D"),
            new charInfo("Sheepshead", [], "One Piece", ["OP"], "M", "https://i.ibb.co/RbZkMgF/image.png", 1549, "D"),
            new charInfo("Shanks", [], "One Piece", ["OP"], "M", "https://i.ibb.co/qJdQ1Mb/image.png", 1550, "SS"),
            new charInfo("Shiryu", ["Shiliew"], "One Piece", ["OP"], "M", "https://i.ibb.co/S3H6FgT/image.png", 1551, "B"),
            new charInfo("Detamaruka Shin", [], "One Piece", ["OP"], "F", "https://i.ibb.co/kMJtxWR/image.png", 1552, "D"),
            new charInfo("Shinobu (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/MDwfgh1/image.png", 1553, "C"),
            new charInfo("Shioyaki", [], "One Piece", ["OP"], "M", "https://i.ibb.co/HC4VM6d/image.png", 1554, "D"),
            new charInfo("Shiki", ["Golden Lion"], "One Piece", ["OP"], "M", "https://i.ibb.co/zScc2zJ/image.png", 1555, "B"),
            new charInfo("Shirahoshi", [], "One Piece", ["OP"], "F", "https://i.ibb.co/jkKPtWG/S.png", 1556, "S"),
            new charInfo("Shot Vasco", [], "One Piece", ["OP"], "M", "https://i.ibb.co/6Jq4BwC/image.png", 1557, "D"),
            new charInfo("Shoujou", [], "One Piece", ["OP"], "M", "https://i.ibb.co/RBjbrs3/image.png", 1558, "D"),
            new charInfo("Shura", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7tSDS5L/image.png", 1559, "D"),
            new charInfo("Shutenmaru", ["Ashura Doji (OP)"], "One Piece", ["OP"], "M", "https://i.ibb.co/1Xh0Cjz/image.png", 1560, "B"),
            new charInfo("Sharley", ["Shyarly"], "One Piece", ["OP"], "F", "https://i.ibb.co/R24mp4q/image.png", 1561, "B"),
            new charInfo("Sicilian", [], "One Piece", ["OP"], "M", "https://i.ibb.co/q9dx0N5/image.png", 1562, "C"),
            new charInfo("Silvers Rayleigh", ["Rayleigh", "Dark King"], "One Piece", ["OP"], "M", "https://i.ibb.co/ncYZw6n/S.png", 1563, "S"),
            new charInfo("Smoker", [], "One Piece", ["OP"], "M", "https://i.ibb.co/G97ckPT/image.png", 1564, "A"),
            new charInfo("Solitaire", [], "One Piece", ["OP"], "F", "https://i.ibb.co/rH940Jw/image.png", 1565, "D"),
            new charInfo("Spandam", [], "One Piece", ["OP"], "M", "https://i.ibb.co/z2V2G5y/image.png", 1566, "C"),
            new charInfo("Spandine", [], "One Piece", ["OP"], "M", "https://i.ibb.co/J7gS63k/image.png", 1567, "D"),
            new charInfo("Speed", [], "One Piece", ["OP"], "F", "https://i.ibb.co/tYs689J/image.png", 1568, "C"),
            new charInfo("Stussy", [], "One Piece", ["OP"], "F", "https://i.ibb.co/1MtjyTb/image.png", 1569, "C"),
            new charInfo("Speed Jiru", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Ryn1DJm/image.png", 1570, "D"),
            new charInfo("Squard", [], "One Piece", ["OP"], "M", "https://i.ibb.co/4ST0kMW/image.png", 1571, "C"),
            new charInfo("Stainless", [], "One Piece", ["OP"], "M", "https://i.ibb.co/dPPm8x9/image.png", 1572, "C"),
            new charInfo("Stelly", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vZdWK7c/image.png", 1573, "D"),
            new charInfo("Stool", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7VyNHxx/image.png", 1574, "D"),
            new charInfo("Strawberry", [], "One Piece", ["OP"], "M", "https://i.ibb.co/ynH1MNk/image.png", 1575, "D"),
            new charInfo("Streusen", [], "One Piece", ["OP"], "M", "https://i.ibb.co/NCf4ZXx/image.png", 1576, "C"),
            new charInfo("Sugar", [], "One Piece", ["OP"], "F", "https://i.ibb.co/TLPn5tb/image.png", 1577, "B"),
            new charInfo("Suleiman", [], "One Piece", ["OP"], "M", "https://i.ibb.co/yBYWnVh/image.png", 1578, "D"),
            new charInfo("Sweet Pea", [], "One Piece", ["OP"], "F", "https://i.ibb.co/42s5K42/image.png", 1579, "D"),
            new charInfo("T-Bone", ["T Bone"], "One Piece", ["OP"], "M", "https://i.ibb.co/1rMQ6hC/image.png", 1580, "D"),
            new charInfo("Taco", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Vgyd3MQ/image.png", 1581, "D"),
            new charInfo("Take", [], "One Piece", ["OP"], "M", "https://i.ibb.co/BVw2H5W/image.png", 1582, "D"),
            new charInfo("Tamachibi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/pKTBKMz/image.png", 1583, "D"),
            new charInfo("Baron Tamago", [], "One Piece", ["OP"], "M", "https://i.ibb.co/XztCP92/image.png", 1584, "C"),
            new charInfo("Tamanegi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Qdb6M7m/image.png", 1585, "D"),
            new charInfo("Tashigi", [], "One Piece", ["OP"], "F", "https://i.ibb.co/2P3FH3j/image.png", 1586, "A"),
            new charInfo("Terracotta", [], "One Piece", ["OP"], "F", "https://i.ibb.co/GT60Kdc/image.png", 1587, "D"),
            new charInfo("Terry (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/BzNj760/image.png", 1588, "D"),
            new charInfo("Lucas Thalassa", ["Thalassa Lucas"], "One Piece", ["OP"], "M", "https://i.ibb.co/2g2vWd3/image.png", 1589, "D"),
            new charInfo("Thatch", [], "One Piece", ["OP"], "M", "https://i.ibb.co/TgzyQgn/image.png", 1590, "C"),
            new charInfo("Tibany", [], "One Piece", ["OP"], "M", "https://i.ibb.co/XzKbDPP/image.png", 1591, "D"),
            new charInfo("Tilestone", [], "One Piece", ["OP"], "M", "https://i.ibb.co/YhqcJpB/image.png", 1592, "D"),
            new charInfo("Tokikake", [], "One Piece", ["OP"], "M", "https://i.ibb.co/TTJJYD7/image.png", 1593, "D"),
            new charInfo("Toko", ["O-Toko", "oToko", "O Toko"], "One Piece", ["OP"], "F", "https://i.ibb.co/VDhj3GD/image.png", 1594, "C"),
            new charInfo("Tom (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Y36QSc2/image.png", 1595, "C"),
            new charInfo("Tonjit", [], "One Piece", ["OP"], "M", "https://i.ibb.co/89Nt5pt/image.png", 1596, "D"),
            new charInfo("Tonoyasu", ["Yasu (OP)", "Shimotsuki Yasuie", "Yasuie Shimotsuki"], "One Piece", ["OP"], "M", "https://i.ibb.co/yBrmQrZ/image.png", 1597, "C"),
            new charInfo("Toto (OP)", [], "One Piece", ["OP"], "M", "https://i.ibb.co/b3B0HL8/image.png", 1598, "D"),
            new charInfo("Trebol", [], "One Piece", ["OP"], "M", "https://i.ibb.co/vH1RmPn/image.png", 1599, "D"),
            new charInfo("Trafalgar Law", ["Trafalgar D. Water Law", "Law Trafalgar"], "One Piece", ["OP"], "M", "https://i.ibb.co/GnjPwsd/Tra.png", 1600, "S"),
            new charInfo("Tristan", [], "One Piece", ["OP"], "F", "https://i.ibb.co/pwjSTjG/image.png", 1601, "D"),
            new charInfo("Tsuru", [], "One Piece", ["OP"], "F", "https://i.ibb.co/G2m5Fvc/image.png", 1602, "C"),
            new charInfo("Turco", ["Impostor Franky"], "One Piece", ["OP"], "M", "https://i.ibb.co/HT0NL7m/image.png", 1603, "D"),
            new charInfo("Ukkari", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Lgt1K4S/image.png", 1604, "D"),
            new charInfo("Ulti", [], "One Piece", ["OP"], "F", "https://i.ibb.co/pnzVc1g/U.png", 1605, "A"),
            new charInfo("Umit", [], "One Piece", ["OP"], "M", "https://i.ibb.co/TMS2K8X/image.png", 1606, "D"),
            new charInfo("Urashima", [], "One Piece", ["OP"], "M", "https://i.ibb.co/WgckNCk/image.png", 1607, "D"),
            new charInfo("Urouge", ["Mad Monk"], "One Piece", ["OP"], "M", "https://i.ibb.co/kgMWxB4/image.png", 1608, "D"),
            new charInfo("Van Augur", ["Augur Van"], "One Piece", ["OP"], "M", "https://i.ibb.co/9NvqGYk/image.png", 1609, "C"),
            new charInfo("Vander Decken IX", [], "One Piece", ["OP"], "M", "https://i.ibb.co/K95r9CR/image.png", 1610, "D"),
            new charInfo("Vegapunk", [], "One Piece", ["OP"], "M", "https://i.ibb.co/c8yYsvb/image.png", 1611, "B"),
            new charInfo("Vergo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/x8FqY1F/image.png", 1612, "B"),
            new charInfo("Victoria Cindry", ["Cindry Victoria"], "One Piece", ["OP"], "F", "https://i.ibb.co/jVQL3KN/image.png", 1613, "C"),
            new charInfo("Vinsmoke Sora", ["Sora Vinsmoke"], "One Piece", ["OP"], "F", "https://i.ibb.co/CBr2Y5X/image.png", 1614, "C"),
            new charInfo("Vinsmoke Ichiji", ["Ichiji Vinsmoke", "Sparking Red"], "One Piece", ["OP"], "M", "https://i.ibb.co/FXB50f4/image.png", 1615, "B"),
            new charInfo("Vinsmoke Reiju", ["Reiju Vinsmoke", "Poison Pink"], "One Piece", ["OP"], "F", "https://i.ibb.co/s6tWQhf/R.png", 1616, "S"),
            new charInfo("Vinsmoke Niji", ["Niji Vinsmoke", "Dengeki Blue"], "One Piece", ["OP"], "M", "https://i.ibb.co/PxbkCw3/image.png", 1617, "B"),
            new charInfo("Vinsmoke Yonji", ["Yonji Vinsmoke", "Winch Green"], "One Piece", ["OP"], "M", "https://i.ibb.co/yh0sQMd/image.png", 1618, "B"),
            new charInfo("Vinsmoke Judge", ["Judge Vinsmoke"], "One Piece", ["OP"], "M", "https://i.ibb.co/TT9SpXw/image.png", 1619, "C"),
            new charInfo("Viola", ["Violet (OP)"], "One Piece", ["OP"], "F", "https://i.ibb.co/X24QMJ4/GCsY5zv.png", 1620, "A"),
            new charInfo("Vista", [], "One Piece", ["OP"], "M", "https://i.ibb.co/M6RMSYL/image.png", 1621, "C"),
            new charInfo("Vito", [], "One Piece", ["OP"], "M", "https://i.ibb.co/yFpZr6v/image.png", 1622, "C"),
            new charInfo("Wadatsumi", ["Onyudo"], "One Piece", ["OP"], "M", "https://i.ibb.co/8Dx0TGH/image.png", 1623, "D"),
            new charInfo("Wanda", [], "One Piece", ["OP"], "F", "https://i.ibb.co/fnXgYRH/image.png", 1624, "C"),
            new charInfo("Wanze", [], "One Piece", ["OP"], "M", "https://i.ibb.co/qsQLgv9/image.png", 1625, "D"),
            new charInfo("Wapol", [], "One Piece", ["OP"], "M", "https://i.ibb.co/J3NsqSX/image.png", 1626, "C"),
            new charInfo("Whitey Bay", [], "One Piece", ["OP"], "F", "https://i.ibb.co/Lr3QFZ6/image.png", 1627, "C"),
            new charInfo("Who's Who", ["Whos Who"], "One Piece", ["OP"], "M", "https://i.ibb.co/Rjy1rxj/w.png", 1628, "B"),
            new charInfo("Wicca", [], "One Piece", ["OP"], "F", "https://i.ibb.co/n17sKrZ/image.png", 1629, "D"),
            new charInfo("Wiper", [], "One Piece", ["OP"], "M", "https://i.ibb.co/7CGS9QM/image.png", 1630, "D"),
            new charInfo("Wire", [], "One Piece", ["OP"], "M", "https://i.ibb.co/HgDVdyk/image.png", 1631, "D"),
            new charInfo("Woop Slap", [], "One Piece", ["OP"], "M", "https://i.ibb.co/k21410S/image.png", 1632, "C"),
            new charInfo("X. Drake", ["X-Drake", "X Drake"], "One Piece", ["OP"], "M", "https://i.ibb.co/tHVXBdC/image.png", 1633, "B"),
            new charInfo("Rocks D. Xebec", [], "One Piece", ["OP"], "M", "https://i.ibb.co/wZn0b0n/image.png", 1634, "B"),
            new charInfo("Yama", [], "One Piece", ["OP"], "M", "https://i.ibb.co/Twc06VC/image.png", 1635, "D"),
            new charInfo("Yamakaji", [], "One Piece", ["OP"], "M", "https://i.ibb.co/k6q5t8w/image.png", 1636, "D"),
            new charInfo("Yarisugi", [], "One Piece", ["OP"], "M", "https://i.ibb.co/st3JWMF/image.png", 1637, "D"),
            new charInfo("Yasopp", [], "One Piece", ["OP"], "M", "https://i.ibb.co/BcVxthP/image.png", 1638, "B"),
            new charInfo("Yorki", [], "One Piece", ["OP"], "M", "https://i.ibb.co/WBkmtF5/image.png", 1639, "D"),
            new charInfo("Yamato", [], "One Piece", ["OP"], "F", "https://i.ibb.co/rMfLG2X/Y.png", 1640, "S"),
            new charInfo("Yonka", [], "One Piece", ["OP"], "F", "https://i.ibb.co/fvCZBcR/image.png", 1641, "D"),
            new charInfo("Yonka Two", [], "One Piece", ["OP"], "F", "https://i.ibb.co/8brmMCr/image.png", 1642, "D"),
            new charInfo("Yosaku", [], "One Piece", ["OP"], "M", "https://i.ibb.co/mz9q2hX/image.png", 1643, "C"),
            new charInfo("Yuki (OP)", [], "One Piece", ["OP"], "F", "https://i.ibb.co/8zqZDQ2/image.png", 1644, "D"),
            new charInfo("Zala", ["Miss Doublefinger"], "One Piece", ["OP"], "F", "https://i.ibb.co/LCtWkx4/image.png", 1645, "D"),
            new charInfo("Zambai", [], "One Piece", ["OP"], "M", "https://i.ibb.co/bRnt3Cc/image.png", 1646, "D"),
            new charInfo("Zeff", [], "One Piece", ["OP"], "M", "https://i.ibb.co/J2mYKQs/image.png", 1647, "B"),
            new charInfo("Zeo", [], "One Piece", ["OP"], "M", "https://i.ibb.co/SfPWYqR/image.png", 1648, "D"),
            new charInfo("Zeus", [], "One Piece", ["OP"], "M", "https://i.ibb.co/J7n2sz3/image.png", 1649, "C"),
            new charInfo("L", ["Ryuzaki", "Lawliet L", "L Lawliet"], "Death Note", ["DN"], "M", "https://i.ibb.co/Xyjs1f2/dtzzNYn.png", 1650, "S"), 
            new charInfo("Light Yagami", ["Kira", "Yagami Light"], "Death Note", ["DN"], "M", "https://i.ibb.co/rtDwwgc/K.png", 1651, "S"),
            new charInfo("Ryuk", [""], "Death Note", ["DN"], "M", "https://i.ibb.co/YjRvsKn/lmyUlFg.png", 1652, "B"),
            new charInfo("Yagami Souichirou", ["Yagami Soichiro"], "Death Note", ["DN"], "M", "https://i.ibb.co/42wMBQV/MDb13e4.png", 1653, "C"),
            new charInfo("Amane Misa", [], "Death Note", ["DN"], "F", "https://i.ibb.co/vPTjY02/ScXBhaj.png", 1654, "A"),
            new charInfo("Mello", ["M (DN)", "Keehl Mihael"], "Death Note", ["DN"], "M", "https://i.ibb.co/ncLtdB5/x1MghPz.png", 1655, "B"),
            new charInfo("Rem (DN)", [], "Death Note", ["DN"], "F", "https://i.ibb.co/zs9K23K/eJBliTF.png", 1656, "D"), 
            new charInfo("Sayu Yagami", ["Yagami Sayu"], "Death Note", ["DN"], "F", "https://i.ibb.co/8M3QrqX/EZBF4nC.png", 1657, "C"),
            new charInfo("Near", ["Nate River", "N (DN)"], "Death Note", ["DN"], "M", "https://i.ibb.co/z8R2rVf/xOY7QoQ.png", 1658, "A"),
            new charInfo("Misora Naomi", [], "Death Note", ["DN"], "F", "https://i.ibb.co/87FY5K1/7B2rlmu.png", 1659, "D"),
            new charInfo("Matsuda Touta", [], "Death Note", ["DN"], "M", "https://i.ibb.co/wB0Y8RP/m8F5zGJ.png", 1660, "D"),
            new charInfo("Mikami Teru", [], "Death Note", ["DN"], "M", "https://i.ibb.co/SQDG1Zz/w8UwihH.png", 1661, "C"),
            new charInfo("Takada Kiyomi", [], "Death Note", ["DN"], "F", "https://i.ibb.co/31DCHP4/glJweEq.png", 1662, "D"),
            new charInfo("Penber Raye", [], "Death Note", ["DN"], "M", "https://i.ibb.co/Jpbp1Q5/APYxRhb.png", 1663, "D"),
            new charInfo("Cheng Xiaoshi", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/mtgCB5q/OtbOA4x.png", 1664, "S"),
            new charInfo("Lu Guang", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/rvwkVfM/fQKlH4W.png", 1665, "S"),
            new charInfo("Qiao Ling", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "F", "https://i.ibb.co/9vnW50T/image.png", 1666, "A"),
            new charInfo("Chen Bin", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/QrYrnWZ/C.png", 1667, "D"),
            new charInfo("Chen Xiao", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/KNFv47S/x.png", 1668, "C"),
            new charInfo("Emma (LC)", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "F", "https://i.ibb.co/71TWXsz/E.png", 1669, "B"),
            new charInfo("Dong Yi", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/pzk2yd2/d.png", 1670, "C"),
            new charInfo("Dou Dou", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/8xmmXwL/d.png", 1671, "D"),
            new charInfo("Liang", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/q9W8dbv/l.png", 1672, "D"),
            new charInfo("Lin Zhen", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "F", "https://i.ibb.co/XX0PS6b/a.png", 1673, "C"),
            new charInfo("Liu Meng", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "F", "https://i.ibb.co/bdFtbgM/l.png", 1674, "B"),
            new charInfo("Liu Min", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/CsJ35kj/l.png", 1675, "B"),
            new charInfo("Liu Siwen", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/d2vMS5B/l.png", 1676, "D"),
            new charInfo("Lu Hongbin", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/mFXRTsk/l.png", 1677, "C"),
            new charInfo("Mei Piyan", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "F", "https://i.ibb.co/QXd4vBt/m.png", 1678, "D"),
            new charInfo("Xiao Li", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/QvwLMp2/x.png", 1679, "B"),
            new charInfo("Xu Shanshan", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "F", "https://i.ibb.co/sjKYjxS/x.png", 1680, "A"),
            new charInfo("Yu Xia", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "F", "https://i.ibb.co/CPJNmxZ/x.png", 1681, "D"),
            new charInfo("Zhu", [], "Link Click", ["Shiguang Dailiren", "Shi Guang Dai Li Ren", "LC"], "M", "https://i.ibb.co/WGrzR5H/s.png", 1682, "D"),
            new charInfo("Hiroshi Odokawa", ["Odokawa Hiroshi"], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/7RY6tt0/iYzN852.png", 1683, "A"),
            new charInfo("Ayumu Gouriki", ["Gouriki Ayumu"], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/3cfJFSq/dgU6UDA.png", 1684, "B"),
            new charInfo("Koshiro Daimon", ["Little Daimon"], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/Fn3qDmc/0EG4bDS.png", 1685, "C"),
            new charInfo("Kenshiro Daimon", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/5BqmjW3/Gkp39iV.jpg", 1686, "C"),
            new charInfo("Fuyuki Yamamoto", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/3pmmrxS/EjgseFM.png", 1687, "B"),
            new charInfo("Shiho Ichimura", [], "Odd Taxi", ["ODDTAXI"], "F", "https://i.ibb.co/6WvHPWp/XlZQOEj.png", 1688, "C"),
            new charInfo("Rui Nikaido", [], "Odd Taxi", ["ODDTAXI"], "F", "https://i.ibb.co/VHjTJrC/wvAMCQx.png", 1689, "B"),
            new charInfo("Miho Shirakawa", [], "Odd Taxi", ["ODDTAXI"], "F", "https://i.ibb.co/TL6vBKb/H6N1ApC.png", 1690, "A"),
            new charInfo("Kensuke Shibagaki", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/ww2V5CX/EjPYJeS.png", 1691, "D"),
            new charInfo("Shun Imai", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/q1w8DHV/Nv5jqi6.png", 1692, "C"),
            new charInfo("Dobu", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/C7TLtjk/Y6IBDdD.png", 1693, "B"),
            new charInfo("Yuki Mitsuya", [], "Odd Taxi", ["ODDTAXI"], "F", "https://i.ibb.co/ZxLtH1T/Ol7NHCy.png", 1694, "D"),
            new charInfo("Atsuya Baba", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/H4s5s1B/TGzzh6V.png", 1695, "D"),
            new charInfo("Haruhito Yano", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/P6GGxX8/q4VIYxt.png", 1696, "C"),
            new charInfo("Hajime Tanaka", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/VqrFb5X/UndTkY2.png", 1697, "D"),
            new charInfo("Togo Sekiguchi", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/VLJ2nky/2cfFA0a.png", 1698, "D"),
            new charInfo("Eiji Kakihana", [], "Odd Taxi", ["ODDTAXI"], "M", "https://i.ibb.co/5FFvWLr/5nM8JtU.png", 1699, "C"),
            new charInfo("Maquia", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "F", "https://i.ibb.co/QfPHt6g/m.png", 1700, "S"),
            new charInfo("Leilia", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "F", "https://i.ibb.co/9pBGVYx/DYyTM9n.png", 1701, "A"),
            new charInfo("Ariel (Maquia)", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/ggXB1F4/eqhvwMT.png", 1702, "B"),
            new charInfo("Clim", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/H2xk9xk/6dLIIaL.png", 1703, "A"),
            new charInfo("Lang", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/gMGk2dv/6S1hctI.png", 1704, "B"),
            new charInfo("Medmel", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "F", "https://i.ibb.co/pZ9bVkb/B4GJzTv.png", 1705, "C"),
            new charInfo("Mido", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "F", "https://i.ibb.co/G7yKf57/Hhrxokt.png", 1706, "C"),
            new charInfo("Izol", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/TTfGkNJ/2GAhL1o.png", 1707, "D"),
            new charInfo("Barlow", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/TYNS1QD/FvaaSp5.png", 1708, "D"),
            new charInfo("Racine", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "F", "https://i.ibb.co/p0y0kJK/r.png", 1709, "C"),
            new charInfo("Darel", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/wddXmq1/image.png", 1710, "D"),
            new charInfo("Deol", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/6vrx8Cb/image.png", 1711, "D"),
            new charInfo("Dita", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "F", "https://i.ibb.co/ggX4cbL/image.png", 1712, "C"),
            new charInfo("Hazel (Maquia)", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/2PfBb96/image.png", 1713, "D"),
            new charInfo("Mezarte Ou", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/tBj7ChF/image.png", 1714, "D"),
            new charInfo("Miria", [], "Maquia", ["SayoAsa", "Sayonara no Asa ni Yakusoku no Hana wo Kazarou", "Maquia: When the Promised Flower Blooms"], "M", "https://i.ibb.co/1f9m5vJ/image.png", 1715, "D"),
            new charInfo("Gin", [], "Hotarubi no Mori e", ["HnMe", "The Light of a Firefly Forest", "Into the Forest of Fireflies"], "M", "https://i.ibb.co/fYy8Tn7/G.png", 1716, "A"),
            new charInfo("Hotaru Takegawa", ["Takegawa Hotaru"], "Hotarubi no Mori e", ["HnMe", "The Light of a Firefly Forest", "Into the Forest of Fireflies"], "F", "https://i.ibb.co/qCMh8B3/U24f9a3.png", 1717, "B"),
            new charInfo("Ryouta", [], "Hotarubi no Mori e", ["HnMe", "The Light of a Firefly Forest", "Into the Forest of Fireflies"], "M", "https://i.ibb.co/VCwcZVM/image.png", 1718, "D"),
            new charInfo("Rin", [], "Shelter", [], "F", "https://i.ibb.co/7yQ2PDr/jvdjbvz.png", 1719, "S"),
            new charInfo("Shigeru", [], "Shelter", [], "M", "https://i.ibb.co/7QXDPd0/image.png", 1720, "D"),
            new charInfo("Ignatius Alexius", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/S3LJYTc/image.png", 1721, "D"),
            new charInfo("Myron Alexius", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/mzhRrvk/image.png", 1722, "C"),
            new charInfo("Alon", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/d6NZR62/image.png", 1723, "D"),
            new charInfo("Amon", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/DVXB0dV/image.png", 1724, "C"),
            new charInfo("Sharrkan Amun-Ra", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/0qhCZHX/image.png", 1725, "B"),
            new charInfo("Armakan Amun-Ra", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/TKhgXVP/image.png", 1726, "D"),
            new charInfo("Mira Dianus Artemina", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/DbG3Kwq/image.png", 1727, "D"),
            new charInfo("Astaroth", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/LZfVBkJ/image.png", 1728, "D"),
            new charInfo("Bhrol", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/VBcSq3K/image.png", 1729, "D"),
            new charInfo("Sphintus Carmen", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/cCwwywd/image.png", 1730, "B"),
            new charInfo("Cassim", ["Kassim", "Kashim"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/HBKPStX/image.png", 1731, "B"),
            new charInfo("Choppo", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/QjwstwV/image.png", 1732, "D"),
            new charInfo("Clemens", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/gvgMPqW/image.png", 1733, "D"),
            new charInfo("Doron", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/q15fhDW/image.png", 1734, "D"),
            new charInfo("Drakon", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/nPnRCHw/image.png", 1735, "C"),
            new charInfo("Edda", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/kQ098FZ/image.png", 1736, "D"),
            new charInfo("Kin Gaku", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/qptsgJN/image.png", 1737, "D"),
            new charInfo("Garda", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/C8HKKzF/image.png", 1738, "D"),
            new charInfo("Hinahoho", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/JxgsGMg/image.png", 1739, "B"),
            new charInfo("Ithnan", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/j61jbqp/image.png", 1740, "C"),
            new charInfo("Jinjin", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/khMQ25Q/image.png", 1741, "D"),
            new charInfo("Junjun", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/5YPqd4T/image.png", 1742, "D"),
            new charInfo("Darius Leoxses", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/hFggHCp/image.png", 1743, "D"),
            new charInfo("Leraje", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/QmQ6jCP/image.png", 1744, "D"),
            new charInfo("Ramal Shambal", ["Shambal Ramal"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/Hg3rnpd/image.png", 1745, "D"),
            new charInfo("Margaret", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/qrjpXth/image.png", 1746, "D"),
            new charInfo("Matal Mogamett", ["Mogamett Matal"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/ncdXZHF/image.png", 1747, "D"),
            new charInfo("Muharaja", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/rdxzyW5/image.png", 1748, "D"),
            new charInfo("S Nando", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/V9FwgLW/image.png", 1749, "D"),
            new charInfo("L Nando", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/F4dDxWj/image.png", 1750, "D"),
            new charInfo("M Nando", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/3r6N9hF/image.png", 1751, "D"),
            new charInfo("Nero (Magi)", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/z63YN3H/image.png", 1752, "D"),
            new charInfo("Ugo", ["Uraltugo Noi Nueph"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/By0hNsG/image.png", 1753, "A"),
            new charInfo("Olba", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/dcv7SGq/image.png", 1754, "D"),
            new charInfo("Otto (Magi)", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/cvPc90F/image.png", 1755, "D"),
            new charInfo("Phenex", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/ZNKHrgz/image.png", 1756, "D"),
            new charInfo("Reirei", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/n0Sbm6W/image.png", 1757, "D"),
            new charInfo("Hakuyuu Ren", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/wL8cm9Q/image.png", 1758, "D"),
            new charInfo("Hakuren Ren", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/mh30Q1N/image.png", 1759, "D"),
            new charInfo("Koumei Ren", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/ggqgbwp/image.png", 1760, "C"),
            new charInfo("Seishuu Ri", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/Vm67nyS/image.png", 1761, "D"),
            new charInfo("Lin Sai", ["Sairin"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/WpWKz86/image.png", 1762, "D"),
            new charInfo("Sabhmad Saluja", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/S5NQ7Qn/image.png", 1763, "D"),
            new charInfo("Abhmad Saluja", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/8708NfR/image.png", 1764, "D"),
            new charInfo("Sana", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/d0yf0L1/image.png", 1765, "D"),
            new charInfo("Scheherazade", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/HVR4xnv/image.png", 1766, "A"),
            new charInfo("Irene Smirnoff", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/30ZSN8N/image.png", 1767, "C"),
            new charInfo("Yaqut", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/gJ59DXh/image.png", 1768, "D"),
            new charInfo("Toto", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/MDpVYNz/image.png", 1769, "B"),
            new charInfo("Yon", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/Z213F6d/image.png", 1770, "D"),
            new charInfo("Anise", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/BjqmxfS/image.png", 1771, "C"),
            new charInfo("Apollonius", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/r3JFq7K/image.png", 1772, "D"),
            new charInfo("Shaman Chagan", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/DrVTKvc/image.png", 1773, "D"),
            new charInfo("Barkak", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/JHP2LHq/image.png", 1774, "D"),
            new charInfo("Budel", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/qYBGJdg/image.png", 1775, "D"),
            new charInfo("Byoln", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/j5Y6xy2/image.png", 1776, "D"),
            new charInfo("Dolge", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/zh22Y6R/image.png", 1777, "D"),
            new charInfo("Ekaterina", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/m4HCvZT/image.png", 1778, "D"),
            new charInfo("Elizabeth (Magi)", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/xjdVjSn/image.png", 1779, "D"),
            new charInfo("Engi", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/4s8YJYB/image.png", 1780, "D"),
            new charInfo("Enshin", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/Lpfhx01/image.png", 1781, "D"),
            new charInfo("Entai", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/cDVNgHW/image.png", 1782, "D"),
            new charInfo("Zurmudd", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/cx6xTTs/image.png", 1783, "D"),
            new charInfo("Goltas", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/4YVm9S2/image.png", 1784, "D"),
            new charInfo("Imsisika", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/yYxGSfL/image.png", 1785, "D"),
            new charInfo("Isaac", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/9yGTYqb/image.png", 1786, "C"),
            new charInfo("Jamil", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/WBYZwNK/image.png", 1787, "C"),
            new charInfo("Mariam", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/7Gmn6dJ/image.png", 1788, "D"),
            new charInfo("Markkio", ["Banker"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/BTPtvkz/image.png", 1789, "D"),
            new charInfo("Nadja", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/JdzhqRm/image.png", 1790, "D"),
            new charInfo("Mina", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/0F6nDnN/image.png", 1791, "D"),
            new charInfo("Paimon (Magi)", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/1nBwjsF/image.png", 1792, "D"),
            new charInfo("Koutoku Ren", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/KDdqPXw/image.png", 1793, "D"),
            new charInfo("Seisyun Ri", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/J5CShXS/image.png", 1794, "C"),
            new charInfo("Ryosai", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/j5bpgKj/image.png", 1795, "D"),
            new charInfo("Rashid Saluja", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/prS2TC3/image.png", 1796, "D"),
            new charInfo("Tiare", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/MV1zyhn/image.png", 1797, "D"),
            new charInfo("Toya", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/2dS9Ffb/image.png", 1798, "C"),
            new charInfo("Zagan", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/PmDBXR1/image.png", 1799, "C"),
            new charInfo("Serendine Dikumenowlz du Parthevia", ["Seren"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/Pgjj9P5/s.png", 1800, "C"),
            new charInfo("Badr", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/4SHfpSn/image.png", 1801, "C"),
            new charInfo("Barbarossa", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/PzDK4fG/image.png", 1802, "D"),
            new charInfo("Darius", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/ZBQstPT/d.png", 1803, "D"),
            new charInfo("Zaynab", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/vDcJDv4/image.png", 1804, "D"),
            new charInfo("Esra", ["Esla"], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/4VQDKBS/image.png", 1805, "C"),
            new charInfo("Falan", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/NWPD2Jx/image.png", 1806, "D"),
            new charInfo("Mystras Leoxses", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/Njf0tR0/image.png", 1807, "B"),
            new charInfo("Mahad", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/cbg330h/image.png", 1808, "D"),
            new charInfo("Pipirika", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/ZT6CWvz/image.png", 1809, "C"),
            new charInfo("Rametoto", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/mqX9V3q/image.png", 1810, "D"),
            new charInfo("Rurumu", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "F", "https://i.ibb.co/r2YpzWF/image.png", 1811, "C"),
            new charInfo("Valefor", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/k4vZBFm/image.png", 1812, "D"),
            new charInfo("Vittel", [], "Magi", ["Magi: The Labyrinth of Magic", "Magi: The Kingdom of Magic"], "M", "https://i.ibb.co/MydNkZ7/v.png", 1813, "D"),
            new charInfo("Sayu Ogiwara", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "F", "https://i.ibb.co/s2wZy7H/2F8g8Zp.png", 1814, "S"),
            new charInfo("Yoshida", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "M", "https://i.ibb.co/6v2qtYv/x7gqwpE.png", 1815, "A"),
            new charInfo("Airi Gotou", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "F", "https://i.ibb.co/nshjpqp/i5M1u8p.png", 1816, "A"),
            new charInfo("Hashimoto", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "M", "https://i.ibb.co/JKxyQyc/XTis29i.png", 1817, "C"),
            new charInfo("Yuuko Masaka", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "F", "https://i.ibb.co/HxNQf9F/image.png", 1818, "C"),
            new charInfo("Yuzuha Mishima", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "F", "https://i.ibb.co/G74hh8C/VOjftSl.png", 1819, "B"),
            new charInfo("Issa Ogiwara", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "M", "https://i.ibb.co/tHHR9K2/image.png", 1820, "C"),
            new charInfo("Asami Yuuki", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "F", "https://i.ibb.co/GTf0V8h/acVmaYw.png", 1821, "B"),
            new charInfo("Kyouya Yaguchi", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "M", "https://i.ibb.co/qdJ8V1j/YWCcR7B.png", 1822, "D"),
            new charInfo("Ao Kanda", [], "Hige wo Soru", ["HigeHiro", "Hige wo Soru. Soshite Joshikousei wo Hirou.", "I Shaved and Took in a High School Runaway"], "F", "https://i.ibb.co/XCRmS0t/Qtxd9y4.png", 1823, "D"),
            new charInfo("Ryuuko Matoi", ["Ryuko Matoi"], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/ckBxLsj/r.png", 1824, "SS"),
            new charInfo("Satsuki Kiryuuin", ["Satsuki Kiryuin", "Kiryuuin Satsuki", "Kiryuin Satsuki"], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/1XL9PcC/s.png", 1825, "S"),
            new charInfo("Mako Mankanshoku", [], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/tMfMTkb/m.png", 1826, "S"),
            new charInfo("Senketsu", ["Kamui"], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/42W2zsz/image.png", 1827, "D"),
            new charInfo("Nonon Jakuzure", [], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/n1wzt56/n.png", 1828, "A"),
            new charInfo("Nui Harime", [], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/bgyKz74/n.png", 1829, "A"),
            new charInfo("Ira Gamagoori", ["Gamagoori Ira"], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/CWZnj06/image.png", 1830, "B"),
            new charInfo("Aikurou Mikisugi", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/rfKBbF8/image.png", 1831, "B"),
            new charInfo("Uzu Sanageyama", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/b2qjCKf/image.png", 1832, "B"),
            new charInfo("Ragyou Kiryuuin", ["Ragyou Kiryuin"], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/hmNGwqh/image.png", 1833, "C"),
            new charInfo("Shiro Byakko", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/H7dM2hV/image.png", 1834, "D"),
            new charInfo("Takaharu Fukuroda", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/sjNMj3G/image.png", 1835, "D"),
            new charInfo("Tarou Genbu", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/WftPbrz/s.png", 1836, "D"),
            new charInfo("Omiko Hakodate", [], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/xfSDKYZ/image.png", 1837, "C"),
            new charInfo("Rei Hououmaru", [], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/K744kBM/image.png", 1838, "D"),
            new charInfo("Imagawa", [], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/PWRFXpw/i.png", 1839, "D"),
            new charInfo("Houka Inumuta", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/x33phXN/image.png", 1840, "C"),
            new charInfo("Shirou Iori", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/0F8Cwh6/image.png", 1841, "D"),
            new charInfo("Tsumugu Kinagase", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/BtrW50m/image.png", 1842, "C"),
            new charInfo("Barazou Mankanshoku", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/HtLJQyV/image.png", 1843, "C"),
            new charInfo("Matarou Mankanshoku", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/jVHXyT8/image.png", 1844, "C"),
            new charInfo("Sukuyo Mankanshoku", [], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/GdNy4FC/image.png", 1845, "C"),
            new charInfo("Isshin Matoi", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/Dk71b3c/image.png", 1846, "D"),
            new charInfo("Jack Naito", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/kB6fZ04/image.png", 1847, "D"),
            new charInfo("Maiko Oogure", [], "Kill la Kill", ["KLK"], "F", "https://i.ibb.co/whNKPJp/image.png", 1848, "D"),
            new charInfo("Mitsuzou Soroi", [], "Kill la Kill", ["KLK"], "M", "https://i.ibb.co/7Rx32w3/image.png", 1849, "D"),
            new charInfo("Asuka Langley Soryu", ["Asuka Langley Souryuu"], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "F", "https://i.ibb.co/mCQm3hb/Asuka.png", 1850, "SS"),
            new charInfo("Rei Ayanami", ["Ayanami Rei"], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "F", "https://i.ibb.co/sgCbQc5/Rei.png", 1851, "SS"),
            new charInfo("Shinji Ikari", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/stYPhv7/image.png", 1852, "A"),
            new charInfo("Misato Katsuragi", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "F", "https://i.ibb.co/gmTkYQZ/M.png", 1853, "S"),
            new charInfo("Kaworu Nagisa", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/84JyX9w/image.png", 1854, "A"),
            new charInfo("Pen Pen", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/0qyRVRL/image.png", 1855, "D"),
            new charInfo("Gendou Ikari", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/MgYNJm2/image.png", 1856, "S"),
            new charInfo("Ryouji Kaji", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/9V3GpCB/image.png", 1857, "B"),
            new charInfo("Ritsuko Akagi", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "F", "https://i.ibb.co/vBn0m6m/m.png", 1858, "A"),
            new charInfo("Touji Suzuhara", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/4NXYChc/image.png", 1859, "B"),
            new charInfo("Kensuke Aida", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/JqBbqkH/image.png", 1860, "B"),
            new charInfo("Naoko Akagi", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "F", "https://i.ibb.co/jhvrq99/image.png", 1861, "D"),
            new charInfo("Shigeru Aoba", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/pbN7zRX/image.png", 1862, "D"),
            new charInfo("Kouzou Fuyutsuki", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/hYj1H7L/image.png", 1863, "C"),
            new charInfo("Hikari Horaki", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "F", "https://i.ibb.co/YhKY91V/image.png", 1864, "B"),
            new charInfo("Makoto Hyuuga", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/Qr7dB0z/image.png", 1865, "C"),
            new charInfo("Maya Ibuki", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "F", "https://i.ibb.co/f4nJdZ3/image.png", 1866, "C"),
            new charInfo("Yui Ikari", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "F", "https://i.ibb.co/DrgVsxR/image.png", 1867, "C"),
            new charInfo("Keel Lorentz", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/GTg6Cyh/image.png", 1868, "D"),
            new charInfo("Kyouko Zeppelin Souryuu", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "F", "https://i.ibb.co/QbK89VY/image.png", 1869, "D"),
            new charInfo("Shiro Tokita", [], "Evangelion", ["Eva", "Neon Genesis Evangelion", "Shinseiki Evangelion"], "M", "https://i.ibb.co/fVJVNkK/image.png", 1870, "D"),
            new charInfo("Yato", ["Yatogami", "Yatty", "Delivery God", "God of Calamity"], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/3NYKxD4/fvjtrj3.png", 1871, "SS"),
            new charInfo("Hiyori Iki", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/kJbvw3R/BkSaKrp.png", 1872, "SS"),
            new charInfo("Yukine", ["Sekki"], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/yWYYpLk/image.png", 1873, "S"),
            new charInfo("Kofuku", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/6Hx4wK1/qUK4eQ6.png", 1874, "S"),
            new charInfo("Bishamon", ["Vaisravana", "Veena", "Bishamonten"], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/NNF1FPS/0qMyUA5.png", 1875, "A"),
            new charInfo("Kazuma", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/VTYyTqN/DexSzEg.png", 1876, "A"),
            new charInfo("Nora", ["Stray", "Hiiro", "Mizuchi", "Tsutsumi", "Eyami"], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/4j3SQ93/image.png", 1877, "B"),
            new charInfo("Daikoku", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/jH4Cb1Y/fWsLrLy.png", 1878, "B"),
            new charInfo("Rabou", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/zXp5NDR/image.png", 1879, "B"),
            new charInfo("Kuraha", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/QvgZ0mr/image.png", 1880, "C"),
            new charInfo("Akiha", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/DRxKWNk/image.png", 1881, "D"),
            new charInfo("Ayu", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/DDd4vp3/image.png", 1882, "D"),
            new charInfo("Hashimoto", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/Qc2Sbny/image.png", 1883, "D"),
            new charInfo("Sayuri Iki", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/L6W24vt/image.png", 1884, "D"),
            new charInfo("Takamasa Iki", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/fHNgkPR/image.png", 1885, "D"),
            new charInfo("Kinuha", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/rQZTDPd/image.png", 1886, "C"),
            new charInfo("Miyu", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/g4bgGQS/image.png", 1887, "D"),
            new charInfo("Moyu", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/7vXdWV7/image.png", 1888, "D"),
            new charInfo("Mutsumi", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/vQp33WN/image.png", 1889, "D"),
            new charInfo("Nayu", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/wddDZ3d/image.png", 1890, "D"),
            new charInfo("Manabu Ogiwara", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/Q6kryt8/image.png", 1891, "D"),
            new charInfo("Keiichi Ono", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/b3GdzqR/image.png", 1892, "D"),
            new charInfo("Sasaki", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/WnW2bbB/image.png", 1893, "D"),
            new charInfo("Ami Tabata", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/85cHX8M/image.png", 1894, "D"),
            new charInfo("Tenjin", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/k9Ltp68/image.png", 1895, "C"),
            new charInfo("Tomone", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/sPS0yMM/image.png", 1896, "D"),
            new charInfo("Touno", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/3YcmwFn/image.png", 1897, "D"),
            new charInfo("Akira Yamashita", ["Yama-chan"], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/y43cn5r/image.png", 1898, "D"),
            new charInfo("Tsuguha", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/g4Z0H3M/image.png", 1899, "C"),
            new charInfo("Tsuyu", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/ftjhGns/image.png", 1900, "C"),
            new charInfo("Yuusuke Urasawa", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/z65mjQt/image.png", 1901, "D"),
            new charInfo("Ebisu", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/mGgWgcg/image.png", 1902, "B"),
            new charInfo("Kouto Fujisaki", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/7grK2mR/image.png", 1903, "C"),
            new charInfo("Aiha", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/ZJR7qTz/image.png", 1904, "B"),
            new charInfo("Fumiha", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/sKn4gkX/image.png", 1905, "D"),
            new charInfo("Hinaha", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/QCygYG3/image.png", 1906, "D"),
            new charInfo("Iwami", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/BrR9Zdr/image.png", 1907, "D"),
            new charInfo("Karuha", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/M7b52GQ/image.png", 1908, "D"),
            new charInfo("Kazuha", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/QMXPQTP/image.png", 1909, "D"),
            new charInfo("Kugaha", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/PmqmgZ7/image.png", 1910, "C"),
            new charInfo("Kunimi", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/VmYWMNc/image.png", 1911, "D"),
            new charInfo("Michitsukasa", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/vmy39b3/image.png", 1912, "D"),
            new charInfo("Mineha", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/Tb79dvT/image.png", 1913, "C"),
            new charInfo("Ookuninushi", ["Daikokuten"], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/GcJvCBK/image.png", 1914, "C"),
            new charInfo("Ryuuha", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/pZf144R/image.png", 1915, "D"),
            new charInfo("Suzuha", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/kSQmzC4/image.png", 1916, "D"),
            new charInfo("Tatsumi", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/HhCkWRZ/image.png", 1917, "D"),
            new charInfo("Touma", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/XJhtYP1/image.png", 1918, "D"),
            new charInfo("Tomoko", [], "Noragami", ["Noragami Aragoto"], "F", "https://i.ibb.co/wznFhQV/image.png", 1919, "C"),
            new charInfo("Yugiha", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/gywdhjq/image.png", 1920, "D"),
            new charInfo("Utami", [], "Noragami", ["Noragami Aragoto"], "M", "https://i.ibb.co/Pj0SXcb/image.png", 1921, "D"),
            new charInfo("Arataki Itto", ["Itto Arataki"], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/qknFLyw/i.png", 1922, "A"),
            new charInfo("Gorou (GI)", ["Goroo (GI)", "Goro (GI)"], "Genshin Impact", ["Genshin", "GI"], "M", "https://i.ibb.co/ZBw9bs2/g.png", 1923, "B"),
            new charInfo("Yun Jin", ["Yunjin"], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/HKLpmXh/y.png", 1924, "S"),
            new charInfo("Shenhe", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/0nkG8pZ/s.png", 1925, "A"),
            new charInfo("Yelan", [], "Genshin Impact", ["Genshin", "GI"], "F", "https://i.ibb.co/vvmSXVp/Y.png", 1926, "A"),
            new charInfo("Miko Yotsuya", ["Mieruko-chan"], "Mieruko-chan", ["Mieruko", "Mieruko chan"], "F", "https://i.ibb.co/1bMxthk/image.png", 1927, "A"),
            new charInfo("Yuria Niguredou", [], "Mieruko-chan", ["Mieruko", "Mieruko chan"], "F", "https://i.ibb.co/SfygB6x/image.png", 1928, "B"),
            new charInfo("Hana Yurikawa", [], "Mieruko-chan", ["Mieruko", "Mieruko chan"], "F", "https://i.ibb.co/wh5m3ZM/image.png", 1929, "B"),
            new charInfo("Kyousuke Yotsuya", [], "Mieruko-chan", ["Mieruko", "Mieruko chan"], "M", "https://i.ibb.co/26mJcMT/image.png", 1930, "C"),
            new charInfo("Zen Toono", [], "Mieruko-chan", ["Mieruko", "Mieruko chan"], "M", "https://i.ibb.co/gy9R0dt/image.png", 1931, "C"),
            new charInfo("Touko Yotsuya", [], "Mieruko-chan", ["Mieruko", "Mieruko chan"], "F", "https://i.ibb.co/7NxQNk3/image.png", 1932, "C"),
            new charInfo("Mitsue Takeda", [], "Mieruko-chan", ["Mieruko", "Mieruko chan"], "F", "https://i.ibb.co/T8V4387/image.png", 1933, "D"),
            new charInfo("Junji Rousoku", [], "Mieruko-chan", ["Mieruko", "Mieruko chan"], "M", "https://i.ibb.co/dQG0gY1/image.png", 1934, "D"),
            new charInfo("Mamoru Yotsuya", [], "Mieruko-chan", ["Mieruko", "Mieruko chan"], "M", "https://i.ibb.co/q0K68y4/image.png", 1935, "D"),
            new charInfo("Destiny", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "F", "https://i.ibb.co/7R9WjBJ/np22t40.png", 1936, "S"),
            new charInfo("Takt Asahina", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "M", "https://i.ibb.co/7St0J3T/image.png", 1937, "A"),
            new charInfo("Anna Schneider", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "F", "https://i.ibb.co/nLkctdr/a.png", 1938, "A"),
            new charInfo("Titan", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "F", "https://i.ibb.co/PD6Tdh8/t.png", 1939, "B"),
            new charInfo("Jupiter", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "F", "https://i.ibb.co/3pJCb8H/yCJHMwI.png", 1940, "B"),
            new charInfo("Twinkle Twinkle Little Star", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "F", "https://i.ibb.co/X8R3RQZ/8APl9in.png", 1941, "B"),
            new charInfo("Heaven", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "F", "https://i.ibb.co/0tqK7YF/h.png", 1942, "C"),
            new charInfo("Hell", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "F", "https://i.ibb.co/wyhXwv4/image.png", 1943, "D"),
            new charInfo("Lenny", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "M", "https://i.ibb.co/ygCg1jT/image.png", 1944, "D"),
            new charInfo("Sagan", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "M", "https://i.ibb.co/DQn0rKd/image.png", 1945, "D"),
            new charInfo("Schindler", [], "Takt op. Destiny", ["Takt Op", "Takt Op Destiny", "Takt Op.Destiny"], "M", "https://i.ibb.co/9VGb6vj/image.png", 1946, "D"),
            new charInfo("Miyo Sasaki", ["Muge"], "A Whisker Away", ["Nakitai Watashi wa Neko wo Kaburu"], "F", "https://i.ibb.co/GJDXSQb/tpMHd1m.png", 1947, "A"),
            new charInfo("Kento Hinode", [], "A Whisker Away", ["Nakitai Watashi wa Neko wo Kaburu"], "M", "https://i.ibb.co/wp91hFj/g1Fvfrw.png", 1948, "B"),
            new charInfo("Yoriko Fukase", [], "A Whisker Away", ["Nakitai Watashi wa Neko wo Kaburu"], "F", "https://i.ibb.co/x2WB7NL/4trqe5U.png", 1949, "C"),
            new charInfo("Kinako", [], "A Whisker Away", ["Nakitai Watashi wa Neko wo Kaburu"], "F", "https://i.ibb.co/zPJ5v9w/image.png", 1950, "D"),
            new charInfo("Kilt", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "M", "https://i.ibb.co/bgP707c/Kilt.png", 1951, "B"),
            new charInfo("Lute", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "M", "https://i.ibb.co/jJngftt/y.png", 1952, "B"),
            new charInfo("Louis Crawford", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "M", "https://i.ibb.co/jVssNCW/Louis.png", 1953, "C"),
            new charInfo("Flare", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "F", "https://i.ibb.co/cvdCQ94/Fl.png", 1954, "B"),
            new charInfo("Honda Yuuya", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "M", "https://i.ibb.co/zrqq297/Honda.png", 1955, "B"),
            new charInfo("Imerda Pinata", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "F", "https://i.ibb.co/wprMSJ6/i.png", 1956, "B"),
            new charInfo("Shijou Yukiko", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "F", "https://i.ibb.co/QQLXgWH/s.png", 1957, "C"),
            new charInfo("Anastasia Melokva", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "F", "https://i.ibb.co/MpP7PnK/anast.png", 1958, "D"),
            new charInfo("Roro Sendiger", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "M", "https://i.ibb.co/yQQTHf9/ru.png", 1959, "C"),
            new charInfo("Don Will Dead", [], "Cheat Slayer", ["Isekai Tenseisha Koroshi"], "M", "https://i.ibb.co/93SCKJ5/Don.png", 1960, "D"),
            new charInfo("Hana", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "F", "https://i.ibb.co/PG2nLs8/g7aWkjw.png", 1961, "A"),
            new charInfo("Ame", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "M", "https://i.ibb.co/FXY7FRG/fQcaIaK.png", 1962, "B"),
            new charInfo("Ookami", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "M", "https://i.ibb.co/Gn8BTky/yEpB6E4.png", 1963, "B"),
            new charInfo("Yuki", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "F", "https://i.ibb.co/cFTRzHy/IJYHj83.png", 1964, "B"),
            new charInfo("Souhei Fujii", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "M", "https://i.ibb.co/fGq4Wgq/6Ota5p2.png", 1965, "C"),
            new charInfo("Nirasaki", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "M", "https://i.ibb.co/DGsthQY/image.png", 1966, "C"),
            new charInfo("Shino", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "F", "https://i.ibb.co/2MFHGt8/image.png", 1967, "D"),
            new charInfo("Hosokawa", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "M", "https://i.ibb.co/XJg4SyJ/image.png", 1968, "D"),
            new charInfo("Horita", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "F", "https://i.ibb.co/YDLdRTt/image.png", 1969, "D"),
            new charInfo("Tanabe", [], "Wolf Children", ["Ookami Kodomo no Ame to Yuki"], "M", "https://i.ibb.co/ryktCRn/image.png", 1970, "D"),
            new charInfo("Kaoru Tsunashi", ["Kaoru Samura"], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "F", "https://i.ibb.co/HH0WqhB/v3uzRFM.png", 1971, "A"),
            new charInfo("Hajime Tsunashi", [], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "M", "https://i.ibb.co/C2Hj1jk/image.png", 1972, "B"),
            new charInfo("Youta Tsunashi", ["Mayotama"], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "M", "https://i.ibb.co/gFSTGQt/image.png", 1973, "C"),
            new charInfo("Rino Juse", [], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "F", "https://i.ibb.co/THqdtjP/image.png", 1974, "B"),
            new charInfo("Nozomu Juse", [], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "M", "https://i.ibb.co/pXtWYTy/image.png", 1975, "C"),
            new charInfo("Miki", [], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "M", "https://i.ibb.co/XbXVXSd/image.png", 1976, "D"),
            new charInfo("Ai", [], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "F", "https://i.ibb.co/m4KQGfN/image.png", 1977, "D"),
            new charInfo("Tanaka", [], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "F", "https://i.ibb.co/qRWqZFx/image.png", 1978, "D"),
            new charInfo("Tadashi Samura", [], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "M", "https://i.ibb.co/W0jnRF6/image.png", 1979, "C"),
            new charInfo("Kyouko Tsunashi", [], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "F", "https://i.ibb.co/wYTccmw/image.png", 1980, "C"),
            new charInfo("Yamada", [], "Danna ga Nani wo Itteiru ka Wakaranai Ken", ["Danna ga Nani", "I Can't Understand What My Husband Is Saying"], "M", "https://i.ibb.co/KmwPn9B/image.png", 1981, "D"),
            new charInfo("Seiya Ryuuguuin", ["Cautious Hero"], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/vkhCszc/iavnp2v.png", 1982, "S"),
            new charInfo("Rista", ["Ristarte"], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/NNXngSv/ls93BVc.png", 1983, "S"),
            new charInfo("Adenela", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/HTC8d6C/tpt50bQ.png", 1984, "A"),
            new charInfo("Valkyrie", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/94mjvFv/1vsp0s4.png", 1985, "B"),
            new charInfo("Ariadoa", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/bzcTqbR/hBSRaRE.png", 1986, "A"),
            new charInfo("Elulu", ["Eruru"], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/tM8fy3X/dWlfR3B.png", 1987, "B"),
            new charInfo("Chaos Machina", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/wRvJxS4/4Lfs8u2.png", 1988, "D"),
            new charInfo("Mitis", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/DCz7D5R/image.png", 1989, "A"),
            new charInfo("Cerseus", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/SR1mYwp/image.png", 1990, "C"),
            new charInfo("Mash", ["Mushroom"], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/wgFKF2H/uG1ueAn.png", 1991, "B"),
            new charInfo("Artemios", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/9qsCqGQ/image.png", 1992, "D"),
            new charInfo("Beel Bub", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/hZbDn1h/image.png", 1993, "D"),
            new charInfo("Carlo (TUEEE)", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/NV5vJ4v/image.png", 1994, "D"),
            new charInfo("Deathmagla", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/F3WmXXQ/image.png", 1995, "D"),
            new charInfo("Eraser Kaiser", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/hfp7cp4/image.png", 1996, "D"),
            new charInfo("Kilkapul", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/ftgZsFQ/image.png", 1997, "D"),
            new charInfo("Ishtar (TUEEE)", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/6WNGZ91/image.png", 1998, "D"),
            new charInfo("Jamie (TUEEE)", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/Nmcf6xY/image.png", 1999, "D"),
            new charInfo("Hestiaca", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/6PDpktT/image.png", 2000, "B"),
            new charInfo("Lagos", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/qrK2hHp/image.png", 2001, "D"),
            new charInfo("Rosalie Roseguard", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/hY9JS5s/Ib5Sau2.png", 2002, "A"),
            new charInfo("Leviae", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "F", "https://i.ibb.co/tpVWK8Y/image.png", 2003, "D"),
            new charInfo("Priest Marth", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/MZZ8zLB/image.png", 2004, "D"),
            new charInfo("Touya", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/GF2SQCr/image.png", 2005, "D"),
            new charInfo("Weaponsmith", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/fYjgqZm/image.png", 2006, "D"),
            new charInfo("Zenosroad", [], "Shinchou Yuusha", ["Cautious Hero", "Tueee", "Kono Yuusha ga Ore Tueee Kuse ni Shinchou Sugiru"], "M", "https://i.ibb.co/rGM4cjy/image.png", 2007, "D"),
            new charInfo("Sakura Yamauchi", [], "I want to eat your pancreas", ["Kimi no Suizou wo Tabetai", "Pancreas"], "F", "https://i.ibb.co/mz1WFwg/s.png", 2008, "SS"),
            new charInfo("Haruki Shiga", [], "I want to eat your pancreas", ["Kimi no Suizou wo Tabetai", "Pancreas"], "M", "https://i.ibb.co/B6nFjvc/PQHxyXS.png", 2009, "S"),
            new charInfo("Kyouko Takimoto", [], "I want to eat your pancreas", ["Kimi no Suizou wo Tabetai", "Pancreas"], "F", "https://i.ibb.co/WzmWGxw/image.png", 2010, "B"),
            new charInfo("Issei Miyata", [], "I want to eat your pancreas", ["Kimi no Suizou wo Tabetai", "Pancreas"], "M", "https://i.ibb.co/8NJWznQ/image.png", 2011, "C"),
            new charInfo("Takahiro", [], "I want to eat your pancreas", ["Kimi no Suizou wo Tabetai", "Pancreas"], "M", "https://i.ibb.co/8XT1JSR/image.png", 2012, "B"),
            new charInfo("Seita", [], "Grave of the Fireflies", ["Hotaru no Haka"], "M", "https://i.ibb.co/XXH0jQG/image.png", 2013, "B"),
            new charInfo("Setsuko", [], "Grave of the Fireflies", ["Hotaru no Haka"], "F", "https://i.ibb.co/fHhdnpZ/image.png", 2014, "C"),
            new charInfo("Yokokawa", [], "Grave of the Fireflies", ["Hotaru no Haka"], "F", "https://i.ibb.co/1X7bxr5/image.png", 2015, "D"),
            new charInfo("Flare Argrande Jioral", ["Freya"], "Redo of Healer", ["Healer", "KJnY", "Kaifuku Jutsushi no Yarinaoshi"], "F", "https://i.ibb.co/TbnydLn/ldtqYSG.png", 2016, "SS"),
            new charInfo("Keyaru", ["Keyaruga", "Keara", "Hero of Recovery"], "Redo of Healer", ["Healer", "KJnY", "Kaifuku Jutsushi no Yarinaoshi"], "M", "https://i.ibb.co/tJcSzXH/k.png", 2017, "S"),
            new charInfo("Bullet (KJnY)", [], "Redo of Healer", ["Healer", "KJnY", "Kaifuku Jutsushi no Yarinaoshi"], "M", "https://i.ibb.co/5M100XK/qCAWuaF.png", 2018, "B"),
            new charInfo("Blade (KJnY)", [], "Redo of Healer", ["Healer", "KJnY", "Kaifuku Jutsushi no Yarinaoshi"], "F", "https://i.ibb.co/Hg738xp/4NtGVLm.png", 2019, "B"),
            new charInfo("Norn Clatalissa Jioral", [], "Redo of Healer", ["Healer", "KJnY", "Kaifuku Jutsushi no Yarinaoshi"], "F", "https://i.ibb.co/dfJv9Qq/7FuZ3LT.png", 2020, "SS"),
            new charInfo("Setsuna", [], "Redo of Healer", ["Healer", "KJnY", "Kaifuku Jutsushi no Yarinaoshi"], "F", "https://i.ibb.co/bsHX9Pm/ZSFyi5f.png", 2021, "A"),
            new charInfo("Kureha Crylet", ["Kureha Clyret"], "Redo of Healer", ["Healer", "KJnY", "Kaifuku Jutsushi no Yarinaoshi"], "F", "https://i.ibb.co/9TgyTMm/gKbBt3j.png", 2022, "A"),
            new charInfo("Eve Reese", [], "Redo of Healer", ["Healer", "KJnY", "Kaifuku Jutsushi no Yarinaoshi"], "F", "https://i.ibb.co/mbDHBP1/dqktg4L.png", 2023, "A"),
            new charInfo("Kaguya Shinomiya", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/xhr9Tq1/UXIhIvq.png", 2024, "SS"),
            new charInfo("Chika Fujiwara", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/GprrvDL/NEHiM1b.png", 2025, "SS"),
            new charInfo("Ai Hayasaka", ["Hayasaka Ai"], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/8zpW4vD/ai.png", 2026, "S"),
            new charInfo("Miyuki Shirogane", ["Shirogane Miyuki"], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/zs8G48p/image.png", 2027, "S"),
            new charInfo("Yuu Ishigami", ["Yu Ishigami", "Ishigami Yuu"], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/pQ1s951/lXENbXh.png", 2028, "S"),
            new charInfo("Kei Shirogane", ["Shirogane Kei"], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/TmYKK9D/yKKnkff.png", 2029, "A"),
            new charInfo("Iino Miko", ["Miko Iino"], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/s3H39gr/kkVL1bd.png", 2030, "A"),
            new charInfo("Toyomi Fujiwara", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/hc8r3V5/lSV96NQ.png", 2031, "A"),
            new charInfo("Moeha Fujiwara", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/PD066bb/7ALm9mx.png", 2032, "B"),
            new charInfo("Betsy Beltoise", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/3TXTLbh/image.png", 2033, "D"),
            new charInfo("Mirin Hinokuchi", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/khKzLpk/image.png", 2034, "C"),
            new charInfo("Nagisa Kashiwagi", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/ScT3h20/image.png", 2035, "C"),
            new charInfo("Karen Kino", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/M9C1Q2t/2KDITXk.png", 2036, "B"),
            new charInfo("Erika Kose", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/3zs1BRs/image.png", 2037, "D"),
            new charInfo("Mikiti", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/HdTqBrD/image.png", 2038, "C"),
            new charInfo("Saburo Odajima", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/rtg6wqf/image.png", 2039, "D"),
            new charInfo("Adolphe Pescarolo", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/TkdnNR5/image.png", 2040, "D"),
            new charInfo("Maki Shijou", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/fv0fDK4/image.png", 2041, "B"),
            new charInfo("Papa Shirogane", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/85Ndp5N/Gzp9zAk.png", 2042, "C"),
            new charInfo("Tsubame Koyasu", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/zf1VPxF/YHyE3Wq.png", 2043, "B"),
            new charInfo("Subaru Suruga", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/4g0Ns7v/image.png", 2044, "D"),
            new charInfo("Tsubasa Tanuma", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/4dJtv6g/image.png", 2045, "D"),
            new charInfo("J. Suzuki", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/cCVW562/image.png", 2046, "D"),
            new charInfo("Daichi Fujiwara", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/d2Bvvgn/image.png", 2047, "D"),
            new charInfo("Gigako", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/bPGxbTf/image.png", 2048, "C"),
            new charInfo("Gou Kazamatsuri", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/CMvjgxh/image.png", 2049, "D"),
            new charInfo("Kozue Makihara", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/WG1G90v/image.png", 2050, "C"),
            new charInfo("Kazeno", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/JrsjcWQ/image.png", 2051, "D"),
            new charInfo("Kou Ogino", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/jWgt6LW/image.png", 2052, "D"),
            new charInfo("Rei Onodera", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/R654jWB/image.png", 2053, "B"),
            new charInfo("Kyoko Ootomo", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/drJ3csw/4FEORhs.png", 2054, "C"),
            new charInfo("Shouzou Tanuma", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/1Gk6yrd/image.png", 2055, "D"),
            new charInfo("Kobachi Osaragi", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "F", "https://i.ibb.co/rmjzjtr/v9gddxk.png", 2056, "D"),
            new charInfo("Saburo Toyosaki", [], "Kaguya-sama: Love is War", ["Kaguya-sama", "Kaguya sama", "Kaguya", "Kaguya-sama wa Kokurasetai"], "M", "https://i.ibb.co/dB63P2d/image.png", 2057, "D"),
            new charInfo("Euryale", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/qnBK97P/5kbRr3O.png", 2058, "A"),
            new charInfo("Stheno", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/YWx2X5p/s.png", 2059, "A"),
            new charInfo("Olivia", ["Livia"], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/xfKXPRV/image.png", 2060, "S"),
            new charInfo("Leon Fou Bartfort", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "M", "https://i.ibb.co/Hr1H2PR/image.png", 2061, "S"),
            new charInfo("Angelica Rapha Redgrave", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/6DdBdtM/image.png", 2062, "A"),
            new charInfo("Noelle Beltre", ["Noelle Zel Lespinasse"], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/5YYmysn/image.png", 2063, "A"),
            new charInfo("Louise Sara Rault", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/jvtBWCd/image.png", 2064, "B"),
            new charInfo("Marie Fou Lafan", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/vHszC1L/image.png", 2065, "C"),
            new charInfo("Hertrauda Sera Fanoss", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/fNhgbm8/image.png", 2066, "B"),
            new charInfo("Yumeria", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/H7m8MLH/image.png", 2067, "C"),
            new charInfo("Lelia Beltre", ["Lelia Zel Lespinasse"], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/jbSrY1N/image.png", 2068, "B"),
            new charInfo("Mylene Rapha Holfort", ["Queen Holfort"], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/KD5VkrQ/image.png", 2069, "A"),
            new charInfo("Clarice Fia Atlee", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/7JyCDb8/image.png", 2070, "D"),
            new charInfo("Deirdre Fia Roseblade", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/jgMR9DT/image.png", 2071, "B"),
            new charInfo("Hertrude Sera Fanoss", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "F", "https://i.ibb.co/qNc4FfL/image.png", 2072, "B"),
            new charInfo("Chris Fia Arclight", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "M", "https://i.ibb.co/5TWffKG/image.png", 2073, "C"),
            new charInfo("Jilk Fia Marmoria", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "M", "https://i.ibb.co/Bgqy186/image.png", 2074, "C"),
            new charInfo("Greg Fou Seberg", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "M", "https://i.ibb.co/q1j5Mvd/image.png", 2075, "C"),
            new charInfo("Julius Rapha Holfort", [], "Trapped in a Dating Sim", ["MobuSeka", "Otome Game Sekai wa Mob ni Kibishii Sekai desu", "The World of Otome Games is Tough for Mobs"], "M", "https://i.ibb.co/26YwZCt/image.png", 2076, "D"),
            new charInfo("Tomoe Gozen", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/16gR5bC/g.png", 2077, "A"),
            new charInfo("Ainz Ooal Gown", ["Momonga"], "Overlord", [], "M", "https://i.ibb.co/NmxB6gy/MLFqXWC.png", 2078, "SS"),
            new charInfo("Albedo", [], "Overlord", [], "F", "https://i.ibb.co/4PR3Bq2/a.png", 2079, "SS"),
            new charInfo("Shalltear Bloodfallen", [], "Overlord", [], "F", "https://i.ibb.co/5KPb6Cb/ZvpvJoR.png", 2080, "SS"),
            new charInfo("Narberal Gamma", ["Nabel"], "Overlord", [], "F", "https://i.ibb.co/5K3VPbL/Ywikd2B.png", 2081, "S"),
            new charInfo("Sebas Tian", [], "Overlord", [], "M", "https://i.ibb.co/JyS7v5W/mGocdxV.png", 2082, "S"),
            new charInfo("Demiurge", [], "Overlord", [], "M", "https://i.ibb.co/DrQdzkt/image.png", 2083, "S"),
            new charInfo("Entoma Vasilissa Zeta", [], "Overlord", [], "F", "https://i.ibb.co/JRn9x4h/rbz7VNl.png", 2084, "A"),
            new charInfo("CZ2128 Delta", ["Shizu Delta"], "Overlord", [], "F", "https://i.ibb.co/b60h7fG/kIf0xnr.png", 2085, "A"),
            new charInfo("Lupusregina Beta", [], "Overlord", [], "F", "https://i.ibb.co/S080RvQ/bArWM5y.png", 2086, "S"),
            new charInfo("Yuri Alpha", [], "Overlord", [], "F", "https://i.ibb.co/Q6JGyHr/lxfTAAo.png", 2087, "A"),
            new charInfo("Pandora's Actor", [], "Overlord", [], "M", "https://i.ibb.co/MhsCsp3/image.png", 2088, "S"),
            new charInfo("Solution Epsilon", [], "Overlord", [], "F", "https://i.ibb.co/7Q298gq/Q7GNJne.png", 2089, "A"),
            new charInfo("Aura Bella Fiora", [], "Overlord", [], "F", "https://i.ibb.co/PzCSV9g/image.png", 2090, "A"),
            new charInfo("Mare Bello Fiore", [], "Overlord", [], "M", "https://i.ibb.co/JQS1BfX/image.png", 2091, "A"),
            new charInfo("Pluton Ainzach", [], "Overlord", [], "M", "https://i.ibb.co/pKKJCyV/image.png", 2092, "D"),
            new charInfo("Khajiit Dale Badantel", [], "Overlord", [], "M", "https://i.ibb.co/Bz9ppWz/image.png", 2093, "D"),
            new charInfo("Lizzie Bareare", [], "Overlord", [], "F", "https://i.ibb.co/JRhVH7t/image.png", 2094, "D"),
            new charInfo("Nfirea Bareare", [], "Overlord", [], "M", "https://i.ibb.co/SJJrfHt/image.png", 2095, "B"),
            new charInfo("Ninya Beiron", [], "Overlord", [], "M", "https://i.ibb.co/9Gp3Zsx/image.png", 2096, "D"),
            new charInfo("Belius", [], "Overlord", [], "M", "https://i.ibb.co/VwGVGGd/image.png", 2097, "D"),
            new charInfo("Bellote", [], "Overlord", [], "M", "https://i.ibb.co/2s7Jk48/image.png", 2098, "D"),
            new charInfo("Brita", [], "Overlord", [], "F", "https://i.ibb.co/0F93Bzc/image.png", 2099, "C"),
            new charInfo("Bukubukuchagama", ["Boiling Teapot"], "Overlord", [], "F", "https://i.ibb.co/M2PFT8n/image.png", 2100, "B"),
            new charInfo("Cedran", [], "Overlord", [], "M", "https://i.ibb.co/pxFh57t/image.png", 2101, "D"),
            new charInfo("Clementine", [], "Overlord", [], "F", "https://i.ibb.co/PFPt9xn/image.png", 2102, "B"),
            new charInfo("Cocytus", [], "Overlord", [], "M", "https://i.ibb.co/XjrQghB/image.png", 2103, "A"),
            new charInfo("Londes Di Clamp", [], "Overlord", [], "M", "https://i.ibb.co/qN7ZD1q/image.png", 2104, "D"),
            new charInfo("Enri Emmot", [], "Overlord", [], "F", "https://i.ibb.co/prhzbgr/image.png", 2105, "B"),
            new charInfo("Nemu Emmot", [], "Overlord", [], "F", "https://i.ibb.co/345h98F/image.png", 2106, "C"),
            new charInfo("Hamusuke", [], "Overlord", [], "M", "https://i.ibb.co/344Gfx7/image.png", 2107, "C"),
            new charInfo("Herohero", [], "Overlord", [], "M", "https://i.ibb.co/b1Fm7KN/image.png", 2108, "C"),
            new charInfo("Iguvuarge", [], "Overlord", [], "M", "https://i.ibb.co/cxHTnhy/image.png", 2109, "D"),
            new charInfo("Ilian", [], "Overlord", [], "M", "https://i.ibb.co/cg20W7z/image.png", 2110, "D"),
            new charInfo("Jugem", [], "Overlord", [], "M", "https://i.ibb.co/wWmL5Ln/image.png", 2111, "D"),
            new charInfo("Kaire", [], "Overlord", [], "M", "https://i.ibb.co/m8rT0qN/image.png", 2112, "D"),
            new charInfo("Nigun Grid Luin", [], "Overlord", [], "M", "https://i.ibb.co/drhXL7j/image.png", 2113, "C"),
            new charInfo("Moknach", [], "Overlord", [], "M", "https://i.ibb.co/55sMMng/image.png", 2114, "D"),
            new charInfo("Peter Mork", [], "Overlord", [], "M", "https://i.ibb.co/p3JqDDb/image.png", 2115, "C"),
            new charInfo("Peroroncino", [], "Overlord", [], "M", "https://i.ibb.co/6WQJdtr/image.png", 2116, "B"),
            new charInfo("Rilick", [], "Overlord", [], "M", "https://i.ibb.co/pxzzsbG/image.png", 2117, "D"),
            new charInfo("Gazef Stronoff", [], "Overlord", [], "M", "https://i.ibb.co/3kdptWh/image.png", 2118, "C"),
            new charInfo("Lukeluther Volve", [], "Overlord", [], "M", "https://i.ibb.co/nCNs0Vj/image.png", 2119, "D"),
            new charInfo("Brain Unglaus", [], "Overlord", [], "M", "https://i.ibb.co/0MDn4Z8/image.png", 2120, "B"),
            new charInfo("Touch Me", [], "Overlord", [], "M", "https://i.ibb.co/NpymVhy/image.png", 2121, "A"),
            new charInfo("Dyne Woodwonder", [], "Overlord", [], "M", "https://i.ibb.co/k91xz6j/image.png", 2122, "D"),
            new charInfo("Zach", [], "Overlord", [], "M", "https://i.ibb.co/cY0VBrX/image.png", 2123, "D"),
            new charInfo("Evileye", ["Landfall"], "Overlord", [], "F", "https://i.ibb.co/vBC1LJB/fvgD3fx.png", 2124, "S"),
            new charInfo("Eclair Acleir Aicler", [], "Overlord", [], "M", "https://i.ibb.co/dJp70fq/image.png", 2125, "C"),
            new charInfo("Lakyus Alvein Dale Aindra", [], "Overlord", [], "F", "https://i.ibb.co/jwZ4pwq/gwozkDZ.png", 2126, "A"),
            new charInfo("Rigrit Bers Caurau", [], "Overlord", [], "F", "https://i.ibb.co/pRBYgZ0/image.png", 2127, "D"),
            new charInfo("Climb", [], "Overlord", [], "M", "https://i.ibb.co/tKgQ8qR/image.png", 2128, "C"),
            new charInfo("Cocco Doll", [], "Overlord", [], "M", "https://i.ibb.co/Yhz4j5R/image.png", 2129, "D"),
            new charInfo("Hilma Cygnaeus", [], "Overlord", [], "F", "https://i.ibb.co/QM965qf/image.png", 2130, "D"),
            new charInfo("Davernoch", [], "Overlord", [], "M", "https://i.ibb.co/cxdkr14/image.png", 2131, "D"),
            new charInfo("Edström", [], "Overlord", [], "F", "https://i.ibb.co/26Z4fvP/image.png", 2132, "C"),
            new charInfo("Gagaran", [], "Overlord", [], "F", "https://i.ibb.co/hFYYv91/image.png", 2133, "C"),
            new charInfo("Zenberu Gugu", [], "Overlord", [], "M", "https://i.ibb.co/yV3YW6B/image.png", 2134, "C"),
            new charInfo("Staffan Heivish", [], "Overlord", [], "M", "https://i.ibb.co/CWMq6VF/image.png", 2135, "D"),
            new charInfo("Sukyu Juju", [], "Overlord", [], "M", "https://i.ibb.co/CHR2h6x/image.png", 2136, "D"),
            new charInfo("Lockmeier", [], "Overlord", [], "M", "https://i.ibb.co/LrdfPQN/image.png", 2137, "D"),
            new charInfo("Crusch Lulu", [], "Overlord", [], "M", "https://i.ibb.co/m8CppHj/image.png", 2138, "C"),
            new charInfo("Malmvist", [], "Overlord", [], "M", "https://i.ibb.co/7y1CqBZ/image.png", 2139, "D"),
            new charInfo("Messenger Monster", [], "Overlord", [], "M", "https://i.ibb.co/hCxc6B7/image.png", 2140, "D"),
            new charInfo("Ulbert Alain Odle", [], "Overlord", [], "M", "https://i.ibb.co/Lr6Sx8N/image.png", 2141, "D"),
            new charInfo("Peshurian", [], "Overlord", [], "M", "https://i.ibb.co/StcBpJN/image.png", 2142, "D"),
            new charInfo("Pestonya Shortcake Wanko", [], "Overlord", [], "M", "https://i.ibb.co/FWpZBQW/image.png", 2143, "D"),
            new charInfo("Elias Brandt Dale Raeven", [], "Overlord", [], "M", "https://i.ibb.co/k0yDXRq/image.png", 2144, "D"),
            new charInfo("Rororo", [], "Overlord", [], "M", "https://i.ibb.co/v3M1n95/image.png", 2145, "D"),
            new charInfo("Jircniv Rune Farlord El Nix", [], "Overlord", [], "M", "https://i.ibb.co/5ss8n5z/image.png", 2146, "C"),
            new charInfo("Shasuryu Shasha", [], "Overlord", [], "M", "https://i.ibb.co/LrbvYVb/image.png", 2147, "D"),
            new charInfo("Zaryusu Shasha", [], "Overlord", [], "M", "https://i.ibb.co/YWb1qTK/image.png", 2148, "C"),
            new charInfo("Sous-chef", [], "Overlord", [], "M", "https://i.ibb.co/JzByLcQ/image.png", 2149, "D"),
            new charInfo("Succulent", [], "Overlord", [], "M", "https://i.ibb.co/FYK1ZR7/image.png", 2150, "D"),
            new charInfo("Tia", [], "Overlord", [], "F", "https://i.ibb.co/KjYbYnn/Ddddabi.png", 2151, "A"),
            new charInfo("Tina", [], "Overlord", [], "F", "https://i.ibb.co/DDwtJ9s/YASJmLd.png", 2152, "A"),
            new charInfo("Renner Theiere Chardelon Ryle Vaiself", ["Golden Princess"], "Overlord", [], "F", "https://i.ibb.co/8r3HbJH/kOQnfpv.gif", 2153, "S"),
            new charInfo("Zanac Varleon Igana Ryle Vaiself", [], "Overlord", [], "M", "https://ibb.co/S3rcNKc", 2154, "D"),
            new charInfo("Tuareninya Veyron", ["Tuare"], "Overlord", [], "F", "https://i.ibb.co/vdwM7g3/tS7enxJ.png", 2155, "B"),
            new charInfo("Victim", [], "Overlord", [], "M", "https://i.ibb.co/1rWk2p3/image.png", 2156, "C"),
            new charInfo("Zero", [], "Overlord", [], "M", "https://i.ibb.co/JjTywQZ/image.png", 2157, "D"),
            new charInfo("Zesshi Zetsumei", [], "Overlord", [], "F", "https://i.ibb.co/SwWcwFj/mst5ybi.png", 2158, "C"),
            new charInfo("Kyukuu Zuuzuu", [], "Overlord", [], "M", "https://i.ibb.co/rf01q2S/image.png", 2159, "D"),
            new charInfo("Arche Eeb Rile Furt", [], "Overlord", [], "F", "https://i.ibb.co/XkCD1wG/image.png", 2160, "B"),
            new charInfo("Agu", [], "Overlord", [], "M", "https://i.ibb.co/PwRgzRK/image.png", 2161, "D"),
            new charInfo("Cixous", [], "Overlord", [], "F", "https://i.ibb.co/HGsdWpt/image.png", 2162, "C"),
            new charInfo("Cona", [], "Overlord", [], "M", "https://i.ibb.co/vqQtNZ5/image.png", 2163, "D"),
            new charInfo("Dyno", [], "Overlord", [], "F", "https://i.ibb.co/DLn56R3/image.png", 2164, "D"),
            new charInfo("Foire", [], "Overlord", [], "F", "https://i.ibb.co/HHsf9P9/8KNbggJ.png", 2165, "C"),
            new charInfo("Gokou", [], "Overlord", [], "M", "https://i.ibb.co/0F1TcwT/image.png", 2166, "D"),
            new charInfo("Roberdyck Goltron", [], "Overlord", [], "M", "https://i.ibb.co/GPcfBcR/image.png", 2167, "D"),
            new charInfo("Gringham", [], "Overlord", [], "M", "https://i.ibb.co/v1mm7tx/image.png", 2168, "D"),
            new charInfo("Imina", [], "Overlord", [], "F", "https://i.ibb.co/zh6cXmV/image.png", 2169, "C"),
            new charInfo("Gu", [], "Overlord", [], "M", "https://i.ibb.co/2jtM40V/image.png", 2170, "D"),
            new charInfo("Kaijali", [], "Overlord", [], "M", "https://i.ibb.co/DgJMfQP/image.png", 2171, "D"),
            new charInfo("Kyouhukou", [], "Overlord", [], "M", "https://i.ibb.co/0tNNnNq/image.png", 2172, "C"),
            new charInfo("Kyumei", [], "Overlord", [], "M", "https://i.ibb.co/Q8N2cM5/image.png", 2173, "D"),
            new charInfo("Lumiere", [], "Overlord", [], "F", "https://i.ibb.co/JrxMn0h/image.png", 2174, "C"),
            new charInfo("Nimble Arc Dale Anoch", [], "Overlord", [], "M", "https://i.ibb.co/fFtkNPP/image.png", 2175, "D"),
            new charInfo("Nosuli", [], "Overlord", [], "M", "https://i.ibb.co/PZZyn8T/image.png", 2176, "D"),
            new charInfo("Parpatra Ogrion", [], "Overlord", [], "M", "https://i.ibb.co/4PY0xXr/image.png", 2177, "D"),
            new charInfo("Neuronist Painkill", [], "Overlord", [], "M", "https://i.ibb.co/sH2b19W/image.png", 2178, "D"),
            new charInfo("Fluder Paradyne", [], "Overlord", [], "M", "https://i.ibb.co/NLRfdCT/image.png", 2179, "D"),
            new charInfo("Baziwood Peshmel", [], "Overlord", [], "M", "https://i.ibb.co/WytL29J/image.png", 2180, "C"),
            new charInfo("Pulcinella", [], "Overlord", [], "M", "https://i.ibb.co/W2zzhTW/image.png", 2181, "D"),
            new charInfo("Ramposa III", [], "Overlord", [], "M", "https://i.ibb.co/nzcVH3T/image.png", 2182, "D"),
            new charInfo("Leinas Rockbruise", [], "Overlord", [], "F", "https://i.ibb.co/grPc5j9/image.png", 2183, "C"),
            new charInfo("Ryraryus Spenia Ai Indarun", [], "Overlord", [], "M", "https://i.ibb.co/F8Q3LQ1/image.png", 2184, "D"),
            new charInfo("Suigyo", [], "Overlord", [], "M", "https://i.ibb.co/HKZBdRN/image.png", 2185, "D"),
            new charInfo("Hekkeran Termite", [], "Overlord", [], "M", "https://i.ibb.co/QY0BCxM/image.png", 2186, "D"),
            new charInfo("Unlai", [], "Overlord", [], "M", "https://i.ibb.co/8zC1YKj/image.png", 2187, "D"),
            new charInfo("Ureirika", [], "Overlord", [], "F", "https://i.ibb.co/SvVbyM9/image.png", 2188, "D"),
            new charInfo("Erya Uzruth", [], "Overlord", [], "M", "https://i.ibb.co/WDTNDDc/image.png", 2189, "D"),
            new charInfo("Barbro Andrean Ierudo Ryle Vaiself", [], "Overlord", [], "M", "https://i.ibb.co/4W3t6Bw/image.png", 2190, "D"),
            new charInfo("Loune Vermillion", [], "Overlord", [], "M", "https://i.ibb.co/7rQkJBg/image.png", 2191, "D"),
            new charInfo("Ai Ooto", ["Aijorina"], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/gZ83jFL/pr2R31d.png", 2192, "SS"),
            new charInfo("Rika Kawai", ["Kawai Rika"], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/Wfz5ZCh/g9JhNCZ.png", 2193, "S"),
            new charInfo("Momoe Sawaki", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/dP6gN6B/SVNOp2J.png", 2194, "A"),
            new charInfo("Neiru Aonuma", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/xgc5wVN/Snkj5ls.png", 2195, "A"),
            new charInfo("Kaoru Kurita", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/8dsHpJj/image.png", 2196, "B"),
            new charInfo("Frill", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/tMyBC0J/image.png", 2197, "B"),
            new charInfo("Ura-Acca", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "M", "https://i.ibb.co/1TFYJx3/image.png", 2198, "C"),
            new charInfo("Kotobuki Awano", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/bmbYtTn/5sJUDnL.png", 2199, "C"),
            new charInfo("Koito Nagase", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/Xxckt3x/image.png", 2200, "B"),
            new charInfo("Acca", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "M", "https://i.ibb.co/QDGvzmq/DhTDsyc.png", 2201, "C"),
            new charInfo("Hachi Onna", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/SN4g6Nx/image.png", 2202, "D"),
            new charInfo("Haruka", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/HBxTjFL/image.png", 2203, "C"),
            new charInfo("Mako", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/xCf83PX/image.png", 2204, "D"),
            new charInfo("Miko", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/bHfgJ9r/image.png", 2205, "D"),
            new charInfo("Miwa", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/zHbqF2y/image.png", 2206, "C"),
            new charInfo("Tae Ooto", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/5kZ6BBb/image.png", 2207, "D"),
            new charInfo("Sachiko", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/6JC0mkD/image.png", 2208, "D"),
            new charInfo("Kurumi Saijou", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/jgrGVgf/image.png", 2209, "A"),
            new charInfo("Shuuichirou Sawaki", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "M", "https://i.ibb.co/F45vP53/image.png", 2210, "D"),
            new charInfo("Minami Suzuhara", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/wQsBDFm/image.png", 2211, "C"),
            new charInfo("Misaki Tanabe", [], "Wonder Egg Priority", ["WEP", "Wonder Egg"], "F", "https://i.ibb.co/f2G9LxG/image.png", 2212, "D"),
            new charInfo("Biwa", [], "Heike Monogatari", ["Heike"], "F", "https://i.ibb.co/jRPYJhH/image.png", 2213, "B"),
            new charInfo("Shigemori Taira no", [], "Heike Monogatari", ["Heike"], "M", "https://i.ibb.co/9wQjr4T/image.png", 2214, "C"),
            new charInfo("Tokuko Taira no", [], "Heike Monogatari", ["Heike"], "F", "https://i.ibb.co/FYx0HgK/image.png", 2215, "C"),
            new charInfo("Decim", [], "Death Parade", [], "M", "https://i.ibb.co/qpW3BfY/Aikt52D.png", 2216, "SS"),
            new charInfo("Kurokami no Onna", ["Chiyuki"], "Death Parade", [], "F", "https://i.ibb.co/kqyzjQh/VkE3xYU.png", 2217, "S"),
            new charInfo("Nona", [], "Death Parade", [], "F", "https://i.ibb.co/qNn79HR/image.png", 2218, "S"),
            new charInfo("Ginti", [], "Death Parade", [], "M", "https://i.ibb.co/gv8vYDz/image.png", 2219, "A"),
            new charInfo("Clavis", [], "Death Parade", [], "M", "https://i.ibb.co/jHKV0SP/image.png", 2220, "A"),
            new charInfo("Mayu Arita", [], "Death Parade", [], "F", "https://i.ibb.co/N2nbpPQ/image.png", 2221, "B"),
            new charInfo("Quin", [], "Death Parade", [], "F", "https://i.ibb.co/0BWFShW/image.png", 2222, "B"),
            new charInfo("Tatsumi", [], "Death Parade", [], "M", "https://i.ibb.co/2ySp8xP/image.png", 2223, "A"),
            new charInfo("Castra", [], "Death Parade", [], "F", "https://i.ibb.co/pQqJtRL/image.png", 2224, "B"),
            new charInfo("Oculus", [], "Death Parade", [], "M", "https://i.ibb.co/SP1ShNC/image.png", 2225, "A"),
            new charInfo("Fujii", [], "Death Parade", [], "M", "https://i.ibb.co/bWCwpmd/image.png", 2226, "D"),
            new charInfo("Harada", [], "Death Parade", [], "M", "https://i.ibb.co/jZNbncC/image.png", 2227, "C"),
            new charInfo("Jirou", [], "Death Parade", [], "M", "https://i.ibb.co/j4C0PnS/image.png", 2228, "D"),
            new charInfo("Kana", [], "Death Parade", [], "F", "https://i.ibb.co/mJh5Q5D/image.png", 2229, "D"),
            new charInfo("Lisa", [], "Death Parade", [], "F", "https://i.ibb.co/QP0WrHD/image.png", 2230, "D"),
            new charInfo("Machiko", [], "Death Parade", [], "F", "https://i.ibb.co/z7B5kjD/image.png", 2231, "D"),
            new charInfo("Shigeru Miura", [], "Death Parade", [], "M", "https://i.ibb.co/y60qpSg/image.png", 2232, "C"),
            new charInfo("Chisato Miyazaki", [], "Death Parade", [], "F", "https://i.ibb.co/1q1tKRB/image.png", 2233, "C"),
            new charInfo("Novem", [], "Death Parade", [], "M", "https://i.ibb.co/DC8VcxM/image.png", 2234, "D"),
            new charInfo("Shimada", [], "Death Parade", [], "M", "https://i.ibb.co/VYd0N3Q/image.png", 2235, "B"),
            new charInfo("Sae Shimada", [], "Death Parade", [], "F", "https://i.ibb.co/9HsSVkf/image.png", 2236, "C"),
            new charInfo("Misaki Tachibana", [], "Death Parade", [], "F", "https://i.ibb.co/3SB7Lqv/image.png", 2237, "D"),
            new charInfo("Mai Takada", [], "Death Parade", [], "F", "https://i.ibb.co/c60vXgY/image.png", 2238, "D"),
            new charInfo("Takashi", [], "Death Parade", [], "M", "https://i.ibb.co/x6NNhBN/image.png", 2239, "C"),
            new charInfo("Yousuke Tateishi", [], "Death Parade", [], "M", "https://i.ibb.co/q53vyn6/image.png", 2240, "C"),
            new charInfo("Yumi Tatsumi", [], "Death Parade", [], "F", "https://i.ibb.co/Z2WC6k1/image.png", 2241, "D"),
            new charInfo("Tria", [], "Death Parade", [], "F", "https://i.ibb.co/GWr7j43/image.png", 2242, "D"),
            new charInfo("Inori Yuzuriha", ["Yuzuriha Inori"], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/Bf26RBz/i1.png", 2243, "SS"),
            new charInfo("Shuu Ouma", ["Shu Ouma", "Shuu Oma", "Shu Oma"], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/vD9FSRr/dpr9Zdo.png", 2244, "S"),
            new charInfo("Gai Tsutsugami", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/rQFrN3J/FBxLsIO.png", 2245, "A"),
            new charInfo("Ayase Shinomiya", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/bPWg4b1/rIeJxLk.png", 2246, "S"),
            new charInfo("Tsugumi", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/njc1rz9/pDS3qD3.png", 2247, "A"),
            new charInfo("Hare Menjou", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/89T2744/image.png", 2248, "A"),
            new charInfo("Makoto Waltz Segai", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/S5gG5mW/image.png", 2249, "C"),
            new charInfo("Daryl Yan", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/BB37QLT/image.png", 2250, "B"),
            new charInfo("Mana Ouma", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/K64skXh/image.png", 2251, "B"),
            new charInfo("Kenji Kido", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/tZHsWzD/image.png", 2252, "C"),
            new charInfo("Dan Eagleman", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/dJ0vJ08/image.png", 2253, "C"),
            new charInfo("Emily (GC)", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/ZT3n01d/image.png", 2254, "D"),
            new charInfo("Guin", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/L07jq0r/image.png", 2255, "D"),
            new charInfo("Miyabi Herikawa", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/dgnQm5R/image.png", 2256, "C"),
            new charInfo("Shuuichirou Keidou", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/2jgn73Y/image.png", 2257, "C"),
            new charInfo("Arisa Kuhouin", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/GtjKFv6/image.png", 2258, "B"),
            new charInfo("Okina Kuhouin", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/XLSZnFP/image.png", 2259, "D"),
            new charInfo("Kurachi", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/5MFt30y/image.png", 2260, "D"),
            new charInfo("Kanon Kusama", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/XyDZF63/image.png", 2261, "C"),
            new charInfo("Kyou", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/vQQnq3K/image.png", 2262, "D"),
            new charInfo("Oogumo", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/9pDmZxd/image.png", 2263, "B"),
            new charInfo("Haruka Ouma", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/hY2zMdv/image.png", 2264, "C"),
            new charInfo("Kurosu Ouma", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/sC9fJjz/image.png", 2265, "C"),
            new charInfo("Rowan", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/mBhFp1h/image.png", 2266, "D"),
            new charInfo("Jun Samukawa", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/YQDFttZ/image.png", 2267, "D"),
            new charInfo("Yahiro Samukawa", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/yynWnZY/image.png", 2268, "C"),
            new charInfo("Shibungi", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/Rc16dtc/image.png", 2269, "C"),
            new charInfo("Saeko Shijou", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/BGtm9tz/image.png", 2270, "C"),
            new charInfo("Ritsu Takarada", [], "Guilty Crown", ["GC"], "F", "https://i.ibb.co/wczJQSf/image.png", 2271, "C"),
            new charInfo("Souta Tamadate", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/DptvbNd/image.png", 2272, "D"),
            new charInfo("Arugo Tsukishima", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/sJPYhFF/image.png", 2273, "D"),
            new charInfo("Major General Yan", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/5Gp9z20/image.png", 2274, "D"),
            new charInfo("Yuu", [], "Guilty Crown", ["GC"], "M", "https://i.ibb.co/cb2rxMk/image.png", 2275, "B"),
            new charInfo("Shouko Nishimiya", ["Nishimiya Shouko"], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "F", "https://i.ibb.co/QXvkd0X/C5F5s8p.png", 2276, "SS"),
            new charInfo("Shouya Ishida", ["Ishida Shouya"], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "M", "https://i.ibb.co/ZVqZGq0/zxyR4tQ.png", 2277, "S"),
            new charInfo("Yuzuru Nishimiya", [], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "F", "https://i.ibb.co/PYqp5DD/3i2FBaF.png", 2278, "A"),
            new charInfo("Naoka Ueno", ["Ueno Naoka"], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "F", "https://i.ibb.co/4JjkhWt/JyeceD5.png", 2279, "A"),
            new charInfo("Tomohiro Nagatsuka", [], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "M", "https://i.ibb.co/nRK24KX/31SiSHT.png", 2280, "B"),
            new charInfo("Maria Ishida", [], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "F", "https://i.ibb.co/qxWRh00/image.png", 2281, "C"),
            new charInfo("Pedro", [], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "M", "https://i.ibb.co/jgcRP5w/image.png", 2282, "D"),
            new charInfo("Miyako Ishida", [], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "F", "https://i.ibb.co/3TtC5MB/jBVtQMC.png", 2283, "B"),
            new charInfo("Miyoko Sahara", ["Sahara Miyoko"], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "F", "https://i.ibb.co/59jsvs7/image.png", 2284, "B"),
            new charInfo("Satoshi Mashiba", ["Mashiba Satoshi"], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "M", "https://i.ibb.co/88J6cbw/image.png", 2285, "B"),
            new charInfo("Keisuke Hirose", [], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "M", "https://i.ibb.co/KXwvSDq/image.png", 2286, "D"),
            new charInfo("Miki Kawai", ["Kawai Miki"], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "F", "https://i.ibb.co/xHKNT4q/image.png", 2287, "B"),
            new charInfo("Ito Nishimiya", [], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "F", "https://i.ibb.co/ZY3pRR3/image.png", 2288, "D"),
            new charInfo("Yaeko Nishimiya", [], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "F", "https://i.ibb.co/HnmVmv6/image.png", 2289, "C"),
            new charInfo("Takeuchi", [], "A Silent Voice", ["Koe no Katachi", "The Shape of Voice", "ASV"], "M", "https://i.ibb.co/kMvrttK/image.png", 2290, "C"),
            new charInfo("Rias Gremory", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/9WwxpBf/r2.png", 2291, "SS"),
            new charInfo("Akeno Himejima", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/1T92vgK/CuB4Ric.png", 2292, "SS"),
            new charInfo("Issei Hyoudou", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/18CbLKx/image.png", 2293, "S"),
            new charInfo("Koneko Toujou", ["Shirone"], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/0GFXnvy/dbOjCgk.png", 2294, "S"),
            new charInfo("Asia Argento", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/DMv8hgw/9J6mPpu.png", 2295, "S"),
            new charInfo("Xenovia Quarta", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/85zYy93/x.png", 2296, "SS"),
            new charInfo("Irina Shidou", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/t2FfxNP/cmaOSvQ.png", 2297, "S"),
            new charInfo("Yuuto Kiba", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/9cHfmDn/URV7Ko7.png", 2298, "A"),
            new charInfo("Ravel Phenex", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/NZ3x7Db/PfCrPV2.png", 2299, "S"),
            new charInfo("Ddraig", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/PYkYrsP/image.png", 2300, "C"),
            new charInfo("Sirzechs Lucifer", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/7kc2MFj/image.png", 2301, "B"),
            new charInfo("Raynare", ["Yuuma Amano"], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/2tHstv7/Xs5717q.png", 2302, "A"),
            new charInfo("Burent", ["Bürent"], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/V2M41Nj/image.png", 2303, "B"),
            new charInfo("Dohnaseek", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/TLYD5nf/image.png", 2304, "D"),
            new charInfo("Ile", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/g70xKXP/image.png", 2305, "C"),
            new charInfo("Isabela", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/svrkhxj/image.png", 2306, "C"),
            new charInfo("Kalawarner", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/34cx9ZQ/image.png", 2307, "C"),
            new charInfo("Karlamine", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/9rxPjzT/image.png", 2308, "B"),
            new charInfo("Katase", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/vL35Kvf/image.png", 2309, "D"),
            new charInfo("Li", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/brMq55x/RRiy2mA.png", 2310, "B"),
            new charInfo("Grayfia Lucifuge", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/6PjSGJg/BBlf94g.png", 2311, "A"),
            new charInfo("Marion", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/17xLhmK/RDWCFnB.png", 2312, "C"),
            new charInfo("Matsuda", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/h9RbS04/image.png", 2313, "D"),
            new charInfo("Mihae", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/cr1B1xM/image.png", 2314, "C"),
            new charInfo("Mil-tan", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/rKhDfzb/image.png", 2315, "D"),
            new charInfo("Mira", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/4mshMw8/image.png", 2316, "C"),
            new charInfo("Mittelt", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/NVLtpb0/image.png", 2317, "C"),
            new charInfo("Motohama", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/xgD6W7x/image.png", 2318, "D"),
            new charInfo("Murayama", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/LRqxLgq/D8f6hZX.png", 2319, "B"),
            new charInfo("Ni", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/6bTpxN6/image.png", 2320, "B"),
            new charInfo("Riser Phenex", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/nR9yVvT/image.png", 2321, "B"),
            new charInfo("Genshirou Saji", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/3WKXHC0/image.png", 2322, "D"),
            new charInfo("Freed Sellzen", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/mv2ZhP5/image.png", 2323, "D"),
            new charInfo("Tsubaki Shinra", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/0C5kgTz/o1C9OFy.png", 2324, "C"),
            new charInfo("Shuriya", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/BTQdgf4/iH1Cwmx.png", 2325, "B"),
            new charInfo("Siris", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/YcWfLMx/image.png", 2326, "D"),
            new charInfo("Souna Sitri", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/hc59xTn/image.png", 2327, "C"),
            new charInfo("Xuelan", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/hVV7jRB/image.png", 2328, "A"),
            new charInfo("Yubelluna", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/WgB785F/DY0Aldr.png", 2329, "C"),
            new charInfo("Azazel", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/q005THm/image.png", 2330, "A"),
            new charInfo("Serafall Leviathan", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/3SLggWH/oLhkp7G.png", 2331, "S"),
            new charInfo("Gasper Vladi", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/7XBCptf/i7EiwVJ.png", 2332, "A"),
            new charInfo("Zeoticus Gremory", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/H4s7X0M/image.png", 2333, "D"),
            new charInfo("Aika Kiryuu", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/Wfz1MDt/EfN1HbT.png", 2334, "A"),
            new charInfo("Kokabiel", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/9pHn9rZ/image.png", 2335, "D"),
            new charInfo("Katerea Leviathan", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/Vqjjtqv/image.png", 2336, "D"),
            new charInfo("Vali Lucifer", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/PFbVT9L/image.png", 2337, "A"),
            new charInfo("Michael", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/R04s4kC/image.png", 2338, "C"),
            new charInfo("Ophis", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/P6mBhVb/MTLSXS6.png", 2339, "B"),
            new charInfo("Seekvaira Agares", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/h2NFqnC/image.png", 2340, "D"),
            new charInfo("Creuserey Asmodeus", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/WnhRR4Z/image.png", 2341, "D"),
            new charInfo("Rossweisse", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/Rc4D9HY/iRvnM3c.png", 2342, "S"),
            new charInfo("Diodora Astaroth", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/zGzc6Qj/image.png", 2343, "D"),
            new charInfo("Sairaorg Bael", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/K2Qjs64/image.png", 2344, "D"),
            new charInfo("Barachiel", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/CW4XxVm/image.png", 2345, "D"),
            new charInfo("Ajuka Beelzebub", ["Astaroth"], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/mRB9GWm/image.png", 2346, "D"),
            new charInfo("Shalba Beelzebub", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/vcfTdg4/image.png", 2347, "D"),
            new charInfo("Zephyrdor Glasya-Labolas", ["Zephyrdor Glasya Labolas"], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/ySwHcLh/image.png", 2348, "D"),
            new charInfo("Millicas Gremory", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/mXwhHMD/image.png", 2349, "D"),
            new charInfo("Venelana Gremory", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/frTHhM7/Lgonn9j.png", 2350, "B"),
            new charInfo("Kuroka", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/GkH1k47/image.png", 2351, "B"),
            new charInfo("Loki", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/JqVDf7n/image.png", 2352, "D"),
            new charInfo("Odin", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/kxsS3bD/image.png", 2353, "C"),
            new charInfo("Arthur Pendragon (DxD)", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/rGR6t3B/image.png", 2354, "D"),
            new charInfo("Siegfried (DxD)", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/PxzpMGj/image.png", 2355, "D"),
            new charInfo("Kunou", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/ZLCMf3v/a7huu2U.png", 2356, "A"),
            new charInfo("Le Fay Pendragon", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "F", "https://i.ibb.co/LSby0cd/iqLJvDF.png", 2357, "B"),
            new charInfo("Dulio Gesualdo", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/yBYY5ms/Xfv9jHH.png", 2358, "D"),
            new charInfo("Bikou", [], "High School DxD", ["DxD", "Highschool DxD", "HSDxD"], "M", "https://i.ibb.co/kJN29NP/AQCtpme.png", 2359, "D"),
            new charInfo("C.C.", ["CC", "C2"], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/qn5MSXP/cc.png", 2360, "SS"),
            new charInfo("Lelouch Lamperouge", ["Lelouch vi Britannia", "L.L.", "LL", "L2"], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/RyrTyYz/gSDc5xJ.png", 2361, "SS"),
            new charInfo("Suzaku Kururugi", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/6Z9dv6g/5mUXmpA.png", 2362, "S"),
            new charInfo("Kallen Stadtfeld", ["Karen Kouzuki"], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/txcNK8d/GHt6EFp.png", 2363, "S"),
            new charInfo("Asashina Shougo", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/7kZhbwZ/147121.png", 2364, "C"),
            new charInfo("Milly Ashford", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/JyKwbg1/rkAM14r.png", 2365, "B"),
            new charInfo("LLoyd Asplund", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/9WtQpTj/aSTtGls.png", 2366, "A"),
            new charInfo("Bartley Asprius", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/L5HMJYH/147139.png", 2367, "D"),
            new charInfo("Rivalz Cardemonde", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/g3Zbyn9/33779.png", 2368, "B"),
            new charInfo("Rakshata Chawla", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/WygsysT/BG1gz24.png", 2369, "C"),
            new charInfo("Chiba Nagisa", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/CzhYkn1/29369.png", 2370, "D"),
            new charInfo("CÃ©cile Croomy", ["Cecile Croomy"], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/W32V08k/fPKPHfQ.png", 2371, "C"),
            new charInfo("Andreas Darlton", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/kBkhL1V/61846.png", 2372, "D"),
            new charInfo("Nina Einstein", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/mBJ8kfg/55951.png", 2373, "B"),
            new charInfo("Shirley Fenette", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/MkSh38C/MbTvcuc.png", 2374, "S"),
            new charInfo("Jeremiah Gottwald", ["Orange"], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/zJzwnXL/SavLXQa.png", 2375, "A"),
            new charInfo("Gilbert G.P. Guilford", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/JHhYFJY/144841.png", 2376, "D"),
            new charInfo("Inoue Naomi", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/2qVySP9/102791.png", 2377, "D"),
            new charInfo("Kirihara Taizou", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/PxTvBHP/146087.png", 2378, "D"),
            new charInfo("Kouzuki Nato", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/Bn7BrY8/62250.png", 2379, "D"),
            new charInfo("Kururugi Genbu", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/MRX7QcW/144191.png", 2380, "D"),
            new charInfo("Kusakabe", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/HVBsj7V/148381.png", 2381, "D"),
            new charInfo("Nunnally Lamperouge", ["Nunnally vi Britannia"], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/pnCTqzp/NLlZg94.png", 2382, "A"),
            new charInfo("Xingke Li", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/9gXgsY4/83319.png", 2383, "B"),
            new charInfo("Mao", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/Jtp535V/176097.png", 2384, "C"),
            new charInfo("Minami Yoshitaka", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/SNM2KRG/283889.png", 2385, "D"),
            new charInfo("Nagata", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/vx1vQvV/144829.png", 2386, "D"),
            new charInfo("Villetta Nu", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/12VStxg/7uLHfLj.png", 2387, "B"),
            new charInfo("Ougi Kaname", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/5LHhpWS/61063.png", 2388, "B"),
            new charInfo("Sawazaki Atsushi", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/b7N10jX/146527.png", 2389, "D"),
            new charInfo("Senba Ryouga", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/njGR75W/135345.png", 2390, "D"),
            new charInfo("Shinozaki Sayoko", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/PTdGHqF/31522.png", 2391, "C"),
            new charInfo("Diethard Ried", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/KwCfNnQ/61853.png", 2392, "C"),
            new charInfo("Kewell Soresi", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/0Vyk77D/62531.png", 2393, "D"),
            new charInfo("Sugiyama Kento", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/PN4SJ9z/144831.png", 2394, "D"),
            new charInfo("Sumeragi Kaguya", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/0nQ3GLW/29099.png", 2395, "B"),
            new charInfo("Tamaki Shinichirou", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/ckKg4Ks/147081.png", 2396, "C"),
            new charInfo("Toudou Kyoushirou", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/QHPsy7G/135525.png", 2397, "B"),
            new charInfo("Urabe Kousetsu", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/7YkM8VP/144833.png", 2398, "D"),
            new charInfo("V.V.", ["VV"], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/dg3rC2L/83146.png", 2399, "C"),
            new charInfo("Schneizel el Britannia", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/WkVS3b7/bpIlbLE.png", 2400, "A"),
            new charInfo("Odysseus eu Britannia", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/TP5HT8F/63993.png", 2401, "C"),
            new charInfo("Clovis la Britannia", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/LZKSBLk/30901.png", 2402, "B"),
            new charInfo("Cornelia li Britannia", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/cDPzNMb/33793.png", 2403, "A"),
            new charInfo("Euphemia li Britannia", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/JjCrvr0/VbNOf6d.png", 2404, "A"),
            new charInfo("Marianne vi Britannia", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/M5j6MG1/135367.png", 2405, "D"),
            new charInfo("Charles zi Britannia", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/1fqfS79/GcMc467.png", 2406, "A"),
            new charInfo("Alstreim Anya", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/q5ttZSs/83435.png", 2407, "B"),
            new charInfo("Bradley Luciano", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/tZ8SRqS/146777.png", 2408, "D"),
            new charInfo("Carales", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/VBPcZW6/146529.png", 2409, "D"),
            new charInfo("Dorothea Ernst", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/KG5wj9w/61854.png", 2410, "D"),
            new charInfo("Futaba Ayame", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/Cm3Dhzv/172047.png", 2411, "D"),
            new charInfo("Hong Gu", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/Ltnfq7r/144233.png", 2412, "D"),
            new charInfo("Monica Krushevsky", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/N9THbZK/144849.png", 2413, "D"),
            new charInfo("Rolo Lamperouge", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/b6CdHmd/83814.png", 2414, "A"),
            new charInfo("Kanon Maldini", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/P6t75fd/147055.png", 2415, "D"),
            new charInfo("Bismarck Waldstein", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/fDvPkyK/62064.png", 2416, "D"),
            new charInfo("Gino Weinberg", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "M", "https://i.ibb.co/fDvPkyK/62064.png", 2417, "B"),
            new charInfo("Guinevere de Britannia", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/kBsNp4b/114485.png", 2418, "D"),
            new charInfo("Carine ne Britannia", [], "Code Geass", ["CG", "Code Geass: Hangyaku no Lelouch"], "F", "https://i.ibb.co/XDGGD6v/107636.png", 2419, "D"),
            new charInfo("Raphtalia", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/zsxM4P9/orOAr0D.png", 2420, "SS"),
            new charInfo("Naofumi Iwatani", ["Shield Hero", "Iwatani Naofumi"], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/0KvJBpY/A4LisgW.png", 2421, "S"),
            new charInfo("Alexanderite Therese", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/5kWqtKX/image.png", 2422, "C"),
            new charInfo("Ake", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/KXB4PqC/image.png", 2423, "D"),
            new charInfo("Filo", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/GPsTnRd/PRMVtbu.png", 2424, "S"),
            new charInfo("Amaki Ren", ["Sword Hero"], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/0jkwFbV/8CITXBA.png", 2425, "A"),
            new charInfo("L'Arc Berg", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/RSJZH4W/518kvPo.png", 2426, "B"),
            new charInfo("Berocas", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/cNFq6QR/384677.png", 2427, "D"),
            new charInfo("Elhart", ["Erhard"], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/QM7PLhv/B9lGz0m.png", 2428, "C"),
            new charInfo("Fitoria", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/3mRXK0F/e7JnXj0.png", 2429, "B"),
            new charInfo("Glass", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/4WLLj9X/pQ3uRnM.png", 2430, "B"),
            new charInfo("Elrasla Grilaroc", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/W00QBC2/384608.png", 2431, "D"),
            new charInfo("Hickwaal", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/RSNwwhC/384592.png", 2432, "D"),
            new charInfo("Rishia Ivyred", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/b33f29H/384607.png", 2433, "C"),
            new charInfo("Kawasumi Itsuki", ["Bow Hero"], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/8P0NXgt/42V26vg.png", 2434, "B"),
            new charInfo("Keel", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/CVZzWZJ/384598.png", 2435, "D"),
            new charInfo("Kitamura Motoyasu", ["Spear Hero"], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/gdRfRPC/bIn4DfV.png", 2436, "A"),
            new charInfo("Mald", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/L68mcbs/384603.png", 2437, "D"),
            new charInfo("Aultcray Melromarc XXXII", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/zQn0ydn/gChx7ua.png", 2438, "C"),
            new charInfo("Idol Rabier", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/m4JZBgn/384595.png", 2439, "D"),
            new charInfo("Melty Q Melromarc", ["Melty Melromarc"], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/G70f0D8/leDS7Xz.png", 2440, "S"),
            new charInfo("Mirelia Q Melromarc", ["Mirelia Melromarc"], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/VmZwMT7/384602.png", 2441, "C"),
            new charInfo("Malty Melromarc", ["Bitch"], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/VLj21XP/ROFrhYg.png", 2442, "B"),
            new charInfo("Van Reichnott", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "M", "https://i.ibb.co/MM1phDQ/384611.png", 2443, "C"),
            new charInfo("Rifana", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/R0jSYzt/384606.png", 2444, "D"),
            new charInfo("Biscas T. Balmus", [], "Tate no Yuusha", ["The Rising of the Shield Hero", "Tate no Yuusha no Nariagari", "Shield Hero"], "F", "https://i.ibb.co/KVF7bwN/384591.png", 2445, "D"),
            new charInfo("Kingprotea", ["Protea", "Alter Ego G"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/8MF4HGs/kp.png", 2446, "B"),
            new charInfo("Chihiro Ogino", ["Sen"], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "F", "https://i.ibb.co/JrwyWhc/khdDsF7.png", 2447, "A"),
            new charInfo("Haku", ["Nigihayami Kohaku Nushi"], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "M", "https://i.ibb.co/2095mXs/6qD4fQR.png", 2448, "B"),
            new charInfo("Kaonashi", ["No-Face", "No Face"], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "M", "https://i.ibb.co/C1h9GY2/ma09C0s.png", 2449, "C"),
            new charInfo("Susuwatari", ["Makkuro-Kurosuke", "Makkuro Kurosuke"], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "M", "https://i.ibb.co/SP2b7ZB/image.png", 2450, "D"),
            new charInfo("Kamajii", [], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "M", "https://i.ibb.co/KbsQNSj/image.png", 2451, "C"),
            new charInfo("Lin", [], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "F", "https://i.ibb.co/4RCsTsM/PUPoc1S.png", 2452, "B"),
            new charInfo("Yubaba", [], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "F", "https://i.ibb.co/2vNp0BJ/image.png", 2453, "D"),
            new charInfo("Zeniba", [], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "F", "https://i.ibb.co/t428qVT/image.png", 2454, "D"),
            new charInfo("Ani-yaku", ["Ani yaku"], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "M", "https://i.ibb.co/ChmLvkt/image.png", 2455, "D"),
            new charInfo("Boh", [], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "M", "https://i.ibb.co/dbFLw6b/image.png", 2456, "D"),
            new charInfo("Kashira", [], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "M", "https://i.ibb.co/VTwCRPX/image.png", 2457, "D"),
            new charInfo("Akio Ogino", [], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "M", "https://i.ibb.co/k5TwNY3/image.png", 2458, "C"),
            new charInfo("Yuuko Ogino", [], "Spirited Away", ["Sen to Chihiro no Kamikakushi", "Sen to Chihiro"], "F", "https://i.ibb.co/8jmGqQN/image.png", 2459, "C"),
            new charInfo("Hina Amano", [], "Tenki no Ko", ["TnK", "Weathering With You"], "F", "https://i.ibb.co/9G8Jnpy/h.png", 2460, "S"),
            new charInfo("Hodaka Morishima", [], "Tenki no Ko", ["TnK", "Weathering With You"], "M", "https://i.ibb.co/87DpNty/HlwnZZ3.png", 2461, "A"),
            new charInfo("Natsumi Suga", [], "Tenki no Ko", ["TnK", "Weathering With You"], "F", "https://i.ibb.co/YT5wjtZ/s.png", 2462, "A"),
            new charInfo("Nagi Amano", [], "Tenki no Ko", ["TnK", "Weathering With You"], "M", "https://i.ibb.co/vcp1PvY/Gtgdi4i.png", 2463, "B"),
            new charInfo("Keisuke Suga", [], "Tenki no Ko", ["TnK", "Weathering With You"], "M", "https://i.ibb.co/RYpGynN/image.png", 2464, "B"),
            new charInfo("Kana Sakura", [], "Tenki no Ko", ["TnK", "Weathering With You"], "F", "https://i.ibb.co/GQq4wZW/image.png", 2465, "D"),
            new charInfo("Takai", [], "Tenki no Ko", ["TnK", "Weathering With You"], "M", "https://i.ibb.co/HXYhn6K/image.png", 2466, "D"),
            new charInfo("Yasui", [], "Tenki no Ko", ["TnK", "Weathering With You"], "M", "https://i.ibb.co/tMkh0Ns/image.png", 2467, "C"),
            new charInfo("Ayane Hanazawa", [], "Tenki no Ko", ["TnK", "Weathering With You"], "F", "https://i.ibb.co/KwKqC4V/image.png", 2468, "C"),
            new charInfo("Kimura", [], "Tenki no Ko", ["TnK", "Weathering With You"], "M", "https://i.ibb.co/kmC788H/image.png", 2469, "D"),
            new charInfo("Sasaki (TnK)", [], "Tenki no Ko", ["TnK", "Weathering With You"], "M", "https://i.ibb.co/zSk0mtF/image.png", 2470, "D"),
        ];

        // Profile
        if (message.content.toLowerCase().startsWith("!pr")) {

            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();

            if (!inventory[user.id + message.guild.id] || inventory[user.id + message.guild.id][0] === undefined) {
                if (user.id === message.author.id) {
                    return message.channel.send("You don't have any characters");
                } else {
                    return message.channel.send(`${user.username} has no characters`);
                };
            };
            
            const inv = [];
            for (i=0; i < inventory[user.id + message.guild.id].length; i++) {
                inv.push(inventory[user.id + message.guild.id][i]);
            };
            const uniq =  inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]]);
            };

            const charsTotal = Object.keys(characters).length;
            const charsTotalF = characters.filter((e) => e.gender === "F").length;
            const charsTotalM = characters.filter((e) => e.gender === "M").length;
            const collected = uniq.length;
            const collectedF = chars.filter((e) => e.gender === "F").length;
            const collectedM = chars.filter((e) => e.gender === "M").length;
            const collRatio = Math.floor((collected / charsTotal)*100);
            const collRatioF = Math.floor((collectedF / charsTotalF)*100);
            const collRatioM = Math.floor((collectedM / charsTotalM)*100);
            const ssT = characters.filter((e) => e.rarity === "SS").length;
            const sT = characters.filter((e) => e.rarity === "S").length;
            const aT = characters.filter((e) => e.rarity === "A").length;
            const bT = characters.filter((e) => e.rarity === "B").length;
            const cT = characters.filter((e) => e.rarity === "C").length;
            const dT = characters.filter((e) => e.rarity === "D").length;
            const collSS = chars.filter((e) => e.rarity === "SS").length;
            const collS = chars.filter((e) => e.rarity === "S").length;
            const collA = chars.filter((e) => e.rarity === "A").length;
            const collB = chars.filter((e) => e.rarity === "B").length;
            const collC = chars.filter((e) => e.rarity === "C").length;
            const collD = chars.filter((e) => e.rarity === "D").length;
            // Anime Total + Anime Unique 
            const animeTotal = [];
            for (i=0; i < Object.keys(characters).length; i++) {
                animeTotal.push(characters[i].anime);
            };
            const aTuniq =  animeTotal.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            // Level
            let xpr = xp[user.id + message.guild.id];
            let level = 0;
            for (i=1; xpr >= 0; i++) {
                xpr -= Math.floor(5*Math.log(i)*Math.log(i)*Math.log(i)*Math.log(i) + 30);
                level++;
            };
            // Coins
            coin = 0;
            if (coins[user.id + message.guild.id]) coin = coins[user.id + message.guild.id];

            let aniCompleted = 0;
            for (i=0; i < aTuniq.length; i++) {
                let animeCheck = characters.filter((e) => e.anime === aTuniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === aTuniq[i]).length;
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

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) thumbnail = characters[favChar[user.id + message.guild.id]].image;
            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s profile`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("**Level**: " + level + " (!level) ㅤㅤ **Coins**: " + coin + "<:coins:872926669055356939>\n**Collected**: " + collected + "/" + charsTotal + " (" + collectedF + "/" + charsTotalF + "<:female:870076411430436914> " + collectedM + "/" + charsTotalM + "<:male:870076394649047080>)\n**Completion**: " + collRatio + "% (" + collRatioF + "%<:female:870076411430436914> " + collRatioM + "%<:male:870076394649047080>)\n**Anime Completed**: " + aniCompleted + "/" + aTuniq.length + `\n**Dungeon**: Floor ${floor}`)
            .setThumbnail(thumbnail)
            .addFields(
                { name: 'Rarity', value: "<:SSTier:869316489931546644> **Tier**: " + `${collSS}/${ssT}` + "\n<:ATier:869316558013464627> **Tier**: " + `${collA}/${aT}` + "\n<:CTier:869316602858991657> **Tier**: " + `${collC}/${cT}`, inline: true },
                { name: '_ _', value: "<:STier:869316518675095552> **Tier**: " + `${collS}/${sT}` + "\n<:BTier:869316586803179571> **Tier**: " + `${collB}/${bT}` + "\n<:DTier:869316616071032843> **Tier**: " + `${collD}/${dT}`, inline: true },
            )
            message.channel.send(Embed);
            
            return;
        };

        // Favourite Character
        if (message.content.toLowerCase().startsWith("!fav")) {
            if (!inventory[message.author.id + message.guild.id]) {
                return message.channel.send("You don't have any characters");
            };
            if (!args[0]) {
                return message.channel.send("Please provide a name");
            };

            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                if (inventory[message.author.id + message.guild.id].some((a) => a === fastCheck[0].id)) {
                    favChar[message.author.id + message.guild.id] = fastCheck[0].id;
                    fs.writeFile('Storage/favChar.json', JSON.stringify(favChar), (err) => {
                        if (err) console.error(err);
                    });
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setDescription(`Favourite charakter set to \n**${fastCheck[0].name}**`)
                    .setImage(fastCheck[0].image)
                    message.channel.send(Embed);
                } else {
                    message.channel.send("You don't own this card");
                };
            } else {
                message.channel.send("No match found. Please use the characters full name");
            };
        };

        // Battle Char
        if (message.content.toLowerCase().startsWith("!bc") || message.content.toLowerCase().startsWith("!use") || message.content.toLowerCase().startsWith("!battlechar") || message.content.toLowerCase().startsWith("!battlecharacter")) {
            if (!inventory[message.author.id + message.guild.id]) {
                return message.channel.send("You don't have any characters");
            };
            if (!args[0]) {
                return message.channel.send("Please provide a name");
            };

            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                if (inventory[message.author.id + message.guild.id].some((a) => a === fastCheck[0].id)) {
                    battleChar[message.author.id + message.guild.id] = fastCheck[0].id;
                    fs.writeFile('Storage/battleChar.json', JSON.stringify(battleChar), (err) => {
                        if (err) console.error(err);
                    });
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setDescription(`Battle charakter set to \n**${fastCheck[0].name}**`)
                    .setImage(fastCheck[0].image)
                    message.channel.send(Embed);
                } else {
                    message.channel.send("You don't own this card");
                };
            } else {
                message.channel.send("No match found. Please use the characters full name");
            };
        };

        // Pity
        if (message.content.toLowerCase().startsWith("!pity")) {
            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();
            
            if (!pity[user.id + message.guild.id]) {
                if (user.id === message.author.id) {
                    return message.channel.send("You haven't started with the game yet.");
                } else {
                    return message.channel.send(`${user.username} hasn't started with the game yet.`);
                };
            };

            const uniq =  inventory[user.id + message.guild.id].reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) thumbnail = characters[favChar[user.id + message.guild.id]].image;

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s profile`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription(`Since last <:STier:869316518675095552> pull: **${pity[user.id + message.guild.id].lastS}**/70\nSince last <:SSTier:869316489931546644> pull: **${pity[user.id + message.guild.id].lastSS}**/180\n\nYou have pulled a total of **${pity[user.id + message.guild.id].pullsTotal}** times!`)
            .setThumbnail(thumbnail)
            message.channel.send(Embed);
            return;
        };

        // Pull
        if (message.content.toLowerCase().startsWith("!p")) {

            if (message.channel.id === "538062289291444224") return;

            var pullCount = JSON.parse(fs.readFileSync('Storage/pullCount.json', 'utf8'));
            if (!inventory[message.author.id + message.guild.id]) inventory[message.author.id + message.guild.id] = [];
            if (!pity[message.author.id + message.guild.id]) pity[message.author.id + message.guild.id] = { pullsTotal: 0, lastSS: 0, lastS: 0, };
            if (!ref[message.author.id + message.guild.id]) ref[message.author.id + message.guild.id] = {};
            if (!pullCount[message.author.id + message.guild.id] && pullCount[message.author.id + message.guild.id] !== 0) pullCount[message.author.id + message.guild.id] = 2;

            // Change %2 === 0 to 1 during winter ?
            if (pullCount[message.author.id + message.guild.id] > 5) {
                let time = new Date();
                let nextPull = time.getHours() % 2 === 0 ? Math.ceil(time/3600000)*3600000 + 3600000 : Math.ceil(time/3600000)*3600000;
                let timeLeft = nextPull - time;
                if (timeLeft > 7200000 - 60000) return message.channel.send(`You've reached your pull limit, please wait **2**h`);
                return message.channel.send(`You've reached your pull limit, please wait ${timeLeft > 3600000 ? "**1**h " : ""}**${timeLeft > 3600000 ? Math.ceil((timeLeft - 3600000)/60000) : Math.ceil((timeLeft)/60000)}** min`);
            };

            let ranRar = Math.floor(Math.random() * 1000); // 0-999

            pity[message.author.id + message.guild.id].pullsTotal++;
            if (ranRar > 2) pity[message.author.id + message.guild.id].lastSS++;
            if (ranRar > 20) pity[message.author.id + message.guild.id].lastS++;

            if (pity[message.author.id + message.guild.id].lastS == 70 && pity[message.author.id + message.guild.id].lastSS == 180) { ranRar = 1; pity[message.author.id + message.guild.id].lastS--; pity[message.author.id + message.guild.id].lastSS = 0 };
            if (pity[message.author.id + message.guild.id].lastS == 70) { ranRar = 10; pity[message.author.id + message.guild.id].lastS = 0 };
            if (pity[message.author.id + message.guild.id].lastSS == 180) { ranRar = 1; pity[message.author.id + message.guild.id].lastSS = 0 };

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
                ssClass[ssNum].displayMy();
            } else if (ranRar < 21) {
                const sClass = characters.filter((e) => e.rarity === "S");
                const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                pity[message.author.id + message.guild.id].lastS = 0;
                if (!ref[message.author.id + message.guild.id][sClass[sNum].id]) ref[message.author.id + message.guild.id][sClass[sNum].id] = 0;
                ref[message.author.id + message.guild.id][sClass[sNum].id]++;
                sClass[sNum].displayMy();
            } else if (ranRar < 63) {
                const aClass = characters.filter((e) => e.rarity === "A");
                const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                if (!ref[message.author.id + message.guild.id][aClass[aNum].id]) ref[message.author.id + message.guild.id][aClass[aNum].id] = 0;
                ref[message.author.id + message.guild.id][aClass[aNum].id]++;
                aClass[aNum].displayMy();
            } else if (ranRar < 189) {
                const bClass = characters.filter((e) => e.rarity === "B");
                const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                if (!ref[message.author.id + message.guild.id][bClass[bNum].id]) ref[message.author.id + message.guild.id][bClass[bNum].id] = 0;
                ref[message.author.id + message.guild.id][bClass[bNum].id]++;
                bClass[bNum].displayMy();
            } else if (ranRar < 442) {
                const cClass = characters.filter((e) => e.rarity === "C");
                const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                if (!ref[message.author.id + message.guild.id][cClass[cNum].id]) ref[message.author.id + message.guild.id][cClass[cNum].id] = 0;
                ref[message.author.id + message.guild.id][cClass[cNum].id]++;
                cClass[cNum].displayMy();
            } else if (ranRar < 1000) {
                const dClass = characters.filter((e) => e.rarity === "D");
                const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                if (!ref[message.author.id + message.guild.id][dClass[dNum].id]) ref[message.author.id + message.guild.id][dClass[dNum].id] = 0;
                ref[message.author.id + message.guild.id][dClass[dNum].id]++;
                dClass[dNum].displayMy();
            };

            pullCount[message.author.id + message.guild.id]++;
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

        // Shop
        if (message.content.toLowerCase().startsWith("!shop")) {
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Shop")
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .setDescription("Card game shop to buy character packs.\nUse `!buy <id>` to buy one")
            .addField("#1 | Character Pack - 250<:coins:872926669055356939>", "Get a random character")
            .addField("#2 | Waifu Pack- 250<:coins:872926669055356939>", "Get a random waifu")
            .addField("#3 | Husbando Pack - 250<:coins:872926669055356939>", "Get a random husbando")
            .addField("#4 | Character Bundle - 600<:coins:872926669055356939>", "Get 3 characters for a discount")
            .addField("#5 | Rare Pack - 400<:coins:872926669055356939>", "Get at least a <:CTier:869316602858991657>-Tier character")
            .addField("#6 | Morpheus Blessing - 2000<:coins:872926669055356939>", "Get a guaranteed new character\n(_<:SSTier:869316489931546644>-Tier are excluded from this pack_)")
            .setFooter(`Balance: ${coins[message.author.id + message.guild.id]} coins`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            message.channel.send(Embed)
        };

        // Buy
        if (message.content.toLowerCase().startsWith("!buy")) {
            if (!args[0]) return message.channel.send("Please specify what you want to buy\nUsage: `!buy <id>`")
            if (isNaN(args[0])) return message.channel.send("Please use the ID of the item you want to buy")
            if (parseInt(args[0]) < 0 || parseInt(args[0]) > 6) return message.channel.send(`**${args[0]}** is not a valid ID. Please see \`!shop\``)
            
            if (!inventory[message.author.id + message.guild.id]) inventory[message.author.id + message.guild.id] = [];
            
            const ranRar = Math.floor(Math.random() * 1000); // 0-999
            const ranRar2 = Math.floor(Math.random() * 1000); // 0-999
            const ranRar3 = Math.floor(Math.random() * 1000); // 0-999

            if (args[0] === "0") {
                return message.channel.send(`**${args[0]}** is not a valid ID. Please see \`!shop\``)
            } else if (args[0] === "1") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 250) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 250;

                if (ranRar < 3) {
                    const ssClass = characters.filter((e) => e.rarity === "SS");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                    ssClass[ssNum].displayMy();
                } else if (ranRar < 21) {
                    const sClass = characters.filter((e) => e.rarity === "S");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                    sClass[sNum].displayMy();
                } else if (ranRar < 63) {
                    const aClass = characters.filter((e) => e.rarity === "A");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    aClass[aNum].displayMy();
                } else if (ranRar < 189) {
                    const bClass = characters.filter((e) => e.rarity === "B");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    bClass[bNum].displayMy();
                } else if (ranRar < 442) {
                    const cClass = characters.filter((e) => e.rarity === "C");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    cClass[cNum].displayMy();
                } else if (ranRar < 1000) {
                    const dClass = characters.filter((e) => e.rarity === "D");
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                    dClass[dNum].displayMy();
                };
            } else if (args[0] === "2") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 250) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 250;

                if (ranRar < 3) {
                    const ssClass = characters.filter((e) => e.rarity === "SS" && e.gender === "F");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                    ssClass[ssNum].displayMy();
                } else if (ranRar < 21) {
                    const sClass = characters.filter((e) => e.rarity === "S" && e.gender === "F");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                    sClass[sNum].displayMy();
                } else if (ranRar < 63) {
                    const aClass = characters.filter((e) => e.rarity === "A" && e.gender === "F");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    aClass[aNum].displayMy();
                } else if (ranRar < 189) {
                    const bClass = characters.filter((e) => e.rarity === "B" && e.gender === "F");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    bClass[bNum].displayMy();
                } else if (ranRar < 442) {
                    const cClass = characters.filter((e) => e.rarity === "C" && e.gender === "F");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    cClass[cNum].displayMy();
                } else if (ranRar < 1000) {
                    const dClass = characters.filter((e) => e.rarity === "D" && e.gender === "F");
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                    dClass[dNum].displayMy();
                };
            } else if (args[0] === "3") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 250) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 250;

                if (ranRar < 3) {
                    const ssClass = characters.filter((e) => e.rarity === "SS" && e.gender === "M");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                    ssClass[ssNum].displayMy();
                } else if (ranRar < 21) {
                    const sClass = characters.filter((e) => e.rarity === "S" && e.gender === "M");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                    sClass[sNum].displayMy();
                } else if (ranRar < 63) {
                    const aClass = characters.filter((e) => e.rarity === "A" && e.gender === "M");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    aClass[aNum].displayMy();
                } else if (ranRar < 189) {
                    const bClass = characters.filter((e) => e.rarity === "B" && e.gender === "M");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    bClass[bNum].displayMy();
                } else if (ranRar < 442) {
                    const cClass = characters.filter((e) => e.rarity === "C" && e.gender === "M");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    cClass[cNum].displayMy();
                } else if (ranRar < 1000) {
                    const dClass = characters.filter((e) => e.rarity === "D" && e.gender === "M");
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                    dClass[dNum].displayMy();
                };
            } else if (args[0] === "4") {
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 600) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 600;

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
                if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < 400) return message.channel.send("You don't have enough coins");
                coins[message.author.id + message.guild.id] -= 400;

                if (ranRar < 4) {
                    const ssClass = characters.filter((e) => e.rarity === "SS");
                    const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                    inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                    ssClass[ssNum].displayMy();
                } else if (ranRar < 30) {
                    const sClass = characters.filter((e) => e.rarity === "S");
                    const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                    inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                    sClass[sNum].displayMy();
                } else if (ranRar < 103) {
                    const aClass = characters.filter((e) => e.rarity === "A");
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    aClass[aNum].displayMy();
                } else if (ranRar < 412) {
                    const bClass = characters.filter((e) => e.rarity === "B");
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    bClass[bNum].displayMy();
                } else if (ranRar < 1000) {
                    const cClass = characters.filter((e) => e.rarity === "C");
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    cClass[cNum].displayMy();
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
                    sClass[sNum].displayMy();
                } else if (ranRar < 63) {
                    let rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "A")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B" || e.rarity === "C" || e.rarity === "D")) rarUp = "S";
                    const aClass = newChars.filter((e) => e.rarity === rarUp);
                    const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                    inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                    aClass[aNum].displayMy();
                } else if (ranRar < 189) {
                    let rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C" || e.rarity === "D")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C" || e.rarity === "D" || e.rarity === "A")) rarUp = "S";
                    const bClass = newChars.filter((e) => e.rarity === rarUp);
                    const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                    inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                    bClass[bNum].displayMy();
                } else if (ranRar < 442) {
                    let rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D" || e.rarity === "B")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D" || e.rarity === "B" || e.rarity === "A")) rarUp = "S";
                    const cClass = newChars.filter((e) => e.rarity === rarUp);
                    const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                    inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                    cClass[cNum].displayMy();
                } else if (ranRar < 1000) {
                    let rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "D")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C" || e.rarity === "B")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C" || e.rarity === "B" || e.rarity === "A")) rarUp = "S";
                    const dClass = newChars.filter((e) => e.rarity === rarUp);
                    const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                    inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                    dClass[dNum].displayMy();
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
        if (message.content.toLowerCase().startsWith("!daily")) {
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
                coins[message.author.id + message.guild.id] += dailyCoins;
                daily[message.author.id + message.guild.id]++;
                message.channel.send(`Added ${dailyCoins} coins to your balance`);
            } else {
                return message.channel.send("You have already claimed your daily");
            };

            fs.writeFile('Storage/daily.json', JSON.stringify(daily), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                if (err) console.error(err);
            });
            return;
        };

        // Inventory
        if (message.content.toLowerCase().startsWith("!inv")) {
            
            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();

            if (!inventory[user.id + message.guild.id]) {
                if (user.id === message.author.id) {
                    return message.channel.send("You don't have any characters");
                } else {
                    return message.channel.send(`${user.username} has no characters`);
                };
            };

            if (inventory[user.id + message.guild.id].length < 1) return message.channel.send("You don't have any characters");

            const inv = [];
            for (i=0; i < inventory[user.id + message.guild.id].length; i++) {
                inv.push(inventory[user.id + message.guild.id][i]);
            };
            
            const uniq = inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);

            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]].name);
            };
            if (message.content[4] === "a" || message.content[4] === "A") chars.sort();

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (!isNaN(parseInt(args[0])) && parseInt(args[0]) <= pagesTotal) {
                currPage = parseInt(args[0]);
            };

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) thumbnail = characters[favChar[user.id + message.guild.id]].image;

            if (message.content[4] === "r" || message.content[4] === "R" || message.content[4] === "d" || message.content[4] === "D") {

                if (message.content[4] === "d" || message.content[4] === "D") {
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

                if (message.content[4] === "d" || message.content[4] === "D") {
                    ssChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    sChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    aChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    bChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    cChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                    dChars.sort((a, b) => inv.filter((e) => e === b.id).length - inv.filter((e) => e === a.id).length);
                };

                function tierNamesInv (t, arr) {
                    if (message.content[4] === "d" || message.content[4] === "D") {
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
        if (message.content.toLowerCase().startsWith("!bal") || message.content.toLowerCase().startsWith("!coins")) {

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
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) thumbnail = characters[favChar[user.id + message.guild.id]].image;
            
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
        if (message.content.toLowerCase().startsWith("!sell")) {

            if (!args[0]) return message.channel.send("Please provide a name or ID");
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");

            const inv = [];
            for (i=0; i < inventory[message.author.id + message.guild.id].length; i++) {
                inv.push(inventory[message.author.id + message.guild.id][i]);
            };

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1];

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
        if (message.content.toLowerCase().startsWith("!give") || message.content.toLowerCase().startsWith("!gift")) {

            if (!args[0] || !args[0].startsWith("<@") || !message.mentions.users.first()) {
                if (message.content[3] === "v" || message.content[3] === "V") return message.channel.send("Please mention a user first. The command structure should look like this:\n`!give @user <amount of coins>`");
                if (message.content[3] === "f" || message.content[3] === "F") return message.channel.send("Please mention a user first. The command structure should look like this:\n`!gift @user <character name or ID>`");
            };
            
            let user = message.mentions.users.first();
            if (user.bot) return message.channel.send("You can't send something to a bot");
            if (user.id === message.author.id) return message.channel.send("no <:yogurtKek:794982064553328660>")

            // Give
            if (message.content[3] === "v" || message.content[3] === "V") {
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
            if (message.content[3] === "f" || message.content[3] === "F") {

                if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters. Use `!pull` to get started.");

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
        if (message.content.toLowerCase().startsWith("!trade")) {
            if (!message.mentions.users.first() || !args[0].startsWith("<@")) return message.channel.send("Please mention someone first\nUsage: `!trade @user <char to offer> , <char to receive>`");
            let user = message.mentions.users.first();
            if (user.bot) return message.channel.send("You can't trade with a bot <:Heh:848238885893177404>");
            if (user.id === message.author.id) return message.channel.send("You can't trade with yourself <:Heh:848238885893177404>");
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send(`You don't have any characters`);
            if (!inventory[user.id + message.guild.id]) return message.channel.send(`**${user.username}** doesn't have any characters`);

            args.shift();
            let msgLeft = args.join(" ");
            if (msgLeft.search(",") === -1) return message.channel.send("You have to seperate both characters with a `,`\nUsage: `!trade @user <char to offer> , <char to receive>`")
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
        if (message.content.toLowerCase().startsWith("!top")) {
            
            let keys = [];
            let showUsers = [];

            if (message.content.toLowerCase().startsWith("!topp")) {
                let pullsC = {};
                for (i=0; i < Object.keys(pity).length; i++) {
                    pullsC[Object.keys(pity)[i]] = pity[Object.keys(pity)[i]].pullsTotal;
                };
                
                let pullsSorted = Object.fromEntries(
                    Object.entries(pullsC).sort(([,a],[,b]) => b-a)
                );
                keys = Object.keys(pullsSorted);

                let i2 = 0;
                for (i=0; i < keys.length; i++) {
                    if (keys[i].slice(18, 37) === message.guild.id) {
                        showUsers.push(`${i2+1}. **${ccgUsers[keys[i].slice(0, 18)]}** - **${pullsSorted[keys[i]]}** pulls`);
                        i2++;
                    };
                };
            } else if (message.content.toLowerCase().startsWith("!topc%")) {
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
            } else if (message.content.toLowerCase().startsWith("!topc")) {
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
            } else if (message.content.toLowerCase().startsWith("!topa")) {
                const animeTotal = [];
                for (i=0; i < Object.keys(characters).length; i++) {
                    animeTotal.push(characters[i].anime);
                };
                const aTuniq =  animeTotal.reduce(function(a,b) {
                    if (a.indexOf(b) < 0 ) a.push(b);
                    return a;
                },[]);

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
                        for (j=0; j < aTuniq.length; j++) {
                            let animeCheck = characters.filter((e) => e.anime === aTuniq[j]).length;
                            let invCheck = chars.filter((e) => e.anime === aTuniq[j]).length;
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
            } else if (message.content.toLowerCase().startsWith("!topd")) {
                var dungeonFloors = JSON.parse(fs.readFileSync('Storage/dungeonFloors.json', 'utf8'));

                let floorsU = {};
                for (i=0; i < Object.keys(dungeonFloors).length; i++) {
                    floorsU[Object.keys(dungeonFloors)[i]] = parseInt(Object.keys(dungeonFloors[Object.keys(dungeonFloors)[i]])[Object.keys(dungeonFloors[Object.keys(dungeonFloors)[i]]).length-1]);
                };
                
                let floorsSorted = Object.fromEntries(
                    Object.entries(floorsU).sort(([,a],[,b]) => b-a)
                );
                keys = Object.keys(floorsSorted);

                let i2 = 0;
                for (i=0; i < keys.length; i++) {
                    if (keys[i].slice(18, 37) === message.guild.id) {
                        showUsers.push(`${i2+1}. **${ccgUsers[keys[i].slice(0, 18)]}** - Floor **${floorsSorted[keys[i]]}**`);
                        i2++;
                    };
                };
            } else {
                let xpSorted = Object.fromEntries(
                    Object.entries(xp).sort(([,a],[,b]) => b-a)
                );
                keys = Object.keys(xpSorted);
                let i2 = 0;
                for (i=0; i < keys.length; i++) {
                    if (keys[i].slice(18, 37) === message.guild.id) {
                        let xpr = xp[keys[i].slice(0, 18) + message.guild.id];
                        let level = 0;
                        for (j=1; xpr >= 0; j++) {
                            xpr -= Math.floor(5*Math.log(j)*Math.log(j)*Math.log(j)*Math.log(j) + 30);
                            level++;
                        };
                        showUsers.push(`${i2+1}. **${ccgUsers[keys[i].slice(0, 18)]}** - Level **${level}**`);
                        i2++;
                    };
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
        if (message.content.toLowerCase().startsWith("!stats")) {
            const waifuT = characters.filter((e) => e.gender === "F");
            const husbT = characters.filter((e) => e.gender === "M");
            const charT = waifuT.length + husbT.length;
            const ssT = characters.filter((e) => e.rarity === "SS");
            const sT = characters.filter((e) => e.rarity === "S");
            const aT = characters.filter((e) => e.rarity === "A");
            const bT = characters.filter((e) => e.rarity === "B");
            const cT = characters.filter((e) => e.rarity === "C");
            const dT = characters.filter((e) => e.rarity === "D");

            const animeNames = [];
            for (i=0; i < Object.keys(characters).length; i++) {
                animeNames.push(characters[i].anime);
            };
            const uniq =  animeNames.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Card Game Stats")
            .setDescription("")
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .addFields(
                { name: 'Characters', value: "<:Rem:869894433385095198> **Waifu total**: " + waifuT.length + "\n<:Yato:869897062672642118> **Husbando total**: " + husbT.length + "\n<:Gawrgura:869894477752447007> **Characters total**: " + charT, inline: true},
                { name: 'Anime', value: "<:Menhera:869913008686649374> **Anime total**: " + uniq.length, inline: true },
                { name: '\u200B', value: '_ _' },
                { name: 'Rarity', value: "<:SSTier:869316489931546644> **Tier**: " + ssT.length + "\n<:ATier:869316558013464627> **Tier**: " + aT.length + "\n<:CTier:869316602858991657> **Tier**: " + cT.length, inline: true },
                { name: '_ _', value: "<:STier:869316518675095552> **Tier**: " + sT.length + "\n<:BTier:869316586803179571> **Tier**: " + bT.length + "\n<:DTier:869316616071032843> **Tier**: " + dT.length, inline: true },
            )
            message.channel.send(Embed);
        };

        // Base stats
        if (message.content.toLowerCase().startsWith("!is") || message.content.toLowerCase().startsWith("!infos") || message.content.toLowerCase().startsWith("!infostats")) {

            if (!args[0]) {
                return message.channel.send("Please provide a name or ID");
            };

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1];

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
            return fArray.base();
        };
        
        // Charakter stats
        if (message.content.toLowerCase().startsWith("!ims") || message.content.toLowerCase().startsWith("!infomystats")) {
            
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");
            if (!args[0] && (battleChar[message.author.id + message.guild.id] || battleChar[message.author.id + message.guild.id] === 0)) args[0] = "" + battleChar[message.author.id + message.guild.id];
            if (!args[0]) return message.channel.send("Please provide a name or ID");

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1];

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

            // HP 1-10
            let sha = 1+parseInt(sha24(fArray.id)[1]);
            // ATK 1-9
            function sumDigits(n) {
                let numArr = n.toString().split("");
                let sum = numArr.reduce(function(a, b){
                    return parseInt(a) + parseInt(b);
                }, 0);
                return sum;
            };
            let qs = sumDigits(sha24(fArray.id));
            while(qs > 9) {
                qs = sumDigits(qs)
            };
            // DEF 1-9
            let vDef = "";
            for (i=0; i < fArray.name.length; i++) {
                vDef += fArray.name[i].charCodeAt(0).toString(10);
            };
            vDef = sumDigits(vDef);
            while(vDef > 9) {
                vDef = sumDigits(vDef)
            };
            let hp;
            let atk;
            let def;
            let rm;
            if (!ref[message.author.id + message.guild.id][fArray.id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][fArray.id];
            };
            if (rm > 5) rm = 5;
            
            switch (fArray.rarity) {
                case "SS" : hp = Math.floor((1+0.25*(rm-1))*(180 + (6*sha))) + Math.round((5+(0.2*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(50 + Math.round(30/qs))) + Math.round((2.4+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(32 + Math.round(10/vDef))) + Math.round((1.25+(0.25/vDef))*(currLvl-1)); break;
                case "S" : hp = Math.floor((1+0.25*(rm-1))*(150 + (5*sha))) + Math.round((3.9+(0.06*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(40 + Math.round(15/qs))) + Math.round((1.9+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(24 + Math.round(10/vDef))) + Math.round((1+(0.2/vDef))*(currLvl-1)); break;
                case "A" : hp = Math.floor((1+0.25*(rm-1))*(120 + (6*sha))) + Math.round((3.3+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(35 + Math.round(15/qs))) + Math.round((1.6+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(18 + Math.round(8/vDef))) + Math.round((0.8+(0.15/vDef))*(currLvl-1)); break;
                case "B" : hp = Math.floor((1+0.25*(rm-1))*(100 + (5*sha))) + Math.round((2.8+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(30 + Math.round(10/qs))) + Math.round((1.2+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(15 + Math.round(7/vDef))) + Math.round((0.6+(0.2/vDef))*(currLvl-1)); break;
                case "C" : hp = Math.floor((1+0.25*(rm-1))*(80 + (4*sha))) + Math.round((2.4+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(25 + Math.round(10/qs))) + Math.round((0.9+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(12 + Math.round(6/vDef))) + Math.round((0.5+(0.15/vDef))*(currLvl-1)); break;
                case "D" : hp = Math.floor((1+0.25*(rm-1))*(70 + (3*sha))) + Math.round((2+(0.05*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(20 + Math.round(10/qs))) + Math.round((0.75+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(10 + Math.round(5/vDef))) + Math.round((0.4+(0.5/vDef))*(currLvl-1)); break;
                default : hp = 1; atk = 1; def = 1; break;
            };
            let ep = Math.floor(((hp/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def)) / (100/atk))*100) / 100;

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

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(fArray.image)
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
        if (message.content.toLowerCase().startsWith("!rankmy")) {

            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");
            
            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            let uniq = characters.filter((e) => inventory[message.author.id + message.guild.id].includes(e.id));

            let rok = {};
            for (j=0; j < uniq.length; j++) {
                let currLvl;
                if (!charlvl[message.author.id + message.guild.id][uniq[j].id]){
                    currLvl = 1;
                } else {
                    currLvl = charlvl[message.author.id + message.guild.id][uniq[j].id]
                }

                // HP
                let sha = 1+parseInt(sha24(uniq[j].id)[1]);
                // ATK 1-9
                function sumDigits(n) {
                    let numArr = n.toString().split("");
                    let sum = numArr.reduce(function(a, b){
                        return parseInt(a) + parseInt(b);
                    }, 0);
                    return sum;
                };
                let qs = sumDigits(sha24(uniq[j].id));
                while(qs > 9) {
                    qs = sumDigits(qs)
                };
                // DEF 1-9
                let vDef = "";
                for (i=0; i < uniq[j].name.length; i++) {
                    vDef += uniq[j].name[i].charCodeAt(0).toString(10);
                };
                vDef = sumDigits(vDef);
                while(vDef > 9) {
                    vDef = sumDigits(vDef)
                };
                let hp;
                let atk;
                let def;
                let rm;
                if (!ref[message.author.id + message.guild.id][uniq[j].id]) {
                    rm = 0;
                } else {
                    rm = ref[message.author.id + message.guild.id][uniq[j].id];
                };
                if (rm > 5) rm = 5;
                switch (uniq[j].rarity) {
                    case "SS" : hp = Math.floor((1+0.25*(rm-1))*(180 + (6*sha))) + Math.round((5+(0.2*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(50 + Math.round(30/qs))) + Math.round((2.4+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(32 + Math.round(10/vDef))) + Math.round((1.25+(0.25/vDef))*(currLvl-1)); break;                    
                    case "S" : hp = Math.floor((1+0.25*(rm-1))*(150 + (5*sha))) + Math.round((3.9+(0.06*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(40 + Math.round(15/qs))) + Math.round((1.9+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(24 + Math.round(10/vDef))) + Math.round((1+(0.2/vDef))*(currLvl-1)); break;
                    case "A" : hp = Math.floor((1+0.25*(rm-1))*(120 + (6*sha))) + Math.round((3.3+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(35 + Math.round(15/qs))) + Math.round((1.6+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(18 + Math.round(8/vDef))) + Math.round((0.8+(0.15/vDef))*(currLvl-1)); break;
                    case "B" : hp = Math.floor((1+0.25*(rm-1))*(100 + (5*sha))) + Math.round((2.8+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(30 + Math.round(10/qs))) + Math.round((1.2+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(15 + Math.round(7/vDef))) + Math.round((0.6+(0.2/vDef))*(currLvl-1)); break;
                    case "C" : hp = Math.floor((1+0.25*(rm-1))*(80 + (4*sha))) + Math.round((2.4+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(25 + Math.round(10/qs))) + Math.round((0.9+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(12 + Math.round(6/vDef))) + Math.round((0.5+(0.15/vDef))*(currLvl-1)); break;
                    case "D" : hp = Math.floor((1+0.25*(rm-1))*(70 + (3*sha))) + Math.round((2+(0.05*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(20 + Math.round(10/qs))) + Math.round((0.75+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(10 + Math.round(5/vDef))) + Math.round((0.4+(0.5/vDef))*(currLvl-1)); break;
                    default : hp = 1; atk = 1; def = 1; break;
                };
                let ep = Math.floor(((hp/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def)) / (100/atk))*100) / 100;
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
        if (message.content.toLowerCase().startsWith("!ranks")) {

            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");

            let sInv = {};
            for (i=0; i < Object.keys(inventory).length; i++) {
                if (Object.keys(inventory)[i].slice(18, 37) === message.guild.id) {
                    sInv[Object.keys(inventory)[i]] = inventory[Object.keys(inventory)[i]];
                };
            };

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

                    // HP
                    let sha = 1+parseInt(sha24(uniq[j].id)[1]);
                    // ATK 1-9
                    function sumDigits(n) {
                        let numArr = n.toString().split("");
                        let sum = numArr.reduce(function(a, b){
                            return parseInt(a) + parseInt(b);
                        }, 0);
                        return sum;
                    };
                    let qs = sumDigits(sha24(uniq[j].id));
                    while(qs > 9) {
                        qs = sumDigits(qs)
                    };
                    // DEF 1-9
                    let vDef = "";
                    for (i=0; i < uniq[j].name.length; i++) {
                        vDef += uniq[j].name[i].charCodeAt(0).toString(10);
                    };
                    vDef = sumDigits(vDef);
                    while(vDef > 9) {
                        vDef = sumDigits(vDef)
                    };
                    let hp, atk, def;
                    let rm;
                    if (!ref[Object.keys(sInv)[s]][uniq[j].id]) {
                        rm = 0;
                    } else {
                        rm = ref[Object.keys(sInv)[s]][uniq[j].id];
                    };
                    if (rm > 5) rm = 5;
                    switch (uniq[j].rarity) {
                        case "SS" : hp = Math.floor((1+0.25*(rm-1))*(180 + (6*sha))) + Math.round((5+(0.2*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(50 + Math.round(30/qs))) + Math.round((2.4+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(32 + Math.round(10/vDef))) + Math.round((1.25+(0.25/vDef))*(currLvl-1)); break;                    
                        case "S" : hp = Math.floor((1+0.25*(rm-1))*(150 + (5*sha))) + Math.round((3.9+(0.06*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(40 + Math.round(15/qs))) + Math.round((1.9+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(24 + Math.round(10/vDef))) + Math.round((1+(0.2/vDef))*(currLvl-1)); break;
                        case "A" : hp = Math.floor((1+0.25*(rm-1))*(120 + (6*sha))) + Math.round((3.3+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(35 + Math.round(15/qs))) + Math.round((1.6+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(18 + Math.round(8/vDef))) + Math.round((0.8+(0.15/vDef))*(currLvl-1)); break;
                        case "B" : hp = Math.floor((1+0.25*(rm-1))*(100 + (5*sha))) + Math.round((2.8+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(30 + Math.round(10/qs))) + Math.round((1.2+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(15 + Math.round(7/vDef))) + Math.round((0.6+(0.2/vDef))*(currLvl-1)); break;
                        case "C" : hp = Math.floor((1+0.25*(rm-1))*(80 + (4*sha))) + Math.round((2.4+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(25 + Math.round(10/qs))) + Math.round((0.9+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(12 + Math.round(6/vDef))) + Math.round((0.5+(0.15/vDef))*(currLvl-1)); break;
                        case "D" : hp = Math.floor((1+0.25*(rm-1))*(70 + (3*sha))) + Math.round((2+(0.05*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(20 + Math.round(10/qs))) + Math.round((0.75+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(10 + Math.round(5/vDef))) + Math.round((0.4+(0.5/vDef))*(currLvl-1)); break;
                        default : hp = 1; atk = 1; def = 1; break;
                    };
                    let ep = Math.floor(((hp/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def)) / (100/atk))*100) / 100;
                    if (ep >= 100) rok[Object.keys(sInv)[s] + " " + uniq[j].id] = ep;
                };
            };

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
        if (message.content.toLowerCase().startsWith("!rank")) {
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
                // HP
                let sha = 1+parseInt(sha24(j)[1]);
                // ATK 1-9
                function sumDigits(n) {
                    let numArr = n.toString().split("");
                    let sum = numArr.reduce(function(a, b){
                        return parseInt(a) + parseInt(b);
                    }, 0);
                    return sum;
                };
                let qs = sumDigits(sha24(j));
                while(qs > 9) {
                    qs = sumDigits(qs)
                };
                // DEF 1-9
                let vDef = "";
                for (i=0; i < characters[j].name.length; i++) {
                    vDef += characters[j].name[i].charCodeAt(0).toString(10);
                };
                vDef = sumDigits(vDef);
                while(vDef > 9) {
                    vDef = sumDigits(vDef)
                };
                let hp;
                let atk;
                let def;
                switch (characters[j].rarity) {
                    case "SS" : hp = 180 + (6*sha); atk = 50 + Math.round(30/qs); def = 32 + Math.round(10/vDef); break;
                    case "S" : hp = 150 + (5*sha); atk = 40 + Math.round(15/qs); def = 24 + Math.round(10/vDef); break;
                    case "A" : hp = 120 + (6*sha); atk = 35 + Math.round(15/qs); def = 18 + Math.round(8/vDef); break;
                    case "B" : hp = 100 + (5*sha); atk = 30 + Math.round(10/qs); def = 15 + Math.round(7/vDef); break;
                    case "C" : hp = 80 + (4*sha); atk = 25 + Math.round(10/qs); def = 12 + Math.round(6/vDef); break;
                    case "D" : hp = 70 + (3*sha); atk = 20 + Math.round(10/qs); def = 10 + Math.round(5/vDef); break;
                    default : hp = 1; atk = 1; def = 1; break;
                };

                let ep = Math.floor(((hp/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def)) / (100/atk))*100) / 100
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
        if (message.content.toLowerCase().startsWith("!levelup") || message.content.toLowerCase().startsWith("!lvlup") || message.content.toLowerCase().startsWith("!lu")) {
            
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");

            if (!args[0]) {
                return message.channel.send("Please provide a name or ID");
            };

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

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1];

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
            if (!coins[message.author.id + message.guild.id] || coins[message.author.id + message.guild.id] < price) return message.channel.send("You don't have enough coins");
            
            // HP 1-10
            let sha = 1+parseInt(sha24(fArray.id)[1]);
            // ATK 1-9
            function sumDigits(n) {
                let numArr = n.toString().split("");
                let sum = numArr.reduce(function(a, b){
                    return parseInt(a) + parseInt(b);
                }, 0);
                return sum;
            };
            let qs = sumDigits(sha24(fArray.id));
            while(qs > 9) {
                qs = sumDigits(qs)
            };
            // DEF 1-9
            let vDef = "";
            for (i=0; i < fArray.name.length; i++) {
                vDef += fArray.name[i].charCodeAt(0).toString(10);
            };
            vDef = sumDigits(vDef);
            while(vDef > 9) {
                vDef = sumDigits(vDef)
            };
            let hp;
            let atk;
            let def;
            let rm;
            if (!ref[message.author.id + message.guild.id][fArray.id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][fArray.id];
            };
            if (rm > 5) rm = 5;
            
            switch (fArray.rarity) {
                case "SS" : hp = Math.floor((1+0.25*(rm-1))*(180 + (6*sha))) + Math.round((5+(0.2*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(50 + Math.round(30/qs))) + Math.round((2.4+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(32 + Math.round(10/vDef))) + Math.round((1.25+(0.25/vDef))*(currLvl-1)); break;
                case "S" : hp = Math.floor((1+0.25*(rm-1))*(150 + (5*sha))) + Math.round((3.9+(0.06*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(40 + Math.round(15/qs))) + Math.round((1.9+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(24 + Math.round(10/vDef))) + Math.round((1+(0.2/vDef))*(currLvl-1)); break;
                case "A" : hp = Math.floor((1+0.25*(rm-1))*(120 + (6*sha))) + Math.round((3.3+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(35 + Math.round(15/qs))) + Math.round((1.6+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(18 + Math.round(8/vDef))) + Math.round((0.8+(0.15/vDef))*(currLvl-1)); break;
                case "B" : hp = Math.floor((1+0.25*(rm-1))*(100 + (5*sha))) + Math.round((2.8+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(30 + Math.round(10/qs))) + Math.round((1.2+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(15 + Math.round(7/vDef))) + Math.round((0.6+(0.2/vDef))*(currLvl-1)); break;
                case "C" : hp = Math.floor((1+0.25*(rm-1))*(80 + (4*sha))) + Math.round((2.4+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(25 + Math.round(10/qs))) + Math.round((0.9+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(12 + Math.round(6/vDef))) + Math.round((0.5+(0.15/vDef))*(currLvl-1)); break;
                case "D" : hp = Math.floor((1+0.25*(rm-1))*(70 + (3*sha))) + Math.round((2+(0.05*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(20 + Math.round(10/qs))) + Math.round((0.75+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(10 + Math.round(5/vDef))) + Math.round((0.4+(0.5/vDef))*(currLvl-1)); break;
                default : hp = 1; atk = 1; def = 1; break;
            };
            let ep = Math.floor(((hp/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def)) / (100/atk))*100) / 100;

            let hp2;
            let atk2;
            let def2;
            switch (fArray.rarity) {
                case "SS" : hp2 = (1+0.25*(rm-1))*(180 + (6*sha)) + Math.round((5+(0.2*sha))*(currLvl-1+up)); atk2 = (1+0.25*(rm-1))*(50 + Math.round(30/qs)) + Math.round((2.4+(0.35/qs))*(currLvl-1+up)); def2 = (1+0.25*(rm-1))*(32 + Math.round(10/vDef)) + Math.round((1.25+(0.25/vDef))*(currLvl-1+up)); break;
                case "S" : hp2 = (1+0.25*(rm-1))*(150 + (5*sha)) + Math.round((3.9+(0.06*sha))*(currLvl-1+up)); atk2 = (1+0.25*(rm-1))*(40 + Math.round(15/qs)) + Math.round((1.9+(0.3/qs))*(currLvl-1+up)); def2 = (1+0.25*(rm-1))*(24 + Math.round(10/vDef)) + Math.round((1+(0.2/vDef))*(currLvl-1+up)); break;
                case "A" : hp2 = (1+0.25*(rm-1))*(120 + (6*sha)) + Math.round((3.3+(0.04*sha))*(currLvl-1+up)); atk2 = (1+0.25*(rm-1))*(35 + Math.round(15/qs)) + Math.round((1.6+(0.25/qs))*(currLvl-1+up)); def2 = (1+0.25*(rm-1))*(18 + Math.round(8/vDef)) + Math.round((0.8+(0.15/vDef))*(currLvl-1+up)); break;
                case "B" : hp2 = (1+0.25*(rm-1))*(100 + (5*sha)) + Math.round((2.8+(0.04*sha))*(currLvl-1+up)); atk2 = (1+0.25*(rm-1))*(30 + Math.round(10/qs)) + Math.round((1.2+(0.3/qs))*(currLvl-1+up)); def2 = (1+0.25*(rm-1))*(15 + Math.round(7/vDef)) + Math.round((0.6+(0.2/vDef))*(currLvl-1+up)); break;
                case "C" : hp2 = (1+0.25*(rm-1))*(80 + (4*sha)) + Math.round((2.4+(0.04*sha))*(currLvl-1+up)); atk2 = (1+0.25*(rm-1))*(25 + Math.round(10/qs)) + Math.round((0.9+(0.35/qs))*(currLvl-1+up)); def2 = (1+0.25*(rm-1))*(12 + Math.round(6/vDef)) + Math.round((0.5+(0.15/vDef))*(currLvl-1+up)); break;
                case "D" : hp2 = (1+0.25*(rm-1))*(70 + (3*sha)) + Math.round((2+(0.05*sha))*(currLvl-1+up)); atk2 = (1+0.25*(rm-1))*(20 + Math.round(10/qs)) + Math.round((0.75+(0.25/qs))*(currLvl-1+up)); def2 = (1+0.25*(rm-1))*(10 + Math.round(5/vDef)) + Math.round((0.4+(0.5/vDef))*(currLvl-1+up)); break;
                default : hp2 = 1; atk2 = 1; def2 = 1; break;
            };
            let ep2 = Math.floor(((hp2/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def2)) / (100/atk2))*100) / 100;

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
        if (message.content.toLowerCase().startsWith("!reset")) {
            if (!args[0]) return message.channel.send("Please provide a name or ID")
            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1];

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
            price = Math.floor(price*0.8)
            if (!coins[message.author.id + message.guild.id]) coins[message.author.id + message.guild.id] = 0;

            message.channel.send(`Do you want to reset **${fArray.name}**'s level for **${price}**<:coins:872926669055356939>? (You only get back 80% of what you've invested)`).then(msg => {
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
        if (message.content.toLowerCase().startsWith("!ep")) {
            if (isNaN(args[0]) || isNaN(args[1]) || isNaN(args[2])) return;
            message.channel.send(Math.floor(((parseInt(args[0])/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),parseInt(args[2]))) / (100/parseInt(args[1])))*100) / 100)
        };

        // Abilities
        if (message.content.toLowerCase().startsWith("!abilities")) {

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
            let aEP = Math.floor(((average[0]/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),average[2])) / (100/average[1]))*100) / 100;

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

        // Dungeon
        if (message.content.toLowerCase().startsWith("!dungeon") || message.content.toLowerCase().startsWith("!d")) {

            if (message.content.toLowerCase() == "!d bump") return;
            if (message.channel.id === '722542408381759610') return;
            
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
            
            if (!battleChar[message.author.id + message.guild.id]) return message.channel.send("You have to choose a battle character first. Use `!bc <char name>` to choose one.");

            let floor = parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1]);
            if (args[0] && !isNaN(args[0])) {
                if (typeof dungeonFloors[message.author.id + message.guild.id][args[0]] !== 'undefined') {
                    floor = parseInt(args[0]);
                } else {
                    return message.channel.send(`You haven't unlocked Floor ${args[0]} yet. You need 20 wins per floor to unlock the next one or just 1 if it's a boss floor.`)
                };
            };

            // Check if daily limit reached
            if (floor === parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1])) {
                if (dungeonLimit[message.author.id + message.guild.id]["current"] > 7 && dungeonLimit[message.author.id + message.guild.id]["normal"] > 7) return message.channel.send("You have reached your limit for this interval. Please wait until the next reset or look up our patreon <:yogurtKek:868979547402551386>");
                if (dungeonLimit[message.author.id + message.guild.id]["current"] > 7 && floor !== 1) return message.channel.send("You have reached your limit for this floor, but you can still challenge lower level floors.\nUsage: `!dungeon <floor>`");
                if (dungeonLimit[message.author.id + message.guild.id]["current"] > 7) return message.channel.send("You have reached your limit for this interval. Please wait until the next reset or look up our patreon <:yogurtKek:868979547402551386>");
                dungeonLimit[message.author.id + message.guild.id]["current"]++;
            } else {
                if (dungeonLimit[message.author.id + message.guild.id]["current"] > 7 && dungeonLimit[message.author.id + message.guild.id]["normal"] > 7) return message.channel.send("You have reached your limit for this interval. Please wait until the next reset or look up our patreon <:yogurtKek:868979547402551386>");
                if (dungeonLimit[message.author.id + message.guild.id]["normal"] > 7) return message.channel.send("You have reached your limit for the lower level floors, but you can still challenge floor " + parseInt(Object.keys(dungeonFloors[message.author.id + message.guild.id])[Object.keys(dungeonFloors[message.author.id + message.guild.id]).length-1]) + ".\nUsage: `!dungeon <floor>`");
                dungeonLimit[message.author.id + message.guild.id]["normal"]++;
            };
            fs.writeFile('Storage/dungeonLimit.json', JSON.stringify(dungeonLimit), (err) => {
                if (err) console.error(err);
            });

            let myChar = characters[battleChar[message.author.id + message.guild.id]];

            if (!charlvl[message.author.id + message.guild.id]) charlvl[message.author.id + message.guild.id] = {};
            if (!charlvl[message.author.id + message.guild.id][myChar.id]) charlvl[message.author.id + message.guild.id][myChar.id] = 1;
            
            let currLvl = charlvl[message.author.id + message.guild.id][myChar.id];
            let myHP, myATK, myDEF;

            // HP 1-10
            let sha = 1+parseInt(sha24(myChar.id)[1]);
            // ATK 1-9
            function sumDigits(n) {
                let numArr = n.toString().split("");
                let sum = numArr.reduce(function(a, b){
                    return parseInt(a) + parseInt(b);
                }, 0);
                return sum;
            };
            let qs = sumDigits(sha24(myChar.id));
            while(qs > 9) {
                qs = sumDigits(qs)
            };
            // DEF 1-9
            let vDef = "";
            for (i=0; i < myChar.name.length; i++) {
                vDef += myChar.name[i].charCodeAt(0).toString(10);
            };
            vDef = sumDigits(vDef);
            while(vDef > 9) {
                vDef = sumDigits(vDef)
            };
            let rm;
            if (!ref[message.author.id + message.guild.id][myChar.id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][myChar.id];
            };
            if (rm > 5) rm = 5;
            
            switch (myChar.rarity) {
                case "SS" : myHP = Math.floor((1+0.25*(rm-1))*(180 + (6*sha))) + Math.round((5+(0.2*sha))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*(50 + Math.round(30/qs))) + Math.round((2.4+(0.35/qs))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*(32 + Math.round(10/vDef))) + Math.round((1.25+(0.25/vDef))*(currLvl-1)); break;
                case "S" : myHP = Math.floor((1+0.25*(rm-1))*(150 + (5*sha))) + Math.round((3.9+(0.06*sha))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*(40 + Math.round(15/qs))) + Math.round((1.9+(0.3/qs))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*(24 + Math.round(10/vDef))) + Math.round((1+(0.2/vDef))*(currLvl-1)); break;
                case "A" : myHP = Math.floor((1+0.25*(rm-1))*(120 + (6*sha))) + Math.round((3.3+(0.04*sha))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*(35 + Math.round(15/qs))) + Math.round((1.6+(0.25/qs))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*(18 + Math.round(8/vDef))) + Math.round((0.8+(0.15/vDef))*(currLvl-1)); break;
                case "B" : myHP = Math.floor((1+0.25*(rm-1))*(100 + (5*sha))) + Math.round((2.8+(0.04*sha))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*(30 + Math.round(10/qs))) + Math.round((1.2+(0.3/qs))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*(15 + Math.round(7/vDef))) + Math.round((0.6+(0.2/vDef))*(currLvl-1)); break;
                case "C" : myHP = Math.floor((1+0.25*(rm-1))*(80 + (4*sha))) + Math.round((2.4+(0.04*sha))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*(25 + Math.round(10/qs))) + Math.round((0.9+(0.35/qs))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*(12 + Math.round(6/vDef))) + Math.round((0.5+(0.15/vDef))*(currLvl-1)); break;
                case "D" : myHP = Math.floor((1+0.25*(rm-1))*(70 + (3*sha))) + Math.round((2+(0.05*sha))*(currLvl-1)); myATK = Math.floor((1+0.25*(rm-1))*(20 + Math.round(10/qs))) + Math.round((0.75+(0.25/qs))*(currLvl-1)); myDEF = Math.floor((1+0.25*(rm-1))*(10 + Math.round(5/vDef))) + Math.round((0.4+(0.5/vDef))*(currLvl-1)); break;
                default : myHP = 1; myATK = 1; myDEF = 1; break;
            };
            let myEP = Math.floor(((myHP/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),myDEF)) / (100/myATK))*100) / 100;
            let myHPd = myHP;
            let myHPt = myHP;
            let myATKd = myATK;
            let myDEFd = myDEF;

            let enemy = enemies.filter((e) => e.floor.includes(floor))[Math.floor(Math.random() * (enemies.filter((e) => e.floor.includes(floor)).length))]
            let eStats = enemy.stats(floor);
            let eHP = eStats[0];
            let eATK = eStats[1];
            let eDEF = eStats[2];
            let eEP = eStats[3];

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

            function matchResult(r) {
                let desc = "";
                if (r === "w") {
                    let unlocked = "";
                    if ((enemies.filter((e) => e.floor.includes(floor))[0].boss && dungeonFloors[message.author.id + message.guild.id][floor] == 1) || (!enemies.filter((e) => e.floor.includes(floor))[0].boss && dungeonFloors[message.author.id + message.guild.id][floor] == 20)) {
                        unlocked = `🔑 Floor **${floor+1}** has been unlocked`;
                        dungeonFloors[message.author.id + message.guild.id][floor+1] = 0;

                    };
                    desc = `<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n${unlocked}`;
                };
                if (r === "l") desc = `💀 **${myChar.name}** lost 💀\n${eEP > myEP ? `**${enemy.name}** was ${Math.floor((eEP/myEP)*10000)/100}% stronger` : "Better luck next time"}`
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`Dungeon Floor ${floor} ${enemy.boss ? "(Boss)" : ""}`)
                .setDescription(desc)
                .setThumbnail(myChar.image)
                .setFooter(`Balance: ${coins[message.author.id + message.guild.id]} coins`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                if (r === "w") {
                    let loot = 80 + Math.floor(Math.random() * floor * 10);
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
                            { name: '<:npbag:917192469450489856> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}\n${lootArr[6]}`, inline: true },
                            { name: '\u200B', value: `${lootArr[1]}\n${lootArr[4]}`, inline: true },
                            { name: '\u200B', value: `${lootArr[2]}\n${lootArr[5]}`, inline: true },
                        )
                    } else if (lootArr.length == 6) {
                        Embed.addFields(
                            { name: '<:npbag:917192469450489856> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}`, inline: true },
                            { name: '\u200B', value: `${lootArr[1]}\n${lootArr[4]}`, inline: true },
                            { name: '\u200B', value: `${lootArr[2]}\n${lootArr[5]}`, inline: true },
                        )
                    } else if (lootArr.length == 5) {
                        Embed.addFields(
                            { name: '<:npbag:917192469450489856> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}`, inline: true },
                            { name: '\u200B', value: `${lootArr[1]}\n${lootArr[4]}`, inline: true },
                            { name: '\u200B', value: `${lootArr[2]}`, inline: true },
                        )
                    } else if (lootArr.length == 4) {
                        Embed.addFields(
                            { name: '<:npbag:917192469450489856> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}`, inline: true },
                            { name: '\u200B', value: `${lootArr[1]}`, inline: true },
                            { name: '\u200B', value: `${lootArr[2]}`, inline: true },
                        )
                    } else if (lootArr.length == 3) {
                        Embed.addFields(
                            { name: '<:npbag:917192469450489856> Loot', value: `${loot}<:coins:872926669055356939>`, inline: true },
                            { name: '\u200B', value: `${lootArr[1]}`, inline: true },
                            { name: '\u200B', value: `${lootArr[2]}`, inline: true },
                        )
                    } else if (lootArr.length == 2) {
                        Embed.addFields(
                            { name: '<:npbag:917192469450489856> Loot', value: `${loot}<:coins:872926669055356939>`, inline: true },
                            { name: '\u200B', value: `${lootArr[1]}`, inline: true },
                        )
                    } else {
                        Embed.addFields(
                            { name: '<:npbag:917192469450489856> Loot', value: `${loot}<:coins:872926669055356939>`, inline: true },
                        )
                    };
                };
                return Embed;
            };

            async function newFight() {
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setTitle(`Dungeon Floor ${floor} ${enemy.boss ? "(Boss)" : ""}`)
                    .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) 💖\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) 💖\n${hpbar(myHP, myHPd)}`)
                    .setImage(enemy.image[Math.floor(Math.random()*enemy.image.length)])
                    .setThumbnail(myChar.image)
                    .setFooter(`Enemy EP: ${eEP}`)
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
                                            Embed.setThumbnail(characters[pID].image).setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        } else {
                                            abilities["64"][abilities["64"].selected] = myHP;
                                            abilities["64"].selected = "fushi";

                                            myHPd = myHPt;
                                            myHP = abilities["64"].fushi;
                                            myATK = myATKd;
                                            myDEF = myDEFd;

                                            notice.push(`\n✨ **${myChar.name}** transformed back`);
                                            Embed.setThumbnail(myChar.image).setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        };

                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        setTimeout(attack, 1200);
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
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                        } else {
                                            notice.push(`\n✨ Attempt failed${(myEP/eEP > 0.8 && abilities["238"].used < abilities[myChar.id].usage) ? ". Repeat next round?" : ""}`);
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                            setTimeout(attack, 1200);
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
                                        Embed.setThumbnail("https://i.ibb.co/YfnG2Tn/at.png").setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        setTimeout(attack, 1200);
                                    },
                                },
                                "405": {
                                    usage: 1,
                                    ability: () => {
                                        // Saber unleashes an attack with 300% the normal damage. She needs to wait 4 rounds first.
                                        if (round <= 3) {
                                            turn = 1;
                                            abilityUsed--;
                                            msg.reactions.resolve("✨").users.remove(message.author);
                                            return message.channel.send(`**${myChar.name}** needs ${4-round} more ${round == 3 ? "round" : "rounds"} to prepare`)
                                        };
                                        let dmg = Math.floor(((3*myATK) * Math.pow(0.99818, eDEF)) * (1 - (0.2*Math.random())));
                                        eHP -= dmg;
                                        if (eHP < 0) {
                                            eHP = 0;
                                        } else {
                                            setTimeout(attack, 1200);
                                        };
                                        notice.push(`\n✨ **${myChar.name}** used Excalibur! She has dealt **+${dmg}** damage`);
                                        Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
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
                                        Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        setTimeout(attack, 1200);
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
                                        Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
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
                                        Embed.setThumbnail("https://i.ibb.co/S7v6Qmx/a.png").setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        msg.reactions.resolve("✨").users.remove(message.author);
                                        setTimeout(attack, 1200);
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
                                            setTimeout(attack, 1200);
                                        };
                                        notice.push(`\n✨ **${myChar.name}** has drained **${drain}**HP from **${enemy.name}**`);
                                        Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
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
    
                                            setTimeout(attack, 1200);
                                            notice.push(`\n✨ **${myChar.name}** used her Code of Immortality for a **${abilities["2360"].revive}**% chance of revival\n<:blank:917804200363171860> **${enemy.name}**'s DEF decreased by **-${decrease}**`);
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
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
                                Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                msg.edit(Embed);

                                if (myHP <= 0 || eHP <= 0) {
                                    if (myHP <= 0) {
                                        if ((abilities[myChar.id] ? abilities[myChar.id].revive : false) && Math.random() < (parseInt(abilities[myChar.id].revive) / 100)) {
                                            myHP += Math.floor((myHPd/100) * abilities[myChar.id].revivehp);
                                            abilities["2360"].update();
                                            notice.push(`\n✨ **${myChar.name}** survived! Restored **${myHP}**HP`);
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                        } else {
                                            atk.stop(), def.stop(), skip.stop();
                                            if (abilities[myChar.id]) ability.stop();

                                            notice.push(`\n💀 **${myChar.name}** lost`);
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("l"))
                                        };
                                    } else {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (abilities[myChar.id]) ability.stop();

                                        notice.push(`\n🎉 **${myChar.name}** won`);
                                        Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                        msg.edit(Embed);
                                        turn = 1;
                                        dungeonFloors[message.author.id + message.guild.id][floor]++
                                        resolve(matchResult("w"))
                                    };
                                };
                                turn = 1;
                                round++;
                            };
    
                            atk.on('collect', r => {
                                if (turn == 1) {
                                    let dmg = Math.floor((myATK * Math.pow(0.99818, eDEF)) * (1 - (0.2*Math.random())));
                                    eHP -= dmg;
                                    if (eHP < 0) {
                                        eHP = 0;
                                    } else {
                                        setTimeout(attack, 1200);
                                    };
                                    turn = 0;
                                    
                                    notice.push(`\n⚔️ **${myChar.name}** has dealt **${dmg}** damage`);
                                    Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("⚔️").users.remove(message.author);
    
                                    if (myHP <= 0 || eHP <= 0) {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (abilities[myChar.id]) ability.stop();
                                        if (myHP <= 0) {
                                            notice.push(`\n💀 **${myChar.name}** lost`);
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("l"))
                                        } else {
                                            notice.push(`\n🎉 **${myChar.name}** won`);
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            dungeonFloors[message.author.id + message.guild.id][floor]++
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
                                        setTimeout(attack, 1200);
                                    } else {
                                        setTimeout(() => {
                                            notice.push(`\n🛡️ **${myChar.name}** has blocked **${enemy.name}'s** attack!`);
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            round++;
                                        },1200)
                                    };
                                    
                                    Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("🛡️").users.remove(message.author);
    
                                    if (myHP <= 0 || eHP <= 0) {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (abilities[myChar.id]) ability.stop();
                                        if (myHP <= 0) {
                                            notice.push(`\n💀 **${myChar.name}** lost`);
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            resolve(matchResult("l"))
                                        } else {
                                            notice.push(`\n🎉 **${myChar.name}** won`);
                                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                            msg.edit(Embed);
                                            turn = 1;
                                            dungeonFloors[message.author.id + message.guild.id][floor]++
                                            resolve(matchResult("w"))
                                        };
                                    };
                                } else {
                                    message.channel.send("Please wait a moment");
                                    msg.reactions.resolve("⚔️").users.remove(message.author);
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
                                                    Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                                    msg.edit(Embed);
                                                    turn = 1;
                                                    resolve(matchResult("l"))
                                                } else {
                                                    notice.push(`\n🎉 **${myChar.name}** won`);
                                                    Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                                    msg.edit(Embed);
                                                    turn = 1;
                                                    dungeonFloors[message.author.id + message.guild.id][floor]++
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
                                    Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                    msg.edit(Embed);
                                    msg.reactions.resolve("⏩").users.remove(message.author);
                                    turn = 0;
                                    while (eHP > 0 && myHP > 0) {
                                        eHP -= Math.floor((myATK * Math.pow(0.99818, eDEF)) * (1 - (0.2*Math.random())));
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
                                                Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                                msg.edit(Embed);
                                                turn = 1;
                                                resolve(matchResult("l"))
                                            } else {
                                                notice.push(`\n🎉 **${myChar.name}** won`);
                                                Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${enemy.name}'s HP (**${eHP}**${"/"}${eStats[0]}) ${eHP == 0 ? "💔" : "💖"}\n${hpbar(eHP, eStats[0])}\nYour HP (**${myHP}**${"/"}${myHPd}) ${myHP == 0 ? "💔" : "💖"}\n${hpbar(myHP, myHPd)}\n-----------------------------------${displayNotice()}`);
                                                msg.edit(Embed);
                                                turn = 1;
                                                dungeonFloors[message.author.id + message.guild.id][floor]++
                                                resolve(matchResult("w"))
                                            };
                                        };
                                    },1200);
                                } else {
                                    turn = 1;
                                    message.channel.send("Please wait a moment");
                                    msg.reactions.resolve("⚔️").users.remove(message.author);
                                };
                            });

                        });
                    });

                });
                fs.writeFile('Storage/dungeonFloors.json', JSON.stringify(dungeonFloors), (err) => {
                    if (err) console.error(err);
                });
                fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                    if (err) console.error(err);
                });
                fs.writeFile('Storage/shards.json', JSON.stringify(shards), (err) => {
                    if (err) console.error(err);
                });
                message.channel.send(result);
            };
            newFight()
        };

        // Shards
        if (message.content.toLowerCase().startsWith("!shards")) {
            if (!shards[message.author.id + message.guild.id]) return message.channel.send("You don't have any Shards. You can obtain them in the `!dungeon`");

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${message.author.username}'s inventory`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("Shards are used to `!refine` characters\nObtainable only in the `!dungeon`")
            .addFields(
                { name: 'Shards', value: `<:ss_shard:917203009543503892>x${shards[message.author.id + message.guild.id]["ss"]}\n<:b_shard:917202862851899392>x${shards[message.author.id + message.guild.id]["b"]}`, inline: true },
                { name: '\u200B', value: `<:s_shard:917202925514817566>x${shards[message.author.id + message.guild.id]["s"]}\n<:c_shard:917202862499582002>x${shards[message.author.id + message.guild.id]["c"]}`, inline: true },
                { name: '\u200B', value: `<:a_shard:917202904862052392>x${shards[message.author.id + message.guild.id]["a"]}\n<:d_shard:917202840563363891>x${shards[message.author.id + message.guild.id]["d"]}`, inline: true },
            )
            .setThumbnail((favChar[message.author.id + message.guild.id] || favChar[message.author.id + message.guild.id] === 0) ? characters[favChar[message.author.id + message.guild.id]].image : characters[inventory[message.author.id + message.guild.id][Math.floor(Math.random() * inventory[message.author.id + message.guild.id].length)]].image)
            message.channel.send(Embed);
        };

        // Refine
        if (message.content.toLowerCase().startsWith("!ref") || message.content.toLowerCase().startsWith("!refine")) {
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters.");

            if (!args[0]) return message.channel.send("Please provide a name or ID");

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1];

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

            // HP 1-10
            let sha = 1+parseInt(sha24(fArray.id)[1]);
            // ATK 1-9
            function sumDigits(n) {
                let numArr = n.toString().split("");
                let sum = numArr.reduce(function(a, b){
                    return parseInt(a) + parseInt(b);
                }, 0);
                return sum;
            };
            let qs = sumDigits(sha24(fArray.id));
            while(qs > 9) {
                qs = sumDigits(qs)
            };
            // DEF 1-9
            let vDef = "";
            for (i=0; i < fArray.name.length; i++) {
                vDef += fArray.name[i].charCodeAt(0).toString(10);
            };
            vDef = sumDigits(vDef);
            while(vDef > 9) {
                vDef = sumDigits(vDef)
            };
            let hp;
            let atk;
            let def;
            let rm;
            if (!ref[message.author.id + message.guild.id][fArray.id]) {
                rm = 0;
            } else {
                rm = ref[message.author.id + message.guild.id][fArray.id];
            };
            if (rm > 5) rm = 5;
            
            switch (fArray.rarity) {
                case "SS" : hp = Math.floor((1+0.25*(rm-1))*(180 + (6*sha))) + Math.round((5+(0.2*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(50 + Math.round(30/qs))) + Math.round((2.4+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(32 + Math.round(10/vDef))) + Math.round((1.25+(0.25/vDef))*(currLvl-1)); break;
                case "S" : hp = Math.floor((1+0.25*(rm-1))*(150 + (5*sha))) + Math.round((3.9+(0.06*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(40 + Math.round(15/qs))) + Math.round((1.9+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(24 + Math.round(10/vDef))) + Math.round((1+(0.2/vDef))*(currLvl-1)); break;
                case "A" : hp = Math.floor((1+0.25*(rm-1))*(120 + (6*sha))) + Math.round((3.3+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(35 + Math.round(15/qs))) + Math.round((1.6+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(18 + Math.round(8/vDef))) + Math.round((0.8+(0.15/vDef))*(currLvl-1)); break;
                case "B" : hp = Math.floor((1+0.25*(rm-1))*(100 + (5*sha))) + Math.round((2.8+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(30 + Math.round(10/qs))) + Math.round((1.2+(0.3/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(15 + Math.round(7/vDef))) + Math.round((0.6+(0.2/vDef))*(currLvl-1)); break;
                case "C" : hp = Math.floor((1+0.25*(rm-1))*(80 + (4*sha))) + Math.round((2.4+(0.04*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(25 + Math.round(10/qs))) + Math.round((0.9+(0.35/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(12 + Math.round(6/vDef))) + Math.round((0.5+(0.15/vDef))*(currLvl-1)); break;
                case "D" : hp = Math.floor((1+0.25*(rm-1))*(70 + (3*sha))) + Math.round((2+(0.05*sha))*(currLvl-1)); atk = Math.floor((1+0.25*(rm-1))*(20 + Math.round(10/qs))) + Math.round((0.75+(0.25/qs))*(currLvl-1)); def = Math.floor((1+0.25*(rm-1))*(10 + Math.round(5/vDef))) + Math.round((0.4+(0.5/vDef))*(currLvl-1)); break;
                default : hp = 1; atk = 1; def = 1; break;
            };
            let ep = Math.floor(((hp/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def)) / (100/atk))*100) / 100;

            let hp2;
            let atk2;
            let def2;
            rm++;
            switch (fArray.rarity) {
                case "SS" : hp2 = Math.floor((1+0.25*(rm-1))*(180 + (6*sha))) + Math.round((5+(0.2*sha))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*(50 + Math.round(30/qs))) + Math.round((2.4+(0.35/qs))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*(32 + Math.round(10/vDef))) + Math.round((1.25+(0.25/vDef))*(currLvl-1)); break;
                case "S" : hp2 = Math.floor((1+0.25*(rm-1))*(150 + (5*sha))) + Math.round((3.9+(0.06*sha))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*(40 + Math.round(15/qs))) + Math.round((1.9+(0.3/qs))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*(24 + Math.round(10/vDef))) + Math.round((1+(0.2/vDef))*(currLvl-1)); break;
                case "A" : hp2 = Math.floor((1+0.25*(rm-1))*(120 + (6*sha))) + Math.round((3.3+(0.04*sha))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*(35 + Math.round(15/qs))) + Math.round((1.6+(0.25/qs))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*(18 + Math.round(8/vDef))) + Math.round((0.8+(0.15/vDef))*(currLvl-1)); break;
                case "B" : hp2 = Math.floor((1+0.25*(rm-1))*(100 + (5*sha))) + Math.round((2.8+(0.04*sha))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*(30 + Math.round(10/qs))) + Math.round((1.2+(0.3/qs))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*(15 + Math.round(7/vDef))) + Math.round((0.6+(0.2/vDef))*(currLvl-1)); break;
                case "C" : hp2 = Math.floor((1+0.25*(rm-1))*(80 + (4*sha))) + Math.round((2.4+(0.04*sha))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*(25 + Math.round(10/qs))) + Math.round((0.9+(0.35/qs))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*(12 + Math.round(6/vDef))) + Math.round((0.5+(0.15/vDef))*(currLvl-1)); break;
                case "D" : hp2 = Math.floor((1+0.25*(rm-1))*(70 + (3*sha))) + Math.round((2+(0.05*sha))*(currLvl-1)); atk2 = Math.floor((1+0.25*(rm-1))*(20 + Math.round(10/qs))) + Math.round((0.75+(0.25/qs))*(currLvl-1)); def2 = Math.floor((1+0.25*(rm-1))*(10 + Math.round(5/vDef))) + Math.round((0.4+(0.5/vDef))*(currLvl-1)); break;
                default : hp2 = 1; atk2 = 1; def2 = 1; break;
            };
            let ep2 = Math.floor(((hp2/Math.pow((10*Math.PI*Math.exp(2))/(Math.PI-Math.exp(1)+(10*Math.PI*Math.exp(2))),def2)) / (100/atk2))*100) / 100;
            
            let useShard;
            let shardStr;
            let price = 0;
            switch (fArray.rarity) {
                case "SS" : useShard = "ss"; shardStr = "<:ss_shard:917203009543503892>"; price = 3000; break;
                case "S" : useShard = "s"; shardStr = "<:s_shard:917202925514817566>"; price = 1000; break;
                case "A" : useShard = "a"; shardStr = "<:a_shard:917202904862052392>"; price = 500; break;
                case "B" : useShard = "b"; shardStr = "<:b_shard:917202862851899392>"; price = 300; break;
                case "C" : useShard = "c"; shardStr = "<:c_shard:917202862499582002>"; price = 250; break;
                case "D" : useShard = "d"; shardStr = "<:d_shard:917202840563363891>"; price = 200; break;
                default : useShard = "ss"; shardStr = "<:ss_shard:917203009543503892>"; price = 9999999; break;
            };

            if (!shards[message.author.id + message.guild.id]) return message.channel.send("You don't have any shards");
            if (shards[message.author.id + message.guild.id][useShard] < 16) return message.channel.send(`You don't have enough shards (**${shards[message.author.id + message.guild.id][useShard]}**/16)`);
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
        if (message.content.toLowerCase().startsWith("!lvl") || message.content.toLowerCase().startsWith("!level")) {
            if (message.content.toLowerCase()[4] == "u" || message.content.toLowerCase()[6] == "u") return;

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
            if (favChar[user.id + message.guild.id] || favChar[user.id + message.guild.id] === 0) thumbnail = characters[favChar[user.id + message.guild.id]].image;

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

        // Find Characters
        if (message.content.toLowerCase().startsWith("!find")) {

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

            let pTitle = "Player";
            if (users.length > 1) pTitle = "Players";

            if (users.length < 16) {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`Found ${users.length} ${pTitle}`)
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
                .setTitle(`Found ${users.length} ${pTitle}`)
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
        if (message.content.toLowerCase().startsWith("!im") || message.content.toLowerCase().startsWith("!infomy")) {

            if (!args[0]) {
                return message.channel.send("Please provide a name or ID");
            };

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1];

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") {
                    if (inventory[message.author.id + message.guild.id].some((e) => e === characters[args[0]].id)) {
                        return characters[args[0]].displayIm();
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
                    return fastCheck[0].displayIm();
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
                fArray[0].displayIm();
            } else {
                message.channel.send("You don't own this card")
            };
            return;
        };

        // Charakter search
        if (message.content.toLowerCase().startsWith("!i ") || message.content.toLowerCase() === "!i" || message.content.toLowerCase().startsWith("!inf")) {

            if (!args[0]) {
                return message.channel.send("Please provide a name or ID");
            };

            if (args[0].toLowerCase() === "last" || args[0].toLowerCase() === "latest") args[0] = inventory[message.author.id + message.guild.id][inventory[message.author.id + message.guild.id].length -1];

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!(args[0][0] === "0" && args[0].length > 1) && args[0][0] !== "-") return characters[args[0]].display();
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            };
            
            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                return fastCheck[0].display();
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
            fArray[0].display();
            
        };

        // Anime search
        if (message.content.toLowerCase().startsWith("!s ") || message.content.toLowerCase() === "!s" || message.content.toLowerCase().startsWith("!se")) {
            
            if (!args[0]) {
                return message.channel.send("Please provide a name");
            };

            if (!inventory[message.author.id + message.guild.id]) inventory[message.author.id + message.guild.id] = [];

            const inv = [];
            for (i=0; i < inventory[message.author.id + message.guild.id].length; i++) {
                inv.push(inventory[message.author.id + message.guild.id][i]);
            };
            const uniq = inv.reduce(function(a,b) {
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

        // List Rarity
        if (message.content.toLowerCase().startsWith("!list")) {
            if (!args[0]) return message.channel.send("Please specify which characters you want to list.\nUsage: `!list <rarity>`");
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
        if (message.content.toLowerCase().startsWith("!a")) {
            let anime = [];
            for (i=0; i < characters.length; i++) {
                anime.push(characters[i].anime);
            };

            let uniq = anime.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
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

    }
};