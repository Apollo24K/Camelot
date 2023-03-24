/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { db, query } = require("../db_handler.js");

const milestones = [
    {
        id: 0,
        required: 250,
        rew: "100<:coins:872926669055356939> and 4<:s_shard:917202925514817566>",
    },
    {
        id: 1,
        required: 500,
        rew: "200<:coins:872926669055356939> and a lootbox",
    },
    {
        id: 2,
        required: 800,
        rew: "300<:coins:872926669055356939> and 1x <:s_ticket:927642487705722890>",
    },
    {
        id: 3,
        required: 1250,
        rew: "350<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890> and a lootbox",
    },
    {
        id: 4,
        required: 1800,
        rew: "400<:coins:872926669055356939>, 8x <:s_shard:917202925514817566> and a lootbox",
    },
    {
        id: 5,
        required: 2500,
        rew: "Luminous Christmas Skin",
        image: "https://i.ibb.co/2YH8ddB/luminous.png",
    },
    {
        id: 6,
        required: 3200,
        rew: "500<:coins:872926669055356939>, 10x <:s_shard:917202925514817566> and 2 lootboxes",
    },
    {
        id: 7,
        required: 3800,
        rew: "600<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890>",
    },
    {
        id: 8,
        required: 4400,
        rew: "750<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and 2 lootboxes",
    },
    {
        id: 9,
        required: 5000,
        rew: "Cecilia Christmas Skin and 3x <:s_ticket:927642487705722890>",
        image: "https://i.ibb.co/kcPHTnL/cecilia.png",
    },
    {
        id: 10,
        required: 6000,
        rew: "800<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and a lootbox",
    },
    {
        id: 11,
        required: 7250,
        rew: "1000<:coins:872926669055356939>, 6x <:ss_shard:917203009543503892>",
    },
    {
        id: 12,
        required: 8500,
        rew: "1000<:coins:872926669055356939>, 3x <:s_ticket:927642487705722890>",
    },
    {
        id: 13,
        required: 10000,
        rew: "Rosalia Christmas Skin and 1x <:ss_ticket:927503239396622336>",
        image: "https://i.ibb.co/zn5dqf4/rosalia.png",
    },
    {
        id: 14,
        required: 12500,
        rew: "1200<:coins:872926669055356939> and 3 lootboxes",
    },
    {
        id: 15,
        required: 15000,
        rew: "Fiona Christmas Skin and 1x <:ss_ticket:927503239396622336>",
        image: "https://i.ibb.co/dPSVSks/fiona.png",
    },
    {
        id: 16,
        required: 18000,
        rew: "1250<:coins:872926669055356939>, 1x <:ss_ticket:927503239396622336> and 2 lootboxes",
    },
    {
        id: 17,
        required: 22500,
        rew: "Rimuru Tempest Christmas Skin and 2x <:ss_ticket:927503239396622336>",
        image: "https://i.ibb.co/WxfWSN1/rimuru.png",
    },
    {
        id: 18,
        required: 26000,
        rew: "6 lootboxes",
    },
    {
        id: 19,
        required: 30000,
        rew: "Dalus and Luxuria Christmas Skins",
        image: "https://i.ibb.co/MV3sB69/luxus.png",
    },
    {
        id: 20,
        required: 36000,
        rew: "Altair Christmas Skin and 1x <:ss_ticket:927503239396622336>",
        image: "https://i.ibb.co/Twh8Jn5/altair.png",
    },
    {
        id: 21,
        required: 42000,
        rew: "Kaith and Anastasia Christmas Skins",
        image: "https://i.ibb.co/WfNF3tK/kaitia.png",
    },
    {
        id: 22,
        required: 50000,
        rew: "Erza Scarlet Christmas Skin, 1x <:ss_ticket:927503239396622336> and 5 lootboxes",
        image: "https://i.ibb.co/2cy4Qf9/erza.png",
    },
    {
        id: 23,
        required: 60000,
        rew: "3000<:coins:872926669055356939>, 2x <:ss_ticket:927503239396622336> and 4 lootboxes",
    },
    {
        id: 24,
        required: 72000,
        rew: "Luna and Senna Christmas Skins, 1x <:ss_ticket:927503239396622336> and 6 lootboxes",
        image: "https://i.ibb.co/3BMtPSH/lenna.png",
    },
    {
        id: 25,
        required: 80000,
        rew: "3x <:ss_ticket:927503239396622336> and 6x <:s_ticket:927642487705722890>",
    },
    {
        id: 26,
        required: 100000,
        rew: "Victoria Christmas Skin",
        image: "https://i.ibb.co/fqY9wTQ/victoria.png",
    },
];

