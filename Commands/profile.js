/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters, auniq, charactersF, charactersM, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } = require("../Modules/chars.js");
const { skins } = require("../Modules/skins.js");
const { userLevel } = require("../Modules/functions.js");
const { db, query } = require("../db_handler.js");
const { achievements } = require("../Modules/achievements.js");
const { fishing } = require("../Modules/items.js");

function padCollected(collSS, collS, collA, collB, collC, collD) {
    let res = []; // SS, A, C, S, B, D
    let len = Math.max(`${collSS}/${charactersSS.length}`.length, `${collA}/${charactersA.length}`.length, `${collC}/${charactersC.length}`.length);
    res.push(`\`${collSS}/${charactersSS.length}` + " ".repeat(len - `${collSS}/${charactersSS.length}`.length) + "`");
    res.push(`\`${collA}/${charactersA.length}` + " ".repeat(len - `${collA}/${charactersA.length}`.length) + "`");
    res.push(`\`${collC}/${charactersC.length}` + " ".repeat(len - `${collC}/${charactersC.length}`.length) + "`");
    len = Math.max(`${collS}/${charactersS.length}`.length, `${collB}/${charactersB.length}`.length, `${collD}/${charactersD.length}`.length);
    res.push(`\`${collS}/${charactersS.length}` + " ".repeat(len - `${collS}/${charactersS.length}`.length) + "`");
    res.push(`\`${collB}/${charactersB.length}` + " ".repeat(len - `${collB}/${charactersB.length}`.length) + "`");
    res.push(`\`${collD}/${charactersD.length}` + " ".repeat(len - `${collD}/${charactersD.length}`.length) + "`");
    return res;
};

