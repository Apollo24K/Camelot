const { MessageEmbed, MessageAttachment } = require('discord.js');
const prefix = "!";
module.exports = {
	name: 'emojis',
	description: 'emoji list',
	execute(message, args) {
        switch (message.content) {
            case prefix + "!kek" : message.delete(); message.channel.send("<:yogurtKek:794982064553328660>"); break;
            case prefix + "!cry" : message.delete(); message.channel.send("<:Miyano_cry:794983572208484352>"); break;
            case prefix + "!check" : message.delete(); message.channel.send("<:check_icon:683671903143067743>"); break;
            case prefix + "!stop" : message.delete(); message.channel.send("<:stop_icon:683671917353369600>"); break;
            case prefix + "!pause" : message.delete(); message.channel.send("<:pause:690939144225947668>"); break;
            case prefix + "!yes" : message.delete(); message.channel.send("<:Yes:795031321470435338>"); break;
            case prefix + "!no" : message.delete(); message.channel.send("<:No:795031351777951804>"); break;
            case prefix + "!maybe" : message.delete(); message.channel.send("<:Ma:874415136734081054>" + "<:ybe:874415166027075655>"); break;
            case prefix + "!smug" : message.delete(); message.channel.send("<:TohruSmug:794983866904870952>"); break;
            case prefix + "!sip" : message.delete(); message.channel.send("<:LoliSip:538075134540382209>"); break;
            case prefix + "!smugsip" : message.delete(); message.channel.send("<:SmugSip:794982500963057664>"); break;
            case prefix + "!srsly" : message.delete(); message.channel.send("<:srsly:794982283223892028>"); break;
            case prefix + "!sure" : message.delete(); message.channel.send("<:sure:794982145453850684>"); break;
            case prefix + "!umu" : message.delete(); message.channel.send("<:umu:794982099420971018>"); break;
            case prefix + "!culture" : message.delete(); message.channel.send("<:NaruOfCulture:794983662496120843>"); break;
            case prefix + "!wink" : message.delete(); message.channel.send("<:RemWink:795030909745233951>"); break;
            case prefix + "!wave" : message.delete(); message.channel.send("<:mashaWave:554673896280817668>"); break;
            case prefix + "!star" : message.delete(); message.channel.send("<:Star:705392801935786005>"); break;
            case prefix + "!menacing" : message.delete(); message.channel.send("<a:Jojo_Menacing_4:637672707059875871>" + "<a:Jojo_Menacing_3:637672692098793483>" + "<a:Jojo_Menacing_2:637672677401952256> " + "<a:Jojo_Menacing_1:637672661505409064>"); break;
            case prefix + "!disco" : message.delete(); message.channel.send("<a:AraDisco:648996741160632340>"); break;
            case prefix + "!hinata" : message.delete(); message.channel.send("<a:HinataThumbsup:789938596151951372>"); break;
            case prefix + "!tohru" : message.delete(); message.channel.send("<a:TohruThumbsUp:790261153153941515>"); break;
            default : break;
        };
	},
};