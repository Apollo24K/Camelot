import { EmbedBuilder } from "discord.js";
import { characters, auniq, charactersF, charactersM, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } from "../Modules/chars";
import { SlashCommand } from '../types';
import { getCachedUserSchema } from '../Modules/queries';

function padCollected(chars: any[]) {
    let collSS = chars.filter((e) => e.rarity === "SS").length;
    let collS = chars.filter((e) => e.rarity === "S").length;
    let collA = chars.filter((e) => e.rarity === "A").length;
    let collB = chars.filter((e) => e.rarity === "B").length;
    let collC = chars.filter((e) => e.rarity === "C").length;
    let collD = chars.filter((e) => e.rarity === "D").length;

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

const exportCommand: SlashCommand = {
    name: 'stats',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {
        const user = interaction.options.getUser('user') || interaction.user;
        const stats = user.id === interaction.user.id ? author.schema : await getCachedUserSchema(user.id, interaction.client);
        if (!stats) return interaction.reply("User not found");

        const chars = [...new Set(stats.chars)].map((e: any) => characters[e]);
        const padded = padCollected(chars);

        // Anime Completed
        let aniCompleted = 0;
        for (let i = 0; i < auniq.length; i++) {
            let animeCheck = characters.filter((e) => e.anime === auniq[i]).length;
            let invCheck = chars.filter((e) => e.anime === auniq[i]).length;
            if (animeCheck === invCheck) aniCompleted++;
        };

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription(
                `### Card Game Stats\n` +
                `<:Menhera:869913008686649374> **Anime**: \`${aniCompleted}/${auniq.length} ➜ (${Math.floor((aniCompleted / auniq.length) * 100)}%)\`\n` +
                `<:Rem:869894433385095198> **Waifu**: \`${chars.filter((e) => e.gender === "F").length}/${charactersF.length} ➜ (${Math.floor((chars.filter((e) => e.gender === "F").length / charactersF.length) * 100)}%)\`\n` +
                `<:Yato:869897062672642118> **Husbando**: \`${chars.filter((e) => e.gender === "M").length}/${charactersM.length} ➜ (${Math.floor((chars.filter((e) => e.gender === "M").length / charactersM.length) * 100)}%)\`\n` +
                `<:Gawrgura:869894477752447007> **Characters**: \`${chars.length}/${characters.length} ➜ (${Math.floor((chars.length / characters.length) * 100)}%)\`\n\n` +
                `**Rarity**\n` +
                `<:SSTier:869316489931546644> **Tier**: ${padded[0]}ㅤ<:STier:869316518675095552> **Tier**: ${padded[3]}\n` +
                `<:ATier:869316558013464627> **Tier**: ${padded[1]}ㅤ<:BTier:869316586803179571> **Tier**: ${padded[4]}\n` +
                `<:CTier:869316602858991657> **Tier**: ${padded[2]}ㅤ<:DTier:869316616071032843> **Tier**: ${padded[5]}`
            );
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;
