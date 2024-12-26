import fs from 'fs';
import { EmbedBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { characters } from "../Modules/chars";
import { achievements } from "../Modules/achievements";
import { getDetailedStats } from "../Modules/functions";
import { OfferRow } from "../Modules/components";

module.exports = {
    name: 'levelup',
    description: 'level your characters up',
    execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        // const choice = interaction.options.getString('character');
        let up = interaction.options.getString('by') || "1";
        if (parseInt(up) < 1) return interaction.reply(`You can't level up by **${up}** levels`);

        db.serialize(async () => {
            const { 0: inv } = await query(`SELECT users.coins, users.bank, users.battlechar, users.premium, users.class, users.level, users.charxp, users.shield_slot, characters.chars, characters.ref, users.equipment, characters.skin, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
            inv.id = interaction.user.id, inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref), inv.equipment = JSON.parse(inv.equipment), inv.skin = JSON.parse(inv.skin), inv.classlevels = JSON.parse(inv.classlevels);

            if (inv.battlechar === null) return interaction.reply("You have not selected a battle character yet, please do so using `/select`");

            let char = characters[inv.battlechar];
            if (!char?.name) return;
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

            let stats = await getDetailedStats(char.id, inv, inv.classlevels);
            let currLvl = stats.lvl;

            // Level up by
            if (up.toLowerCase() === "max") {
                // let iCoins = inv.coins, lvup = 0;
                // while (iCoins >= 0) {
                //     iCoins -= 500 + 100*(currLvl-1+lvup++);
                // };
                // up = lvup-1;
                up = Math.floor((Math.sqrt((2 * (inv.coins + inv.charxp)) + (100 * (currLvl * currLvl)) + (700 * currLvl) + 1225) / 10) - 3.5 - currLvl);
                if (up === 0) return interaction.reply("You don't have enough coins");
            } else {
                up = parseInt(up) || 1;
            };

            let stats2 = await getDetailedStats(char.id, inv, inv.classlevels, up);

            // let price = 0;
            // for (let i=0; i < up; i++) {
            //     price += 500 + 100*(currLvl-1+i);
            // };
            let price = Math.max((50 * up * ((2 * currLvl) + up + 7)) - inv.charxp, 0);
            if (inv.coins < price) return interaction.reply(`You don't have enough coins (**${inv.coins}**/${price}<:coins:872926669055356939>)`);

            // Thumbnail
            const thumbnail = char.getImage(inv.premium, customSettings[interaction.user.id]?.cimg[char.id], inv.skin[char.id]);

            const Embed = new EmbedBuilder()
                .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
                .setDescription(`**${char.name}**\nLevel up from ${currLvl} ➜ **${currLvl + up}** for **${price}**<:coins:872926669055356939>`)
                .addFields(
                    { name: 'HP ️️️💖', value: `${stats.hp} ➜ **${stats2.hp}**`, inline: true },
                    { name: 'ATK ️️⚔️', value: `${stats.atk} ➜ **${stats2.atk}**`, inline: true },
                    { name: 'DEF ️️️🛡️', value: `${stats.def} ➜ **${stats2.def}**`, inline: true },
                )
                .setThumbnail(thumbnail)
                .setFooter({ text: `EP: ${stats.ep} ➜ ${stats2.ep}` });
            return interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") return interaction.channel.send("Action cancelled");

                    const { 0: inv } = await query(`SELECT users.coins, users.bank, users.premium, users.class, users.level, users.charxp, users.shield_slot, characters.chars, characters.ref, users.equipment, characters.skin, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
                    inv.id = interaction.user.id, inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref), inv.equipment = JSON.parse(inv.equipment), inv.skin = JSON.parse(inv.skin), inv.classlevels = JSON.parse(inv.classlevels);

                    if (inv.coins < price) return interaction.channel.send(`You don't have enough coins (**${inv.coins}**/${price}<:coins:872926669055356939>)`);

                    stats = await getDetailedStats(char.id, inv, inv.classlevels);
                    if (currLvl !== stats.lvl) return interaction.channel.send(`You have already leveled up your character.`);

                    inv.level = currLvl + up;

                    interaction.channel.send(`**${char.name}** reached level ${currLvl + up}!`);

                    await query(`UPDATE users SET coins = coins - ${price}, charxp = 0, level = ${inv.level} WHERE id = ${interaction.user.id}`);

                    // Achievements
                    achievements[42].check(interaction, interaction.user, currLvl + up), achievements[43].check(interaction, interaction.user, currLvl + up), achievements[44].check(interaction, interaction.user, currLvl + up), achievements[45].check(interaction, interaction.user, currLvl + up); // The Battle is to the Strongest
                });

                collector.on('end', () => {
                    interaction.editReply({ components: [] });
                });

            });
        });

    },
};