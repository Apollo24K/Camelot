import { auniq } from "../Modules/chars";

module.exports = {
	name: 'recommend',
	description: 'recommend an anime',
	execute(interaction) {
		return interaction.reply(auniq[Math.floor(Math.random() * auniq.length)]);
	},
};