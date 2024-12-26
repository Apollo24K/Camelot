import fs from 'fs';
import Package from '../package.json';
import { EmbedBuilder } from 'discord.js';
import { db, query } from "../db_handler";

module.exports = {
    name: 'premium',
    description: 'premium',
    execute(interaction) {

        const user = interaction.options.getUser('user') ?? interaction.user;

        // const premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));
        // const premiumGifted = JSON.parse(fs.readFileSync('Storage/premiumGifted.json', 'utf8'));

        // premiumGift?.[user.id]?.date > (new Date().getTime() - 30*24*60*60*1000)

        // console.log(new Date());
        // console.log(new Date(premiumGift["254833691438743552"].date));

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT premium FROM users WHERE id = ${user.id}`);

            // If the user has premium
            if (stats?.premium > 0) {
                const premiumGifted = JSON.parse(fs.readFileSync('Storage/premiumGifted.json', 'utf8'))[user.id] ?? 0;

                let giftLimit = 0, giftTier = 1;
                switch (stats.premium) {
                    case 3: giftLimit = 1; break;
                    case 4: giftLimit = 3; break;
                    case 5: giftLimit = 3; break;
                    case 6: giftLimit = 4; break;
                    case 7: giftLimit = 2, giftTier = 2; break;
                    default: false; break;
                };

                const Embed = new EmbedBuilder()
                    .setAuthor({ name: "Camelot Premium", iconURL: user.displayAvatarURL({ dynamic: true }) + "?size=2048" })
                    .setColor(0xbbffff)
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(`Your current tier: **${stats.premium}** 💎\n${giftLimit === 0 ? "" : `Gifts left this month: **${Math.max(0, giftLimit - premiumGifted)}**/${giftLimit} T${giftTier}\n`}\nPatreon: https://www.patreon.com/cmlt\nSee https://ko-fi.com/camelot24 for donations and lower fees`)
                    .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });
                return interaction.reply({ embeds: [Embed] });
            };

            const Embed = new EmbedBuilder()
                .setTitle("Camelot Premium")
                .setColor(0xbbffff)
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription("Camelot Premium offers a lot of features to improve your playing experience. If you enjoy playing with Camelot, we would really appreciate your support! <:fumino_heart:794983494534955038>\nYou can find out more about the features and benefits of premium on our patreon.\n\nPatreon: https://www.patreon.com/cmlt\nSee https://ko-fi.com/camelot24 for donations and lower fees")
                .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });
            return interaction.reply({ embeds: [Embed] });
        });

    },
};
