import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { query } from "../db_handler";
import { characters } from "../Modules/chars";
import { splitTitle, rarity, getRefinement } from "../Modules/functions";

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

const thumbnail = "https://i.ibb.co/z4DcLzS/preview.gif";
const expity = 24;

const newex = {
    "22610": 0.016, // Mari EX
    "22611": 0.013, // Frieren EX
    "22612": 0.011, // Itachi EX
}; // sum = 0.04

const oldex = {
    "17116": 0.004, // Isolde EX
    "17686": 0.005, // Escanor EX
    "17871": 0.006, // Padoru EX
    "18011": 0.005, // Lria EX
}; // sum = 0.02

const expool = {
    ...newex,
    ...oldex,
};

const exDropRate = Math.floor(10000 * Object.values(expool).reduce((acc, rate) => acc + rate, 0)) / 100;

function getChar(pity = false, forcePity = false) {
    let char, weightSum = 0, ranum = Math.random(); // ranum = Math.floor(Math.random() * 1000); // 0-999

    const usePool = pity ? newex : expool;

    // Roll weighted EX
    for (const cid in usePool) {
        const weight = usePool[cid];
        weightSum += weight;
        if (ranum < weightSum) {
            char = characters[cid];
            break;
        };
    };

    // if no EX
    if (!char) {
        if (Math.random() < (0.5 - (exDropRate / 100))) char = characters.filter((e) => e.rarity === "SS").sort(() => 0.5 - Math.random())[0]; // SS char
        else char = characters.filter((e) => e.rarity === "S").sort(() => 0.5 - Math.random())[0]; // S char
    };

    // Pity
    if (forcePity) {
        const exSet = Object.keys(usePool);
        char = characters[exSet[Math.floor(Math.random() * exSet.length)]];
    };

    return char;
};

// Expected drops
// let count = Object.entries(expool).reduce((acc, [cid]) => { acc[cid] = 0; return acc; }, {});
// let stats = { expity: 0 };
// for (let i = 0; i < 10000; i++) {
//     let char = getChar();

//     if (++stats.expity >= expity) {
//         let failSafe = 0;
//         while (char.rarity !== "EX" && failSafe++ < 101) {
//             char = getChar(true, failSafe === 100);
//         };
//     };
//     if (char.rarity === "EX") stats.expity = 0;

//     if (char.id in count) count[char.id]++;
// };
// console.log(count);

module.exports = {
    name: 'ex',
    description: 'Pull for a chance of getting an EX character!',
    async execute(interaction) {

        const { 0: stats } = await query(`SELECT expulls, expity FROM users WHERE id = ${interaction.user.id}`);

        const { 0: inv } = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
        inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref);

        function getDesc() {
            return `Pull for a chance of getting an EX character!\nIncludes the following characters:\n**NEW** (67%): ${Object.keys(newex).map((e) => `**${characters[e].name}**`).join(", ")}\n**RERUN** (33%): ${Object.keys(oldex).map((e) => `**${characters[e].name}**`).join(", ")}\n\n` +
                `**Drop Rates**:\n<a:EXTRA:1138530846144462968> Tier ➜ **${exDropRate}**% | Pity: **${stats.expity}**/${expity}\n<:SSTier:869316489931546644> Tier ➜ **${50 - exDropRate}**%\n<:STier:869316518675095552> Tier ➜ **50**%\n\n` +
                `-# Tip: Pity only includes new EX characters!`;
        };

        const Embed = new EmbedBuilder()
            .setColor(0x2aad9d)
            .setThumbnail(thumbnail)
            .setAuthor({ name: `${interaction.user.username}'s inventory`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" })
            .setDescription(getDesc());
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
                    while (char.rarity !== "EX" && failSafe++ < 101) {
                        char = getChar(true, failSafe === 100);
                    };
                };
                if (char.rarity === "EX") stats.expity = 0;

                inv.chars.push(char.id);
                await query(`UPDATE users SET expulls = expulls - 1, expity = ${stats.expity} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);

                Embed.setDescription(getDesc());
                interaction.editReply({ embeds: [Embed], components: [r1(stats)] });

                if (char.name === "Padoru EX") {
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
                } else if (char.name === "Urashima EX") {
                    interaction.channel.send("✨ The stars are calling...");
                    setTimeout(() => {
                        displayMy(char, inv.chars, inv.ref[char.id], interaction);
                    }, 2000);
                } else {
                    displayMy(char, inv.chars, inv.ref[char.id], interaction);
                };
            });

        });

    },
};

// Expected drops
// let count = Object.entries(expool).reduce((acc, [cid]) => { acc[cid] = 0; return acc; }, {});
// let stats = { expity: 0 };
// for (let i = 0; i < 10000; i++) {
//     let char = getChar();

//     if (++stats.expity >= expity) {
//         let failSafe = 0;
//         while (char.rarity !== "EX" && failSafe++ < 101) {
//             char = getChar(true, failSafe === 100);
//         };
//     };
//     if (char.rarity === "EX") stats.expity = 0;

//     if (char.id in count) count[char.id]++;
// };
// console.log(count);
