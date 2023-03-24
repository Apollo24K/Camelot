module.exports = {
    name: 'random',
	description: 'random',
	execute(interaction) {

        if (interaction.options.getSubcommand() === "number") {
            const ranum = Math.ceil(Math.random() * 100);
            switch (ranum) {
                case 24 : interaction.reply('24 🎉'); break;
                case 42 : interaction.reply('42, the Answer to the Ultimate Question of Life, the Universe, and Everything'); break;
                case 91 : interaction.reply('91 🏆'); break;
                default : interaction.reply(""+ranum); break;
            }
        } else if (interaction.options.getSubcommand() === "name") {
            const letters = ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no', 'n', 'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'pa', 'pi', 'pu', 'pe', 'po', 'ga', 'gi', 'gu', 'ge', 'go', 'ba', 'bi', 'bu', 'be', 'bo', 'za', 'ze', 'zi', 'zo', 'zu', 'do', 'ji'];
            interaction.reply(letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)] + (Math.random() < 0.5 ? letters[Math.floor(Math.random() * letters.length)] : ""));
        } else if (interaction.options.getSubcommand() === "coin") {
            interaction.reply(Math.random() < 0.5 ? "Heads" : "Tails");
        };

    },
};