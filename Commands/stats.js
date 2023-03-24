const { MessageEmbed } = require("discord.js");
const { characters, auniq, charactersF, charactersM, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } = require("../Modules/chars.js");

module.exports = {
    name: 'stats',
	description: 'See some stats of camelot',
	execute(interaction) {

        const Embed = new MessageEmbed()
        .setColor(0xbbffff)
        .setTitle("Card Game Stats")
        .setDescription("")
        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
        .addFields(
            { name: 'Characters', value: "<:Rem:869894433385095198> **Waifu total**: " + charactersF.length + "\n<:Yato:869897062672642118> **Husbando total**: " + charactersM.length + "\n<:Gawrgura:869894477752447007> **Characters total**: " + characters.length, inline: true},
            { name: 'Anime', value: "<:Menhera:869913008686649374> **Anime total**: " + auniq.length, inline: true },
            { name: '\u200B', value: '_ _' },
            { name: 'Rarity', value: "<:SSTier:869316489931546644> **Tier**: " + charactersSS.length + "\n<:ATier:869316558013464627> **Tier**: " + charactersA.length + "\n<:CTier:869316602858991657> **Tier**: " + charactersC.length, inline: true },
            { name: '_ _', value: "<:STier:869316518675095552> **Tier**: " + charactersS.length + "\n<:BTier:869316586803179571> **Tier**: " + charactersB.length + "\n<:DTier:869316616071032843> **Tier**: " + charactersD.length, inline: true },
        )
        return interaction.reply({ embeds: [Embed] });

    },
};