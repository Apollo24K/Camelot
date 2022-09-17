const { MessageEmbed } = require("discord.js");
const { characters, auniq, charactersF, charactersM, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");


module.exports = {
    name: 'shop',
	description: 'Shop',
	execute(interaction) {

        db.serialize(async () => {
            var stats = await query(`SELECT coins FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];
            if (!stats) stats = {coins: 0};

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Shop")
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .setDescription("Card game shop to buy character packs.\nUse `/buy <item>` to buy one")
            .addField("Character Pack - 300<:coins:872926669055356939>", "Get a random character")
            .addField("Waifu Pack- 300<:coins:872926669055356939>", "Get a random waifu")
            .addField("Husbando Pack - 300<:coins:872926669055356939>", "Get a random husbando")
            .addField("Character Bundle - 800<:coins:872926669055356939>", "Get 3 characters for a discount")
            .addField("Rare Pack - 500<:coins:872926669055356939>", "Get at least a <:CTier:869316602858991657>-Tier character")
            .addField("Morpheus Blessing - 2000<:coins:872926669055356939>", "Get a guaranteed new character\n(_<:SSTier:869316489931546644>-Tier are excluded from this pack_)")
            .setFooter(`Balance: ${stats.coins} coins`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")            
            interaction.reply({ embeds: [Embed] });
        });
        
    },
};