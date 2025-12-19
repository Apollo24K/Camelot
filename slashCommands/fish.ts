import { fishing } from "../Modules/items";
import { dailies } from "../Modules/dailyQuests";
import { achievements } from "../Modules/achievements";
import { ItemRarity, SlashCommand } from "../types";
import { updateUsersAndCache } from "../Modules/queries";

const fishingCooldown = new Map();

const exportCommand: SlashCommand = {
    name: 'fish',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        // Set up restrictions
        if (fishingCooldown.has(interaction.user.id)) return interaction.reply({ content: `You can fish again in ${30 - Math.floor((new Date().getTime() - fishingCooldown.get(interaction.user.id)) / 1000)} seconds`, ephemeral: true });
        fishingCooldown.set(interaction.user.id, new Date().getTime());
        setTimeout(() => fishingCooldown.delete(interaction.user.id), 30 * 1000);

        // 20% chance of failure
        if (Math.random() < 0.2) return interaction.reply(`🎣 | You couldn't catch anything`);

        // Roll a rarit (normal: 0.47, special: 0.30, rare: 0.18, unique: 0.045, legendary: 0.0047, mythical: 0.0003)
        let ranRar = Math.floor(Math.random() * 10000); // 0-9999
        let rar: ItemRarity = "normal"; //, eventpts = 20;
        if (ranRar < 3) rar = "mythical"; //, eventpts = 500;
        else if (ranRar < 50) rar = "legendary"; //, eventpts = 500;
        else if (ranRar < 500) rar = "unique"; //, eventpts = 160;
        else if (ranRar < 2300) rar = "rare"; //, eventpts = 75;
        else if (ranRar < 5300) rar = "special"; //, eventpts = 40;

        const caught = fishing.filter((e) => e.grade === rar).sort((a, b) => Math.random() - 0.5)[0];

        // Event
        // eventpts = Math.floor(eventpts * (0.9+(0.35*Math.random())))
        // eventpts = Math.floor(eventpts*2);
        // interaction.reply(`🎣 | You've caught a __${caught.grade}__ **${caught.name}** ${caught.emoji}\nAdded **${eventpts}**🍬`);
        interaction.reply(`🎣 | ${caught.grade === "mythical" ? "Wow, you've" : "You've"} caught a __${caught.grade}__ **${caught.name}**${caught.grade === "mythical" ? "!" : ""} ${caught.emoji}`);

        await updateUsersAndCache(interaction.client, interaction.user.id, {
            updates: {
                items: { type: "merge_json", value: { [caught.id]: 1 } },
                // eventpts: { type: "increment", value: eventpts },
                // eventpts2: { type: "increment", value: eventpts },
            },
        });

        // Daily Quests
        dailies[7].update(interaction, interaction.client); // A Fishy Task
        if (caught.grade === "rare" || caught.grade === "unique" || caught.grade === "legendary" || caught.grade === "mythical") {
            setTimeout(() => {
                dailies[8].update(interaction, interaction.client); // Another Fishy Task
            }, 200);
        };

        //* Achievements
        // Angler's Triumph
        achievements[52].check(interaction, interaction.user, caught.grade), achievements[53].check(interaction, interaction.user, caught.grade), achievements[54].check(interaction, interaction.user, caught.grade);
        // Something's Fishy
        achievements[83].check(interaction, interaction.user), achievements[84].check(interaction, interaction.user), achievements[85].check(interaction, interaction.user), achievements[86].check(interaction, interaction.user), achievements[87].check(interaction, interaction.user);
    },
};

export default exportCommand;
