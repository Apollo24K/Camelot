import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { search, splitTitle, baseHP, baseATK, baseDEF, baseEP, baseExpertise, getDetailedStats, rarity, getRefinement, customEmojis, getClassLvl } from "../Modules/functions";
import { classes } from "../Modules/classes";
import skinInfo, { skins } from "../Modules/skins";
import { PageRow } from "../Modules/components";
import { DetailedStats, SlashCommand } from '../types';
import { getUserSchema, updateUsers } from '../Modules/queries';
import charInfo from '../Modules/chars';

const exportCommand: SlashCommand = {
    name: 'info',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;
        let choice = interaction.options.getString('characters') ?? "";
        const flag = interaction.options.getString('flag') ?? (choice ? (user.id === interaction.user.id ? "base" : "my") : "detailed") as "base" | "my" | "detailed";

        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);

        if (choice === "") choice = `${stats.battlechar ?? ""}`;

        if (flag === "base") {
            const choices = [...new Set(choice.split(",").map((e) => e.trim()))];

            const chars: charInfo[] = [];
            choices.forEach((c) => {
                const char = search(c, stats.chars, interaction, true);
                if (char?.name && !chars.includes(char)) chars.push(char);
            });

            if (chars.length === 0) return interaction.reply(`No match found`);
            if (chars.length > 10) return interaction.reply(`You can't view more than 10 chars at once`);

            let fSkins: [{ image: string, name: string; }, ...skinInfo[]], currentSkin: number, pagesTotal: number;
            let hp: number, atk: number, def: number, ep: number, expertise: string;

            const embeds: EmbedBuilder[] = [];
            for (const char of chars) {
                hp = baseHP(char.id);
                atk = baseATK(char.id);
                def = baseDEF(char.id);
                ep = baseEP(char.id);
                expertise = baseExpertise(char.id);

                const Embed = new EmbedBuilder()
                    .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
                    .setImage(char.image)
                    .setThumbnail(rarity(char.rarity))
                    .setDescription(`**${char.name}**\n${splitTitle(char.anime)}\n`)
                    .addFields(
                        { name: 'HP ️️️💖', value: "" + hp, inline: true },
                        { name: 'ATK ️️⚔️', value: "" + atk, inline: true },
                        { name: 'DEF ️️️🛡️', value: "" + def, inline: true },
                    )
                    .setFooter({ text: `ID: #${char.id} | EP: ${ep}\nExpertise: ${expertise}` });
                // if (skins.filter((e) => e.cid == char.id).length === 0) return interaction.reply({ embeds: [Embed] });

                if (skins.filter((e) => e.cid == char.id).length > 0) {
                    fSkins = [{ image: char.image, name: char.name }, ...skins.filter((e) => e.cid == char.id)];
                    currentSkin = 1;
                    pagesTotal = fSkins.length;

                    Embed.setFooter({ text: `ID: #${char.id} | EP: ${ep}\nSkin: ${currentSkin}/${pagesTotal} | Expertise: ${expertise}` });
                };
                embeds.push(Embed);
            };

            if (embeds.length === 0) return interaction.reply(`No match found`);

            //@ts-ignore
            if (embeds.length > 1 || !pagesTotal) return interaction.reply({ embeds });
            return interaction.reply({ embeds, components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currentSkin > 1) currentSkin--;
                        else currentSkin = pagesTotal;
                    } else {
                        if (currentSkin < pagesTotal) currentSkin++;
                        else currentSkin = 1;
                    };

                    //@ts-ignore
                    embeds[0].setDescription(`**${fSkins ? fSkins[currentSkin - 1].name : chars[0].name}**\n${splitTitle(chars[0].anime)}\n${fSkins?.[currentSkin - 1]?.obtain ? "Obtain: `" + fSkins[currentSkin - 1].obtain + "`" + (stats.skins.includes(fSkins[currentSkin - 1].id) ? "<a:check:873196253276700682>" : "") : ""}`).setImage(fSkins?.[currentSkin - 1]?.image || chars[0].image);
                    if (skins.filter((e) => e.cid == chars[0].id).length > 0) {
                        embeds[0].setFooter({ text: `ID: #${chars[0].id} | EP: ${ep}\nSkin: ${currentSkin}/${pagesTotal}` });
                    };

                    interaction.editReply({ embeds });
                });
            });
        };

        if (flag === "my") {
            const choices = [...new Set(choice.split(",").map((e) => e.trim()))];

            const chars: charInfo[] = [];
            choices.forEach((c) => {
                const char = search(c, stats.chars, interaction, true);
                if (char?.name && !chars.includes(char)) chars.push(char);
            });

            if (chars.length === 0) return interaction.reply(`No match found`);
            if (chars.length > 7) return interaction.reply(`You can't view more than 7 chars at once`);

            let charstats: DetailedStats, cls: string, dupes: number;
            let fSkins: [{ image: string, name: string, id: number; }, ...skinInfo[]], currentSkin: number, pagesTotal: number;

            const embeds: EmbedBuilder[] = [];
            for (const char of chars) {
                let img = char.image;

                if (!stats.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
                charstats = await getDetailedStats(char.id, stats, stats.dungeon_classlevels);
                cls = charstats.class === -1 ? "None" : `${classes[charstats.class].name}${classes[charstats.class].emblem}Lvl. ${charstats.clvl}`;
                dupes = stats.chars.filter((e) => e === char.id).length;

                img = char.getImage(stats.premium, stats.custom_skins[char.id], stats.char_skin[char.id]);
                if (char.id === 18011 && charstats.maskinfo) img = { "phantasmal": "https://i.imgur.com/vKmnIqq.png", "verdant": "https://i.imgur.com/sWYC62u.png", "valkyrie": "https://i.imgur.com/Sn3MQZ7.png" }[charstats.maskinfo as "phantasmal" | "verdant" | "valkyrie"];

                const Embed = new EmbedBuilder()
                    .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
                    .setImage(img)
                    .setThumbnail(rarity(char.rarity))
                    .setDescription(
                        `**${char.name}**\n${splitTitle(char.anime)}\n\n` +
                        `**Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n` +
                        `**Class**: ${cls}\n` +
                        `**Equipment**: ${charstats.weaponicon}${stats.premium > 3 && charstats.shieldicon ? charstats.shieldicon : ""} ${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n` +
                        `**Items**: `
                        + `${charstats.runeicon} `
                        + `${charstats.ring1icon}`
                        + `${charstats.ring2icon}`
                        + `${charstats.ring3icon}`
                    )
                    .addFields(
                        { name: `HP ${customEmojis.hp}`, value: "" + charstats.hp, inline: true },
                        { name: `ATK ${customEmojis.atk}`, value: "" + charstats.atk, inline: true },
                        { name: `DEF ${customEmojis.def}`, value: "" + charstats.def, inline: true },
                    )
                    .setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of ${char.gender === "F" ? "her" : "him"}\nEP: ${charstats.ep} | Expertise: ${charstats.expertise}`, iconURL: user.displayAvatarURL({ size: 2048 }) });
                // if (skins.filter((e) => e.cid == char.id).length === 0) return interaction.reply({ embeds: [Embed] });

                if (skins.filter((e) => e.cid == char.id).length > 0) {
                    fSkins = [{ image: img, name: char.name, id: -1 }, ...skins.filter((e) => e.cid == char.id)];
                    const foundSkin = fSkins.find((e) => e.id === stats.char_skin[char.id]);
                    currentSkin = foundSkin ? fSkins.indexOf(foundSkin) + 1 : 1;
                    pagesTotal = fSkins.length;

                    Embed.setDescription(`**${fSkins[currentSkin - 1].name}**\n${splitTitle(char.anime)}\n\n **Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}\n**Equipment**: ${charstats.weaponicon}${stats.premium > 3 && charstats.shieldicon ? charstats.shieldicon : ""} ${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n**Items**: <:rune_empty:1034507494539669635> <:ring_empty:1034509903886299136><:locked:1034511902417621002><:locked:1034511902417621002>`).setImage(fSkins[currentSkin - 1].image).setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of ${char.gender === "F" ? "her" : "him"}\nEP: ${charstats.ep} | Skin: ${currentSkin}/${pagesTotal}`, iconURL: user.displayAvatarURL({ size: 2048 }) });
                };

                embeds.push(Embed);
            };

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setEmoji('⏪')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setEmoji('⏩')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('select')
                        .setLabel('select')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(user.id !== interaction.user.id),
                );

            // Embed.setDescription(`**${fSkins[currentSkin - 1].name}**\n${splitTitle(char.anime)}\n\n **Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}\n**Equipment**: ${charstats.weaponicon}${stats.premium > 3 && charstats.shieldicon ? charstats.shieldicon : ""} ${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n**Items**: <:rune_empty:1034507494539669635> <:ring_empty:1034509903886299136><:locked:1034511902417621002><:locked:1034511902417621002>`).setImage(fSkins[currentSkin - 1].image).setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of ${char.gender === "F" ? "her" : "him"}\nEP: ${charstats.ep} | Skin: ${currentSkin}/${pagesTotal}`, iconURL: user.displayAvatarURL({ dynamic: true }) + "?size=2048" });

            if (embeds.length === 0) return interaction.reply(`No match found`);

            //@ts-ignore
            if (embeds.length > 1 || !pagesTotal) return interaction.reply({ embeds });
            return interaction.reply({ embeds, components: [row] }).then(msg => {

                const prev = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && (r.customId === "prev" || r.customId === "next"), componentType: ComponentType.Button, time: 90000 });
                const select = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "select", componentType: ComponentType.Button, time: 90000 });

                prev.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currentSkin > 1) currentSkin--;
                        else currentSkin = pagesTotal;
                    } else {
                        if (currentSkin < pagesTotal) currentSkin++;
                        else currentSkin = 1;
                    };

                    embeds[0].setDescription(`**${fSkins?.[currentSkin - 1]?.name || chars[0].name}**\n${splitTitle(chars[0].anime)}\n\n **Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}\n**Equipment**: ${charstats.weaponicon}${stats.premium > 3 && charstats.shieldicon ? charstats.shieldicon : ""} ${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n**Items**: <:rune_empty:1034507494539669635> <:ring_empty:1034509903886299136><:locked:1034511902417621002><:locked:1034511902417621002>`).setImage(fSkins?.[currentSkin - 1]?.image || chars[0].image).setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of ${chars[0].gender === "F" ? "her" : "him"}\nEP: ${charstats.ep} | Skin: ${currentSkin}/${pagesTotal}`, iconURL: user.displayAvatarURL({ size: 2048 }) });
                    interaction.editReply({ embeds });
                });

                select.on('collect', async () => {
                    if (currentSkin === 1 || stats.skins.includes(fSkins[currentSkin - 1].id)) {
                        if (currentSkin === 1) {
                            delete stats.char_skin[chars[0].id];
                        } else {
                            stats.char_skin[chars[0].id] = fSkins[currentSkin - 1].id;
                        };

                        // Update users table
                        await updateUsers(user.id, {
                            char_skin: { type: "set", value: stats.char_skin },
                        });

                        if (interaction.channel?.isSendable()) interaction.channel.send(`Set **${chars[0].name}**'s skin to **${fSkins[currentSkin - 1].name}**`);

                    } else {
                        //@ts-ignore
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have the skin "${fSkins[currentSkin - 1].name}". Obtainable through: \`${fSkins[currentSkin - 1].obtain}\``);
                    };
                });

            });
        };

        if (flag === "detailed") {
            const choices = [...new Set(choice.split(",").map((e) => e.trim()))];

            const chars: charInfo[] = [];
            choices.forEach((c) => {
                const char = search(c, stats.chars, interaction, true);
                if (char?.name && !chars.includes(char)) chars.push(char);
            });

            if (chars.length === 0) return interaction.reply(`No match found`);
            if (chars.length > 4) return interaction.reply(`You can't view more than 4 chars at once`);

            const embeds: EmbedBuilder[] = [];
            for (const char of chars) {
                let img = char.image;

                if (!stats.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
                let charstats = await getDetailedStats(char.id, stats, stats.dungeon_classlevels);
                let cls = charstats.class === -1 ? "None" : `${classes[charstats.class].name}${classes[charstats.class].emblem}Lvl. ${charstats.clvl}`;

                img = char.getImage(stats.premium, stats.custom_skins[char.id], stats.char_skin[char.id]);
                if (char.id === 18011 && charstats.maskinfo) img = { "phantasmal": "https://i.imgur.com/vKmnIqq.png", "verdant": "https://i.imgur.com/sWYC62u.png", "valkyrie": "https://i.imgur.com/Sn3MQZ7.png" }[charstats.maskinfo as "phantasmal" | "verdant" | "valkyrie"];

                const Embed = new EmbedBuilder()
                    .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
                    .setThumbnail(img)
                    .setDescription(
                        `**${char.name}** - ${char.anime}\n` +
                        `**Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n` +
                        `**Class**: ${cls}\n` +
                        `**Equipment**: ${charstats.weaponicon}`
                        + `${(stats.premium > 3 || stats.shield_slot) && charstats.shieldicon ? charstats.shieldicon : ""} `
                        + `${charstats.helmeticon || "<:helmet_empty:1034499888878198885>"}`
                        + `${charstats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}`
                        + `${charstats.glovesicon || "<:gloves_empty:1034499892409794570>"}`
                        + `${charstats.bootsicon || "<:boots_empty:1034499893919764480>"}\n` +
                        `**Items**: `
                        + `${charstats.runeicon} `
                        + `${charstats.ring1icon}`
                        + `${charstats.ring2icon}`
                        + `${charstats.ring3icon}`
                    )
                    .addFields(
                        { name: 'Stats', value: `${customEmojis.hp} **HP**: __${charstats.bhp}__ + ${charstats.hp - charstats.bhp}\n${customEmojis.atk} **ATK**: __${charstats.batk}__ + ${charstats.atk - charstats.batk}\n${customEmojis.def} **DEF**: __${charstats.bdef}__ + ${charstats.def - charstats.bdef}\n<:magic_dmg:948568336621527040> **MD**: __${charstats.bmd}__ + ${charstats.md - charstats.bmd}\n${customEmojis.mr} **MR**: __${charstats.bmr}__ + ${charstats.mr - charstats.bmr}`, inline: true },
                        { name: '_ _', value: `${customEmojis.cr} **Crit Rate**: ${Math.floor(charstats.cr * 100)}%\n${customEmojis.cd} **Crit Damage**: ${Math.floor(charstats.cd * 100)}%\n${customEmojis.br} **Block Rate**: ${Math.floor(charstats.br * 100)}%\n${customEmojis.dodge} **Dodge**: ${Math.floor(charstats.dodge * 100)}%`, inline: true },
                        { name: '_ _', value: `${customEmojis.mana} **Mana**: ${charstats.mana}\n${customEmojis.mg} **Mana Gen**: +${charstats.mg}`, inline: true },
                    )
                    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ size: 2048 }) })
                    .setFooter({ text: `EP: ${charstats.ep} | items: ${charstats.uniqueids.join(",")}` });
                embeds.push(Embed);
            };

            return interaction.reply({ embeds });
        };

    },
};

export default exportCommand;