module.exports = {
    name: 'profile',
	description: 'User Profile',
	execute(interaction) {
        
        let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        let user = interaction.options.getUser('user') || interaction.user;
        
        db.serialize(async () => {
            let stats = await query(`SELECT favchar, xp, coins, gems, arenawins, arenalosses, lilies, achievements, items, mailbox, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);
            stats.achievements = JSON.parse(stats.achievements);
            stats.items = JSON.parse(stats.items);
            stats.mailbox = JSON.parse(stats.mailbox);

            let inv = await query(`SELECT chars, ref, skin FROM characters WHERE id = ${user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), skin: JSON.parse(inv[0].skin)};
            if (!inv.chars.length) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);
            
            let dg = await query(`SELECT floors FROM dungeon WHERE id = ${user.id}`);
            dg = {floors: JSON.parse(dg[0].floors)};

            let chars = [...new Set(inv.chars)].map((e) => characters[e]);
            
            let collected = chars.length;
            let collectedF = chars.filter((e) => e.gender === "F").length;
            let collectedM = chars.filter((e) => e.gender === "M").length;
            let collSS = chars.filter((e) => e.rarity === "SS").length;
            let collS = chars.filter((e) => e.rarity === "S").length;
            let collA = chars.filter((e) => e.rarity === "A").length;
            let collB = chars.filter((e) => e.rarity === "B").length;
            let collC = chars.filter((e) => e.rarity === "C").length;
            let collD = chars.filter((e) => e.rarity === "D").length;
            
            let padded = padCollected(collSS, collS, collA, collB, collC, collD);

            // Anime Completed
            let aniCompleted = 0;
            for (let i=0; i < auniq.length; i++) {
                let animeCheck = characters.filter((e) => e.anime === auniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === auniq[i]).length;
                if (animeCheck === invCheck) aniCompleted++;
            };

            // Fish Found
            // let fishFound = 0;
            // fishing.forEach((e) => e.id in stats.items ? fishFound++ : false);
            
            // Floor
            let floor = 1;
            if (dg.floors[Object.keys(dg.floors)[Object.keys(dg.floors).length-1]] >= 20 && Object.keys(dg.floors)[Object.keys(dg.floors).length-1] !== 100) dg.floors[1+parseInt(Object.keys(dg.floors)[Object.keys(dg.floors).length-1])] = 0;
            if (dg.floors[Object.keys(dg.floors)[Object.keys(dg.floors).length-1]] >= 1 && Object.keys(dg.floors)[Object.keys(dg.floors).length-1] % 5 == 0 && Object.keys(dg.floors)[Object.keys(dg.floors).length-1] !== 100) dg.floors[1+parseInt(Object.keys(dg.floors)[Object.keys(dg.floors).length-1])] = 0;
            floor = parseInt(Object.keys(dg.floors)[Object.keys(dg.floors).length-1])
    
            let thumbnail = chars[Math.floor(Math.random() * chars.length)].image;
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], inv.skin[stats.favchar]);
            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setThumbnail(thumbnail)
            .setAuthor({name: `${user.username}'s profile${stats.premium ? " 💎" : ""}`, iconURL: user.displayAvatarURL({ dynamic: true }) + "?size=2048"})
            .setDescription(
                `**Level**: \`${userLevel(stats.xp)}\`ㅤ**Coins**: \`${stats.coins}\`<:coins:872926669055356939>ㅤ**Gems**: \`${stats.gems}\`<:genesis_gems:1034179687720681492>\n` +
                `**Dungeon**: \`Floor ${Math.min(floor, 100)}/${floor <= 100 ? 0 : Math.min(floor-100, 100)}/${Math.max(floor-200, 0)}\`ㅤ**Arena**: \`${stats.arenawins} wins\`, \`${stats.arenalosses} losses\`\n` +
                `**Anime Completed**: \`${aniCompleted}/${auniq.length}\`\n` +
                `**Achievements**: \`${stats.achievements.length}/${achievements.length}\`\n` + "\n" + // remove the additional \n when adding items
                // `**Fish Found**: \`${fishFound}/${fishing.length}\`\n\n` +
                
                `**Characters**: __\`${collected}/${characters.length}\`__ (__\`${collectedF}/${charactersF.length}\`__<:female:870076411430436914>__\`${collectedM}/${charactersM.length}\`__<:male:870076394649047080>)\n` +
                `<:SSTier:869316489931546644> **Tier**: ${padded[0]}ㅤ<:STier:869316518675095552> **Tier**: ${padded[3]}\n` +
                `<:ATier:869316558013464627> **Tier**: ${padded[1]}ㅤ<:BTier:869316586803179571> **Tier**: ${padded[4]}\n` +
                `<:CTier:869316602858991657> **Tier**: ${padded[2]}ㅤ<:DTier:869316616071032843> **Tier**: ${padded[5]}`
            );

            // Check if there's a mail
            if (stats.mailbox.length && user.id === interaction.user.id) {
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('open')
                            .setLabel(`You've got ${stats.mailbox.length} new ${stats.mailbox.length === 1 ? "mail" : "mails"}!`)
                            .setStyle('PRIMARY'),
                    );

                return interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {

                    const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "open", componentType: 'BUTTON', time: 30000 });
    
                    collector.on('collect', async r => {
                        let stats = await query(`SELECT mailbox FROM users WHERE id = ${user.id}`);
                        stats = JSON.parse(stats[0].mailbox);
                        const mail = stats.shift();
                        if (!mail) return interaction.channel.send("You don't have any notifications");

                        let add_xp = 0, add_coins = 0, add_shards = {"ss": 0,"s":0,"a":0,"b":0,"c":0,"d":0}, add_tickets = {"ss": 0,"s":0,"a":0,"b":0,"c":0,"d":0}, add_lb = 0;
                        
                        const types = {
                            "1": { // XP
                                run: () => {
                                    mail.rewards.split(",").forEach((rew) => {
                                        if (rew.match(/xp/gi)) add_xp += parseInt(rew.split("|")[1]);
                                    });
                                },
                            },
                            "2": { // Coins
                                run: () => {
                                    mail.rewards.split(",").forEach((rew) => {
                                        if (rew.match(/coins/gi)) add_coins += parseInt(rew.split("|")[1]);
                                    });
                                },
                            },
                            "3": { // Shards
                                run: () => {
                                    mail.rewards.split(",").forEach((rew) => {
                                        if (rew.match(/shard/gi)) {
                                            add_shards[rew.split(" ")[0]] += parseInt(rew.split("|")[1]);
                                        };
                                    });
                                },
                            },
                            "4": { // Tickets
                                run: () => {
                                    mail.rewards.split(",").forEach((rew) => {
                                        if (rew.match(/ticket/gi)) {
                                            add_tickets[rew.split(" ")[0]] += parseInt(rew.split("|")[1]);
                                        };
                                    });
                                },
                            },
                            "5": { // Lootbox
                                run: () => {
                                    mail.rewards.split(",").forEach((rew) => {
                                        if (rew.match(/lb/gi)) add_lb += parseInt(rew.split("|")[1]);
                                    });
                                },
                            },
                            "6": { // Char
                                run: () => {
                                    mail.rewards.split(",").forEach(async (rew) => {
                                        if (rew.match(/char/gi)) {
                                            let cinv = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                                            cinv = JSON.parse(cinv[0].chars);
                                            cinv.push(parseInt(rew.split("|")[1]));
                                            await query(`UPDATE characters SET chars = '${JSON.stringify(cinv)}' WHERE id = ${interaction.user.id}`);
                                        };
                                    });
                                },
                            },
                            "7": { // Skin
                                run: () => {
                                    mail.rewards.split(",").forEach(async (rew) => {
                                        if (rew.match(/skin/gi)) {
                                            let cinv = await query(`SELECT skins FROM users WHERE id = ${interaction.user.id}`);
                                            cinv = JSON.parse(cinv[0].skins);
                                            cinv.push(parseInt(rew.split("|")[1]));
                                            await query(`UPDATE users SET skins = '${JSON.stringify(cinv)}' WHERE id = ${interaction.user.id}`);
                                        };
                                    });
                                },
                            },
                        };
                
                        mail.type.split(",").forEach((type) => {
                            types[type].run();
                        });
                        
                        let shardEmojis = {"ss":"<:ss_shard:917203009543503892>","s":"<:s_shard:917202925514817566>","a":"<:a_shard:917202904862052392>","b":"<:b_shard:917202862851899392>","c":"<:c_shard:917202862499582002>","d":"<:d_shard:917202840563363891>"};
                        let ticketEmojis = {"ss":"<:ss_ticket:927503239396622336>","s":"<:s_ticket:927642487705722890>","a":"<:a_ticket:929420377946472508>","b":"<:b_ticket:929420396535615519>","c":"<:c_ticket:929420424645853214>","d":"<:d_ticket:929420447102152714>"};
                        
                        let notification = `${mail.message}\n\n**Rewards**:\n>>> `

                        const Mail = new MessageEmbed()
                        .setColor(0xbbffff)
                        .setAuthor({name: "Mailbox", iconURL: "https://i.ibb.co/HDHFqDB/621813807534309376.gif"})
                        .setThumbnail("https://i.ibb.co/nLrQFvd/gb.png")
                        .setFooter({text: `Date issued: ${new Date(parseInt(mail.date)).getUTCDate()}/${new Date(parseInt(mail.date)).getUTCMonth() + 1}/${new Date(parseInt(mail.date)).getUTCFullYear()}`} )

                        mail.type.split(",").forEach((type) => {
                            switch (type) {
                                case "1": mail.rewards.split(",").forEach((rew) => { if (rew.match(/xp/gi)) notification += `You received **${rew.split("|")[1]}** XP!\n`; }); break;
                                case "2": mail.rewards.split(",").forEach((rew) => { if (rew.match(/coins/gi)) notification += `Added **${rew.split("|")[1]}** <:coins:872926669055356939>\n`; }); break;
                                case "3": mail.rewards.split(",").forEach((rew) => { if (rew.match(/shard/gi)) notification += `Added **${rew.split("|")[1]}**x ${shardEmojis[rew.split(" ")[0]]}\n`; }); break;
                                case "4": mail.rewards.split(",").forEach((rew) => { if (rew.match(/ticket/gi)) notification += `Added **${rew.split("|")[1]}**x ${ticketEmojis[rew.split(" ")[0]]}\n`; }); break;
                                case "5": mail.rewards.split(",").forEach((rew) => { if (rew.match(/lb/gi)) notification += `Added **${rew.split("|")[1]}** ${rew.split("|")[1] == "1" ? "lootbox" : "lootboxes"}\n`; }); break;
                                case "6": mail.rewards.split(",").forEach((rew) => { if (rew.match(/char/gi)) { notification += `Added ${characters[rew.split("|")[1]].rarity}-Tier **${characters[rew.split("|")[1]].name}**\n`; Mail.setImage(characters[rew.split("|")[1]].image); }; }); break;
                                case "7": mail.rewards.split(",").forEach(async (rew) => { if (rew.match(/skin/gi)) { notification += `Added **${skins[rew.split("|")[1]].name}** skin\n`; Mail.setImage(skins[rew.split("|")[1]].image); }; }); break;
                            };
                        });

                        await query(`UPDATE users SET xp = xp + ${add_xp}, coins = coins + ${add_coins}, lootbox = lootbox + ${add_lb}, ssshard = ssshard + ${add_shards["ss"]}, sshard = sshard + ${add_shards["s"]}, ashard = ashard + ${add_shards["a"]}, bshard = bshard + ${add_shards["b"]}, cshard = cshard + ${add_shards["c"]}, dshard = dshard + ${add_shards["d"]}, ssticket = ssticket + ${add_tickets["ss"]}, sticket = sticket + ${add_tickets["s"]}, aticket = aticket + ${add_tickets["a"]}, bticket = bticket + ${add_tickets["b"]}, cticket = cticket + ${add_tickets["c"]}, dticket = dticket + ${add_tickets["d"]}, mailbox = '${JSON.stringify(stats)}' WHERE id = ${user.id}`);
                        
                        Mail.setDescription(notification);
                        return interaction.channel.send({ embeds: [Mail] });
                    });
    
                });
            };

            return interaction.reply({ embeds: [Embed] });
        });
        
	},
};