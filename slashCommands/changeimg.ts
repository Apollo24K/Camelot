import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { search, getDimensions } from "../Modules/functions";
import { characters } from "../Modules/chars";
import { SlashCommand } from '../types';
import { getUserSchema, updateUsersAndCache } from "../Modules/queries";

const exportCommand: SlashCommand = {
    name: 'changeimg',
    async execute({ interaction, author }) {

        const stats = author.schema;
        if (stats.premium < 3) return interaction.reply("This is a `/premium` feature to change the image of a character. If you're enjoying the bot we would appreciate your help <:RaphiSmile:868998036645380197>\nIf you're having any issues, you can ask us on our `/support` Server.");

        const choice = interaction.options.getString('character', true);
        const imgurl = interaction.options.getString('image-url', true);

        const char = search(choice, stats.chars, interaction);
        if (!char) return;
        if (!stats.chars.includes(char.id)) return interaction.reply(`You don't have a copy of ${char.name}`);

        if (imgurl.toLowerCase() === "reset") {
            if (stats.custom_skins[char.id]) {
                delete stats.custom_skins[char.id];

                await updateUsersAndCache(interaction.client, interaction.user.id, {
                    updates: {
                        custom_skins: { type: "set", value: stats.custom_skins },
                    },
                });

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

        if (Object.keys(stats.custom_skins).length >= uploadLimit) return interaction.reply(`You have reached your upload limit of ${uploadLimit} characters. You can reset the image of a character with \`/changeimg <char>, reset\``);
        if (imgurl.endsWith(".gif") && !hasGif) return interaction.reply("You can't use gifs");

        async function getImg() {
            let dimensions = await getDimensions(imgurl);
            if (!dimensions) return interaction.reply("Invalid image link. Please try another one");
            if (!((dimensions.width % 9 == 0 && dimensions.height % 14 == 0) && (dimensions.width / 9 == dimensions.height / 14))) return interaction.reply(`Your image should have a width to height ratio of 9:14 (recommended: 225x350px)\nCurrent image width x height = ${dimensions.width}x${dimensions.height}`);
            await setCustomImage();
        };

        async function setCustomImage() {
            if (!char) return;
            stats.custom_skins[char.id] = imgurl;
            interaction.reply(`**${char.name}**'s image was changed successfully`);

            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    custom_skins: { type: "set", value: stats.custom_skins },
                },
            });

            const row = new ActionRowBuilder<ButtonBuilder>()
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
                .setDescription(`Server: ${interaction.guild ? interaction.guild.name : "No Server"}\nUser: ${interaction.user} | ${interaction.user.id}`)
                .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ size: 2048 }) });
            if (channel?.isSendable()) channel.send({ embeds: [Embed], components: [row] });
        };

        getImg();

    },
    async executeButtonInteraction({ interaction }) {
        const [, , uid, cid] = interaction.customId.split("-");

        const stats = await getUserSchema(uid);
        if (!stats) return interaction.followUp({ content: "Couldn't find user" });

        if (stats.custom_skins[cid]) {
            delete stats.custom_skins[cid];
            await updateUsersAndCache(interaction.client, uid, {
                updates: {
                    custom_skins: { type: "set", value: stats.custom_skins },
                },
            });

            interaction.followUp({ content: `${interaction.user} has removed <@${uid}>'s ${characters[parseInt(cid)].name} skin` });
        } else {
            interaction.followUp({ content: `Failed to remove skin (seems it has been removed already)` });
        };
    },
};

export default exportCommand;
