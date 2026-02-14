import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import charInfo, { characters } from "../Modules/chars";
import { splitTitle, rarity, getRefinement } from "../Modules/functions";
import { CompactUserSchema, SlashCommand } from "../types";
import { getUserSchema, updateUsers } from "../Modules/queries";

function displayMy(thisChar: charInfo, inv: CompactUserSchema, interaction: ChatInputCommandInteraction) {
    const dupes = inv.chars.filter((e) => e === thisChar.id).length;

    const Embed = new EmbedBuilder()
        .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[thisChar.rarity])
        .setImage(thisChar.image)
        .setThumbnail(rarity(thisChar.rarity))
        .setDescription(`**${thisChar.name}**\n${splitTitle(thisChar.anime)}\n\n**Ref**. ${getRefinement(inv.char_ref[thisChar.id])}`)
        .setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
    if (interaction.channel?.isSendable()) interaction.channel.send({ embeds: [Embed] });
};

function r1(stats: CompactUserSchema) {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ex')
                .setLabel(`Pull (${stats.expulls} left)`)
                .setDisabled(stats.expulls < 1)
                .setEmoji('<a:EXTRA:1138530846144462968>')
                .setStyle(ButtonStyle.Success),
        );
};

const thumbnail = "https://i.ibb.co/1J71WdPk/yor.gif";
const expity = 24;

const newex: { [key: string]: number; } = {
    "25828": 0.014, // Yor EX
    "25829": 0.008, // Aneira EX

    "17688": 0.003, // Apollo EX
    "21931": 0.005, // Acheron EX
    "21930": 0.008, // Lucy EX
    "18010": 0.01, // Hori EX
    "17871": 0.006, // Padoru EX
}; // sum = 0.054

const oldex: { [key: string]: number; } = {
    "18010": 0, // Sara EX
}; // sum = 0.0

const expool: { [key: string]: number; } = {
    ...oldex,
    ...newex,
};

const exDropRate = Math.floor(10000 * Object.values(expool).reduce((acc, rate) => acc + rate, 0)) / 100;

function getChar(pity: boolean = false, forcePity: boolean = false) {
    let char: charInfo, weightSum = 0, ranum = Math.random(); // ranum = Math.floor(Math.random() * 1000); // 0-999

    const usePool = pity ? newex : expool;

    // Roll weighted EX
    for (const cid in usePool) {
        const weight = usePool[cid];
        weightSum += weight;
        if (ranum < weightSum) {
            char = characters[cid as any];
            break;
        };
    };

    // Pity
    if (forcePity) {
        const exSet = Object.keys(usePool);
        char = characters[exSet[Math.floor(Math.random() * exSet.length)] as any];
    };

    // If no EX
    const getRarity = (Math.random() < (0.5 - (exDropRate / 100))) ? "SS" : "S";
    char ||= characters.filter((e) => e.rarity === getRarity).sort(() => 0.5 - Math.random())[0];

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

const exportCommand: SlashCommand = {
    name: 'ex',
    async execute({ interaction, author }) {

        const stats = author.schema;

        function getDesc() {
            return `Pull for a chance of getting an EX character!\nIncludes the following characters:\n` +
                // `${Object.keys(newex).map((e) => `**${characters[e as any].name}**`).join(", ")}, ${Object.keys(oldex).map((e) => `**${characters[e as any].name}**`).join(", ")}\n\n` +
                `**Yor EX**, **Aneira EX**, **Apollo EX**, **Acheron EX**, **Lucy EX**, **Hori EX**, **Padoru EX**\n\n` +
                `**Drop Rates**:\n<a:EXTRA:1138530846144462968> Tier ➜ **${exDropRate}**% | Pity: **${stats.expity}**/${expity}\n<:SSTier:869316489931546644> Tier ➜ **${50 - exDropRate}**%\n<:STier:869316518675095552> Tier ➜ **50**%\n\n` +
                `-# Tip: Use up your <a:EXTRA:1138530846144462968> pulls before the next event starts, you'll lose them otherwise!`;
        };

        const Embed = new EmbedBuilder()
            .setColor(0x2aad9d)
            .setThumbnail(thumbnail)
            .setAuthor({ name: `${interaction.user.username}'s inventory`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) })
            .setDescription(getDesc());
        return interaction.reply({ embeds: [Embed], components: [r1(stats)] }).then((msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async () => {
                const inv = await getUserSchema(interaction.user.id);
                if (!inv) return;
                stats.expulls = inv.expulls;
                stats.expity = inv.expity;

                if (stats.expulls-- < 1) return interaction.followUp(`You don't have any <a:EXTRA:1138530846144462968> Pulls left`);

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

                await updateUsers(interaction.user.id, {
                    expulls: { type: "increment", value: -1 },
                    expity: { type: "set", value: stats.expity },
                    chars: { type: "append", value: [char.id] },
                });


                Embed.setDescription(getDesc());
                interaction.editReply({ embeds: [Embed], components: [r1(stats)] });


                if (char.name === "Padoru EX") {
                    if (interaction.channel?.isSendable()) interaction.channel.send("Hashire sori yo");
                    setTimeout(() => {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Kaze no you ni");
                    }, 1800);
                    setTimeout(() => {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Tsukimihara wo");
                    }, 3600);
                    setTimeout(() => {
                        if (interaction.channel?.isSendable()) interaction.channel.send("PADORU PADORUUU!! <:padoru:746835471119810624>");
                    }, 5400);
                    setTimeout(() => {
                        displayMy(char, inv, interaction);
                    }, 6000);
                } else if (char.name === "Urashima EX") {
                    if (interaction.channel?.isSendable()) interaction.channel.send("✨ The stars are calling...");
                    setTimeout(() => {
                        displayMy(char, inv, interaction);
                    }, 2000);
                } else {
                    displayMy(char, inv, interaction);
                };
            });
        });

    },
};

export default exportCommand;

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
