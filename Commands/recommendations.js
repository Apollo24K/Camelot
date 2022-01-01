const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'recommendations',
	description: 'recommendations',
	execute(message, args) {
        const gildas = Math.floor(Math.random() * 306);
        if (gildas === 0) {
          message.channel.send('Steins;Gate');
        } else if (gildas === 1) {
          message.channel.send('Tate no Yuusha no Nariagari');
        } else if (gildas === 2) {
          message.channel.send('Assassination Classroom');
        } else if (gildas === 3) {
          message.channel.send('One Piece');
        } else if (gildas === 4) {
          message.channel.send('Classroom of the Elite');
        } else if (gildas === 5) {
          message.channel.send('Made in Abyss');
        } else if (gildas === 6) {
          message.channel.send('No Game No Life');
        } else if (gildas === 7) {
          message.channel.send('Demon Slayer');
        } else if (gildas === 8) {
          message.channel.send('Vinland Saga');
        } else if (gildas === 9) {
          message.channel.send('Dr. Stone');
        } else if (gildas === 10) {
          message.channel.send('High School DxD');
        } else if (gildas === 11) {
          message.channel.send('The Testament of Sister New Devil');
        } else if (gildas === 12) {
          message.channel.send('Attack on Titan');
        } else if (gildas === 13) {
          message.channel.send('Akame ga Kill!');
        } else if (gildas === 14) {
          message.channel.send('Trinity Seven');
        } else if (gildas === 15) {
          message.channel.send('Death Note');
        } else if (gildas === 16) {
          message.channel.send('Code Geass');
        } else if (gildas === 17) {
          message.channel.send('Sword Art Online');
        } else if (gildas === 18) {
          message.channel.send('Tokyo Ghoul');
        } else if (gildas === 19) {
          message.channel.send('One Punch Man');
        } else if (gildas === 20) {
          message.channel.send('Mob Psycho 100');
        } else if (gildas === 21) {
          message.channel.send('Hunter x Hunter');
        } else if (gildas === 22) {
          message.channel.send('Food Wars');
        } else if (gildas === 23) {
          message.channel.send('Seraph of the End');
        } else if (gildas === 24) {
          message.channel.send('**Fate Series** (use "!fate/order" to see where to start)');
        } else if (gildas === 25) {
          message.channel.send('Fairy Tail');
        } else if (gildas === 26) {
          message.channel.send('Black Clover');
        } else if (gildas === 27) {
          message.channel.send('Fullmetal Alchemist: Brotherhood');
        } else if (gildas === 28) {
          message.channel.send('Mirai Nikki');
        } else if (gildas === 29) {
          message.channel.send('Another');
        } else if (gildas === 30) {
          message.channel.send('Your Name');
        } else if (gildas === 31) {
          message.channel.send('Tenki no ko');
        } else if (gildas === 32) {
          message.channel.send('Guilty Crown');
        } else if (gildas === 33) {
          message.channel.send('Noragami');
        } else if (gildas === 34) {
          message.channel.send('K-Project');
        } else if (gildas === 35) {
          message.channel.send('Re:Zero');
        } else if (gildas === 36) {
          message.channel.send('My Hero Academia');
        } else if (gildas === 37) {
          message.channel.send('Kaguya-Sama: Love is war');
        } else if (gildas === 38) {
          message.channel.send('Kakegurui');
        } else if (gildas === 39) {
          message.channel.send('Kenja no Mago');
        } else if (gildas === 40) {
          message.channel.send('Charlotte');
        } else if (gildas === 41) {
          message.channel.send('Kono Subarashii Sekai ni Shukufuku wo!');
        } else if (gildas === 43) {
          message.channel.send('Angel Beats');
        } else if (gildas === 44) {
          message.channel.send('Overlord');
        } else if (gildas === 45) {
          message.channel.send('Youjo Senki');
        } else if (gildas === 46) {
          message.channel.send('Danmachi: Is It Wrong to Try to Pick Up Girls in a Dungeon?');
        } else if (gildas === 47) {
          message.channel.send('A Silent Voice');
        } else if (gildas === 48) {
          message.channel.send('Black Bullet');
        } else if (gildas === 49) {
          message.channel.send('Black Butler');
        } else if (gildas === 50) {
          message.channel.send('Toradora');
        } else if (gildas === 51) {
          message.channel.send('Isekai Quartet (but make sure to watch these first: KonoSuba, Overlord, Re:Zero, Youjo Senki');
        } else if (gildas === 52) {
          message.channel.send('The Devil is a Part-Timer!');
        } else if (gildas === 53) {
          message.channel.send('Monogatari Series');
        } else if (gildas === 54) {
          message.channel.send('Mahou Shoujo Madoka★Magica');
        } else if (gildas === 55) {
          message.channel.send('Fire Force');
        } else if (gildas === 56) {
          message.channel.send('Keijo!!!!!!!!');
        } else if (gildas === 57) {
          message.channel.send('Elfen Lied');
        } else if (gildas === 58) {
          message.channel.send('Berserk');
        } else if (gildas === 59) {
          message.channel.send('Parasyte');
        } else if (gildas === 60) {
          message.channel.send('Spirited Away');
        } else if (gildas === 61) {
          message.channel.send('My Neighbor Totoro');
        } else if (gildas === 62) {
          message.channel.send('Mononoke Hime');
        } else if (gildas === 63) {
          message.channel.send("Howl's Moving Castle");
        } else if (gildas === 64) {
          message.channel.send('Grave of the Fireflies');
        } else if (gildas === 65) {
          message.channel.send('The Quintessential Quintuplets');
        } else if (gildas === 66) {
          message.channel.send('Cautious Hero');
        } else if (gildas === 67) {
          message.channel.send('The Seven Deadly Sins');
        } else if (gildas === 68) {
          message.channel.send('Azur Lane');
        } else if (gildas === 69) {
          message.channel.send("JoJo's Bizarre Adventure");
        } else if (gildas === 70) {
          message.channel.send('Shuumatsu Nani Shitemasu ka? Isogashii Desu ka? Sukutte Moratte Ii Desu ka?');
        } else if (gildas === 71) {
          message.channel.send('Tensei Shitara Slime Datta Ken');
        } else if (gildas === 72) {
          message.channel.send('The Irregular at Magic High School');
        } else if (gildas === 73) {
          message.channel.send('Mob Psycho 100');
        } else if (gildas === 74) {
          message.channel.send('Arslan Senki');
        } else if (gildas === 75) {
          message.channel.send('Yakusoku no Neverland');
        } else if (gildas === 76) {
          message.channel.send('Your Lie in April');
        } else if (gildas === 77) {
          message.channel.send('Haikyuu!!');
        } else if (gildas === 78) {
          message.channel.send('Kuroko no Basket');
        } else if (gildas === 79) {
          message.channel.send('Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai');
        } else if (gildas === 80) {
          message.channel.send('Violet Evergarden');
        } else if (gildas === 81) {
          message.channel.send('Dororo');
        } else if (gildas === 82) {
          message.channel.send('Durarara!!');
        } else if (gildas === 83) {
          message.channel.send('Bofuri');
        } else if (gildas === 84) {
          message.channel.send('Yahari Ore no Seishun Love Comedy wa Machigatteiru');
        } else if (gildas === 85) {
          message.channel.send('Gintama');
        } else if (gildas === 86) {
          message.channel.send('Legend of the Galactic Heroes');
        } else if (gildas === 87) {
          message.channel.send('3-gatsu no Lion');
        } else if (gildas === 88) {
          message.channel.send('Clannad');
        } else if (gildas === 89) {
          message.channel.send('Cowboy Bebop');
        } else if (gildas === 90) {
          message.channel.send('Shouwa Genroku Rakugo Shinjuu');
        } else if (gildas === 91) {
          message.channel.send('Hajime no Ippo');
        } else if (gildas === 92) {
          message.channel.send('Mushishi');
        } else if (gildas === 93) {
          message.channel.send('Rurouni Kenshin');
        } else if (gildas === 94) {
          message.channel.send('Great Teacher Onizuka	');
        } else if (gildas === 95) {
          message.channel.send('Monster');
        } else if (gildas === 96) {
          message.channel.send("Natsume's Book of Friends");
        } else if (gildas === 97) {
          message.channel.send('Wolf Children');
        } else if (gildas === 98) {
          message.channel.send('Spice and Wolf');
        } else if (gildas === 99) {
          message.channel.send('Tengen Toppa Gurren Lagann');
        } else if (gildas === 100) {
          message.channel.send('Suzumiya Haruhi no Shoushitsu');
        } else if (gildas === 101) {
          message.channel.send('Ashita no Joe');
        } else if (gildas === 102) {
          message.channel.send('Ping Pong the Animation');
        } else if (gildas === 103) {
          message.channel.send('Bakuman');
        } else if (gildas === 104) {
          message.channel.send('Chihayafuru');
        } else if (gildas === 105) {
          message.channel.send('Yojouhan Shinwa Taikei');
        } else if (gildas === 106) {
          message.channel.send('Kimi no Suizou wo Tabetai');
        } else if (gildas === 107) {
          message.channel.send('Sora yori mo Tooi Basho');
        } else if (gildas === 108) {
          message.channel.send('Kara no Kyoukai');
        } else if (gildas === 109) {
          message.channel.send('Aria the Origination');
        } else if (gildas === 110) {
          message.channel.send('Mo Dao Zu Shi');
        } else if (gildas === 111) {
          message.channel.send('Quanzhi Gaoshou');
        } else if (gildas === 112) {
          message.channel.send('Saiki Kusuo no Ψ-nan');
        } else if (gildas === 113) {
          message.channel.send('Ghost in the Shell');
        } else if (gildas === 114) {
          message.channel.send('Rainbow');
        } else if (gildas === 115) {
          message.channel.send('Uchuu Kyoudai');
        } else if (gildas === 116) {
          message.channel.send('Slam Dunk');
        } else if (gildas === 117) {
          message.channel.send('Kaze ga Tsuyoku Fuiteiru');
        } else if (gildas === 118) {
          message.channel.send('Nichijou');
        } else if (gildas === 119) {
          message.channel.send('Neon Genesis Evangelion');
        } else if (gildas === 120) {
          message.channel.send('Absolute Duo');
        } else if (gildas === 121) {
          message.channel.send('Ajin');
        } else if (gildas === 122) {
          message.channel.send('Acchi Kocchi');
        } else if (gildas === 123) {
          message.channel.send('Akagami no Shirayukihime');
        } else if (gildas === 124) {
          message.channel.send('Akatsuki no Yona');
        } else if (gildas === 125) {
          message.channel.send('Aku no Hana');
        } else if (gildas === 126) {
          message.channel.send('Akuma no Riddle');
        } else if (gildas === 127) {
          message.channel.send('Aldnoah.Zero');
        } else if (gildas === 128) {
          message.channel.send('Kabaneri of the Iron Fortress');
        } else if (gildas === 129) {
          message.channel.send('Amagi Brilliant Park');
        } else if (gildas === 130) {
          message.channel.send('AnoHana');
        } else if (gildas === 131) {
          message.channel.send('Ascendance of a Bookworm');
        } else if (gildas === 132) {
          message.channel.send('Asobi Asobase');
        } else if (gildas === 133) {
          message.channel.send('Baccano!');
        } else if (gildas === 134) {
          message.channel.send('Beastars');
        } else if (gildas === 135) {
          message.channel.send('Beelzebub');
        } else if (gildas === 136) {
          message.channel.send('Beelzebub-jou no Okinimesu mama.');
        } else if (gildas === 137) {
          message.channel.send('Black Lagoon');
        } else if (gildas === 138) {
          message.channel.send('Bleach');
        } else if (gildas === 139) {
          message.channel.send('Blend S');
        } else if (gildas === 140) {
          message.channel.send('Blue Exorcist');
        } else if (gildas === 141) {
          message.channel.send('Bokutachi wa Benkyou ga Dekinai');
        } else if (gildas === 142) {
          message.channel.send('Btooom!');
        } else if (gildas === 143) {
          message.channel.send('Bungou Stray Dogs');
        } else if (gildas === 144) {
          message.channel.send('Byousoku 5 Centimeter');
        } else if (gildas === 145) {
          message.channel.send('Carole & Tuesday');
        } else if (gildas === 146) {
          message.channel.send('Cells at Work!');
        } else if (gildas === 147) {
          message.channel.send('Chobits');
        } else if (gildas === 148) {
          message.channel.send('Choujigen Game Neptune');
        } else if (gildas === 149) {
          message.channel.send('Chuunibyou demo Koi ga Shitai!');
        } else if (gildas === 150) {
          message.channel.send('Citrus');
        } else if (gildas === 151) {
          message.channel.send('Claymore');
        } else if (gildas === 152) {
          message.channel.send('Dagashi Kashi');
        } else if (gildas === 153) {
          message.channel.send('Danganronpa ');
        } else if (gildas === 154) {
          message.channel.send('Danshi Koukousei no Nichijou');
        } else if (gildas === 155) {
          message.channel.send('Darker than Black');
        } else if (gildas === 156) {
          message.channel.send('Darling in the FranXX');
        } else if (gildas === 157) {
          message.channel.send('Date a Live');
        } else if (gildas === 158) {
          message.channel.send("Darwin's Game");
        } else if (gildas === 159) {
          message.channel.send('Deadman Wonderland');
        } else if (gildas === 160) {
          message.channel.send('Death March kara Hajimaru Isekai Kyousoukyoku');
        } else if (gildas === 161) {
          message.channel.send('Death Parade');
        } else if (gildas === 162) {
          message.channel.send('Demon King Daimao');
        } else if (gildas === 163) {
          message.channel.send('Devilman: Crybaby');
        } else if (gildas === 164) {
          message.channel.send('Divine Gate');
        } else if (gildas === 165) {
          message.channel.send('Domestic na Kanojo');
        } else if (gildas === 166) {
          message.channel.send('Erased');
        } else if (gildas === 167) {
          message.channel.send('Ergo Proxy');
        } else if (gildas === 168) {
          message.channel.send('Eromanga-Sensei');
        } else if (gildas === 169) {
          message.channel.send('Eizouken ni wa Te wo Dasu na!');
        } else if (gildas === 170) {
          message.channel.send('Free!');
        } else if (gildas === 171) {
          message.channel.send('Fruits Basket');
        } else if (gildas === 172) {
          message.channel.send('Full Metal Panic!');
        } else if (gildas === 173) {
          message.channel.send('Gatchaman Crowds');
        } else if (gildas === 174) {
          message.channel.send('Gakusen Toshi Asterisk');
        } else if (gildas === 175) {
          message.channel.send('Gamers!');
        } else if (gildas === 176) {
          message.channel.send('Gantz');
        } else if (gildas === 177) {
          message.channel.send('Garden of Sinners');
        } else if (gildas === 178) {
          message.channel.send('Gate');
        } else if (gildas === 179) {
          message.channel.send('Gekkan Shoujo Nozaki-kun');
        } else if (gildas === 180) {
          message.channel.send("Girls' Last Tour");
        } else if (gildas === 181) {
          message.channel.send('Goblin Slayer');
        } else if (gildas === 182) {
          message.channel.send('God Eater');
        } else if (gildas === 183) {
          message.channel.send('Gokukoku no Brynhildr');
        } else if (gildas === 184) {
          message.channel.send('Golden Boy');
        } else if (gildas === 185) {
          message.channel.send('Gosick');
        } else if (gildas === 186) {
          message.channel.send('Granblue Fantasy');
        } else if (gildas === 187) {
          message.channel.send('Grand Blue');
        } else if (gildas === 188) {
          message.channel.send('Great Teacher Onizuka');
        } else if (gildas === 189) {
          message.channel.send('Grimgar, Ashes and Illusions');
        } else if (gildas === 190) {
          message.channel.send('Grisaia no Kajitsu');
        } else if (gildas === 191) {
          message.channel.send('Haibane Renmei	');
        } else if (gildas === 192) {
          message.channel.send('Hellsing');
        } else if (gildas === 193) {
          message.channel.send('High Score Girl');
        } else if (gildas === 194) {
          message.channel.send('Highschool of the Dead');
        } else if (gildas === 195) {
          message.channel.send('Higurashi no Naku Koro ni');
        } else if (gildas === 196) {
          message.channel.send('Hinamatsuri');
        } else if (gildas === 197) {
          message.channel.send('Children Who Chase Lost Voices');
        } else if (gildas === 198) {
          message.channel.send('Hotarubi no Mori e');
        } else if (gildas === 199) {
          message.channel.send('How Not to Summon a Demon Lord');
        } else if (gildas === 200) {
          message.channel.send('Hyouka');
        } else if (gildas === 201) {
          message.channel.send('Initial D');
        } else if (gildas === 202) {
          message.channel.send('Inou-Battle wa Nichijou-kei no Naka de');
        } else if (gildas === 203) {
          message.channel.send('InuYasha');
        } else if (gildas === 204) {
          message.channel.send('Inuyashiki');
        } else if (gildas === 205) {
          message.channel.send('Isekai wa Smartphone to Tomo ni');
        } else if (gildas === 206) {
          message.channel.send('Jibaku Shounen Hanako-kun');
        } else if (gildas === 207) {
          message.channel.send('Jormungand');
        } else if (gildas === 208) {
          message.channel.send('Joshikousei no Mudazukai');
        } else if (gildas === 209) {
          message.channel.send('K-On!');
        } else if (gildas === 210) {
          message.channel.send('Kakuriyo no Yadomeshi');
        } else if (gildas === 211) {
          message.channel.send('Kami nomi zo Shiru Sekai');
        } else if (gildas === 212) {
          message.channel.send('Kämpfer');
        } else if (gildas === 213) {
          message.channel.send('Kanata no Astra');
        } else if (gildas === 214) {
          message.channel.send('Katanagatari');
        } else if (gildas === 215) {
          message.channel.send('Kekkai Sensen');
        } else if (gildas === 216) {
          message.channel.send('Kill la Kill');
        } else if (gildas === 217) {
          message.channel.send('I want to eat your pancreas');
        } else if (gildas === 218) {
          message.channel.send('Kino no Tabi');
        } else if (gildas === 219) {
          message.channel.send('Kiss X Sis');
        } else if (gildas === 220) {
          message.channel.send('Kiznaiver');
        } else if (gildas === 221) {
          message.channel.send('Koi to Uso');
        } else if (gildas === 222) {
          message.channel.send('Kokoro Connect');
        } else if (gildas === 223) {
          message.channel.send('Konohana Kitan');
        } else if (gildas === 224) {
          message.channel.send('Kore wa Zombie Desu ka?');
        } else if (gildas === 225) {
          message.channel.send('Kuzu no Honkai');
        } else if (gildas === 226) {
          message.channel.send('Kyoukai no Kanata');
        } else if (gildas === 227) {
          message.channel.send('Liz to Aoi Tori');
        } else if (gildas === 228) {
          message.channel.send('Log Horizon');
        } else if (gildas === 229) {
          message.channel.send('Lucky☆Star');
        } else if (gildas === 230) {
          message.channel.send('Magi');
        } else if (gildas === 231) {
          message.channel.send('Magister Negi Magi');
        } else if (gildas === 232) {
          message.channel.send('Mahoutsukai no Yome');
        } else if (gildas === 233) {
          message.channel.send('Maoyuu Maou Yuusha');
        } else if (gildas === 234) {
          message.channel.send('Masamune-kun no Revenge');
        } else if (gildas === 235) {
          message.channel.send("Miss Kobayashi's Dragon Maid");
        } else if (gildas === 236) {
          message.channel.send('Monster Musume');
        } else if (gildas === 237) {
          message.channel.send('Mushoku Tensei');
        } else if (gildas === 238) {
          message.channel.send('Nagi no Asu kara');
        } else if (gildas === 239) {
          message.channel.send('Nana');
        } else if (gildas === 240) {
          message.channel.send('Nanbaka');
        } else if (gildas === 241) {
          message.channel.send('Naruto');
        } else if (gildas === 242) {
          message.channel.send('Nekopara');
        } else if (gildas === 243) {
          message.channel.send('Netoge no Yome wa Onnanoko ja Nai to Omotta?');
        } else if (gildas === 244) {
          message.channel.send('New Game!');
        } else if (gildas === 245) {
          message.channel.send('NHK ni Youkoso!');
        } else if (gildas === 246) {
          message.channel.send('Ni no Kuni');
        } else if (gildas === 247) {
          message.channel.send('Nisekoi');
        } else if (gildas === 248) {
          message.channel.send('One Outs');
        } else if (gildas === 249) {
          message.channel.send('One Week Friends');
        } else if (gildas === 250) {
          message.channel.send('Orange');
        } else if (gildas === 251) {
          message.channel.send('Ore Monogatari!');
        } else if (gildas === 252) {
          message.channel.send('Oreshura');
        } else if (gildas === 253) {
          message.channel.send('Ouran High School Host Club');
        } else if (gildas === 254) {
          message.channel.send('Pandora Hearts');
        } else if (gildas === 255) {
          message.channel.send('Perfect Blue');
        } else if (gildas === 256) {
          message.channel.send('Plastic Memories');
        } else if (gildas === 257) {
          message.channel.send('Princess Principal');
        } else if (gildas === 258) {
          message.channel.send('Prison School');
        } else if (gildas === 259) {
          message.channel.send('Psycho Pass');
        } else if (gildas === 260) {
          message.channel.send('Rakudai Kishi no Cavalry');
        } else if (gildas === 261) {
          message.channel.send('Release the Spyce');
        } else if (gildas === 262) {
          message.channel.send('ReLIFE');
        } else if (gildas === 263) {
          message.channel.send('Rikei ga Koi ni Ochita no de Shoumei shitemita');
        } else if (gildas === 264) {
          message.channel.send('Sakamoto desu ga?');
        } else if (gildas === 265) {
          message.channel.send('Sakura Quest');
        } else if (gildas === 266) {
          message.channel.send('Samurai Champloo');
        } else if (gildas === 267) {
          message.channel.send('Sankarea');
        } else if (gildas === 268) {
          message.channel.send('Sayonara no Asa ni Yakusoku no Hana wo Kazarou');
        } else if (gildas === 269) {
          message.channel.send('Sekirei');
        } else if (gildas === 270) {
          message.channel.send('Serial Experiments Lain');
        } else if (gildas === 271) {
          message.channel.send('Sewayaki Kitsune no Senko-san');
        } else if (gildas === 272) {
          message.channel.send('Shakugan no Shana');
        } else if (gildas === 273) {
          message.channel.send('Shiki');
        } else if (gildas === 274) {
          message.channel.send('Shimoneta to Iu Gainen ga Sonzai Shinai Taikutsu na Sekai');
        } else if (gildas === 275) {
          message.channel.send('Shingeki no Bahamut');
        } else if (gildas === 276) {
          message.channel.send('Shinsekai Yori');
        } else if (gildas === 277) {
          message.channel.send('Shirobako');
        } else if (gildas === 278) {
          message.channel.send('Soul Eater');
        } else if (gildas === 279) {
          message.channel.send('Sounan Desu ka?');
        } else if (gildas === 280) {
          message.channel.send('Space Dandy');
        } else if (gildas === 281) {
          message.channel.send('Tales of Zestiria X');
        } else if (gildas === 282) {
          message.channel.send('Tamako Market');
        } else if (gildas === 283) {
          message.channel.send('Tanaka-kun wa Itsumo Kedaruge');
        } else if (gildas === 284) {
          message.channel.send('The Garden of Words');
        } else if (gildas === 285) {
          message.channel.send('The Perfect Insider');
        } else if (gildas === 286) {
          message.channel.send('The Place Promised in Our Early Days');
        } else if (gildas === 287) {
          message.channel.send('To Love-Ru');
        } else if (gildas === 288) {
          message.channel.send('Toaru Series');
        } else if (gildas === 289) {
          message.channel.send('The Girl Who Leapt Through Time');
        } else if (gildas === 290) {
          message.channel.send('Tokyo Magnitude 8.0');
        } else if (gildas === 291) {
          message.channel.send('Tower of God');
        } else if (gildas === 292) {
          message.channel.send('Usagi Drop');
        } else if (gildas === 293) {
          message.channel.send('Watashi ni Tenshi ga Maiorita!');
        } else if (gildas === 294) {
          message.channel.send('World Trigger');
        } else if (gildas === 295) {
          message.channel.send('Wotaku ni Koi wa Muzukashii');
        } else if (gildas === 296) {
          message.channel.send('xxxHolic');
        } else if (gildas === 297) {
          message.channel.send('Yamada-kun and the Seven Witches');
        } else if (gildas === 298) {
          message.channel.send('Yuri!!! on Ice');
        } else if (gildas === 299) {
          message.channel.send('Yuru Camp');
        } else if (gildas === 300) {
          message.channel.send('Yuru Yuri');
        } else if (gildas === 301) {
          message.channel.send('Rokka no Yuusha');
        } else if (gildas === 302) {
          message.channel.send('Zankyou no Terror');
        } else if (gildas === 303) {
          message.channel.send('Zetsuen no Tempest');
        } else if (gildas === 304) {
          message.channel.send('Zombieland Saga');
        } else if (gildas === 305) {
          message.channel.send('BNA: Brand New Animal');
        } 
	},
};