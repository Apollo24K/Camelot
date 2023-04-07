/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { search, splitTitle, baseHP, baseATK, baseDEF, baseEP, getDetailedStats, rarity, getRefinement, customEmojis } = require("../Modules/functions.js");
const { classes } = require("../Modules/classes.js");
const { skins } = require("../Modules/skins.js");

module.exports = {
    name: 'info',
	description: 'Character info',
	execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        let user = interaction.options.getUser('user') || interaction.user;
        let flag = interaction.options.getString('flag');

        db.serialize(async () => {
            let stats = await query(`SELECT premium, skins FROM users WHERE id = ${user.id}`);
            if (!stats[0]) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);
            stats = {premium: stats[0].premium, skins: JSON.parse(stats[0].skins)};

            let inv = await query(`SELECT chars, class, ref, level, skin, equipment FROM characters WHERE id = ${user.id}`);
            inv = {premium: stats.premium, chars: JSON.parse(inv[0].chars), class: JSON.parse(inv[0].class), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), skin: JSON.parse(inv[0].skin), equipment: JSON.parse(inv[0].equipment)};

            let dg = await query(`SELECT classes, classlevels FROM dungeon WHERE id = ${user.id}`);
            dg = {classes: JSON.parse(dg[0].classes), classlevels: JSON.parse(dg[0].classlevels)};

            let choice = interaction.options.getString('character');
            
            let char = search(choice, inv.chars, interaction);
            if (!char.name) return;

            let img = char.image;
            
            if (flag === "base") {
                
                let hp = baseHP(char.id);
                let atk = baseATK(char.id);
                let def = baseDEF(char.id);
                let ep = baseEP(char.id)
                
                const Embed = new MessageEmbed()
                .setColor({D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, default: 0xbbffff}[char.rarity])
                .setImage(img)
                .setThumbnail(rarity(char.rarity))
                .setDescription(`**${char.name}**\n${splitTitle(char.anime)}\n`)
                .addFields(
                    { name: 'HP ️️️💖', value: ""+hp, inline: true },
                    { name: 'ATK ️️⚔️', value: ""+atk, inline: true },
                    { name: 'DEF ️️️🛡️', value: ""+def, inline: true },
                )
                .setFooter(`ID: #${char.id} | EP: ${ep}`)
                if (skins.filter((e) => e.cid == char.id).length === 0) return interaction.reply({ embeds: [Embed] });
                
                let fSkins = [{image: img, name: char.name}, ...skins.filter((e) => e.cid == char.id)];
                let currentSkin = 1;
                let pagesTotal = fSkins.length;
                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('prev')
                        .setEmoji('⏪')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('next')
                        .setEmoji('⏩')
                        .setStyle('SECONDARY'),
                );
                Embed.setFooter(`ID: #${char.id} | EP: ${ep}\nSkin: ${currentSkin}/${pagesTotal}`)
                return interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        if (currentSkin > 1) currentSkin--;
                        else currentSkin = pagesTotal;

                        Embed.setDescription(`**${fSkins[currentSkin-1].name}**\n${splitTitle(char.anime)}\n${fSkins[currentSkin-1].obtain ? "Obtain: `"+fSkins[currentSkin-1].obtain+"`" + (stats.skins.includes(fSkins[currentSkin-1].id) ? "<a:check:873196253276700682>" : "") : ""}`).setImage(fSkins[currentSkin-1].image).setFooter(`ID: #${char.id} | EP: ${ep}\nSkin: ${currentSkin}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });

                    next.on('collect', async r => {
                        if (currentSkin < pagesTotal) currentSkin++;
                        else currentSkin = 1;

                        Embed.setDescription(`**${fSkins[currentSkin-1].name}**\n${splitTitle(char.anime)}\n${fSkins[currentSkin-1].obtain ? "Obtain: `"+fSkins[currentSkin-1].obtain+"`" + (stats.skins.includes(fSkins[currentSkin-1].id) ? "<a:check:873196253276700682>" : "") : ""}`).setImage(fSkins[currentSkin-1].image).setFooter(`ID: #${char.id} | EP: ${ep}\nSkin: ${currentSkin}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });
                });
                
            };
            
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
            let charstats = await getDetailedStats(char.id, inv, dg.classlevels);
            let cls = charstats.class === -1 ? "None" : `${classes[charstats.class].name}${classes[charstats.class].emblem}Lvl. ${charstats.clvl}`;
            let dupes = inv.chars.filter((e) => e === char.id).length;

            if (flag === "my") {
                img = char.getImage(stats.premium, customSettings[user.id]?.cimg[char.id], inv.skin[char.id]);

                const Embed = new MessageEmbed()
                .setColor({D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, default: 0xbbffff}[char.rarity])
                .setImage(img)
                .setThumbnail(rarity(char.rarity))
                .setDescription(`**${char.name}**\n${splitTitle(char.anime)}\n\n **Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}\n**Equipment**: ${charstats.weaponicon}${stats.premium > 3 && charstats.shieldicon ? charstats.shieldicon : "" } ${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n**Items**: <:rune_empty:1034507494539669635> <:ring_empty:1034509903886299136><:locked:1034511902417621002><:locked:1034511902417621002>`)
                .addFields(
                    { name: `HP ${customEmojis.hp}`, value: ""+charstats.hp, inline: true },
                    { name: `ATK ${customEmojis.atk}`, value: ""+charstats.atk, inline: true },
                    { name: `DEF ${customEmojis.def}`, value: ""+charstats.def, inline: true },
                )
                .setFooter(`You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this\nEP: ${charstats.ep}`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                if (skins.filter((e) => e.cid == char.id).length === 0) return interaction.reply({ embeds: [Embed] });

                let fSkins = [{image: img, name: char.name}, ...skins.filter((e) => e.cid == char.id)];
                let currentSkin = fSkins.indexOf(fSkins.find((e) => e.id === inv.skin[char.id]))+1 || 1;
                let pagesTotal = fSkins.length;
                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('prev')
                        .setEmoji('⏪')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('next')
                        .setEmoji('⏩')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('select')
                        .setLabel('select')
                        .setStyle('PRIMARY')
                        .setDisabled(user.id !== interaction.user.id),
                );
                Embed.setDescription(`**${fSkins[currentSkin-1].name}**\n${splitTitle(char.anime)}\n\n **Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}\n**Equipment**: ${charstats.weaponicon}${stats.premium > 3 && charstats.shieldicon ? charstats.shieldicon : "" } ${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n**Items**: <:rune_empty:1034507494539669635> <:ring_empty:1034509903886299136><:locked:1034511902417621002><:locked:1034511902417621002>`).setImage(fSkins[currentSkin-1].image).setFooter(`You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this\nEP: ${charstats.ep} | Skin: ${currentSkin}/${pagesTotal}`, user.displayAvatarURL({ dynamic: true }) + "?size=2048");
                return interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });
                    const select = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "select", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        if (currentSkin > 1) currentSkin--;
                        else currentSkin = pagesTotal;

                        Embed.setDescription(`**${fSkins[currentSkin-1].name}**\n${splitTitle(char.anime)}\n\n **Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}\n**Equipment**: ${charstats.weaponicon}${stats.premium > 3 && charstats.shieldicon ? charstats.shieldicon : "" } ${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n**Items**: <:rune_empty:1034507494539669635> <:ring_empty:1034509903886299136><:locked:1034511902417621002><:locked:1034511902417621002>`).setImage(fSkins[currentSkin-1].image).setFooter(`You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this\nEP: ${charstats.ep} | Skin: ${currentSkin}/${pagesTotal}`, user.displayAvatarURL({ dynamic: true }) + "?size=2048");
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });

                    next.on('collect', async r => {
                        if (currentSkin < pagesTotal) currentSkin++;
                        else currentSkin = 1;

                        Embed.setDescription(`**${fSkins[currentSkin-1].name}**\n${splitTitle(char.anime)}\n\n **Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}\n**Equipment**: ${charstats.weaponicon}${stats.premium > 3 && charstats.shieldicon ? charstats.shieldicon : "" } ${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n**Items**: <:rune_empty:1034507494539669635> <:ring_empty:1034509903886299136><:locked:1034511902417621002><:locked:1034511902417621002>`).setImage(fSkins[currentSkin-1].image).setFooter(`You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this\nEP: ${charstats.ep} | Skin: ${currentSkin}/${pagesTotal}`, user.displayAvatarURL({ dynamic: true }) + "?size=2048");
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });

                    select.on('collect', async r => {
                        if (currentSkin === 1 || stats.skins.includes(fSkins[currentSkin-1].id)) {
                            if (currentSkin === 1) {
                                delete inv.skin[char.id];
                            } else {
                                inv.skin[char.id] = fSkins[currentSkin-1].id;
                            };

                            await query(`UPDATE characters SET skin = '${JSON.stringify(inv.skin)}' WHERE id = ${user.id}`);
    
                            interaction.channel.send(`Set **${char.name}**'s skin to **${fSkins[currentSkin-1].name}**`);

                        } else {
                            interaction.channel.send(`You don't have the skin "${fSkins[currentSkin-1].name}". Obtainable through: \`${fSkins[currentSkin-1].obtain}\``);
                        };
                    });

                });
            };

            if (flag === "detailed") {
                img = char.getImage(stats.premium, customSettings[user.id]?.cimg[char.id], inv.skin[char.id]);

                const Embed = new MessageEmbed()
                .setColor({D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, default: 0xbbffff}[char.rarity])
                .setThumbnail(img)
                .setDescription(`**${char.name}** - ${char.anime}\n**Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}\n**Equipment**: ${charstats.weaponicon}${stats.premium > 3 && charstats.shieldicon ? charstats.shieldicon : "" } ${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n**Items**: <:rune_empty:1034507494539669635> <:ring_empty:1034509903886299136><:locked:1034511902417621002><:locked:1034511902417621002>\n\n`)
                .addFields(
                    { name: 'Stats', value: `${customEmojis.hp} **HP**: __${charstats.bhp}__ + ${charstats.hp-charstats.bhp}\n${customEmojis.atk} **ATK**: __${charstats.batk}__ + ${charstats.atk - charstats.batk}\n${customEmojis.def} **DEF**: __${charstats.bdef}__ + ${charstats.def - charstats.bdef}\n<:magic_dmg:948568336621527040> **MD**: __${charstats.bmd}__ + ${charstats.md - charstats.bmd}\n${customEmojis.mr} **MR**: __${charstats.bmr}__ + ${charstats.mr - charstats.bmr}`, inline: true },
                    { name: '_ _', value: `${customEmojis.cr} **Crit Rate**: ${Math.floor(charstats.cr*100)}%\n${customEmojis.cd} **Crit Damage**: ${charstats.cd*100}%\n${customEmojis.br} **Block Rate**: ${Math.floor(charstats.br*100)}%\n${customEmojis.dodge} **Dodge**: ${Math.floor(charstats.dodge*100)}%`, inline: true },
                    { name: '_ _', value: `${customEmojis.mana} **Mana**: ${charstats.mana}\n${customEmojis.mg} **Mana Gen**: +${charstats.mg}`, inline: true },
                )
                .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setFooter(`EP: ${charstats.ep}`)
                return interaction.reply({ embeds: [Embed] });
            };

        });

    },
};