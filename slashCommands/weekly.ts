import { updateUsers } from "../Modules/queries.js";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'weekly',
    async execute({ interaction, author }) {

        if (!author.schema.premium) return interaction.reply("This is a `/premium` feature. If you like the bot we'd appreciate your support <:RaphiSmile:868998036645380197>");

        if (author.schema.weeklyclaimed) {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
            const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 0, 0, 0);

            let s = nextSunday.getTime() - now.getTime();
            let dLeft = Math.floor(s / (1000 * 60 * 60 * 24));
            s %= (1000 * 60 * 60 * 24);
            let hLeft = Math.floor(s / (1000 * 60 * 60));
            s %= (1000 * 60 * 60);
            let mLeft = Math.floor(s / (1000 * 60));

            return interaction.reply("You have already used your weekly this week. Come back in " + `${dLeft ? `**${dLeft}**d ` : ""}${hLeft ? `**${hLeft}**h ` : ""}**${mLeft + 1}**min`);
        };

        let addCoins = 0, ssTicket = 0, sTicket = 0, addGems = 0;

        switch (author.schema.premium) {
            case 1: addCoins = 10000; sTicket = 1; break;
            case 2: addCoins = 20000; sTicket = 3; break;
            case 3: addCoins = 30000; addGems = 120; sTicket = 5; ssTicket = 1; break;
            case 4: addCoins = 40000; addGems = 240; sTicket = 5; ssTicket = 2; break;
            case 5: addCoins = 50000; addGems = 320; sTicket = 6; ssTicket = 3; break;
            case 6: addCoins = 75000; addGems = 450; sTicket = 10; ssTicket = 5; break;
            case 7: addCoins = 100000; addGems = 720; sTicket = 12; ssTicket = 6; break;
            default: false; break;
        };

        interaction.reply(`Added ${addGems ? `**${addGems}**<:genesis_gems:1034179687720681492>, ` : ""}**${addCoins}**<:coins:872926669055356939>${ssTicket === 0 ? ` and **${sTicket}**x<:s_ticket:927642487705722890>` : `, **${sTicket}**x<:s_ticket:927642487705722890> and **${ssTicket}**x<:ss_ticket:927503239396622336>`}`);

        await updateUsers(interaction.user.id, {
            coins: { type: 'increment', value: addCoins },
            gems: { type: 'increment', value: addGems },
            ssticket: { type: 'increment', value: ssTicket },
            sticket: { type: 'increment', value: sTicket },
            weeklyclaimed: { type: 'set', value: 1 }
        });
    },
};

export default exportCommand;
