const { generateCaptcha } = require("../Modules/functions.js");
const { requestVerification } = require("../Modules/components.js");

module.exports = {
	name: 'captcha',
	description: 'captcha',
	execute(interaction) {

        const code = interaction.options.getString('code');

        if (!requestVerification.has(interaction.user.id)) return interaction.reply("You don't have any pending captcha");

        if (code === requestVerification.get(interaction.user.id).text) {
            clearTimeout(requestVerification.get(interaction.user.id).timeout);
            requestVerification.delete(interaction.user.id);
            return interaction.reply("Thank you!");
        };

        if (code !== requestVerification.get(interaction.user.id)) {
            const captcha = generateCaptcha();
            clearTimeout(requestVerification.get(interaction.user.id).timeout);
            requestVerification.set(interaction.user.id, {text: captcha.text, timeout: setTimeout(() => requestVerification.delete(interaction.user.id), 60*60*1000)});
            return interaction.reply({content: `Wrong code, please try again </captcha:1114616338581823568>`, files: [captcha.attachement]});
        };

	},
};