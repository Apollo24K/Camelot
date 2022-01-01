const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'emojilist',
	description: 'emoji list',
	execute(message, args) {
        const embed = new MessageEmbed()
        .setTitle('Emoji List')
        .setColor(0xbbffff)
        .setDescription("<:yogurtKek:794982064553328660> -> !!kek\n<:Miyano_cry:794983572208484352> -> !!cry\n<:TohruSmug:794983866904870952> -> !!smug\n<:LoliSip:538075134540382209> -> !!sip\n<:SmugSip:794982500963057664> -> !!smugsip\n<:check_icon:683671903143067743> -> !!check\n<:stop_icon:683671917353369600> -> !!stop\n<:pause:690939144225947668> -> !!pause\n<:Yes:795031321470435338> -> !!yes\n<:No:795031351777951804> -> !!no\n<:Ma:874415136734081054><:ybe:874415166027075655> !!maybe\n<:srsly:794982283223892028> -> !!srsly\n<:sure:794982145453850684> -> !!sure\n<:umu:794982099420971018> -> !!umu\n<:NaruOfCulture:794983662496120843> -> !!culture\n<:RemWink:795030909745233951> -> !!wink\n<:mashaWave:554673896280817668> -> !!wave\n<a:AraDisco:648996741160632340> -> !!disco")
        .setTimestamp()
        .setFooter("Camelot V1.0.0", "https://i.ibb.co/42gCWkC/Artoria-Pendragon.png")
        message.channel.send(embed);
	}
};