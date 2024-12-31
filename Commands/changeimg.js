/* eslint-disable no-extra-semi */
import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { search, getDimensions } from "../Modules/functions";
import { characters } from "../Modules/chars";
import { db, query } from "../db_handler";

module.exports = {
    name: 'changeimg',
    description: 'Change a characters image',
    execute(interaction) {

        db.serialize(async () => {
            let stats = await query(`SELECT premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            let inv = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
            inv = { chars: JSON.parse(inv[0].chars) };

            if (stats.premium < 3) return interaction.reply("This is a `/premium` feature to change the image of a character. If you're enjoying the bot we would appreciate your help <:RaphiSmile:868998036645380197>\nIf you're having any issues, you can ask us on our `/support` Server.");

            let choice = interaction.options.getString('character');
            let imgurl = interaction.options.getString('image-url');

            let char = search(choice, inv.chars, interaction);
            if (!char.name) return;
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of ${char.name}`);

            let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

            if (!customSettings[interaction.user.id]) customSettings[interaction.user.id] = { cimg: {}, aimg: {} };
            fs.writeFile('Storage/customSettings.json', JSON.stringify(customSettings), (err) => {
                if (err) console.error(err);
            });
            if (imgurl.toLowerCase() === "reset") {
                if (customSettings[interaction.user.id].cimg[char.id]) {
                    delete customSettings[interaction.user.id].cimg[char.id];
                    setTimeout(() => {
                        fs.writeFile('Storage/customSettings.json', JSON.stringify(customSettings), (err) => {
                            if (err) console.error(err);
                        });
                    }, 100);
                    return interaction.reply(`Removed **${char.name}**'s image`);
                } else {
                    return interaction.reply(`Your **${char.name}** doesn't have a custom image`);
                };
            };
            if (!(imgurl.startsWith("https://i.ibb.co/") || imgurl.startsWith("https://i.imgur.com/") || imgurl.startsWith("https://imgur.com/"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com");
            if (!(imgurl.endsWith(".png") || imgurl.endsWith(".jpg") || imgurl.endsWith(".jpeg") || imgurl.endsWith(".gif"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com that ends with .png, .jpg, .jpeg or .gif");

            let uploadLimit = 0;
            let hasGif = false;
            switch (stats.premium) {
                case 3: uploadLimit = 1; break;
                case 4: uploadLimit = 5; break;
                case 5: uploadLimit = 10; hasGif = true; break;
                case 6: uploadLimit = 30; hasGif = true; break;
                case 7: uploadLimit = 100000000; hasGif = true; break;
                default: false; break;
            };

            if (Object.keys(customSettings[interaction.user.id].cimg).length >= uploadLimit) return interaction.reply(`You have reached your upload limit of ${uploadLimit} characters. You can reset the image of a character with \`/changeimg <char>, reset\``);
            if (imgurl.endsWith(".gif") && !hasGif) return interaction.reply("You can't use gifs");

            async function getImg() {
                let dimensions = await getDimensions(imgurl);
                if (!dimensions) return interaction.reply("Invalid image link. Please try another one");
                if (!((dimensions.width % 9 == 0 && dimensions.height % 14 == 0) && (dimensions.width / 9 == dimensions.height / 14))) return interaction.reply(`Your image should have a width to height ratio of 9:14 (recommended: 225x350px)\nCurrent image width x height = ${dimensions.width}x${dimensions.height}`);
                setCustomImage();
            };

            function setCustomImage() {
                customSettings[interaction.user.id].cimg[char.id] = imgurl;
                interaction.reply(`**${char.name}**'s image was changed successfully`);
                fs.writeFile('Storage/customSettings.json', JSON.stringify(customSettings), (err) => {
                    if (err) console.error(err);
                });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ref-changeimg-${interaction.user.id}-${char.id}`)
                            .setLabel(`Remove image`)
                            .setStyle(ButtonStyle.Secondary)
                    );

                const channel = interaction.client.channels.cache.find(channel => channel.id === "934117922039791627");
                const Embed = new EmbedBuilder()
                    .setTitle(char.name)
                    .setColor(0xbbffff)
                    .setImage(imgurl)
                    .setThumbnail(char.image)
                    .setDescription(`Server: ${interaction.guild.name}\nUser: ${interaction.user} | ${interaction.user.id}`)
                    .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
                channel.send({ embeds: [Embed], components: [row] });
            };

            getImg();

        });

    },
    executeButtonInteraction(interaction) {
        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const [, , uid, cid] = interaction.customId.split("-");

        if (customSettings[uid]?.cimg?.[cid]) {
            delete customSettings[uid].cimg[cid];
            setTimeout(() => {
                fs.writeFile('Storage/customSettings.json', JSON.stringify(customSettings), (err) => {
                    if (err) console.error(err);
                });
            }, 100);

            interaction.followUp({ content: `${interaction.user} has removed <@${uid}>'s ${characters[cid].name} skin` });
        } else {
            interaction.followUp({ content: `Failed to remove skin (seems it has been removed already)` });
        };
    },
};
