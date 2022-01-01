const { MessageEmbed } = require('discord.js');
module.exports = {
        name: 'notes',
        description: 'update notes',
	execute(message, args) {

        let pages = [
            "‧ Duplikate kann man jetzt einfacher mit **!invd** sehen\n‧ Added **One Piece** (664 Chars)\n‧ Added **Death Note** (14 Chars)\n‧ Level etwas generft",
            "‧ Ein pity system (`!pity`) wurde hinzugefügt. Wenn man in 70 pulls keinen S char bekommt kriegt man im 70. garantiert nen S tier, und wenn man in 180 pulls keinen SS bekommt kriegt man im 180. nen SS\n‧ Mit `!list <rarity>` kann man sich jetzt alle chars im spiel ansehen von ner bestimmten seltenheit.\n‧ Added **Link Click** (19 Chars)\n‧ Bei `!anime` sieht man jetzt auch neben jedem anime wie viele chars einem noch fehlen\n‧ und paar bug fixes",
            "‧ Command `!find <char name or ID>` geaddet um nach spielern zu suchen die nen bestimmten char haben",
            "‧ `!invd` wird nun nach anzahl dupes sortiert\n‧ Mehr filter für top (`!topp`, `!topc`, `!topc%`, `!topa`)\n  - `!topp`: topliste nach pulls\n  - `!topc`: topliste nach anzahl chars\n  - `!topc%`: topliste nach sammel fortschritt\n  - `!topa`: topliste nach anzahl kompletter anime\n‧ Added **Odd Taxi** (17 Chars)\n‧ Added **Maquia** (16 Chars)\n‧ Added **Hotarubi no Mori e** (3 Chars)\n‧ Added **Shelter** (2 Chars)",
            "‧ **Magi** erweitert (+93 chars)\n‧ Added **Kill la Kill** (26 chars)\n‧ Added **Evangelion** (21 chars)\n‧ Added **Higehiro** (10 chars)",
            "‧ Added **Noragami** (51 chars)",
            '‧ Anime mit zu langen namen werden jetzt auf 2 zeilen gesplitten `(wie z.B "That Time I Got Reincarnated as a Slime")`\n‧ **Genshin Impact** erweitert (+5 chars)\n‧ Added **Takt op. Destiny** (11 chars)\n‧ Added **Mieruko-chan** (9 chars)',
            "‧ Added **Cheat Slayer** (10 chars)\n‧ Added **Wolf Children** (10 chars)\n‧ Added **Danna ga Nani wo Itteiru ka Wakaranai Ken** (11 chars)\n‧ Added **A Whisker Away** (4 chars)",
            "‧ `!sell dupes` endlich geaddet\n  - Aufbau: `!sell dupes <number> <rarit>`\n  - `<number>` definiert hier ab wie viele copies die karte verkauft werden soll\n  - `<rarit>` ist optional falls man z.B nur D rank dupes verkaufen will\n  - wenn man nix dazuschreibt werden alle dupes verkauft\n  - Beispiel: `!sell dupes 3 B` verkauft alle B rang Karten ab der 3. Kopie\n‧ Refinement funktioniert endlich wies geplant war, also das level erhöht sich nun nur wenn man nen char selbst pullt. Das level bleibt dann auch gleich falls man seine dupes verkauft.\n‧ Added **Kaguya-sama: Love is War** (34 chars)\n‧ Added **Shinchou Yuusha** (26 chars)\n‧ Added **Redo of Healer** (8 chars)\n‧ Added **I want to eat your pancreas** (5 chars)\n‧ Added **Grave of the Fireflies** (3 chars)",
            "‧ Chars haben jeweils 3 stats. HP, ATK und DEF. Alle chars haben unterschiedliche, base stats die man durchs aufleveln und mit Refinement level erhöhen kann. Neben HP, ATK und DEF werdet ihr noch einen weiteren wert finden, **EP**. Das gibt die overall stärke eines chars an. Je höher desto besser.\n  - Mit `!infostats <char>` oder kurz `!is <char>` könnt ihr die base stats von chars ansehen\n  - Mit `!ims <char>` seht ihr die stats von euren eigenen chars\n  - `!rank` sortiert sortiert die besten chars nach base EP\n  - Aufleveln könnt ihr eure chars mit `!lvlup <char>` oder kurz `!lu <char>`\n‧ Added **Trapped in Dating Sim** (17 chars)",
        ];

        let page = pages.length-1;

        const Embed = new MessageEmbed()
        .setColor(0xbbffff)
        .setTitle(`Update Notes`)
        .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
        .setDescription(pages[page])
        .setFooter(`Page ${pages.length - page}/${pages.length}`)
        message.channel.send(Embed).then(msg => {
            msg.react("⏪").then(r => {
                msg.react("⏩");

                const prevFilter = (reaction, user) => reaction.emoji.name === "⏪" && user.id === message.author.id;
                const nextFilter = (reaction, user) => reaction.emoji.name === "⏩" && user.id === message.author.id;
                const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                const next = msg.createReactionCollector(nextFilter, {time: 60000});

                prev.on('collect', r => {
                    if (page+1 < pages.length) {
                        page++;
                    } else {
                        page = 0;
                    };

                    Embed.setDescription(pages[page]).setFooter(`Page ${pages.length - page}/${pages.length}`);
                    msg.edit(Embed);
                    msg.reactions.resolve("⏪").users.remove(message.author);
                });

                next.on('collect', r => {
                    if (page > 0) {
                        page--;
                    } else {
                        page = pages.length-1;
                    };

                    Embed.setDescription(pages[page]).setFooter(`Page ${pages.length - page}/${pages.length}`);
                    msg.edit(Embed);
                    msg.reactions.resolve("⏩").users.remove(message.author);
                });
            });
        });

	},
};