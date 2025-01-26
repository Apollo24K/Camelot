import { EmbedBuilder, Message, MessageType } from "discord.js";
import { BotEvent } from "../types";

const emojis = ["<:LuminousPsssh:1071574041116295328>", "<:HayasakaSmile:928369469301088326>", "<:ClaraLove:1034899845539962890>", "<:DizzyWorried:1025876785470111766>", "<:KannaWave:1025884100445339660>", "<:CirWave:1025884103565914252>", "<:KazuhaWave:1025884094975967324>", "<:HowCute:1026605362960408576>", "<:KanaoSmile:1025876532587151486>", "<:KannaPat:1026921369650331648>", "<a:KannaFire:1045096950070001687>", "<:KaguyaThink:1045096923255816253>", "<:MashaWave:928370055354400799>", "<:RoxyConcern:1041990236307197972>", "<:RaphiSmile:928370490270183485>", "<:RemWink:928370529742757960>", "<:MikuHappy:1045096947876368404>", "<:LoliSip:928369879348805692>", "<:LoveHeart:928369932683595827>", "<:OhMy:928370383495770112>", "<:AzusaSmug:1025884097299615774>", "<:KotoWave:1025884105281372260>", "<:omoshiroi:1029435114637246575>", "<:wow:1020442064409874462>", "<:umu:1025876213853605919>", "<:yayyy:1031583211828035655>", "<:pewpew:928370427112357918>", "<:ara:1071573953509863465>", "<:cuteXD:1031583207562428488>", "<:ThumbsUp:1020442047712350298>", "<:TohruPoint:928370972132782090>", "<:Woah:928370799965003826>", "<:SmugSip:928368817078407229>", "<a:ShiroeGlassesPush:1027582770211463358>", "<:SataniaEvil:928369432307331162>"];

const event: BotEvent = {
    name: "messageCreate",
    execute: (message: Message) => {
        if (message.author.bot) return;

        if (message.guild) {
            if (message.mentions.users.first()?.id !== message.client.user.id) return;
            if (message.guild.id === "927257132624130119") return;
            if (message.type === MessageType.Default) {
                if (message.channel.isSendable()) message.channel.send(
                    `Welcome, Adventurer ${emojis[Math.floor(Math.random() * emojis.length)]}\n` +
                    `Please use slash commands (i.e. </pull:1011014030103674913>) to interact with the bot.\n` +
                    `If it doesn't work it's probably because of some missing permissions, make sure that Camelot has all required permissions to function! Feel free to reach out to us if you need help at any step: https://discord.gg/myy9PBCdEW`
                );
            };
            return;
        };

        // Log DM's
        const channel = message.client.channels.cache.find(channel => channel.id === "1077264632412110890");
        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setDescription(message.content)
            .setAuthor({ name: message.author.tag, url: "https://" + message.author.id + ".com", iconURL: message.author.displayAvatarURL({ size: 1024 }) });
        if (channel?.isSendable()) channel.send({ embeds: [Embed] });
    },
};

export default event;
