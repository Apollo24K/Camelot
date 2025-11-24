import { getAllFAQSchemas, getFAQSchemaByName } from "../Modules/queries";
import { SlashCommand } from "../types";

const exportCommand: SlashCommand = {
    name: 'faq',
    skipUserRefetch: true,
    skipServerRefetch: true,
    execute: async ({ interaction }) => {

        const search = interaction.options.getString('search', true);

        const faq = await getFAQSchemaByName(search.toLowerCase());

        if (faq) {
            return interaction.reply(faq.body.replace(/\\n/g, "\n"));
        } else {
            return interaction.reply({ content: `Couldn't find an FAQ for \`${search.toLowerCase()}\``, ephemeral: true });
        };
    },
    async autocomplete({ interaction }) {
        const name = interaction.options.getFocused().toLowerCase();

        const faq = await getAllFAQSchemas();
        faq.sort((a, b) => a.name.localeCompare(b.name));

        let fArray = faq.filter((e) => e.name.includes(name));

        const matches = fArray.filter((e) => e.name === name);
        fArray = fArray.filter((e) => e.name !== name);
        const starts = fArray.filter((e) => e.name.startsWith(name));
        fArray = fArray.filter((e) => !e.name.startsWith(name));

        return [...matches, ...starts, ...fArray].map((e) => ({ name: e.name, value: e.name }));
    },
};

export default exportCommand;
