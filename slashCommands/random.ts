import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'random',
    async execute({ interaction }) {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "numbers") {
            const min = interaction.options.getInteger('min') ?? 1;
            const max = interaction.options.getInteger('max') ?? 100;
            const amount = interaction.options.getInteger('amount') ?? 1;

            if (min > max) return interaction.reply({ content: "Minimum number cannot be greater than the maximum number", ephemeral: true });
            if (amount < 1 || amount > 100) return interaction.reply({ content: "Amount must be between 1 and 100", ephemeral: true });
            if (min < -1000000000 || max > 1000000000) return interaction.reply({ content: "Numbers must be between -1'000'000'000 and 1'000'000'000", ephemeral: true });

            const numbers = [];
            for (let i = 0; i < amount; i++) {
                numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
            };

            if (amount === 1) {
                switch (numbers[0]) {
                    case 24: return interaction.reply('24 🎉');
                    case 42: return interaction.reply('42, the Answer to the Ultimate Question of Life, the Universe, and Everything');
                    case 91: return interaction.reply('91 🏆');
                    default: return interaction.reply("" + numbers[0]);
                };
            };

            return interaction.reply({ content: numbers.join(", ") });
        };

        if (subcommand === "name") {
            const letters = ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no', 'n', 'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'pa', 'pi', 'pu', 'pe', 'po', 'ga', 'gi', 'gu', 'ge', 'go', 'ba', 'bi', 'bu', 'be', 'bo', 'za', 'ze', 'zi', 'zo', 'zu', 'do', 'ji'];
            return interaction.reply(letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)] + (Math.random() < 0.5 ? letters[Math.floor(Math.random() * letters.length)] : ""));
        };

        if (subcommand === "coin") {
            return interaction.reply(Math.random() < 0.5 ? "Heads" : "Tails");
        };
    },
};

export default exportCommand;