const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('prev')
            .setEmoji('⏪')
            .setStyle('SECONDARY'),
        new MessageButton()
            .setCustomId('next')
            .setEmoji('⏩')
            .setStyle('SECONDARY'),
    );

module.exports = {
    name: 'event',
    description: 'event stuff',
	execute(interaction) {

        return interaction.reply("There is no ongoing event as of right now.\n Please see our </support:1011293280702578694> server for more information.");

        db.serialize(async () => {
            let stats = await query(`SELECT eventpts FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0] ?? {eventpts: 0};
            
            let pagesTotal = Math.ceil(milestones.length / 5);
            let currPage = 1;
            let left = milestones.length % 5;
            
            let showF = [];
            if (currPage < pagesTotal || left === 0) {
                for (let i=(currPage-1)*5; i < currPage * 5; i++) {
                    showF.push(`${milestones[i].id+1}) Required: **${milestones[i].required}**❄️${stats.eventpts >= milestones[i].required ? " <a:check:873196253276700682>" : ""}\n ➥ ${milestones[i].rew}\n`);
                };
            } else {
                for (let i=(currPage-1)*5; i < (currPage * 5) - (5-left); i++) {
                    showF.push(`${milestones[i].id+1}) Required: **${milestones[i].required}**❄️${stats.eventpts >= milestones[i].required ? " <a:check:873196253276700682>" : ""}\n ➥ ${milestones[i].rew}\n`);
                };
            };
            
            const Embed = new MessageEmbed()
            .setTitle('Christmas Event Rewards')
            .setColor(0x00873E)
            .setThumbnail("https://i.imgur.com/rO3nYoM.png")
            .setDescription(`Your balance: **${stats.eventpts}**❄️\n\n` + showF.join("\n"))
            .setFooter(`Page ${currPage}/${pagesTotal}`);
            interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                prev.on('collect', async r => {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    let showF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (let i=(currPage-1)*5; i < currPage * 5; i++) {
                            showF.push(`${milestones[i].id+1}) Required: **${milestones[i].required}**❄️${stats.eventpts >= milestones[i].required ? " <a:check:873196253276700682>" : ""}\n ➥ ${milestones[i].rew}\n`);
                        };
                    } else {
                        for (let i=(currPage-1)*5; i < (currPage * 5) - (5-left); i++) {
                            showF.push(`${milestones[i].id+1}) Required: **${milestones[i].required}**❄️${stats.eventpts >= milestones[i].required ? " <a:check:873196253276700682>" : ""}\n ➥ ${milestones[i].rew}\n`);
                        };
                    };

                    Embed.setDescription(`Your balance: **${stats.eventpts}**❄️\n\n` + showF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (let i=(currPage-1)*5; i < currPage * 5; i++) {
                            showF.push(`${milestones[i].id+1}) Required: **${milestones[i].required}**❄️${stats.eventpts >= milestones[i].required ? " <a:check:873196253276700682>" : ""}\n ➥ ${milestones[i].rew}\n`);
                        };
                    } else {
                        for (let i=(currPage-1)*5; i < (currPage * 5) - (5-left); i++) {
                            showF.push(`${milestones[i].id+1}) Required: **${milestones[i].required}**❄️${stats.eventpts >= milestones[i].required ? " <a:check:873196253276700682>" : ""}\n ➥ ${milestones[i].rew}\n`);
                        };
                    };

                    Embed.setDescription(`Your balance: **${stats.eventpts}**❄️\n\n` + showF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });
                
            });;
        });

	},
};