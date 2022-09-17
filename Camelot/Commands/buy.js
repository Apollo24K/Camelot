const { MessageEmbed } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { splitTitle, rarity, getRefinement } = require("../Modules/functions.js");
const { achievements } = require("../Modules/achievements.js");

function displayMy(thisChar, inv, ref, interaction) {
    let animeL = splitTitle(thisChar.anime);
    let dupes = inv.filter((e) => e === thisChar.id).length;
    let refinement = getRefinement(ref);
    
    let img = thisChar.image;
    
    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setImage(img)
    .setThumbnail(rarity(thisChar.rarity))
    .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
    .setFooter(`You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
    interaction.editReply({ embeds: [Embed] });
};

module.exports = {
	name: 'buy',
	description: 'buy from the shop',
	execute(interaction) {

        let item = interaction.options.getString('item');

        db.serialize(async () => {
            await interaction.deferReply();

            var stats = await query(`SELECT coins FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];
            if (!stats?.coins) return interaction.editReply("You don't have enough coins");

            var inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};
            
            let sub_coins = 0;

            const ranRar = Math.floor(Math.random() * 1000); // 0-999

            if (item === "0") {
                return interaction.editReply(`**${args[0]}** is not a valid ID. Please see \`${prefix}shop\``)
            } else if (item === "1" || item === "2" || item === "3") {
                if (stats.coins < 300) return interaction.editReply("You don't have enough coins");
                sub_coins = 300;

                let rar = "D";
                if (ranRar < 3) rar = "SS";
                else if (ranRar < 21) rar = "S";
                else if (ranRar < 63) rar = "A";
                else if (ranRar < 189) rar = "B";
                else if (ranRar < 442) rar = "C";
    
                let fChars = characters.filter((e) => e.rarity === rar);
                if (item === "2") fChars = fChars.filter((e) => e.gender === "F");
                else if (item === "3") fChars = fChars.filter((e) => e.gender === "M");
                let num = Math.floor(Math.random() * fChars.length);
                inv.chars.push(fChars[num].id);
                displayMy(fChars[num], inv.chars, inv.ref[fChars[num].id], interaction);

            } else if (item === "4") {
                if (stats.coins < 800) return interaction.editReply("You don't have enough coins");
                sub_coins = 800;

                let desc3 = [];
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${interaction.user.username}`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")

                let rarEmoji = {"SS":"<:SSTier:869316489931546644>","S":"<:STier:869316518675095552>","A":"<:ATier:869316558013464627>","B":"<:BTier:869316586803179571>","C":"<:CTier:869316602858991657>","D":"<:DTier:869316616071032843>"}

                for (i=1; i < 4; i++) {
                    const ranRar = Math.floor(Math.random() * 1000); // 0-999
                    let rar = "D";
                    if (ranRar < 3) rar = "SS";
                    else if (ranRar < 21) rar = "S";
                    else if (ranRar < 63) rar = "A";
                    else if (ranRar < 189) rar = "B";
                    else if (ranRar < 442) rar = "C";

                    let fChars = characters.filter((e) => e.rarity === rar);
                    let num = Math.floor(Math.random() * fChars.length);
                    desc3.push(`${i}. ${rarEmoji[rar]}-Tier **${fChars[num].name}**`)
                    inv.chars.push(fChars[num].id);
                };

                Embed.setDescription(desc3.join("\n")).setThumbnail(characters[inv.chars[inv.chars.length - 3]].image)
                interaction.editReply({ embeds: [Embed] });

            } else if (item === "5") {
                if (stats.coins < 500) return interaction.editReply("You don't have enough coins");
                sub_coins = 500;

                let rar = "C";
                if (ranRar < 4) rar = "SS";
                else if (ranRar < 30) rar = "S";
                else if (ranRar < 103) rar = "A";
                else if (ranRar < 412) rar = "B";
    
                let fChars = characters.filter((e) => e.rarity === rar);
                let num = Math.floor(Math.random() * fChars.length);
                inv.chars.push(fChars[num].id);
                displayMy(fChars[num], inv.chars, inv.ref[fChars[num].id], interaction);

            } else if (item === "6") {
                if (stats.coins < 2000) return interaction.editReply("You don't have enough coins");
                let newChars = characters.filter((e) => !inv.chars.includes(e.id) && e.rarity !== "SS");
                if (newChars.length < 1) return interaction.editReply("You already have every character");
                sub_coins = 2000;
                
                let rarUp;
                if (ranRar < 21) {
                    rarUp = "S";
                    if (!newChars.some((e) => e.rarity === "S")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "S" || e.rarity === "A")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "S" || e.rarity === "A" || e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "S" || e.rarity === "A" || e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                } else if (ranRar < 63) {
                    rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "A")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B" || e.rarity === "C" || e.rarity === "D")) rarUp = "S";
                } else if (ranRar < 189) {
                    rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C" || e.rarity === "D")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C" || e.rarity === "D" || e.rarity === "A")) rarUp = "S";
                } else if (ranRar < 442) {
                    rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D" || e.rarity === "B")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D" || e.rarity === "B" || e.rarity === "A")) rarUp = "S";
                } else if (ranRar < 1000) {
                    rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "D")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C" || e.rarity === "B")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C" || e.rarity === "B" || e.rarity === "A")) rarUp = "S";
                };
                let fChars = newChars.filter((e) => e.rarity === rarUp);
                const num = Math.floor(Math.random() * fChars.length);
                inv.chars.push(fChars[num].id);
                displayMy(fChars[num], inv.chars, inv.ref[fChars[num].id], interaction);
            };
            
            await query(`UPDATE users SET coins = coins - ${sub_coins} WHERE id = ${interaction.user.id}`);
            await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);
            
            // Achievements
            achievements[1].check(interaction), achievements[2].check(interaction), achievements[3].check(interaction); // Collector
            achievements[19].check(interaction), achievements[20].check(interaction), achievements[21].check(interaction), achievements[22].check(interaction), achievements[23].check(interaction); // Diligent
            achievements[48].check(interaction); // First Steps
        });

    },
};