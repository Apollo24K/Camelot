const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");


module.exports = {
    name: 'settings',
    description: 'See your settings and change them',
    execute(interaction) {
        db.serialize(async () => {

            let delay = interaction.options.getInteger('delay');
            let reminder = interaction.options.getString('reminder');
            let display = interaction.options.getBoolean('display');

            const { 0: stats } = await query(`SELECT premium, pullreminder, votereminder, animationdelay, displayeimage FROM users WHERE id = ${interaction.user.id}`);

            if (delay) {
                if (!stats.premium) return interaction.reply("This is a `/premium` feature. It changes the animation delay during a battle. If you're interested in supporting us, please see our patreon! <:RaphiSmile:868998036645380197>");
                if (delay < 200 || delay > 1200) return interaction.reply("Please provide a number between 200-1200");
    
                await interaction.reply(`Your animation delay was set to ${delay}ms\nTry it out in the \`/dungeon\` !`);
                await query(`UPDATE users SET animationdelay = ${delay} WHERE id = ${interaction.user.id}`);

            } else if (reminder) {
                if (reminder === "pulls") {
                    await query(`UPDATE users SET pullreminder = ${stats.pullreminder ? 0 : 1} WHERE id = ${interaction.user.id}`);
                    return interaction.reply(`${stats.pullreminder ? "Disabled" : "Enabled"} pull reminders`);
                }
            
                if (reminder === "votes") {
                    await query(`UPDATE users SET votereminder = ${stats.votereminder ? 0 : 1} WHERE id = ${interaction.user.id}`);
                    return interaction.reply(`${stats.votereminder ? "Disabled" : "Enabled"} vote reminders`);
                }
            } else if (display === true || display === false) {
                await query(`UPDATE users SET displayeimage = ${display ? 1 : 0} WHERE id = ${interaction.user.id}`);
                return interaction.reply(`${stats.displayeimage ? "Disabled" : "Enabled"} displaying the enemy image`);
            } else {

                let elementsperPage = 5;
                //let pagesTotal = Math.ceil( / elementsPerPage);
                let pagesTotal = 1;
                let currPage = 1;

                const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle("Settings")
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .addFields(
                    { name: "⏲ Delay 💎", value: `${stats.premium ? "* **delay:** " + stats.animationdelay + "ms" : "This is a `/premium` feature."}\n` },
                    { name: "🎶 Reminder", value: `* **pulls:** ${stats.pullreminder ? "Enabled" : "Disabled"}\n* **votes:** ${stats.votereminder ? "Enabled" : "Disabled"}\n` },
                    { name: "📱 Display Enemy", value: `* **display:** ${stats.displayeimage ? "Enabled" : "Disabled"}\n` },
                )
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                return interaction.reply({ embeds: [Embed] });

            }
        });
    }
}