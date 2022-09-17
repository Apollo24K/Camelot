var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters, auniq, charactersF, charactersM, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } = require("../Modules/chars.js");
const { userLevel } = require("../Modules/functions.js");
const { db, query } = require("../db_handler.js");
const { achievements } = require("../Modules/achievements.js");

module.exports = {
    name: 'profile',
	description: 'User Profile',
	execute(interaction) {
        
        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        let user = interaction.options.getUser('user') || interaction.user;
        
        db.serialize(async () => {
            await interaction.deferReply();

            var stats = await query(`SELECT favchar, xp, coins, arenawins, arenalosses, lilies, achievements, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.editReply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);
            stats.achievements = JSON.parse(stats.achievements);

            var inv = await query(`SELECT chars, ref FROM characters WHERE id = ${user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};
            if (!inv.chars.length) return interaction.editReply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);
            
            var dg = await query(`SELECT floors FROM dungeon WHERE id = ${user.id}`);
            dg = {floors: JSON.parse(dg[0].floors)};

            let chars = [...new Set(inv.chars)].map((e) => characters[e]);
            
            let collected = chars.length;
            let collectedF = chars.filter((e) => e.gender === "F").length;
            let collectedM = chars.filter((e) => e.gender === "M").length;
            let collRatio = Math.floor((collected / characters.length)*100);
            let collRatioF = Math.floor((collectedF / charactersF.length)*100);
            let collRatioM = Math.floor((collectedM / charactersM.length)*100);
            let collSS = chars.filter((e) => e.rarity === "SS").length;
            let collS = chars.filter((e) => e.rarity === "S").length;
            let collA = chars.filter((e) => e.rarity === "A").length;
            let collB = chars.filter((e) => e.rarity === "B").length;
            let collC = chars.filter((e) => e.rarity === "C").length;
            let collD = chars.filter((e) => e.rarity === "D").length;
    
            // Anime Completed
            let aniCompleted = 0;
            for (i=0; i < auniq.length; i++) {
                let animeCheck = characters.filter((e) => e.anime === auniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === auniq[i]).length;
                if (animeCheck === invCheck) aniCompleted++;
            };
    
            // Floor
            let floor = 1;
            if (dg.floors[Object.keys(dg.floors)[Object.keys(dg.floors).length-1]] >= 20 && Object.keys(dg.floors)[Object.keys(dg.floors).length-1] !== 100) dg.floors[1+parseInt(Object.keys(dg.floors)[Object.keys(dg.floors).length-1])] = 0;
            if (dg.floors[Object.keys(dg.floors)[Object.keys(dg.floors).length-1]] >= 1 && Object.keys(dg.floors)[Object.keys(dg.floors).length-1] % 5 == 0 && Object.keys(dg.floors)[Object.keys(dg.floors).length-1] !== 100) dg.floors[1+parseInt(Object.keys(dg.floors)[Object.keys(dg.floors).length-1])] = 0;
            floor = parseInt(Object.keys(dg.floors)[Object.keys(dg.floors).length-1])
    
            let thumbnail = chars[Math.floor(Math.random() * chars.length)].image;
            if (stats.favchar !== null) {
                thumbnail = characters[stats.favchar].image;
                if (stats.premium > 2) if (customSettings[user.id] && customSettings[user.id].cimg[stats.favchar]) thumbnail = customSettings[user.id].cimg[stats.favchar];
            };
    
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor({name: `${user.username}'s profile${stats.premium ? " 💎" : ""}`, iconURL: user.displayAvatarURL({ dynamic: true }) + "?size=2048"})
            .setDescription(`**Level**: ${userLevel(stats.xp)} ㅤㅤ **Coins**: ${stats.coins}<:coins:872926669055356939> ㅤㅤ **Lilium**: ${stats.lilies} <:lilium:974057059618291732>\n**Collected**: ${collected}/${characters.length} (${collectedF}/${charactersF.length}<:female:870076411430436914> ${collectedM}/${charactersM.length}<:male:870076394649047080>)\n**Completion**: ${collRatio}% (${collRatioF}%<:female:870076411430436914> ${collRatioM}%<:male:870076394649047080>)\n**Anime Completed**: ${aniCompleted}/${auniq.length}\n**Achievements**: ${stats.achievements.length}/${achievements.length}\n**Dungeon**: Floor ${floor} ㅤ **Arena**: ${stats.arenawins} wins, ${stats.arenalosses} losses`)
            .setThumbnail(thumbnail)
            .addFields(
                { name: 'Rarity', value: `<:SSTier:869316489931546644> **Tier**: ${collSS}/${charactersSS.length}\n<:ATier:869316558013464627> **Tier**: ${collA}/${charactersA.length}\n<:CTier:869316602858991657> **Tier**: ${collC}/${charactersC.length}`, inline: true },
                { name: '_ _', value: `<:STier:869316518675095552> **Tier**: ${collS}/${charactersS.length}\n<:BTier:869316586803179571> **Tier**: ${collB}/${charactersB.length}\n<:DTier:869316616071032843> **Tier**: ${collD}/${charactersD.length}`, inline: true },
            )
    
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('1st')
                        .setLabel('Open!')
                        .setStyle('PRIMARY'),
                );
    
            return interaction.editReply({ embeds: [Embed], /*components: [row]*/ })
            
            // .then((msg) => {
    
            //     const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === message.author.id, componentType: 'BUTTON', time: 60000 });
    
            //     collector.on('collect', async r => {
            //         await r.deferUpdate().catch((err) => {
            //                 console.log(`%cERROR Interaction Failed 'deferUpdate()', command: "${cmd}" on "${r.customId}"`, consoleStyle.warning);
            //             });
                    
            //         msg.edit({ content: "You don't have any lootboxes left", components: [] });
            //     });
    
            // });;

        });


        
	},
};