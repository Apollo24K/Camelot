const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { splitTitle, rarity, getRefinement } = require("../Modules/functions.js");

function displayMy(thisChar, inv, ref, interaction) {
    const dupes = inv.filter((e) => e === thisChar.id).length;

    const Embed = new EmbedBuilder()
        .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[thisChar.rarity])
        .setImage(thisChar.image)
        .setThumbnail(rarity(thisChar.rarity))
        .setDescription(`**${thisChar.name}**\n${splitTitle(thisChar.anime)}\n\n**Ref**. ${getRefinement(ref)}`)
        .setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
    interaction.channel.send({ embeds: [Embed] });
};

function r1(stats) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ex')
            .setLabel(`Pull (${stats.expulls} left)`)
            .setDisabled(stats.expulls < 1)
            .setEmoji('<a:EXTRA:1138530846144462968>')
            .setStyle('Success'),
    );
};

const thumbnail = "https://i.ibb.co/tLRsrcH/prev.gif";
const expity = 24;

function getChar(pity = false) {
    let char, ranum = Math.floor(Math.random() * 1000); // 0-999
    if (ranum < 11) char = characters[19048]; // Gojo EX
    else if (ranum < (11 + 19)) char = characters[19049]; // Ruminas EX
    else if (ranum < (11 + 19 + 15)) char = characters[19050]; // Raiden EX
    else if (ranum < (11 + 19 + 15 + 23)) char = characters[19051]; // Sara EX
    // else if (ranum < (11 + 19 + 15 + 23 + 17)) char = characters[18010]; // Hori EX
    else if (ranum < (11 + 19 + 15 + 23 + 400)) char = characters.filter((e) => e.rarity === "SS").sort(() => 0.5 - Math.random())[0]; // SS char
    else char = characters.filter((e) => e.rarity === "S").sort(() => 0.5 - Math.random())[0]; // S char

    if (pity) {
        let exSet = [17871, 18011, 17742, 17743, 18010];
        char = characters[exSet[Math.floor(Math.random() * exSet.length)]];
    };

    return char;
};

// Expected drops
// let count = [0, 0, 0, 0, 0];
// let stats = { expity: 0 };
// for (let i = 0; i < 100000; i++) {
//     let char = getChar();

//     if (++stats.expity >= expity) {
//         let failSafe = 0;
//         while (char.rarity !== "EX" && failSafe++ < 100) {
//             char = getChar();
//         };
//     };
//     if (char.rarity === "EX") stats.expity = 0;

//     count[0] += char.id === 17871;
//     count[1] += char.id === 18011;
//     count[2] += char.id === 17742;
//     count[3] += char.id === 17743;
//     count[4] += char.id === 18010;
// };
// console.log(count.map((e) => e / 1000));

const desc = "Pull for a chance of getting an EX character!\nIncludes the following characters: **Gojou Satoru EX**, **Raiden Shogun EX**, **Ruminas Valentine EX**, **Rudeus' EX**";

module.exports = {
    name: 'ex',
    description: 'Pull for a chance of getting an EX character!',
    async execute(interaction) {

        const { 0: stats } = await query(`SELECT expulls, expity FROM users WHERE id = ${interaction.user.id}`);

        const { 0: inv } = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
        inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref);

        const Embed = new EmbedBuilder()
            .setColor(0x2aad9d)
            .setThumbnail(thumbnail)
            .setAuthor({ name: `${interaction.user.username}'s inventory`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" })
            .setDescription(`${desc}\n\n**Drop Rates**:\n<a:EXTRA:1138530846144462968> Tier ➜ **8**% | Pity: **${stats.expity}**/${expity}\n<:SSTier:869316489931546644> Tier ➜ **42**%\n<:STier:869316518675095552> Tier ➜ **50**%`);
        interaction.reply({ embeds: [Embed], components: [r1(stats)], fetchReply: true }).then((msg) => {

            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async () => {
                const { 0: stats2 } = await query(`SELECT expulls, expity FROM users WHERE id = ${interaction.user.id}`);
                stats.expulls = stats2.expulls;
                stats.expity = stats2.expity;

                if (stats.expulls-- < 1) return interaction.followUp(`You don't have any <a:EXTRA:1138530846144462968> Pulls left`);

                const { 0: inv } = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
                inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref);

                let char = getChar();

                // Check Pity
                if (++stats.expity >= expity) {
                    let failSafe = 0;
                    while (char.rarity !== "EX" && failSafe++ < 100) {
                        char = getChar(failSafe === 100);
                    };
                };
                if (char.rarity === "EX") stats.expity = 0;

                inv.chars.push(char.id);
                await query(`UPDATE users SET expulls = expulls - 1, expity = ${stats.expity} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);

                Embed.setDescription(`${desc}\n\n**Drop Rates**:\n<a:EXTRA:1138530846144462968> Tier ➜ **8**% | Pity: **${stats.expity}**/${expity}\n<:SSTier:869316489931546644> Tier ➜ **42**%\n<:STier:869316518675095552> Tier ➜ **50**%`);
                interaction.editReply({ embeds: [Embed], components: [r1(stats)] });

                if (char.id === 17871) {
                    interaction.channel.send("Hashire sori yo");
                    setTimeout(() => {
                        interaction.channel.send("Kaze no you ni");
                    }, 1800);
                    setTimeout(() => {
                        interaction.channel.send("Tsukimihara wo");
                    }, 3600);
                    setTimeout(() => {
                        interaction.channel.send("PADORU PADORUUU!! <:padoru:746835471119810624>");
                    }, 5400);
                    setTimeout(() => {
                        displayMy(char, inv.chars, inv.ref[char.id], interaction);
                    }, 6000);
                } else {
                    displayMy(char, inv.chars, inv.ref[char.id], interaction);
                };
            });

        });

    },
};