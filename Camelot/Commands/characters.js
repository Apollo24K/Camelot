const { MessageEmbed, Message } = require("discord.js");
const prefix = "!";

var fs = require('fs');
var inventory = JSON.parse(fs.readFileSync('Storage/inventory.json', 'utf8'));
var favChar = JSON.parse(fs.readFileSync('Storage/favChar.json', 'utf8'));
var xp = JSON.parse(fs.readFileSync('Storage/xp.json', 'utf8'));
var coins = JSON.parse(fs.readFileSync('Storage/coins.json', 'utf8'));

module.exports = {
    name: 'characters',
    description: 'Characters',
    execute(message, args, disbut, client) {

        function rarity(a) {
            if (a === "SS") {
                return "https://i.ibb.co/GdhDTj1/n3qj4i2.png";
            } else if (a === "S") {
                return "https://i.ibb.co/8KZJLLZ/aSXEB8J.png";
            } else if (a === "A") {
                return "https://i.ibb.co/8MTkwzf/MNNSMIP.png";
            } else if (a === "B") {
                return "https://i.ibb.co/WswjB19/HHgIQsZ.png";
            } else if (a === "C") {
                return "https://i.ibb.co/ZHRxzFB/bF4Uwq7.png";
            } else if (a === "D") {
                return "https://i.ibb.co/Yp26KZG/qHR5lBz.png";
            } else {
                return "https://i.ibb.co/j6Vhb5B/zPpfb14.jpg";
            };
        };

        class charInfo {
            constructor(name, alias, anime, anialias, gender, image, id, rarity) {
                this._name = name;
                this._alias = alias;
                this._anime = anime;
                this._anialias = anialias;
                this._gender = gender;
                this._image = image;
                this._id = id;
                this._rarity = rarity;
            };
            display() {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setImage(this.image)
                .setThumbnail(rarity(this.rarity))
                .setDescription("**" + this.name + "**" + "\n" + this.anime)
                .setFooter(`ID: #${this.id}`)
                message.channel.send(Embed);
            };
            displayMy() {

                const dupes = inventory[message.author.id + message.guild.id].filter((e) => e === this.id);
                let copy;
                if (dupes.length < 1) {
                    copy = "copy";
                } else {
                    copy = "copies"
                };
                let refinement = "";
                if (dupes.length < 1) {
                    refinement = "<:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (dupes.length < 2) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (dupes.length < 3) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (dupes.length < 4) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136>";
                } else {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552>";
                };

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setImage(this.image)
                .setThumbnail(rarity(this.rarity))
                .setDescription("**" + this.name + "**" + "\n" + this.anime + "\n\n**Ref**. " + refinement)
                .setFooter("You have " + (dupes.length + 1) + ` ${copy} of this`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                message.channel.send(Embed);
            };
            displayIm() {

                const dupes = inventory[message.author.id + message.guild.id].filter((e) => e === this.id);
                let copy;
                if (dupes.length < 2) {
                    copy = "copy";
                } else {
                    copy = "copies"
                };
                let refinement = "";
                if (dupes.length < 2) {
                    refinement = "<:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (dupes.length < 3) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (dupes.length < 4) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (dupes.length < 5) {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136>";
                } else {
                    refinement = "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552>";
                };

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setImage(this.image)
                .setThumbnail(rarity(this.rarity))
                .setDescription("**" + this.name + "**" + "\n" + this.anime + "\n\n**Ref**. " + refinement)
                .setFooter("You have " + (dupes.length) + ` ${copy} of this`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                message.channel.send(Embed);
            };
            get name() {
                return this._name;
            };
            get alias() {
                return this._alias;
            };
            get anime() {
                return this._anime;
            };
            get anialias() {
                return this._anialias;
            }
            get gender() {
                return this._gender;
            };
            get image() {
                return this._image;
            };
            get id() {
                return this._id;
            };
            get rarity() {
                return this._rarity;
            };
        };
        

        const characters = [
            new charInfo("Donquixote Rosinante", ["Corazon"], "One Piece", ["OP"], "M", "https://i.ibb.co/j8wGtS7/lbg3UeV.png", 0, "SS"),
            new charInfo("Nezuko Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/7jv2fY2/lAThmyr.png", 1, "SS"),
            new charInfo("Nino Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "F", "https://i.ibb.co/Tq9X5xm/k0CY0zg.png", 2, "S"),
            new charInfo("Miku Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "F", "https://i.ibb.co/jZ6ZV8N/YBkHZ1D.png", 3, "S"),
            new charInfo("Itsuki Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "F", "https://i.ibb.co/ygCD0tH/zGURdtZ.png", 4, "A"),
            new charInfo("Yotsuba Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "F", "https://i.ibb.co/qJK42nD/2VgyqAm.png", 5, "B"),
            new charInfo("Ichika Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "F", "https://i.ibb.co/4sVksLK/1SpSENc.png", 6, "B"),
            new charInfo("Fuutarou Uesugi", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "M", "https://i.ibb.co/4RRYdqr/C16wbDI.png", 7, "B"),
            new charInfo("Raiha Uesugi", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "F", "https://i.ibb.co/0s7FRgJ/qb5AL7S.png", 8, "C"),
            new charInfo("Isanari Uesugi", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "M", "https://i.ibb.co/Gnd52V3/FXG4kPy.png", 9, "D"),
            new charInfo("Maruo Nakano", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "M", "https://i.ibb.co/CW4vvVM/Di6ChiN.png", 10, "D"),
            new charInfo("Matsui", [], "Gotoubun no Hanayome", ["5-toubun no Hanayome", "The Quintessential Quintuplets", "Quintessential Quintuplets"], "F", "https://i.ibb.co/610tXCC/xSvNNhu.png", 11, "D"),
            new charInfo("Victorique de Blois", ["The Golden Fairy", "Gray Wolf", "Monstre Charmant"], "Gosick", [], "F", "https://i.ibb.co/WDXv3xW/CzoxzRi.png", 12, "A"),
            new charInfo("Kazuya Kujou", ["The Black Reaper", "Baby Squirrel"], "Gosick", [], "M", "https://i.ibb.co/yYRSW7j/yR8KV9T.png", 13, "B"),
            new charInfo("Cordelia Gallo", [], "Gosick", [], "F", "https://i.ibb.co/vh9jJyZ/Tyj2oiE.png", 14, "D"),
            new charInfo("Brian Roscoe", [], "Gosick", [], "M", "https://i.ibb.co/3dddn3W/xmmaaSg.png", 15, "D"),
            new charInfo("Grevil de Blois", ["Pointy Head"], "Gosick", [], "M", "https://i.ibb.co/NnXk109/Gtrm63p.png", 16, "C"),
            new charInfo("Cecile Lafitte", [], "Gosick", [], "F", "https://i.ibb.co/V3jnP7Q/zEYYK0p.png", 17, "C"),
            new charInfo("Avril Bradley", [], "Gosick", [], "F", "https://i.ibb.co/YpCws6Q/jLggZGx.png", 18, "D"),
            new charInfo("Ambrose", [], "Gosick", [], "M", "https://i.ibb.co/RDwQJLZ/qDKFDC2.png", 19, "D"),
            new charInfo("Albert de Blois", [], "Gosick", [], "M", "https://i.ibb.co/02YbSxm/FjKzWUp.png", 20, "D"),
            new charInfo("Izumi Miyamura", ["Miyamura Izumi"], "Horimiya", [], "M", "https://i.ibb.co/cc4D2dV/DmQ4GTu.png", 21, "A"),
            new charInfo("Kyousuke Hori", [], "Horimiya", [], "M", "https://i.ibb.co/sWv3zhx/40oXTnX.png", 22, "D"),
            new charInfo("Yuki Yoshikawa", ["Yoshikawa Yuki"], "Horimiya", [], "F", "https://i.ibb.co/X2WYTWZ/lR1DeLm.png", 23, "A"),
            new charInfo("Kyouko Hori", ["Hori Kyouko"], "Horimiya", [], "F", "https://i.ibb.co/BKTjQbQ/ptPDIdN.png", 24, "S"),
            new charInfo("Honoka Sawada", [], "Horimiya", [], "F", "https://i.ibb.co/LJXJT52/TsYGnEj.png", 25, "B"),
            new charInfo("Tooru Ishikawa", [], "Horimiya", [], "M", "https://i.ibb.co/QD7Hp3W/xN5ahlV.png", 26, "C"),
            new charInfo("Akane Yanagi", [], "Horimiya", [], "M", "https://i.ibb.co/2ktvFMS/nGctW1M.png", 27, "D"),
            new charInfo("Remi Ayasaki", [], "Horimiya", [], "F", "https://i.ibb.co/xzj6733/c89Ykp6.png", 28, "B"),
            new charInfo("Shuu Iura", [], "Horimiya", [], "M", "https://i.ibb.co/fDJ36Lv/0HGcmqI.png", 29, "D"),
            new charInfo("Sakura Kouno", [], "Horimiya", [], "F", "https://i.ibb.co/5sfbvjg/GWXtjHZ.png", 30, "D"),
            new charInfo("Kouichi Shindou", [], "Horimiya", [], "M", "https://i.ibb.co/C0mBZxJ/aTgvaln.png", 31, "D"),
            new charInfo("Yume", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/cyvMhsj/uViM4Px.png", 32, "B"),
            new charInfo("Merry", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/7YP86yN/LwMW67M.png", 33, "A"),
            new charInfo("Haruhiro", ["Hal"], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/CKSvfvb/teozchH.png", 34, "C"),
            new charInfo("Manato", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/wrkZL39/XjqMQq9.png", 35, "C"),
            new charInfo("Ranta", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/NN56gw4/gUPRek1.png", 36, "C"),
            new charInfo("Shihoru", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/qypcKvw/3yisyUF.png", 37, "B"),
            new charInfo("Moguzo", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/nRFpH1W/FMq2r44.png", 38, "C"),
            new charInfo("Barbara", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/BrFDZjM/4GF6SHD.png", 39, "D"),
            new charInfo("Renji", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "M", "https://i.ibb.co/ftCbDnv/kQ6gh4o.png", 40, "C"),
            new charInfo("Chibi", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/st5WxgV/6HYneZF.png", 41, "D"),
            new charInfo("Choco", [], "Grimgar: Ashes and Illusions", ["Hai to Gensou no Grimgar", "Grimgar Ashes and Illusions", "Grimgar"], "F", "https://i.ibb.co/2SYpbKy/zAyBN0F.png", 42, "C"),
            new charInfo("Aka Onda", [], "Rec", [], "F", "https://i.ibb.co/tbVxSJw/GCZGr6J.png", 43, "B"),
            new charInfo("Fumihiko Matsumaru", [], "Rec", [], "M", "https://i.ibb.co/MPYVfrf/R1HhmuN.png", 44, "D"),
            new charInfo("Tanaka (Rec)", [], "Rec", [], "F", "https://i.ibb.co/st3Cyh7/pio3oZz.png", 45, "D"),
            new charInfo("Yoshio Hatakeda", [], "Rec", [], "M", "https://i.ibb.co/G7n3bbF/tq57MkG.png", 46, "D"),
            new charInfo("Hyakkimaru", [], "Dororo", [], "M", "https://i.ibb.co/C5YtK1s/xBSmo3h.png", 47, "A"),
            new charInfo("Dororo", [], "Dororo", [], "F", "https://i.ibb.co/zPHLP8c/tyhcXQZ.png", 48, "A"),
            new charInfo("Mio", [], "Dororo", [], "F", "https://i.ibb.co/VSJtDY0/FjgZFIA.png", 49, "C"),
            new charInfo("Jukai", [], "Dororo", [], "M", "https://i.ibb.co/9wQkMQG/CMOKmMu.png", 50, "D"),
            new charInfo("Tahoumaru", [], "Dororo", [], "M", "https://i.ibb.co/J31pN7x/rjOU6h5.png", 51, "D"),
            new charInfo("Shichika Yasuri", [], "Katanagatari", [], "M", "https://i.ibb.co/wRSWZY6/7HbQTwq.png", 52, "C"),
            new charInfo("Togame", [], "Katanagatari", [], "F", "https://i.ibb.co/r4dkLYG/17UfgzO.png", 53, "B"),
            new charInfo("Nanami Yasuri", [], "Katanagatari", [], "F", "https://i.ibb.co/6yCxBvN/uKfujyB.png", 54, "C"),
            new charInfo("Hitei", [], "Katanagatari", [], "F", "https://i.ibb.co/RhKhZ6P/VzFnIEd.png", 55, "C"),
            new charInfo("Emonzaemon Souda", [], "Katanagatari", [], "M", "https://i.ibb.co/PtzC7NS/nUGJEIl.png", 56, "D"),
            new charInfo("Rinne Higaki", [], "Katanagatari", [], "M", "https://i.ibb.co/mb4P7MD/PUOy7jE.png", 57, "D"),
            new charInfo("Meisai Tsuruga", [], "Katanagatari", [], "F", "https://i.ibb.co/t2fHSKr/DnQ0Hi0.png", 58, "C"),
            new charInfo("Houou Maniwa", [], "Katanagatari", [], "M", "https://i.ibb.co/Sv5fWw7/j2y2k5y.png", 59, "D"),
            new charInfo("Zanki Kiguchi", [], "Katanagatari", [], "F", "https://i.ibb.co/pntdb38/3ozpmGT.png", 60, "D"),
            new charInfo("Kyouken Maniwa", [], "Katanagatari", [], "F", "https://i.ibb.co/p3zbxjJ/NvW06O5.png", 61, "C"),
            new charInfo("Hakuhei Sabi", [], "Katanagatari", [], "M", "https://i.ibb.co/cLY4YHy/tahoP8r.png", 62, "C"),
            new charInfo("Ginkaku Uneri", [], "Katanagatari", [], "M", "https://i.ibb.co/gWYPgNk/fjx6qck.png", 63, "D"),
            new charInfo("Fushi", [], "Fumetsu no Anata e", ["To Your Eternity"], "M", "https://i.ibb.co/Lh5mp0f/LZPJ0gY.png", 64, "SS"),
            new charInfo("Parona", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/sbpGkbn/9Sfze53.png", 65, "A"),
            new charInfo("Gugu", [], "Fumetsu no Anata e", ["To Your Eternity"], "M", "https://i.ibb.co/z4Tb8HC/wzoaRMk.png", 66, "S"),
            new charInfo("March", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/bJYbgH6/LVaAF6d.png", 67, "B"),
            new charInfo("Rynn Cropp", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/3YhHLGR/38Rsjgl.png", 68, "C"),
            new charInfo("Tonari Dalton", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/VmY1QhC/8pY6nN6.png", 69, "C"),
            new charInfo("Pyoran", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/tp2Xy6L/R8DptII.png", 70, "D"),
            new charInfo("Hayase", [], "Fumetsu no Anata e", ["To Your Eternity"], "F", "https://i.ibb.co/smfSp0Y/5zNO8wY.png", 71, "D"),
            new charInfo("Yuuki Asuna", ["Asuna Yuuki"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/7WG0jr6/hFfvuHy.png", 72, "SS"),
            new charInfo("Kirigaya Kazuto", ["Kirito", "Kazuto Kirigaya", "Beater"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/PWdgj7z/xCuvs7C.png", 73, "A"),
            new charInfo("Alice Zuberg", ["Synthesis Thirty"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/gJHwq7S/c3LXIFJ.jpg", 74, "S"),
            new charInfo("Konno Yuuki", ["Yuuki Konno"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/qWbcsRK/CkxbsJb.png", 75, "S"),
            new charInfo("Kirigaya Suguha", ["Leafa", "Suguha Kirigaya"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/QpXJXnN/rUglxLU.png", 76, "A"),
            new charInfo("Sinon", ["Asada Shino"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/Bs2WmLY/GPA9sj0.png", 77, "A"),
            new charInfo("Eugeo", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/hBDfcm2/oKmV7V4.png", 78, "B"),
            new charInfo("Quinella", ["Administrator"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/Yd50wkd/He45omC.png", 79, "B"),
            new charInfo("Yui", ["Yui-MHCP001"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/Zg3xSx3/HlT0odh.png", 80, "B"),
            new charInfo("Klein", ["Tsuboi Ryoutarou"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/LdncKWM/KXY2HyV.png", 81, "B"),
            new charInfo("Andrew Gilbert Mills", ["Agil"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/D5y3zpY/QHkQbPU.png", 82, "C"),
            new charInfo("Silica", ["Keiko Ayano"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/jMNHWmy/ID6omse.png", 83, "B"),
            new charInfo("Lisbeth", ["Rika Shinozaki"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/yWr5G13/UzVvmcY.png", 84, "B"),
            new charInfo("Kayaba Akihiko", ["Akihiko Kayaba", "Heathcliff"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/Cw4cMGX/OnkWRSG.png", 85, "B"),
            new charInfo("Vassago Casals", ["PoH"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/9pzCSKk/52CWt3v.png", 86, "D"),
            new charInfo("Kuradeel", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/W3qjTSF/Zssooan.jpg", 87, "D"),
            new charInfo("Sugou Nobuyuki", ["Oberon"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/Cv2yHrf/HDYuWj2.png", 88, "D"),
            new charInfo("Death Gun", ["Shinkawa Shouichi", "Sterben", "XaXa"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/x72VQ0p/iKl6G63.png", 89, "C"),
            new charInfo("Gabriel Miller", ["Subtilizer", "Veta"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/dgHcT9Q/KISlyKD.png", 90, "C"),
            new charInfo("Lipia Zancale", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/PM9N4Dy/d3zNKfT.png", 91, "D"),
            new charInfo("Sachi", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/WF4R5rs/DnH3cIH.png", 92, "C"),
            new charInfo("Argo", ["Hosaka Carina Tomo", "The Rat"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/z5tFyVw/5nTBcal.png", 93, "D"),
            new charInfo("Sakuya", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/fx0pFsq/bYAu5m3.png", 94, "D"),
            new charInfo("Alicia Rue", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/yktyTjg/f45e09Q.png", 95, "D"),
            new charInfo("Eugene", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/SBTpdkx/BMMaZn1.jpg", 96, "D"),
            new charInfo("Selka Zuberg", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/LnkGBZb/Nm4sDFj.png", 97, "C"),
            new charInfo("Tiese Shtolienen", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/zbwwSyD/Yu8dWaa.png", 98, "C"),
            new charInfo("Ronye Arabel", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/NN131XR/AKrjstX.png", 99, "D"),
            new charInfo("Yuna (SAO)", ["Shigemura Yuuna", "Yuuna Shigemura"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/mC2JFnY/RTVsVH4.png", 100, "A"),
            new charInfo("Sortiliena Serlut", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/KKRXXRW/heufWsG.png", 101, "C"),
            new charInfo("Nochizawa Eiji", ["Nautilus"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/2qvpPF1/ZsmBzFD.png", 102, "C"),
            new charInfo("Shigemura Tetsuhiro", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/8m6zc9j/j0VrPyF.png", 103, "D"),
            new charInfo("Philia", ["Takemiya Kotone"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/sqhSDnw/sJcmx8P.png", 104, "B"),
            new charInfo("Strea", ["Strea-MHCP002"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/wsqTs8x/uJ6lYHt.png", 105, "C"),
            new charInfo("Rain", ["Karatachi Nijika"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/7XkcyRk/WWTxIC1.png", 106, "B"),
            new charInfo("Premiere", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/xSdhY7L/pkoPdhC.png", 107, "D"),
            new charInfo("Kureha", ["Takamine Momiji"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/55TyCgp/cqlBTcf.png", 108, "B"),
            new charInfo("Kohiruimaki Karen", ["LLENN", "Pink Devil"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/YfxPD92/cbdT6ad.png", 109, "C"),
            new charInfo("Pitohui", ["Kanzaki Elsa"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.ibb.co/1G1fnwt/9tHgE6y.png", 110, "D"),
            new charInfo("Asougi Goushi", ["M (SAO)"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.ibb.co/wg3Fw3j/QKjKICa.png", 111, "D"),
            new charInfo("Kaori Miyazono", ["Kao-chan", "Miyazono Kaori"], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/ZNrTyQY/gVq44JT.png", 112, "S"),
            new charInfo("Arima Kousei", ["Kousei Arima"], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/YhHJsMc/6iImUfB.png", 113, "S"),
            new charInfo("Sawabe Tsubaki", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/pKbMf3X/1SqCLnI.png", 114, "A"),
            new charInfo("Watari Ryota", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/pZ9fZmr/FFMF3lp.png", 115, "B"),
            new charInfo("Aiza Takeshi", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/df2ZJ6M/8QmEfjs.png", 116, "C"),
            new charInfo("Igawa Emi", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/vZP5M3J/KZblVRy.png", 117, "B"),
            new charInfo("Arima Saki", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/g7RndcV/7KIKwWl.png", 118, "D"),
            new charInfo("Seto Hiroko", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/0cjz0CY/2pJStwH.png", 119, "C"),
            new charInfo("Aiza Nagi", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/nfT2v8k/QXVYRT3.png", 120, "C"),
            new charInfo("Kashiwagi Nao", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/cJNqQG6/24nxkMt.png", 121, "C"),
            new charInfo("Miike Toshiya", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/4YNx72f/FFr2NYm.jpg", 122, "D"),
            new charInfo("Seto Koharu", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/7k2cRWM/d7rZiLs.png", 123, "D"),
            new charInfo("Ochiai Yuriko", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/y0LgSSP/SyexScK.jpg", 124, "D"),
            new charInfo("Takayanagi Akira", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/1rVMMq1/Oe9mAHj.jpg", 125, "D"),
            new charInfo("Miyazono Ryouko", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.ibb.co/51Q3tjt/l22dDM8.png", 126, "D"),
            new charInfo("Miyazono Yoshiyuki", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.ibb.co/TYp8YXv/PMzvQiD.png", 127, "D"),
            new charInfo("Hanako Honda", [], "Asobi Asobase", [], "F", "https://i.ibb.co/LYmTKbr/9tEqv2e.png", 128, "A"),
            new charInfo("Olivia", [], "Asobi Asobase", [], "F", "https://i.ibb.co/LkFC2rg/sYEz9dV.png", 129, "A"),
            new charInfo("Kasumi Nomura", [], "Asobi Asobase", [], "F", "https://i.ibb.co/1XNJwSf/hdM5wJ2.png", 130, "A"),
            new charInfo("Maeda", [], "Asobi Asobase", [], "M", "https://i.ibb.co/SV6Dmx6/3chkI9X.png", 131, "D"),
            new charInfo("Tsugumi Aozora", [], "Asobi Asobase", [], "F", "https://i.ibb.co/KKJhR4n/oowniNN.png", 132, "C"),
            new charInfo("Tokuko Sharekoube", [], "Asobi Asobase", [], "F", "https://i.ibb.co/8MWWzTd/OYJc6c0.png", 133, "D"),
            new charInfo("Akira Takizawa", ["Air King"], "Eden of The East", ["Higashi no Eden"], "M", "https://i.ibb.co/f0Ftsff/dCj636b.png", 134, "B"),
            new charInfo("Saki Morimi", [], "Eden of The East", ["Higashi no Eden"], "F", "https://i.ibb.co/gF0YrKX/30TbbbV.png", 135, "B"),
            new charInfo("Kuroha Shiratori", ["Diana (HnE)"], "Eden of The East", ["Higashi no Eden"], "F", "https://i.ibb.co/3kVbQFk/kWRNreN.png", 136, "D"),
            new charInfo("Kazuomi Hirasawa", [], "Eden of The East", ["Higashi no Eden"], "M", "https://i.ibb.co/BcLhYRK/IHAz1vH.png", 137, "C"),
            new charInfo("Yutaka Itazu", [], "Eden of The East", ["Higashi no Eden"], "M", "https://i.ibb.co/rMSzvb2/WrqyVBo.png", 138, "C"),
            new charInfo("Mikuru Katsuhara", ["Micchon", "Mittan"], "Eden of The East", ["Higashi no Eden"], "F", "https://i.ibb.co/7b2Q7fX/DRYnY7x.png", 139, "C"),
            new charInfo("Satoshi Ohsugi", [], "Eden of The East", ["Higashi no Eden"], "M", "https://i.ibb.co/T2CWw6w/iSrdd5K.png", 140, "D"),
            new charInfo("Yuusei Kondou", [], "Eden of The East", ["Higashi no Eden"], "M", "https://i.ibb.co/fQdxdLT/aCz13fn.png", 141, "D"),
            new charInfo("Tachibana Kanade", ["Kanade Tachibana"], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/fpmXh3P/tu4umn4.png", 142, "SS"),
            new charInfo("Yuri Nakamura", ["Yurippe"], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/GsFjhRb/wJ2IjyU.png", 143, "A"),
            new charInfo("Yui (AB)", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/b3f30Dn/QyH97El.png", 144, "A"),
            new charInfo("Yuzuru Otonashi", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/dKSYwWc/At0ieyA.png", 145, "B"),
            new charInfo("Hideki Hinata", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/M8T6w81/KOwG8xW.png", 146, "B"),
            new charInfo("T.K.", ["TK"], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/LCNsn8y/i5MGzc8.png", 147, "D"),
            new charInfo("Masami Iwasawa", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/YbHtxV5/rZRcZD7.png", 148, "B"),
            new charInfo("Ayato Naoi", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/xSFVDJ8/tAYHNF0.png", 149, "C"),
            new charInfo("Shiina", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/Twg65tb/ydmVgC7.png", 150, "C"),
            new charInfo("Noda", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/mXLQBqC/ewP4giE.png", 151, "D"),
            new charInfo("Fujimaki", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.ibb.co/4T6gGxk/X0YIBZr.png", 152, "D"),
            new charInfo("Hisako", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/RSKxpLw/EeFoyiH.png", 153, "C"),
            new charInfo("Hitomi", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/JqnLHH9/tWHKPwz.png", 154, "D"),
            new charInfo("Miyuki Irie", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/NFgYMqr/EXYL5fS.png", 155, "C"),
            new charInfo("Yusa", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/BjzzxjP/hewh7sE.png", 156, "C"),
            new charInfo("Hatsune Otonashi", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.ibb.co/ySMx7ms/ZSd0g5p.png", 157, "D"),
            new charInfo("Zenitsu Agatsuma", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/GCPH418/P54BqWy.png", 158, "S"),
            new charInfo("Tanjirou Kamado", ["Kamado Tanjirou", "Gonpachirou Kamaboko", "Kamaboko Gonpachirou", "Monjirou"], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/K9Qc2Vc/RqsLOue.png", 159, "S"),
            new charInfo("Mitsuri Kanroji", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/pRcqJ9M/HCvkjV3.png", 160, "A"),
            new charInfo("Shinobu Kochou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/x7KjSp2/pzCg8Pn.png", 161, "S"),
            new charInfo("Kanao Tsuyuri", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/HGnmtJq/Ukj0VSo.png", 162, "A"),
            new charInfo("Giyuu Tomioka", ["Tomioka Giyuu"], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/hDkQcdn/tb3UHR6.png", 163, "A"),
            new charInfo("Inosuke Hashibira", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/5BDY6vs/lwTCWVV.png", 164, "A"),
            new charInfo("Kyoujurou Rengoku", ["Rengoku Kyoujurou"], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/BPgv1Pq/0r7isIJ.png", 165, "B"),
            new charInfo("Kibutsuji Muzan", ["Muzan Kibutsuji"], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/5LXDPLL/HtDM46i.png", 166, "B"),
            new charInfo("Muichirou Tokitou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/jW7PKJw/MNvq0XX.png", 167, "C"),
            new charInfo("Enmu", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/HrdqhqT/UuHSWtS.png", 168, "B"),
            new charInfo("Aoi Kanzaki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/Sm5F0ZQ/C7Ge5lQ.png", 169, "C"),
            new charInfo("Gotou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/KLDYW8L/dSVQChd.png", 170, "D"),
            new charInfo("Hisa", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/1nDj6mq/iKea5EB.png", 171, "D"),
            new charInfo("Kozo Kanamori", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/5KhLZ6V/CKaRrPu.png", 172, "D"),
            new charInfo("Hotaru Haganezuka", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/B6Cf0qM/YkVIfBc.png", 173, "C"),
            new charInfo("Gyoumei Himejima", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/r0k24xg/1f6Ikuo.png", 174, "C"),
            new charInfo("Shigeru Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/RcGBSKW/vH4emSW.png", 175, "D"),
            new charInfo("Rokuta Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/NxQsbBn/UFX3ISW.png", 176, "D"),
            new charInfo("Takeo Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/Q9HtWj2/U23adFJ.png", 177, "D"),
            new charInfo("Hanako Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/JtgGd5B/GgK79YJ.png", 178, "D"),
            new charInfo("Kie Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/tC8g1Pg/xWFKqPe.png", 179, "D"),
            new charInfo("Tanjuurou Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/B2nw7xJ/uIi3njP.png", 180, "C"),
            new charInfo("Kamanue", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/K7DNs4J/8fQK1V5.png", 181, "D"),
            new charInfo("Kazumi", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/D5PQY8s/kgp0Cgq.png", 182, "D"),
            new charInfo("Kiyoshi", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/HGSV5d1/p2YTsPS.png", 183, "D"),
            new charInfo("Kanae Kochou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/7S77tv0/x4WBwVX.png", 184, "B"),
            new charInfo("Jigorou Kuwajima", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/q9vyhqf/IuhUD1o.png", 185, "C"),
            new charInfo("Makomo", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/zVbxNmn/VKpog7E.png", 186, "C"),
            new charInfo("Murata", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/n6MpVJY/6NwWhzA.png", 187, "D"),
            new charInfo("Sumi Nakahara", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/Y0DwB0K/YU1rRRg.png", 188, "D"),
            new charInfo("Rui", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/K52YKBB/bWwcoY8.png", 189, "B"),
            new charInfo("Sabito", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/89VsmZn/mVzAKFB.png", 190, "B"),
            new charInfo("Genya Shinazugawa", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/3R5C6TT/GznXxvV.png", 191, "C"),
            new charInfo("Shoichi", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/wKXDz9x/C68Eo0G.png", 192, "D"),
            new charInfo("Susamaru", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/SNpnkrQ/2uuvtgW.png", 193, "D"),
            new charInfo("Naho Takada", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/BwtsbBS/kSBodEb.png", 194, "D"),
            new charInfo("Tamayo", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/q59tQKd/BfrASpa.png", 195, "C"),
            new charInfo("Kiyo Terauchi", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/yFLjpWM/rOHiAPZ.png", 196, "D"),
            new charInfo("Kagaya Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/0tTvtcB/cefiLm7.png", 197, "C"),
            new charInfo("Kiriya Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/znNfBwN/szZXunC.png", 198, "C"),
            new charInfo("Nichika Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/mSs5Fnt/K5WlWIb.png", 199, "C"),
            new charInfo("Hinaki Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/Fh8zR4P/P29sjf4.png", 200, "C"),
            new charInfo("Kanata Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.ibb.co/c2s7wnq/TZJQbMj.png", 201, "C"),
            new charInfo("Sakonji Urokodaki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/C7BYKD4/XmRUdTM.png", 202, "B"),
            new charInfo("Tengen Uzui", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/TLN5KsD/1xiLGWM.png", 203, "C"),
            new charInfo("Yahaba", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/tPKH7m0/Xy5tquR.png", 204, "D"),
            new charInfo("Yushirou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.ibb.co/480pCJQ/hYbg0YY.png", 205, "C"),
            new charInfo("Tsunemori Akane", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/k016sS9/pXXmN8N.png", 206, "A"),
            new charInfo("Kogami Shinya", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/VgBTpR1/5zXd1Sf.png", 207, "A"),
            new charInfo("Makishima Shogo", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/njJPzqg/KvDyljr.png", 208, "A"),
            new charInfo("Ginoza Nobuchika", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/521WDX1/mO0sVao.png", 209, "A"),
            new charInfo("Kunidzuka Yayoi", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/mhJRSJd/kyIqsJC.png", 210, "B"),
            new charInfo("Kagari Shuusei", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/3Wz6ffn/zaejTyA.png", 211, "B"),
            new charInfo("Masaoka Tomomi", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/pw7Y2jK/yDCcguq.png", 212, "B"),
            new charInfo("Karanomori Shion", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/5LwcXsy/RlJd7TX.png", 213, "B"),
            new charInfo("Saiga Jouji", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/PCLYrkK/DC2WgbE.png", 214, "C"),
            new charInfo("Aoyanagai Risa", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/84wNzh2/BX10k9n.png", 215, "C"),
            new charInfo("Funahara Yuki", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/KGs9p9N/Lz0p9uJ.jpg", 216, "D"),
            new charInfo("Kasei Joushuu", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/hCDpVwk/alGkWkk.png", 217, "C"),
            new charInfo("Tougane Sakuya", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/56gnQF4/xrwtsFp.png", 218, "C"),
            new charInfo("Shimotsuki Mika", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/txLNPzz/4qvTIJ9.png", 219, "C"),
            new charInfo("Kamui  Kirito", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/0X6Kk0Y/Dw8ahfi.png", 220, "C"),
            new charInfo("Aikawa Tsubaki", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/N1N1wHf/2V8tIUJ.jpg", 221, "D"),
            new charInfo("Hasuike Kaede", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/bdbSPNB/JBaKD9R.jpg", 222, "D"),
            new charInfo("Suzuki Moe", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/hgpfqgD/oHdYKzf.jpg", 223, "D"),
            new charInfo("Hinakawa Shou", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/vHSrQb7/5Ptm39A.png", 224, "C"),
            new charInfo("Sugou Teppei", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/MkZF9FW/DsdKgAf.jpg", 225, "D"),
            new charInfo("Tougane Misako", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.ibb.co/z832P7S/VeMImBi.jpg", 226, "D"),
            new charInfo("Shindou Arata", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/WnzWR8C/dGwremD.png", 227, "B"),
            new charInfo("Ignatov Kei Mikhail", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.ibb.co/d0LTm9W/LjR1Dha.jpg", 228, "D"),
            new charInfo("Vivy", ["Diva"], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/Wk4RX0L/bG5XdmT.png", 229, "A"),
            new charInfo("Matsumoto", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "M", "https://i.ibb.co/zNCgjDK/9A3u1JT.png", 230, "B"),
            new charInfo("Estella", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/LPLPmL7/CagOcrE.png", 231, "B"),
            new charInfo("Kakitani Yugo", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "M", "https://i.ibb.co/y4DrmbS/7X3MU6x.png", 232, "C"),
            new charInfo("Ophelia", ["The Small Theater Fairy"], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/dM4Wy0m/jHxmNYv.png", 233, "C"),
            new charInfo("Elizabeth", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/6yjg4hY/6R3dM7c.png", 234, "B"),
            new charInfo("Grace", [], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "F", "https://i.ibb.co/6vJtmdC/OdNq6aP.png", 235, "D"),
            new charInfo("Dr. Matsumoto", ["Matsumoto Osamu"], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "M", "https://i.ibb.co/X72Tf9w/1GmozYl.png", 236, "C"),
            new charInfo("Tatsuya Saeki", ["Dr. Saeki"], "Vivy: Fluorite Eye's Song", ["Vivy -Fluorite Eye's Song-", "Vivy"], "M", "https://i.ibb.co/T0HQp0B/jq58oU2.png", 237, "C"),
            new charInfo("Rimuru Tempest", ["Satoru Mikami", "Slime-san"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/tXPbFpL/c0MS7Ca.png", 238, "SS"), // SS Tier?
            new charInfo("Veldora Tempest", ["Storm Dragon Veldora"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/HFsTLNd/XxQxKMy.png", 239, "B"),
            new charInfo("Milim Nava", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/Bjnwd9T/jrEQxi5.png", 240, "S"),
            new charInfo("Diablo (TenSura)", ["Noir"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/jVTFnD6/DCcH6VN.png", 241, "A"),
            new charInfo("Shuna", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/RcYpbhQ/H4KIyKo.png", 242, "A"),
            new charInfo("Shion", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/bLnLcCz/jy6qWqU.png", 243, "A"),
            new charInfo("Benimaru", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/zm32Kh4/1VScZEU.png", 244, "A"),
            new charInfo("Souei", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/jZtXhpN/qT7ZhmU.png", 245, "B"),
            new charInfo("Hakurou", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/5KcxMG6/fjxtCp1.png", 246, "C"),
            new charInfo("Gobuta", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/87z0f5j/orAd8Rs.png", 247, "C"),
            new charInfo("Chloe Aubert", ["Aubert Chloe"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/tJgm4TM/ckVpOkn.png", 248, "C"),
            new charInfo("Carrion", ["Beast King"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/qFYXrwS/YmkX4ze.jpg", 249, "C"),
            new charInfo("Clayman", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/7RYvFjx/2DNWa7H.png", 250, "B"),
            new charInfo("Gazel Dwargo", ["Heroic King"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/93Fr4Hh/PcfMucQ.png", 251, "D"),
            new charInfo("Ellen (TenSura)", ["Eren (TenSura)", "Elyune H. Grimwald"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/S7wknY1/zTodkIe.png", 252, "C"),
            new charInfo("Fuse", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/6BPb8Xh/IdP3PxQ.png", 253, "D"),
            new charInfo("Gabiru", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/Z24J8h5/BdQ3YDn.png", 254, "C"),
            new charInfo("Geld", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/GvvqWhS/PfMP0Ou.png", 255, "D"),
            new charInfo("Gido", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/X2Ypjnd/vrJ9XZr.png", 256, "D"),
            new charInfo("Shizue Izawa", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/N2d5spR/35orED4.png", 257, "A"), // absolut unsicher mit der Rarity
            new charInfo("Yuuki Kagurazaka", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/MDJ9JQb/SU6Z8dT.png", 258, "C"),
            new charInfo("Kaijin", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/W3jHzzw/6VQCnWP.png", 259, "C"),
            new charInfo("Kurobee", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/9nV4jrL/4ierWgO.png", 260, "D"),
            new charInfo("Lamrys", ["Ramiris", "Fairy of the Labyrinth"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/P9fyyGy/8UNLwvT.png", 261, "B"),
            new charInfo("Laplace", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/YPZgpr0/HeIAcz7.png", 262, "C"),
            new charInfo("Ranga", ["Tempest Wolf", "Star Wolf"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/34xrrHs/fkRaNnj.png", 263, "C"), 
            new charInfo("Rigurd", ["Rigur"], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/LQs7QBY/6eYfoKN.png", 264, "B"),
            new charInfo("Treyni", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/n3P9ckW/UO4PJBf.png", 265, "B"),
            new charInfo("Vesta", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/kSnwSLJ/Z6jpQCw.png", 266, "D"),
            new charInfo("Albis", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/6DZ0nLJ/Nfrkyma.png", 267, "D"),
            new charInfo("Grucius", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/RDzYtRV/YdaNnTt.jpg", 268, "C"),
            new charInfo("Mjurran", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/bHgxpCt/a352v1q.jpg", 269, "C"),
            new charInfo("Suphia", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/GxjBJWb/kUNHI9R.png", 270, "D"),
            new charInfo("Taguchi Shougo", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/HzvdSZp/f9VyvCv.jpg", 271, "D"),
            new charInfo("Mizutani Kirara", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "F", "https://i.ibb.co/q5hrbV6/aqw5Vqs.jpg", 272, "D"),
            new charInfo("Tachibana Kyouya", [], "That Time I Got Reincarnated as a Slime", ["Tensei shitara Slime Datta Ken", "Slime", "Tensura"], "M", "https://i.ibb.co/bL0yH2z/1ENFf7y.jpg", 273, "D"),
            new charInfo("Eren Yeager", ["Attack Titan", "Eren Jäger", "Yeager Eren"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/0rYJMQ7/ern.png", 274, "SS"),
            new charInfo("Mikasa Ackerman", ["Ackerman Mikasa"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/JFQjmC9/m.png", 275, "S"),
            new charInfo("Armin Arlert", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/80RCmJq/arm.png", 276, "S"),
            new charInfo("Sasha Braus", ["Potato Girl", "Sasha Brouse", "Sasha Blouse"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/tLk51vW/sasha.png", 277, "A"),
            new charInfo("Oluo Bozado", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/Yk1jR28/uL7ycmW.png", 278, "D"),
            new charInfo("Reiner Braun", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/rcpWXrY/g9I8IAy.png", 279, "B"),
            new charInfo("Riko Brzenska", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/bPgNj0c/3AdFVPt.png", 280, "D"),
            new charInfo("Mina Carolina", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/WpLTfzt/RHyPKnw.png", 281, "C"),
            new charInfo("Ian Dietrich", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/JpxnbFr/PvDSmLI.png", 282, "D"),
            new charInfo("Nile Dok", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/tzSrFrX/F1aclTJ.png", 283, "C"),
            new charInfo("Marlo Freudenberg", ["Marlowe Freudenberg"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/sC2J0yj/w47LO3q.png", 284, "C"),
            new charInfo("Hannes", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/9v3GvBG/S5f5O3g.png", 285, "C"),
            new charInfo("Bertolt Hoover", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/XS7XYgW/1EuTnEL.png", 286, "B"),
            new charInfo("Jean Kirstein", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/MpWzwRS/Dftcmdx.png", 287, "A"),
            new charInfo("Krista Lenz", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/Ss6jJW0/1ENFf7y.png", 288, "A"),
            new charInfo("Annie Leonhart", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/FxsL291/Ut1luXj.png", 289, "B"),
            new charInfo("Levi", ["Levi Ackerman"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/QHkd2nf/6ixQuad.png", 290, "SS"),
            new charInfo("Nick (AoT)", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/Vj8PmJB/213227.jpg", 291, "D"),
            new charInfo("Pixis Dot", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/gPd51nX/TNthRiD.png", 292, "B"),
            new charInfo("Petra Ral", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/QJbbx2S/we.png", 293, "C"),
            new charInfo("Anka Rheinberger", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/LngxGf6/lZPFHfQ.png", 294, "D"),
            new charInfo("Keith Shadis", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/yWGZKX1/D33gAp6.png", 295, "C"),
            new charInfo("Erwin Smith", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/bJfbypV/ezgif-6-ff759d55a63a.png", 296, "A"),
            new charInfo("Connie Springer", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/5BvSTXD/7HOPXFT.png", 297, "A"),
            new charInfo("Kitts Verman", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/wrz1vRQ/206475.jpg", 298, "D"),
            new charInfo("Thomas Wagner", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/fnch3B9/ezgif-6-c05bea048abf.png", 299, "D"),
            new charInfo("Grisha Yeager", ["Dr. Yeager"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/MPXK1Yb/a.png", 300, "B"),
            new charInfo("Carla Yeager", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/K2vfcwD/Fj5Tgwg.png", 301, "C"),
            new charInfo("Ymir", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/dmGfYTc/vHe8y7O.png", 302, "B"),
            new charInfo("Mike Zacharias", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/z5sfrXH/13waInL.png", 303, "C"),
            new charInfo("Darius Zackly", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/9rMcdZC/213239.jpg", 304, "D"),
            new charInfo("Hange Zoë", ["Hange Zoe"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/jyHr2c4/h.png", 305, "A"),
            new charInfo("Zeke", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/QQ5ypbX/z.png", 306, "A"),
            new charInfo("Kenny Ackerman", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/Zx8r3Ky/ezgif-6-e945a66032b8.png", 307, "C"),
            new charInfo("Alma", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/Fg9yPSW/360458.webp", 308, "D"),
            new charInfo("Uri Reiss", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/PZhzVKL/ADyimgt.png", 309, "B"),
            new charInfo("Rodd Reiss", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/rdHSxJZ/Kq7bn1x.png", 310, "D"),
            new charInfo("Frieda Reiss", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/5F4pk1J/4UQanBD.png", 311, "C"),
            new charInfo("Hitch Dreyse", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/8xYcJqx/2hRvscu.png", 312, "C"),
            new charInfo("Pieck Finger", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/TbJZcsB/p.png", 313, "A"),
            new charInfo("Eren Kruger", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/HT36rzM/oEf7pd2.png", 314, "C"),
            new charInfo("Fay Yeager", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/V2dL4bW/lovenCV.png", 315, "D"),
            new charInfo("Gabi Braun", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/x7Q5znN/who9X4j.png", 316, "C"),
            new charInfo("Porco Galliard", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/pdGKyFn/mWZCF9i.png", 317, "B"),
            new charInfo("Colt Grice", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/QrPPnyR/hXC7ICw.png", 318, "C"),
            new charInfo("Falco Grice", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/R05hBH9/431391.webp", 319, "B"),
            new charInfo("Onyankopon", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/yRBpwxw/MzRzbOI.png", 320, "C"),
            new charInfo("Willy Tybur", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/fCQD7QM/fOPvCC1.png", 321, "B"),
            new charInfo("Lara Tybur", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/ngDyGbF/Xew1e6n.png", 322, "C"),
            new charInfo("Yelena", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/swNmmdT/WeA0EW6.png", 323, "B"),
            new charInfo("Zofia", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/b3ZFPCc/ezgif-6-c1193bf08ef4.png", 324, "C"),
            new charInfo("Berner Moblit", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/Qbz4tZ4/UxkPfjg.png", 325, "D"),
            new charInfo("Marco Bott", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/F5vp4yC/zU1Hmmo.png", 326, "D"),
            new charInfo("Dirk", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/P578Byx/mahJshT.png", 327, "D"),
            new charInfo("Floch Forster", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/HYYxZyx/VrFJKyb.png", 328, "B"),
            new charInfo("Marlo Freudenberg", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/FnYBnmV/onCpMnm.png", 329, "C"),
            new charInfo("Dina Fritz", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/d0zVBjR/5Ob1MPz.png", 330, "D"),
            new charInfo("Tom Ksaver", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/x8vvZWS/ntoC5Pg.png", 331, "D"),
            new charInfo("Kiyomi Azumabito", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "F", "https://i.ibb.co/0rgjjKM/k.png", 332, "D"),
            new charInfo("Nicolo", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/k994z8j/qryyfxp.png", 333, "C"),
            new charInfo("Udo", [], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/LPc49fP/2THLbB8.png", 334, "C"),
            new charInfo("Artur Braus", ["Artur Blouse"], "Attack on Titan", ["Shingeki no Kyojin", "AoT"], "M", "https://i.ibb.co/3vJdDWx/4PmvEgX.jpg", 335, "D"),
            new charInfo("Tsukasa Yuzaki", ["Tsukuyomi Tsukasa"], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/1ZwSPDj/t.png", 336, "S"),
            new charInfo("Nasa Yuzaki", [], "Tonikaku Kawaii", ["Tonikawa"], "M", "https://i.ibb.co/5M0d7Mb/gH6SKVI.png", 337, "A"),
            new charInfo("Kaname Arisugawa", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/F4vzxhT/0SUUehn.png", 338, "B"),
            new charInfo("Aya Arisugawa", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/X2sRJdV/iYNBR9k.png", 339, "C"),
            new charInfo("Aurora (TK)", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/nkXVGvy/tpkvkcE.png", 340, "D"),
            new charInfo("Charlotte (TK)", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/0q2Dj4C/G48nFnv.png", 341, "C"),
            new charInfo("Chitose Kaginoji", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/r4c06Zh/3eyNoW0.png", 342, "C"),
            new charInfo("Enishi Yuzaki", [], "Tonikaku Kawaii", ["Tonikawa"], "M", "https://i.ibb.co/16dmPn0/e.png", 343, "D"),
            new charInfo("Kanoka Yuzaki", [], "Tonikaku Kawaii", ["Tonikawa"], "F", "https://i.ibb.co/349KKnn/XPomdzj.png", 344, "D"),
            new charInfo("Kyouya Hashiba", ["Hashiba Kyouya"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "M", "https://i.ibb.co/fQmgM5w/koZkXYi.png", 345, "B"),
            new charInfo("Kawasegawa Eiko", [], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "F", "https://i.ibb.co/m4DFYst/wcIRD55.png", 346, "B"),
            new charInfo("Kogure Nanako", ["N@NA"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "F", "https://i.ibb.co/QN20JhG/FZegI4Q.png", 347, "B"),
            new charInfo("Rokuonji Tsurayuki", ["Kawagoe Kyouchi"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "M", "https://i.ibb.co/vwkcQng/TUDzCXT.png", 348, "C"),
            new charInfo("Shino Aki", ["Shinoaki", "Shino Akishima"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "F", "https://i.ibb.co/k9Scs3y/d7Ccx2T.png", 349, "A"),
            new charInfo("Miyoki Hashiba", ["Hashiba Miyoki"], "Remake our Life!", ["Bokutachi no Remake", "Remake our Life"], "F", "https://i.ibb.co/12GKPQb/idiUOjD.png", 350, "D"),
            new charInfo("Dalian", ["Dariane"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/jHxcfTr/LlDgTgM.png", 351, "A"),
            new charInfo("Hugh Anthony Disward", ["Huey"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/dp1fRJH/CM9lIgn.png", 352, "B"),
            new charInfo("Aira", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/j8hsjvH/oEII0vH.png", 353, "D"),
            new charInfo("Mildred Dewar", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/BnvKF8N/10XTVWX.png", 354, "D"),
            new charInfo("Paula Dickinson", ["Paula Lents"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/Zhrr9MS/doV4Boy.jpg", 355, "D"),
            new charInfo("Viola Duplessis", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/8N8SMcp/81FhqLH.jpg", 356, "D"),
            new charInfo("Fiona", ["Inu Musume"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/h92zD8L/eRGT4DJ.png", 357, "C"),
            new charInfo("Flamberge", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/3TrKFby/fnGqNI7.png", 358, "B"),
            new charInfo("Martin Geese", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/s5cj3Nq/ECMHQtJ.jpg", 359, "D"),
            new charInfo("Gianni", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/3cvtp4Z/0agARX5.jpg", 360, "D"),
            new charInfo("Ilas", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/TgGMd0F/Qb5eDmu.jpg", 361, "D"),
            new charInfo("Armand Jeremiah", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/wRKjHkL/nCorkeu.png", 362, "C"),
            new charInfo("Kamhout Hal", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/ck2mFNC/uZ0f4H3.png", 363, "C"),
            new charInfo("Lenny Lents", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/mTJ2hVk/image.png", 364, "D"),
            new charInfo("Estella Lilburn", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/GTt3Fks/image.png", 365, "D"),
            new charInfo("Merlgar", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/19z9zsX/image.png", 366, "D"),
            new charInfo("Moskin", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/18ssq0h/image.png", 367, "D"),
            new charInfo("Mabel Nash", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/ZVM9S0F/image.png", 368, "C"),
            new charInfo("Patricia Nash", ["Patti"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/HCtgMvt/image.png", 369, "D"),
            new charInfo("Nos", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/X5GZJ3c/image.png", 370, "D"),
            new charInfo("Oobaba", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/MPL5P7w/image.png", 371, "D"),
            new charInfo("Raziel", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/R4gBKvm/r.png", 372, "C"),
            new charInfo("Salut", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/m5YFjp6/image.png", 373, "D"),
            new charInfo("Camilla Sauer Keynes", ["Kamilla Sauer Keynes"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/BwS6T9g/image.png", 374, "B"),
            new charInfo("Lianna Scholes", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/5FqRZ5P/image.png", 375, "D"),
            new charInfo("Christabel Sistine", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/F7gwgDD/a.png", 376, "C"),
            new charInfo("Laticia Serkis", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/kc7WPqk/image.png", 377, "D"),
            new charInfo("Shoka no shoujo", ["Bookshelf girl"], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "F", "https://i.ibb.co/P1dGNDd/image.png", 378, "B"),
            new charInfo("Vance", [], "Dantalian no Shoka", ["The Mystic Archives of Dantalian"], "M", "https://i.ibb.co/V35FNJt/image.png", 379, "D"),
            new charInfo("Mitsuha Miyamizu", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/pbS1wx3/image.png", 380, "S"),
            new charInfo("Taki Tachibana", [], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/TkP3bMP/image.png", 381, "S"),
            new charInfo("Tsukasa Fujii", [], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/gtyVLx1/image.png", 382, "B"),
            new charInfo("Toshiki Miyamizu", [], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/Qdsm1ns/image.png", 383, "D"),
            new charInfo("Yotsuha Miyamizu", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/w0jLfTh/image.png", 384, "B"),
            new charInfo("Futaba Miyamizu", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/nQVrHLt/341157.jpg", 385, "C"),
            new charInfo("Hitoha Miyamizu", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/f4c1P4W/zg8Iihs.png", 386, "D"),
            new charInfo("Sayaka Natori", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/b79dMCW/PFKKN6X.png", 387, "C"),
            new charInfo("Miki Okudera", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/k8J9rxk/image.png", 388, "A"),
            new charInfo("Shinta Takagi", [], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/vXmf57f/image.png", 389, "D"),
            new charInfo("Katsuhiko Teshigawara", ["Tessie"], "Your Name", ["Kimi no Na wa"], "M", "https://i.ibb.co/H7wqvMT/5C1X8Bh.png", 390, "B"),
            new charInfo("Yukari Yukino", [], "Your Name", ["Kimi no Na wa"], "F", "https://i.ibb.co/jLn6pKT/image.png", 391, "C"),
            new charInfo("Chizuru Ichinose", ["Mizuhara Chizuru"], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/qsSJ0rZ/Tz8m5bT.png", 392, "S"),
            new charInfo("Kazuya Kinoshita", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/NKFByMT/image.png", 393, "A"),
            new charInfo("Sayuri Ichinose", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/rMpptB7/image.png", 394, "D"),
            new charInfo("Yoshiaki Kibe", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/zQLG62F/image.png", 395, "C"),
            new charInfo("Kazuo Kinoshita", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/H4DK1Zq/image.png", 396, "D"),
            new charInfo("Nagomi Kinoshita", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/4twztRk/JWg5tyk.png", 397, "D"),
            new charInfo("Harumi Kinoshita", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/9YGdfY4/image.png", 398, "D"),
            new charInfo("Shun Kuribayashi", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/JpzCFfW/image.png", 399, "C"),
            new charInfo("Mami Nanami", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/d4b5vGP/jwxS4xS.png", 400, "A"),
            new charInfo("Sumi Sakurasawa", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/mXSzLN3/image.png", 401, "A"),
            new charInfo("Ruka Sarashina", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/191TXZH/image.png", 402, "B"),
            new charInfo("Takeshi Sasano", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "M", "https://i.ibb.co/2g1vvZ7/image.png", 403, "D"),
            new charInfo("Sonoko Shimae", [], "Rent-a-Girlfriend", ["Kanojo, Okarishimasu", "Kanojo Okarishimasu", "Rent a Girlfriend", "Kanokari"], "F", "https://i.ibb.co/rZ7n57N/s.png", 404, "D"),
            new charInfo("Artoria Pendragon", ["Saber"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/zrGGH50/3rLQUle.png", 405, "SS"),
            new charInfo("Kiritsugu Emiya", ["Emiya Kiritsugu"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/BTm0JqW/image.png", 406, "A"),
            new charInfo("Shirou Emiya", ["Emiya Shirou"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/VWygTSf/EB4Z1ib.png", 407, "B"),
            new charInfo("Gilgamesh", ["King of Heroes", "King of Kings", "Golden King"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/bWt37rG/lX3zwmJ.png", 408, "S"),
            new charInfo("Enkidu", ["Chains of Heaven"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/WpyYk8m/image.png", 409, "A"),
            new charInfo("Kirei Kotomine", ["Kotomine Kirei"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/4Pvfj4v/image.png", 410, "B"),
            new charInfo("Irisviel von Einzbern", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/jDFX3xF/image.png", 411, "A"),
            new charInfo("Rin Tohsaka", ["Rin Toosaka", "Tohsaka Rin"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/yk5Y5Mq/image.png", 412, "S"),
            new charInfo("Alexander the Great", ["Iskandar", "King of Conquerors", "Rider"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ZV2ZWpH/image.png", 413, "A"),
            new charInfo("Illyasviel von Einzbern", ["Illya"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/mShNyVP/image.png", 414, "B"),
            new charInfo("Sakura Matou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/pz1320d/JROxIug.png", 415, "A"),
            new charInfo("Diarmuid Ua Duibhne", ["Duirmuid O'Dyna"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/GdWRjc3/image.png", 416, "B"),
            new charInfo("Hassan-i-Sabbah", ["Hassan i Sabbah", "Assassin"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/7gXZYBQ/image.png", 417, "D"),
            new charInfo("Berserker", ["Lancelot"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Yk032Q2/C.png", 418, "B"),
            new charInfo("Gilles de Rais", ["Bluebeard"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/wJHxYHq/image.png", 419, "D"),
            new charInfo("Kayneth El-Melloi Archibald", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/n1Nbch9/image.png", 420, "C"),
            new charInfo("Gráinne", ["Grainne"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/d53pxFt/image.png", 421, "D"),
            new charInfo("Maiya Hisau", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/JKwskQW/image.png", 422, "B"),
            new charInfo("Natalia Kamiński", ["Natalia Kaminski"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/250xLRp/image.png", 423, "C"),
            new charInfo("Risei Kotomine", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/pwx5RYD/image.png", 424, "D"),
            new charInfo("Kotone", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/30mHy50/image.png", 425, "D"),
            new charInfo("Leysritt", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/LP1BXSZ/image.png", 426, "D"),
            new charInfo("Leysritt (Kaleid)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/F46rJf7/IL6qfHc.png", 427, "C"),
            new charInfo("Martha Mackenzie", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/Xydz9X0/image.png", 428, "D"),
            new charInfo("Glen Mackenzie", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/DWrzYmF/image.png", 429, "D"),
            new charInfo("Matou Zouken", ["Zouken Matou"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/qRvcYzt/image.png", 430, "C"),
            new charInfo("Kariya Matou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/W5bN61H/image.png", 431, "C"),
            new charInfo("Sola-Ui Nuada-Re Sophia-Ri", ["Sola Ui Nuada Re Sophia Ri"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/ck9VZpN/image.png", 432, "C"),
            new charInfo("Tokiomi Tohsaka", ["Tokiomi Toosaka"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/rckTzSg/image.png", 433, "C"),
            new charInfo("Aoi Tohsaka", ["Aoi Zenjou", "Aoi Toosaka"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/hVB5C8t/image.png", 434, "D"),
            new charInfo("Ryuunosuke Uryuu", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/8DbgxXC/image.png", 435, "D"),
            new charInfo("Waver Velvet", ["Lord El-Melloi II"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/YQyPsQc/image.png", 436, "B"),
            new charInfo("Jubstacheit von Einzbern", ["Acht"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/7WXZXGZ/image.png", 437, "D"),
            new charInfo("Archer", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0tzKKXS/image.png", 438, "A"),
            new charInfo("Cú Chulainn", ["Lancer", "Cu Chulainn"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/qWvFwrR/SZqJfoZ.png", 439, "A"),
            new charInfo("Sasaki Kojirou", ["Assassin (stay night)"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/fqhsXdB/image.png", 440, "B"),
            new charInfo("Heracles", ["Berserker (stay night)", "Megalos"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/5v0QcyZ/image.png", 441, "C"),
            new charInfo("Medea", ["Caster"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/kJPkQSN/78FDr46.png", 442, "A"),
            new charInfo("Fujimura Taiga", ["Fuji-nee", "Fuji nee"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/7gKbNCV/image.png", 443, "C"),
            new charInfo("Kane Himuro", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/zs6kxfj/image.png", 444, "D"),
            new charInfo("Souichirou Kuzuki", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/PgNzJzw/image.png", 445, "D"),
            new charInfo("Kaede Makidera", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/zsHtC8G/image.png", 446, "D"),
            new charInfo("Shinji Matou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ThW7dZ5/image.png", 447, "B"),
            new charInfo("Ayako Mitsuzuri", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/WyG2KH4/image.png", 448, "C"),
            new charInfo("Medusa", ["Rider (stay night)"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/Z619qdC/image.png", 449, "A"),
            new charInfo("Ryuudou Issei", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/FWGBCJL/image.png", 450, "D"),
            new charInfo("Yukika Saegusa", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/NWrLgp6/image.png", 451, "D"),
            new charInfo("Sella", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/PC04TYb/image.png", 452, "D"),
            new charInfo("Sella (Kaleid)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/JqRQt2w/image.png", 453, "C"),
            new charInfo("Shin Assassin", ["Hassan of the Cursed Arm", "True Assassin"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Nt1Cqqg/image.png", 454, "D"),
            new charInfo("Arthur Pendragon", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/DKvZV38/image.png", 455, "C"),
            new charInfo("Ayaka Sajou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/nLy17Kc/image.png", 456, "C"),
            new charInfo("Misaya Reiroukan", ["Cherubim", "Lady of the Wolves"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/18Hw9jr/image.png", 457, "B"),
            new charInfo("Manaka Sajou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/mD3vJbD/image.png", 458, "D"),
            new charInfo("Aro Isemi", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0rF57C0/image.png", 459, "D"),
            new charInfo("Okita Souji", ["Sakura Saber"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/xms7CRJ/image.png", 460, "SS"),
            new charInfo("Oda Nobunaga", ["Majin Archer", "Demon Archer"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/qnnPytj/image.png", 461, "S"),
            new charInfo("Nagao Kagetora", ["Lancer of Eight Flowers"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/P5cby4G/image.png", 462, "C"),
            new charInfo("Okita Souji (alter)", ["Sakura Saber (alter)", "Okita Souji Alter", "Sakura Saber Alter"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/CbFmGNp/image.png", 463, "S"),
            new charInfo("Okada Izou", ["Ghost of Tosa"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/rthNVmq/image.png", 464, "B"),
            new charInfo("Oryou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/FVBwnM3/AKAUUUP.png", 465, "C"),
            new charInfo("Sakamoto Ryouma", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/svDdND3/image.png", 466, "C"),
            new charInfo("Mori Nagayoshi", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0DRFvgP/image.png", 467, "C"),
            new charInfo("Major Reiter", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/7Vm5rRT/image.png", 468, "D"),
            new charInfo("Jeanne d'Arc", ["Ruler", "The Maid of Orléans", "Maid of Orléans"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/hBkCfpW/image.png", 469, "S"),
            new charInfo("Jeanne d'Arc (alter)", ["Jalter", "Jeanne d'Arc Alter"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/SVh0X5h/sw.png", 470, "A"),
            new charInfo("Sieg", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/dfzrXXJ/image.png", 471, "B"),
            new charInfo("Astolfo", ["Rider of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/W3bt90N/image.png", 472, "A"),
            new charInfo("Mordred", ["Saber of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/sJDrwPM/image.png", 473, "S"),
            new charInfo("Karna", ["Lancer of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ZK8qXyv/image.png", 474, "B"),
            new charInfo("Merlin", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/QcGYyGx/image.png", 475, "A"),
            new charInfo("Atalanta", ["Archer of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/LP02hLL/image.png", 476, "B"),
            new charInfo("Semiramis", ["Assassin of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/6vLwq2N/Qf7aEQS.png", 477, "B"),
            new charInfo("Spartacus", ["Berserker of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Z8ws4j2/image.png", 478, "D"),
            new charInfo("William Shakespeare", ["Caster of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/CwW57kP/image.png", 479, "C"),
            new charInfo("Achilles", ["Rider of Red"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ysZzBFh/image.png", 480, "C"),
            new charInfo("Rocco Belfeban", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/09FyjRL/image.png", 481, "D"),
            new charInfo("Flatt Escardos", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/XsfSh9T/image.png", 482, "D"),
            new charInfo("Caules Forvedge Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ckM83R8/image.png", 483, "D"),
            new charInfo("Fiore Forvedge Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/kQ1hwst/image.png", 484, "D"),
            new charInfo("Roche Frain Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ZxpPB9Y/image.png", 485, "D"),
            new charInfo("Victor Frankenstein", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/FVDHm5w/image.png", 486, "D"),
            new charInfo("Celenike Icecolle Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/DYv3ddN/image.png", 487, "D"),
            new charInfo("Shirou Kotomine", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/YLyTDsC/image.png", 488, "B"),
            new charInfo("Chiron", ["Archer of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0GJf96B/image.png", 489, "C"),
            new charInfo("Jack the Ripper", ["Assassin of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/wpLPyGJ/image.png", 490, "C"),
            new charInfo("Frankenstein", ["Berserker of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/BctZhCZ/image.png", 491, "B"),
            new charInfo("Avicebron", ["Caster of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ZxZXzWQ/image.png", 492, "D"),
            new charInfo("Vlad III", ["Lancer of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/1K1DxqB/image.png", 493, "C"),
            new charInfo("Siegfried", ["Saber of Black"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/4gzT260/image.png", 494, "C"),
            new charInfo("Laeticia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/C8fwrVc/image.png", 495, "D"),
            new charInfo("Gordes Musik Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/vBRQCcZ/image.png", 496, "D"),
            new charInfo("Darnic Prestone Yggdmillennia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/6JbrPDc/image.png", 497, "D"),
            new charInfo("Reika Rikudou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/FzCMkq1/image.png", 498, "C"),
            new charInfo("Isabelle Romée", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/xzCv2VZ/image.png", 499, "D"),
            new charInfo("Morgan le Fay", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/nwkbWqZ/fay.png", 500, "A"),
            new charInfo("Sergio", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/ssZXh06/image.png", 501, "D"),
            new charInfo("Kairi Shishigou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/S6rk1Kw/image.png", 502, "B"),
            new charInfo("Tool", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/GM9XBRV/image.png", 503, "D"),
            new charInfo("Nero Claudius", ["Nero Claudius Caesar Augustus Germanicus", "Saber Nero", "Red Saber"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/g309TzJ/image.png", 504, "S"),
            new charInfo("Hakuno Kishinami (M)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/YLDT7p7/image.png", 505, "C"),
            new charInfo("Hakuno Kishinami (F)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/0ZsyJLZ/5r0qmme.png", 506, "B"),
            new charInfo("Francis Drake", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/CKsng16/aoY6cjy.png", 507, "B"),
            new charInfo("Dan Blackmore", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Nss6wSs/image.png", 508, "D"),
            new charInfo("Rani VIII", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/WV2Ggcc/khzGjbi.png", 509, "C"),
            new charInfo("Artoria Pendragon (alter)", ["Saber (alter)", "Saber alter", "Salter"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/h8z6CM6/image.png", 510, "S"),
            new charInfo("Gudao", ["Ritsuka Fujimaru (M)"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/3kWs5w3/image.png", 511, "B"),
            new charInfo("Mash Kyrielight", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/ZzGZpRw/XHlBAuF.png", 512, "A"),
            new charInfo("Romani Archaman", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/c1HDYYB/image.png", 513, "C"),
            new charInfo("Olga Marie Animusphere", ["Olga-Marie Arsimilat Animusphere", "Olga Marie Arsimilat Animusphere", "Olgamally"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/qpsnzL8/ZCVq7e0.png", 514, "B"),
            new charInfo("Lev Lainur Flauros", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/zJQmyZw/image.png", 515, "D"),
            new charInfo("Ushiwakamaru", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/6mWwhGj/3gAIRkH.png", 516, "B"),
            new charInfo("Gudako", ["Ritsuka Fujimaru (F)"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/BjKfzT4/2oZ1mvk.png", 517, "B"),
            new charInfo("Scáthach", ["Scathach"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/9ZHVNyw/s.png", 518, "A"),
            new charInfo("Hans Christian Andersen", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Ykgtv9b/image.png", 519, "D"),
            new charInfo("Thomas Alva Edison", ["Thomas Edison"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/G0S5Nqj/NZVFINJ.png", 520, "C"),
            new charInfo("Sherlock Holmes", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/dQ3Vkf9/qTL9Nt7.png", 521, "D"),
            new charInfo("Brynhildr", ["Sigrdrífa", "Sigrdrifa"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/pKGV8cX/DzCZHX3.png", 522, "C"),
            new charInfo("Miyamoto Musashi", ["Musashi Miyamoto", "Shinmen Takezou", "Miyamoto Iori"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/SNYrq9R/image.png", 523, "SS"),
            new charInfo("Ryouma Sakamoto", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/0F44LB7/image.png", 524, "D"),
            new charInfo("Nikola Tesla", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/qYd7Xmb/hfspEhh.png", 525, "C"),
            new charInfo("Tristan", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/BKbVmJc/zdXyQts.png", 526, "D"),
            new charInfo("Abigail Williams", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/RYR0nTN/XhcLYBE.png", 527, "C"),
            new charInfo("Artoria Pendragon (lancer)", ["Lartoria", "Lion King", "The Lion King", "Artoria Lancer"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/D7Fdhs4/a13G1wY.png", 528, "A"),
            new charInfo("Artoria Pendragon (lancer alter)", ["Lalter", "Artoria Lancer Alter"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/89RH6zJ/8ugAUqe.png", 529, "A"),
            new charInfo("Tamamo no Mae", ["Blue Caster"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/P5QDmHb/JHOBEuT.png", 530, "A"),
            new charInfo("Gray", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/jfcmK8s/DlLrWaF.png", 531, "B"),
            new charInfo("Reines El-Melloi Archisorte", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/L6Gm7T7/YfeyRKn.png", 532, "C"),
            new charInfo("Luviagelita Edelfelt", ["Luvia"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/TYTrXN8/image.png", 533, "B"),
            new charInfo("Melvin Weins", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/SrwLt1H/image.png", 534, "D"),
            new charInfo("Yvette L. Lehrman", ["Yvette Lehrman"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/jGXbBLK/wOolhq5.png", 535, "C"),
            new charInfo("Hishiri Adashino", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/g3rB5MH/89JoOKG.png", 536, "D"),
            new charInfo("Mary Lil Fargo", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/LCN5rSP/image.png", 537, "D"),
            new charInfo("Alec Fargo", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/nkWVrGW/image.png", 538, "D"),
            new charInfo("Trisha Fellows", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/ysv0h3X/image.png", 539, "D"),
            new charInfo("Gaurika", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/VS7rbRr/image.png", 540, "D"),
            new charInfo("Hephaestion", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/GQ4vF3T/image.png", 541, "D"),
            new charInfo("Fernando Li", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/KyJwS8C/image.png", 542, "D"),
            new charInfo("Bram Nuada-Re Sophia-Ri", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/QJWYSyt/image.png", 543, "D"),
            new charInfo("Wills Pelham Codrington", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/6RWN7KF/image.png", 544, "D"),
            new charInfo("Jean-Mario Supinerra", ["Jean Mario Supinerra"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/xHp4R1K/image.png", 545, "D"),
            new charInfo("Ishtar", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/Kr6h5JJ/46txCUb.png", 546, "S"),
            new charInfo("Ereshkigal", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/ryDMtyz/D4TINe2.png", 547, "S"),
            new charInfo("Gorgon", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/j3NGk9F/hbOpFkb.png", 548, "C"),
            new charInfo("Leonardo da Vinci", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/k9VxQsR/QcyKi6O.png", 549, "A"),
            new charInfo("Angra Mainyu", ["Aŋra Mainiiu", "Avenger", "All the World's Evil"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/n8PGV4L/Pv5dClp.png", 550, "B"),
            new charInfo("Dustin", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/KNpJMNP/image.png", 551, "D"),
            new charInfo("Jaguar Man", ["Jaguarman", "Jaguar Warrior"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/tJ3rvB2/Bd7685l.png", 552, "C"),
            new charInfo("Leonidas I", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/x6QHLb0/image.png", 553, "D"),
            new charInfo("Solomon", ["Mage King", "King Solomon"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/zZ5x0h3/image.png", 554, "C"),
            new charInfo("Quetzalcoatl", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/jkDyJ6d/FkUXGFN.png", 555, "B"),
            new charInfo("Meuniere", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/VNDymcv/image.png", 556, "D"),
            new charInfo("Wolfgang Amadeus Mozart", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/Ph8bPwL/BgRbVHJ.png", 557, "C"),
            new charInfo("Benkei Musashibou", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/phP8x8B/image.png", 558, "D"),
            new charInfo("Siduri", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/mhkxmk4/Sq9DC4e.png", 559, "C"),
            new charInfo("Tiamat", ["Femme Fatale"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/qk3VLR4/CYgGTed.png", 560, "B"),
            new charInfo("Miyu Edelfelt", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/G77jzw4/qD1YBJ5.png", 561, "C"),
            new charInfo("Tatsuko Gakumazawa", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/nfKgx6w/ZHov6wn.png", 562, "D"),
            new charInfo("Mimi Katsura", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/P1hHn4V/aPkHLfs.png", 563, "D"),
            new charInfo("Suzuka Kurihara", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/wLnDbKj/as.png", 564, "D"),
            new charInfo("Nanaki Moriyama", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/FnwNrs3/image.png", 565, "D"),
            new charInfo("Chloe von Einzbern", ["Dark Illya"], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/Hq0v0Ly/eUx283L.png", 566, "B"),
            new charInfo("Caren Hortensia", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/VJg18sX/2nJhywr.png", 567, "C"),
            new charInfo("Hibari Kurihara", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/3RDd6df/image.png", 568, "D"),
            new charInfo("Nanami Moriyama", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/bFP3tjw/image.png", 569, "D"),
            new charInfo("Bazett Fraga McRemitz", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/7vSzR8h/nmm4l69.png", 570, "B"),
            new charInfo("Julian Ainsworth", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/thRZQKK/8g0NetZ.png", 571, "D"),
            new charInfo("Erika Ainsworth", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/3WbFm2p/N23mumO.png", 572, "D"),
            new charInfo("Angelica Ainsworth", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/mz9ckHM/AY5q3UL.png", 573, "C"),
            new charInfo("Beatrice Flowerchild", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/WFx5jrM/tUJT3Hb.png", 574, "D"),
            new charInfo("Tanaka (Kaleid)", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "F", "https://i.ibb.co/F4NdTN1/oo.png", 575, "C"),
            new charInfo("Sigma", [], "Fate Series", ["Fate", "Fate/stay night", "Fate stay night", "Fate/Zero", "Fate Zero", "Fate/Apocrypha", "Fate Apocrypha", "Fate/Kaleid", "Fate Kaleid", "Fate Kaleid Liner Prisma Illya", "Fate/Prototype", "Fate/Grand Order", "Fate Grand Order", "F/", "FGO"], "M", "https://i.ibb.co/g6p5mJD/image.png", 576, "D"),
            new charInfo("Roxy Migurdia", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/QFBrTMK/pCalWuu.png", 577, "A"),
            new charInfo("Rudeus Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/GQ9DLQr/65ZVVJF.png", 578, "A"),
            new charInfo("Paul Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/vZ8cDvP/BFN7Xdg.png", 579, "B"),
            new charInfo("Zenith Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/J73TW7J/DYg6HCd.png", 580, "B"),
            new charInfo("Norn Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/6wWkB6S/GjJj8e5.png", 581, "C"), 
            new charInfo("Aisha Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/CVTsw93/S9L9GMS.png", 582, "C"),
            new charInfo("Lilia Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/vBgtpRy/wmoGh8q.png", 583, "C"),
            new charInfo("Sylphiette", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/bHF7sbc/Z47FYrJ.png", 584, "B"),
            new charInfo("Eris Boreas Greyrat", ["Mad Dog"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/s3KDwZb/larhiCh.png", 585, "A"),
            new charInfo("Philip Boreas Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/dKhbBjv/A4Ks9pF.png", 586, "D"),
            new charInfo("Sauros Boreas Greyrat", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/746NBHQ/2EbWv0F.png", 587, "D"),
            new charInfo("Ghislaine Dedoldia", ["King's Hound"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/hVMx77n/zBEVqt3.png", 588, "C"),
            new charInfo("Ruijerd Superdia", ["Dead End", "Watch Dog"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/tZQ982P/CxqkQzW.png", 589, "A"),
            new charInfo("Kishirika Kishirisu", ["Demon Emperor of Demon Eyes", "The Immortal Demon Empress"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/TwpX737/ZkDoOHE.png", 590, "C"),
            new charInfo("Elinalise Dragonroad", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/7XCVgRB/LK2bwHv.png", 591, "C"),
            new charInfo("Geese", [], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/0s26bBj/lKESqgB.png", 592, "D"),
            new charInfo("Zanoba Shirone", ["Head Ripping Prince"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/thbNcJK/hsOEIpw.png", 593, "C"),
            new charInfo("Orsted", ["Dragon God"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "M", "https://i.ibb.co/sPrw6v8/sGpVxFB.png", 594, "B"),
            new charInfo("Nanahoshi Shizuka", ["Silent Seven Stars"], "Mushoku Tensei", ["Mushoku Tensei: Isekai Ittara Honki Dasu", "Mushoku Tensei: Jobless Reincarnation"], "F", "https://i.ibb.co/tmmc4qP/p1cGZVF.png", 595, "D"),
            new charInfo("Hinata Shouyou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/Qbx3LD7/pXGeQpu.png", 596, "S"),
            new charInfo("Kageyama Tobio", ["King of the Court"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/QC3StBr/PFeMDn7.png", 597, "S"),
            new charInfo("Nishinoya Yuu", ["Karasuno's Guardian Duty"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/vBT3RpN/NGnX4Si.png", 598, "S"),
            new charInfo("Aihara Mao", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/7SPfxbM/image.png", 599, "D"),
            new charInfo("Aone Takanobu", ["The Iron Wall"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/WkDnPtB/uY0xBnJ.png", 600, "B"),
            new charInfo("Azumane Asahi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/k5DjYb7/hFlu4Ua.png", 601, "A"),
            new charInfo("Ennoshita Chikara", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/vq2t1f2/RA1kJEe.png", 602, "B"),
            new charInfo("Fukunaga Shouhei", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/GtRZz2S/mzHImxC.png", 603, "D"),
            new charInfo("Futakuchi Kenji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/BnHTPKd/wRIBkH4.png", 604, "B"),
            new charInfo("Hanamaki Takahiro", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/kJBYzK9/Eee2SJi.png", 605, "D"),
            new charInfo("Hinata Natsu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/VB7cL2V/image.png", 606, "D"),
            new charInfo("Ikejiri Hayato", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tQgbYdP/TaOAGip.png", 607, "D"),
            new charInfo("Inuoka Sou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/Y7nGsXD/0kLucNf.png", 608, "D"),
            new charInfo("Iwaizumi Hajime", ["Iwa-chan"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/q1RbNb8/7E97UUT.png", 609, "B"), 
            new charInfo("Izumi Yukitaka", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/5s3vKGn/a34FXfo.png", 610, "D"),
            new charInfo("Kai Nobuyuki", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/L0FZ2wj/O7xXOTQ.png", 611, "D"),
            new charInfo("Kamasaki Yasushi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/PgYcH8M/0Cq5i8y.png", 612, "D"),
            new charInfo("Kindaichi Yuutarou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/1r7S5cB/Y5PDiYz.png", 613, "C"),
            new charInfo("Kinoshita Hisashi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/zfF7cJ6/mdfG2cq.png", 614, "C"),
            new charInfo("Kozume Kenma", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/PC4DBTj/2NfknZT.png", 615, "A"),
            new charInfo("Kunimi Akira", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/q9Kp70z/Im9mDdi.png", 616, "C"),
            new charInfo("Kuroo Tetsurou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/RGXNDsY/vhROhIx.png", 617, "A"),
            new charInfo("Matsukawa Issei", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/M1t0vD3/V6c72Gm.png", 618, "D"),
            new charInfo("Michimiya Yui", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/Fx3kfFd/eAp8ikQ.png", 619, "C"),
            new charInfo("Moniwa Kaname", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/ZSJ82R7/r3GFT0N.png", 620, "D"),
            new charInfo("Narita Kazuhito", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/phgK4bp/U4eM6CY.png", 621, "D"),
            new charInfo("Nekomata Yasufumi", ["Nekomata-sensei"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/0M9zQ3J/neKhnZj.png", 622, "C"),
            new charInfo("Oikawa Tooru", ["Grand King"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/gjjCzNC/2rcay8n.png", 623, "S"),
            new charInfo("Sasaya Takehito", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/L5PcC3M/mtSsmI4.png", 624, "D"),
            new charInfo("Sawamura Daichi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tpjDBR1/Sl05lAY.png", 625, "B"),
            new charInfo("Shimada Makoto", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/ymT0RWh/u6Mf1Xp.png", 626, "D"),
            new charInfo("Shimizu Kiyoko", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/bgLw5Gf/3nDKpU5.png", 627, "B"),
            new charInfo("Sugawara Koushi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/0YF0PgM/mgI1W1H.png", 628, "A"),
            new charInfo("Takeda Ittetsu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/kSs5ZLG/0NG4rdn.png", 629, "B"),
            new charInfo("Tanaka Ryuunosuke", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/3CZPWRr/wZFn37f.png", 630, "B"),
            new charInfo("Tsukishima Kei", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/YbfgJyp/lLNKA4a.png", 631, "A"),
            new charInfo("Ukai Keishin", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/34ZP38S/plhOhKt.png", 632, "B"),
            new charInfo("Ushijima Wakatoshi", ["Ushiwaka"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tHYLkBP/YH87Ui9.png", 633, "B"),
            new charInfo("Watari Shinji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/kQgcpXw/0JBc13k.png", 634, "D"),
            new charInfo("Yaku Morisuke", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/dGp5H45/SUyw3We.png", 635, "C"),
            new charInfo("Yamaguchi Tadashi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/NSZ13jy/kgG1tod.png", 636, "B"),
            new charInfo("Yamamoto Taketora", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/w79gRbS/tBMB3E4.png", 637, "C"),
            new charInfo("Akaashi Keiji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/pZwP07f/bMKgceK.png", 638, "B"),
            new charInfo("Bokuto Koutarou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tDLr9Nf/QlvrG1f.png", 639, "A"),
            new charInfo("Goura Masaki", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/C1TZnm7/402015.jpg", 640, "D"),
            new charInfo("Haiba Lev", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/CKPPDzw/oBNrmnR.png", 641, "C"),
            new charInfo("Koganegawa Kanji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/8gP3cKR/IJlc9OV.png", 642, "C"), 
            new charInfo("Kyoutani Kentarou", ["Mad Dog (HQ)"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/72BL5CJ/uupKrTB.png", 643, "C"),
            new charInfo("Misaki Hana", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/5xBz5f0/ssJbjoE.png", 644, "D"),
            new charInfo("Ogano Daiki", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/YWhS3yN/402018.jpg", 645, "D"),
            new charInfo("Oiwake Takurou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/dJdbbJ6/kJLArHu.png", 646, "D"),
            new charInfo("Shirofuke Yukie", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/bXGwSDp/oW0RwLs.png", 647, "C"),
            new charInfo("Suzumeda Kaori", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/x3MWwXG/image.png", 648, "D"),
            new charInfo("Tanaka Saeko", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/7v0Z2df/xX5gycq.png", 649, "C"),
            new charInfo("Terushima Yuuji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/NmjwBKv/1tWnHqx.png", 650, "C"),
            new charInfo("Tsukishima Akiteru", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/zP0S4L5/Ib4DLwA.png", 651, "D"),
            new charInfo("Ukai Ikkei", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tJZ9XVQ/UocTJ3V.png", 652, "B"),
            new charInfo("Yachi Hitoka", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "F", "https://i.ibb.co/tzF57Mb/BGupgwo.png", 653, "B"),
            new charInfo("Goshiki Tsutomu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/RP6MQSC/SayviQ0.png", 654, "C"),
            new charInfo("Semi Eita", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/Zmy3H1V/ywJzt3r.png", 655, "D"),
            new charInfo("Tendou Satori", ["Guess Monster"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/vkkWG0z/GTWzdLF.png", 656, "C"),
            new charInfo("Washijou Tanji", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/tmbPn71/qY5SiVh.png", 657, "C"),
            new charInfo("Sakusa Kiyoomi", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/TWczCVc/2zCMdGe.png", 658, "D"),
            new charInfo("Kita Shinsuke", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/VqgxftR/e983AdX.png", 659, "C"),
            new charInfo("Miya Osamu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/59ptT4s/KjdMNp3.png", 660, "C"),
            new charInfo("Miya Atsumu", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/Xp6g1wY/Yq3Drxu.png", 661, "B"),
            new charInfo("Ojiro Aran", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/hVMWcy0/3xZ5ri7.png", 662, "D"),
            new charInfo("Suna Rintarou", [], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/HLycKTY/6VsHc47.png", 663, "D"),
            new charInfo("Udai Tenma", ["Little Giant"], "Haikyuu!!", ["Haikyuu", "Haikyu"], "M", "https://i.ibb.co/99ZFsQL/wCDYxmq.png", 664, "C"),
        ];

        // Profile
        if (message.content.startsWith("!pr") || message.content.startsWith("!Pr") || message.content.startsWith("!pR") || message.content.startsWith("!PR")) {

            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();

            if (!inventory[user.id + message.guild.id] || inventory[user.id + message.guild.id][0] === undefined) {
                if (user.id === message.author.id) {
                    return message.channel.send("You don't have any characters");
                } else {
                    return message.channel.send(`${user.username} has no characters`);
                };
            };
            
            const inv = [];
            for (i=0; i < inventory[user.id + message.guild.id].length; i++) {
                inv.push(inventory[user.id + message.guild.id][i]);
            };
            const uniq =  inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]]);
            };

            const charsTotal = Object.keys(characters).length;
            const charsTotalF = characters.filter((e) => e.gender === "F").length;
            const charsTotalM = characters.filter((e) => e.gender === "M").length;
            const collected = uniq.length;
            const collectedF = chars.filter((e) => e.gender === "F").length;
            const collectedM = chars.filter((e) => e.gender === "M").length;
            const collRatio = Math.floor((collected / charsTotal)*100);
            const collRatioF = Math.floor((collectedF / charsTotalF)*100);
            const collRatioM = Math.floor((collectedM / charsTotalM)*100);
            const ssT = characters.filter((e) => e.rarity === "SS").length;
            const sT = characters.filter((e) => e.rarity === "S").length;
            const aT = characters.filter((e) => e.rarity === "A").length;
            const bT = characters.filter((e) => e.rarity === "B").length;
            const cT = characters.filter((e) => e.rarity === "C").length;
            const dT = characters.filter((e) => e.rarity === "D").length;
            const collSS = chars.filter((e) => e.rarity === "SS").length;
            const collS = chars.filter((e) => e.rarity === "S").length;
            const collA = chars.filter((e) => e.rarity === "A").length;
            const collB = chars.filter((e) => e.rarity === "B").length;
            const collC = chars.filter((e) => e.rarity === "C").length;
            const collD = chars.filter((e) => e.rarity === "D").length;
            // Anime Total + Anime Unique 
            const animeTotal = [];
            for (i=0; i < Object.keys(characters).length; i++) {
                animeTotal.push(characters[i].anime);
            };
            const aTuniq =  animeTotal.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            // Level
            let xpr = xp[user.id + message.guild.id];
            let level = 0;
            for (i=1; xpr >= 0; i++) {
                xpr -= Math.floor(5*Math.log(i)*Math.log(i)*Math.log(i) + 20);
                level++;
            };
            // Coins
            coin = 0;
            if (coins[user.id + message.guild.id]) coin = coins[user.id + message.guild.id];

            let aniCompleted = 0;
            for (i=0; i < aTuniq.length; i++) {
                let animeCheck = characters.filter((e) => e.anime === aTuniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === aTuniq[i]).length;
                if (animeCheck === invCheck) {
                    aniCompleted++;
                };
            };

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id]) thumbnail = characters[favChar[user.id + message.guild.id]].image;
            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s profile`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("**Level**: " + level + " (!level) ㅤㅤ **Coins**: " + coin + "<:coins:872926669055356939>\n**Collected**: " + collected + "/" + charsTotal + " (" + collectedF + "/" + charsTotalF + "<:female:870076411430436914> " + collectedM + "/" + charsTotalM + "<:male:870076394649047080>)\n**Completion**: " + collRatio + "% (" + collRatioF + "%<:female:870076411430436914> " + collRatioM + "%<:male:870076394649047080>)\n**Anime Completed**: " + aniCompleted + "/" + aTuniq.length)
            .setThumbnail(thumbnail)
            .addFields(
                { name: 'Rarity', value: "<:SSTier:869316489931546644> **Tier**: " + `${collSS}/${ssT}` + "\n<:ATier:869316558013464627> **Tier**: " + `${collA}/${aT}` + "\n<:CTier:869316602858991657> **Tier**: " + `${collC}/${cT}`, inline: true },
                { name: '_ _', value: "<:STier:869316518675095552> **Tier**: " + `${collS}/${sT}` + "\n<:BTier:869316586803179571> **Tier**: " + `${collB}/${bT}` + "\n<:DTier:869316616071032843> **Tier**: " + `${collD}/${dT}`, inline: true },
            )
            message.channel.send(Embed);
            
            return;
        };

        // Favourite Character
        if (message.content.startsWith("!f") || message.content.startsWith("!F")) {
            if (!inventory[message.author.id + message.guild.id]) {
                return message.channel.send("You don't have any characters");
            };
            if (!args[0]) {
                return message.channel.send("Please provide a name");
            };

            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                if (inventory[message.author.id + message.guild.id].some((a) => a === fastCheck[0].id)) {
                    favChar[message.author.id + message.guild.id] = fastCheck[0].id;
                    fs.writeFile('Storage/favChar.json', JSON.stringify(favChar), (err) => {
                        if (err) console.error(err);
                    });
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setDescription(`Favourite charakter set to \n**${fastCheck[0].name}**`)
                    .setImage(fastCheck[0].image)
                    message.channel.send(Embed);
                } else {
                    message.channel.send("You don't own this card");
                };
            } else {
                message.channel.send("No match found. Please use the characters full name");
            };
        };

        // Pull
        if (message.content.startsWith("!p") || message.content.startsWith("!P")) {

            var pullCount = JSON.parse(fs.readFileSync('Storage/pullCount.json', 'utf8'));
            if (!inventory[message.author.id + message.guild.id]) inventory[message.author.id + message.guild.id] = [];
            if (!pullCount[message.author.id + message.guild.id]) pullCount[message.author.id + message.guild.id] = 0;

            if (pullCount[message.author.id + message.guild.id] > 5) {
                let time = new Date();
                let nextPull = time.getHours() % 2 === 0 ? Math.ceil(time/3600000)*3600000 + 3600000 : Math.ceil(time/3600000)*3600000;
                let timeLeft = nextPull - time;
                return message.channel.send(`You've reached your pull limit, please wait ${timeLeft > 3600000 ? "**1**h " : ""}**${timeLeft > 3600000 ? Math.ceil((timeLeft - 3600000)/60000) : Math.ceil((timeLeft)/60000)}** min`);
            };

            const ranRar = Math.floor(Math.random() * 1000); // 0-999

            const ranXp = Math.ceil(Math.random() * 10); // 1-10
            if (!xp[message.author.id + message.guild.id]) xp[message.author.id + message.guild.id] = 0;
            xp[message.author.id + message.guild.id] += ranXp;
            if (ranRar < 25 && ranRar > 2) xp[message.author.id + message.guild.id] += ranXp;
            if (ranRar < 3) xp[message.author.id + message.guild.id] += 20;
            fs.writeFile('Storage/xp.json', JSON.stringify(xp), (err) => {
                if (err) console.error(err);
            });


            if (ranRar < 3) {
                const ssClass = characters.filter((e) => e.rarity === "SS");
                const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                ssClass[ssNum].displayMy();
                inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
            } else if (ranRar < 25) {
                const sClass = characters.filter((e) => e.rarity === "S");
                const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                sClass[sNum].displayMy();
                inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
            } else if (ranRar < 101) {
                const aClass = characters.filter((e) => e.rarity === "A");
                const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                aClass[aNum].displayMy();
                inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
            } else if (ranRar < 259) {
                const bClass = characters.filter((e) => e.rarity === "B");
                const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                bClass[bNum].displayMy();
                inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
            } else if (ranRar < 542) {
                const cClass = characters.filter((e) => e.rarity === "C");
                const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                cClass[cNum].displayMy();
                inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
            } else if (ranRar < 1000) {
                const dClass = characters.filter((e) => e.rarity === "D");
                const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                dClass[dNum].displayMy();
                inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
            };

            pullCount[message.author.id + message.guild.id]++;
            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/pullCount.json', JSON.stringify(pullCount), (err) => {
                if (err) console.error(err);
            });
        };

        // Daily
        if (message.content.startsWith("!d") || message.content.startsWith("!D")) {
            var daily = JSON.parse(fs.readFileSync('Storage/daily.json', 'utf8'));
            if (!daily[message.author.id + message.guild.id]) daily[message.author.id + message.guild.id] = 0;
            if (!coins[message.author.id + message.guild.id]) coins[message.author.id + message.guild.id] = 0;

            if (daily[message.author.id + message.guild.id] < 1) {
                // Level
                let xpr = xp[message.author.id + message.guild.id];
                let level = 0;
                for (i=1; xpr >= 0; i++) {
                    xpr -= Math.floor(5*Math.log(i)*Math.log(i)*Math.log(i) + 20);
                    level++;
                };
                dailyCoins = 200 + (Math.floor(level/2)*10);
                coins[message.author.id + message.guild.id] += dailyCoins;
                daily[message.author.id + message.guild.id]++;
                message.channel.send(`Added ${dailyCoins} coins to your balance`);
            } else {
                return message.channel.send("You have already claimed your daily");
            };

            fs.writeFile('Storage/daily.json', JSON.stringify(daily), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                if (err) console.error(err);
            });
        };

        // Inventory
        if (message.content.startsWith("!inv") || message.content.startsWith("!Inv") || message.content.startsWith("!iNv") || message.content.startsWith("!inV") || message.content.startsWith("!INv") || message.content.startsWith("!InV") || message.content.startsWith("!iNV") || message.content.startsWith("!INV")) {
            
            let user = message.author;
            if (message.mentions.users.first()) user = message.mentions.users.first();

            if (!inventory[user.id + message.guild.id]) {
                if (user.id === message.author.id) {
                    return message.channel.send("You don't have any characters");
                } else {
                    return message.channel.send(`${user.username} has no characters`);
                };
            };

            const inv = [];
            for (i=0; i < inventory[user.id + message.guild.id].length; i++) {
                inv.push(inventory[user.id + message.guild.id][i]);
            };
            
            const uniq =  inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);

            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]].name);
            };

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (!isNaN(parseInt(args[0])) && parseInt(args[0]) <= pagesTotal) {
                currPage = parseInt(args[0]);
            };

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[user.id + message.guild.id]) thumbnail = characters[favChar[user.id + message.guild.id]].image;

            if (uniq.length < 16) {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(chars.join('\n'))
                .setFooter(`Page 1/1`)
                message.channel.send(Embed);
            } else {
                let left = uniq.length % 15;
                let showChars = [];
                if (currPage < pagesTotal) {
                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                        showChars.push(chars[i]);
                    };
                } else {
                    for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                        showChars.push(chars[i]);
                    };
                };
                
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(showChars.join('\n'))
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                message.channel.send(Embed).then(msg => {
                    msg.react("⏪").then(r => {
                        msg.react("⏩");

                        const prevFilter = (reaction, user1) => reaction.emoji.name === "⏪" && user1.id === message.author.id;
                        const nextFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                        const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                        const next = msg.createReactionCollector(nextFilter, {time: 60000});

                        prev.on('collect', r => {
                            if (currPage > 1) {
                                currPage--;
                            } else {
                                currPage = pagesTotal;
                            };
                            let showChars = [];
                            if (currPage < pagesTotal) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showChars.push(chars[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showChars.push(chars[i]);
                                };
                            };
                            Embed.setDescription(showChars.join('\n')).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏪").users.remove(message.author);
                        });
                          
                        next.on('collect', r => {
                            if (currPage < pagesTotal) {
                                currPage++;
                            } else {
                                currPage = 1;
                            };
                            let showChars = [];
                            if (currPage < pagesTotal) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showChars.push(chars[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showChars.push(chars[i]);
                                };
                            };
                            Embed.setDescription(showChars.join('\n')).setFooter(`Page ${currPage}/${pagesTotal}`);
                            msg.edit(Embed);
                            msg.reactions.resolve("⏩").users.remove(message.author);
                        });
                    });
                });
            };

        };

        // Sell
        if (message.content.startsWith("!se") || message.content.startsWith("!Se") || message.content.startsWith("!sE") || message.content.startsWith("!SE")) {

            if (!args[0]) return message.channel.send("Please provide a name or ID");

            const inv = [];
            for (i=0; i < inventory[message.author.id + message.guild.id].length; i++) {
                inv.push(inventory[message.author.id + message.guild.id][i]);
            };

            if (!isNaN(args[0]) && args[0] < characters.length && !args[1]) {
                if (!inv.some((e) => e == args[0])) return message.channel.send(`You don't have a copy of **${characters[args[0]].name}**`);

                price = 0;
                if (characters[args[0]].rarity === "SS") price = 5000;
                if (characters[args[0]].rarity === "S") price = 1000;
                if (characters[args[0]].rarity === "A") price = 500;
                if (characters[args[0]].rarity === "B") price = 250;
                if (characters[args[0]].rarity === "C") price = 100;
                if (characters[args[0]].rarity === "D") price = 50;
                message.channel.send(`Are you sure you want to sell **${characters[args[0]].name}** for **${price}**<:coins:872926669055356939>?`).then(msg => {
                    msg.react("☑️").then(r => {
                        msg.react("❎");

                        const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                        const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                        const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                        const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});

                        confirm.on('collect', r => {
                            let indx = inventory[message.author.id + message.guild.id].indexOf(parseInt(args[0]));
                            inventory[message.author.id + message.guild.id].splice(indx, 1);
                            coins[message.author.id + message.guild.id] += price;

                            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                                if (err) console.error(err);
                            });
                            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                                if (err) console.error(err);
                            });
                            message.channel.send(`**${price}**<:coins:872926669055356939> were added to your balance`);
                            confirm.stop();
                            cancel.stop();
                        });

                        cancel.on('collect', r=> {
                            message.channel.send("Action cancelled")
                            confirm.stop();
                            cancel.stop();
                        });

                    });
                });
                return;
            } else if (!isNaN(args[0]) && args[0] >= characters.length && !args[1]) {
                return message.channel.send("The ID must be smaller than " + characters.length);
            };

            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                if (!inv.some((e) => e == fastCheck[0].id)) return message.channel.send(`You don't have a copy of **${fastCheck[0].name}**`);

                price = 0;
                if (fastCheck[0].rarity === "SS") price = 5000;
                if (fastCheck[0].rarity === "S") price = 1000;
                if (fastCheck[0].rarity === "A") price = 500;
                if (fastCheck[0].rarity === "B") price = 250;
                if (fastCheck[0].rarity === "C") price = 100;
                if (fastCheck[0].rarity === "D") price = 50;

                message.channel.send(`Are you sure you want to sell **${fastCheck[0].name}** for **${price}**<:coins:872926669055356939>?`).then(msg => {
                    msg.react("☑️").then(r => {
                        msg.react("❎");

                        const confirmFilter = (reaction, user) => reaction.emoji.name === "☑️" && user.id === message.author.id;
                        const cancelFilter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
                        const confirm = msg.createReactionCollector(confirmFilter, {time: 15000});
                        const cancel = msg.createReactionCollector(cancelFilter, {time: 15000});

                        confirm.on('collect', r => {
                            let indx = inventory[message.author.id + message.guild.id].indexOf(fastCheck[0].id);
                            inventory[message.author.id + message.guild.id].splice(indx, 1);
                            coins[message.author.id + message.guild.id] += price;

                            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                                if (err) console.error(err);
                            });
                            fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                                if (err) console.error(err);
                            });
                            message.channel.send(`**${price}**<:coins:872926669055356939> were added to your balance`);
                            confirm.stop();
                            cancel.stop();
                        });

                        cancel.on('collect', r=> {
                            message.channel.send("Action cancelled")
                            confirm.stop();
                            cancel.stop();
                        });
                    });
                });
            } else {
                message.channel.send("No match found. Please use the characters full name");
            };
            return;
        };

        // Level
        if (message.content.startsWith("!l") || message.content.startsWith("!L")) {
            if (!xp[message.author.id + message.guild.id]) return message.channel.send("You haven't started playing the game yet");
            
            let xpr = xp[message.author.id + message.guild.id];
            let level = 0;
            for (i=1; xpr >= 0; i++) {
                xpr -= Math.floor(5*Math.log(i)*Math.log(i)*Math.log(i) + 20);
                level++;
            };

            const inv = [];
            for (i=0; i < inventory[message.author.id + message.guild.id].length; i++) {
                inv.push(inventory[message.author.id + message.guild.id][i]);
            };
            const uniq =  inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (favChar[message.author.id + message.guild.id]) thumbnail = characters[favChar[message.author.id + message.guild.id]].image;

            let xpTotal = Math.floor(5*Math.log(level)*Math.log(level)*Math.log(level) + 20);
            let percent = Math.floor(((xpTotal+xpr)/(xpTotal))*1000);
            let bar = "";
            if (percent >= 0 && percent < 125) bar = "<:barLh:872111263747035177><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 125 && percent < 250) bar = "<:barL:872111285741969438><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 250 && percent < 375) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 375 && percent < 500) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 500 && percent < 625) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 625 && percent < 750) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 750 && percent < 875) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 875 && percent < 1000) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barRh:872111194188705848>";

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${message.author.username}'s Level`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("Current Level: **" + level + "**\nXP required to level up: **" + -xpr + "**\n" + bar)
            .setThumbnail(thumbnail)
            message.channel.send(Embed);
        };

        // Top
        if (message.content.startsWith("!t") || message.content.startsWith("!T")) {

            let keys = Object.keys(xp);
            console.log(keys);
        };

        // Stats
        if (message.content.startsWith("!st") || message.content.startsWith("!St") || message.content.startsWith("!sT") || message.content.startsWith("!ST")) {
            const waifuT = characters.filter((e) => e.gender === "F");
            const husbT = characters.filter((e) => e.gender === "M");
            const charT = waifuT.length + husbT.length;
            const ssT = characters.filter((e) => e.rarity === "SS");
            const sT = characters.filter((e) => e.rarity === "S");
            const aT = characters.filter((e) => e.rarity === "A");
            const bT = characters.filter((e) => e.rarity === "B");
            const cT = characters.filter((e) => e.rarity === "C");
            const dT = characters.filter((e) => e.rarity === "D");

            const animeNames = [];
            for (i=0; i < Object.keys(characters).length; i++) {
                animeNames.push(characters[i].anime);
            };
            const uniq =  animeNames.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Card Game Stats")
            .setDescription("")
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .addFields(
                { name: 'Characters', value: "<:Rem:869894433385095198> **Waifu total**: " + waifuT.length + "\n<:Yato:869897062672642118> **Husbando total**: " + husbT.length + "\n<:Gawrgura:869894477752447007> **Characters total**: " + charT, inline: true},
                { name: 'Anime', value: "<:Menhera:869913008686649374> **Anime total**: " + uniq.length, inline: true },
                { name: '\u200B', value: '_ _' },
                { name: 'Rarity', value: "<:SSTier:869316489931546644> **Tier**: " + ssT.length + "\n<:ATier:869316558013464627> **Tier**: " + aT.length + "\n<:CTier:869316602858991657> **Tier**: " + cT.length, inline: true },
                { name: '_ _', value: "<:STier:869316518675095552> **Tier**: " + sT.length + "\n<:BTier:869316586803179571> **Tier**: " + bT.length + "\n<:DTier:869316616071032843> **Tier**: " + dT.length, inline: true },
            )
            message.channel.send(Embed);
        };

        // Owned Characters
        if (message.content.startsWith("!im") || message.content.startsWith("!Im") || message.content.startsWith("!iM") || message.content.startsWith("!IM")) {

            if (!args[0]) {
                return message.channel.send("Please provide a name");
            };

            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                if (inventory[message.author.id + message.guild.id].some((e) => e === fastCheck[0].id)) {
                    return fastCheck[0].displayIm();
                } else {
                    return message.channel.send("You don't own this card");
                };
            };

            let fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

            let i = 0;
            
            for (j=0; j < args.length; j++) {
                let argsW = args[j].length;

                while (argsW > 0) {
                    fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                    argsW--;
                    i++;
                };

                i = 0;
                if (fArray.length < 2) {
                    j = args.length;
                };
            };
            
            if (fArray.length === 0) {
                return message.channel.send("No match found");
            };

            if (fArray.length > 1) {
                return message.channel.send(fArray.length + " matches found");
            };
            if (inventory[message.author.id + message.guild.id].some((e) => e === fArray[0].id)) {
                fArray[0].displayIm();
            } else {
                message.channel.send("You don't own this card")
            };
            
        };

        // Charakter search
        if (message.content.startsWith("!i ") || message.content.startsWith("!I ") || message.content === "!i" || message.content === "!I" || message.content.startsWith("!inf") || message.content.startsWith("!Inf") || message.content.startsWith("!iNf") || message.content.startsWith("!inF") || message.content.startsWith("!INf") || message.content.startsWith("!InF") || message.content.startsWith("!iNF") || message.content.startsWith("!INF")) {

            if (!args[0]) {
                return message.channel.send("Please provide a name");
            };
            
            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                return fastCheck[0].display();
            };

            let fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

            let i = 0;
            
            for (j=0; j < args.length; j++) {
                let argsW = args[j].length;

                while (argsW > 0) {
                    fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[j] === undefined ? false :  e.name.toLowerCase().split(" ")[j][i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
                    argsW--;
                    i++;
                };

                i = 0;
                if (fArray.length < 2) {
                    j = args.length;
                };
            };

            if (fArray.length === 0) {
                return message.channel.send("No match found");
            };

            if (fArray.length > 1) {
                return message.channel.send(fArray.length + " matches found");
            };
            fArray[0].display();
            
        };

        // Anime search
        if (message.content.startsWith("!s ") || message.content.startsWith("!S ") || message.content === "!s" || message.content === "!S" || message.content.startsWith("!se") || message.content.startsWith("!Se") || message.content.startsWith("!sE") || message.content.startsWith("!SE")) {
            
            if (!args[0]) {
                return message.channel.send("Please provide a name");
            };

            const inv = [];
            for (i=0; i < inventory[message.author.id + message.guild.id].length; i++) {
                inv.push(inventory[message.author.id + message.guild.id][i]);
            };
            const uniq = inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]]);
            };

            let fastCheck = characters.filter((e) => e.anime.toLowerCase() === args.join(' ').toLowerCase() || e.anialias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {

                let charNames = [];
                for (i=0; i < fastCheck.length; i++) {
                    charNames.push(fastCheck[i].name);
                };

                let ssChars = fastCheck.filter((b) => b.rarity === "SS");
                let sChars = fastCheck.filter((b) => b.rarity === "S");
                let aChars = fastCheck.filter((b) => b.rarity === "A");
                let bChars = fastCheck.filter((b) => b.rarity === "B");
                let cChars = fastCheck.filter((b) => b.rarity === "C");
                let dChars = fastCheck.filter((b) => b.rarity === "D");

                function tierNames (t, arr) {
                    for (h=0; h < t.length; h++) {
                        arr.push(t[h].name);
                    };
                    return arr;
                };

                let ssCharsN = [];
                let sCharsN = [];
                let aCharsN = [];
                let bCharsN = [];
                let cCharsN = [];
                let dCharsN = [];

                let desc = "";
                
                if (ssChars[0]) desc += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNames(ssChars, ssCharsN).join("\n> ");
                if (sChars[0]) desc += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNames(sChars, sCharsN).join("\n> ");
                if (aChars[0]) desc += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNames(aChars, aCharsN).join("\n> ");
                if (bChars[0]) desc += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNames(bChars, bCharsN).join("\n> ");
                if (cChars[0]) desc += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNames(cChars, cCharsN).join("\n> ");
                if (dChars[0]) desc += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNames(dChars, dCharsN).join("\n> ");

                let charsOwned = chars.filter((b) => b.anime === fastCheck[0].anime);
                let allChars = ssChars.concat(sChars).concat(aChars).concat(bChars).concat(cChars).concat(dChars);

                if (charNames.length < 16) {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setTitle(`**${fastCheck[0].anime}** (` + charsOwned.length + "/" + charNames.length + ")")
                    .setThumbnail(allChars[0].image)
                    .setDescription(desc)
                    .setFooter(`Page 1/1`)
                    message.channel.send(Embed);
                } else {
                    let pagesTotal = Math.ceil(charNames.length / 15);
                    let currPage = 1;
                    
                    let left = allChars.length % 15;
                    let showChars = [];
                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                        showChars.push(allChars[i]);
                    };
                    
                    let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                    let sFiltered = showChars.filter((b) => b.rarity === "S");
                    let aFiltered = showChars.filter((b) => b.rarity === "A");
                    let bFiltered = showChars.filter((b) => b.rarity === "B");
                    let cFiltered = showChars.filter((b) => b.rarity === "C");
                    let dFiltered = showChars.filter((b) => b.rarity === "D");

                    let ssFiltrN = [];
                    let sFiltrN = [];
                    let aFiltrN = [];
                    let bFiltrN = [];
                    let cFiltrN = [];
                    let dFiltrN = [];

                    let description = "";

                    if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNames(ssFiltered, ssFiltrN).join("\n> ");
                    if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNames(sFiltered, sFiltrN).join("\n> ");
                    if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNames(aFiltered, aFiltrN).join("\n> ");
                    if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNames(bFiltered, bFiltrN).join("\n> ");
                    if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNames(cFiltered, cFiltrN).join("\n> ");
                    if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNames(dFiltered, dFiltrN).join("\n> ");

                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setTitle(`**${fastCheck[0].anime}** (` + charsOwned.length + "/" + charNames.length + ")")
                    .setThumbnail(allChars[0].image)
                    .setDescription(description)
                    .setFooter(`Page ${currPage}/${pagesTotal}`)
                    message.channel.send(Embed).then(msg => {
                        msg.react("⏪").then(r => {
                            msg.react("⏩");

                            const prevFilter = (reaction, user) => reaction.emoji.name === "⏪" && user.id === message.author.id;
                            const nextFilter = (reaction, user) => reaction.emoji.name === "⏩" && user.id === message.author.id;
                            const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                            const next = msg.createReactionCollector(nextFilter, {time: 60000});

                            prev.on('collect', r => {
                                if (currPage > 1) {
                                    currPage--;
                                } else {
                                    currPage = pagesTotal;
                                };

                                let showChars = [];
                                if (currPage < pagesTotal) {
                                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                        showChars.push(allChars[i]);
                                    };
                                } else {
                                    for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                        showChars.push(allChars[i]);
                                    };
                                };

                                let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                                let sFiltered = showChars.filter((b) => b.rarity === "S");
                                let aFiltered = showChars.filter((b) => b.rarity === "A");
                                let bFiltered = showChars.filter((b) => b.rarity === "B");
                                let cFiltered = showChars.filter((b) => b.rarity === "C");
                                let dFiltered = showChars.filter((b) => b.rarity === "D");
            
                                let ssFiltrN = [];
                                let sFiltrN = [];
                                let aFiltrN = [];
                                let bFiltrN = [];
                                let cFiltrN = [];
                                let dFiltrN = [];
            
                                let description = "";
            
                                if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNames(ssFiltered, ssFiltrN).join("\n> ");
                                if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNames(sFiltered, sFiltrN).join("\n> ");
                                if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNames(aFiltered, aFiltrN).join("\n> ");
                                if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNames(bFiltered, bFiltrN).join("\n> ");
                                if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNames(cFiltered, cFiltrN).join("\n> ");
                                if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNames(dFiltered, dFiltrN).join("\n> ");

                                Embed.setDescription(description).setFooter(`Page ${currPage}/${pagesTotal}`);
                                msg.edit(Embed);
                                msg.reactions.resolve("⏪").users.remove(message.author);
                            });

                            next.on('collect', r => {
                                if (currPage < pagesTotal) {
                                    currPage++;
                                } else {
                                    currPage = 1;
                                };

                                let showChars = [];
                                if (currPage < pagesTotal) {
                                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                        showChars.push(allChars[i]);
                                    };
                                } else {
                                    for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                        showChars.push(allChars[i]);
                                    };
                                };

                                let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                                let sFiltered = showChars.filter((b) => b.rarity === "S");
                                let aFiltered = showChars.filter((b) => b.rarity === "A");
                                let bFiltered = showChars.filter((b) => b.rarity === "B");
                                let cFiltered = showChars.filter((b) => b.rarity === "C");
                                let dFiltered = showChars.filter((b) => b.rarity === "D");
            
                                let ssFiltrN = [];
                                let sFiltrN = [];
                                let aFiltrN = [];
                                let bFiltrN = [];
                                let cFiltrN = [];
                                let dFiltrN = [];
            
                                let description = "";
            
                                if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNames(ssFiltered, ssFiltrN).join("\n> ");
                                if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNames(sFiltered, sFiltrN).join("\n> ");
                                if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNames(aFiltered, aFiltrN).join("\n> ");
                                if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNames(bFiltered, bFiltrN).join("\n> ");
                                if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNames(cFiltered, cFiltrN).join("\n> ");
                                if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNames(dFiltered, dFiltrN).join("\n> ");

                                Embed.setDescription(description).setFooter(`Page ${currPage}/${pagesTotal}`);
                                msg.edit(Embed);
                                msg.reactions.resolve("⏩").users.remove(message.author);
                            });

                        });
                    });

                };
            };
        };

        // List all anime
        if (message.content.startsWith("!a") || message.content.startsWith("!A")) {
            let anime = [];
            for (i=0; i < characters.length; i++) {
                anime.push(characters[i].anime);
            };

            let uniq = anime.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);
            uniq = uniq.sort();

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (!isNaN(parseInt(args[0])) && parseInt(args[0]) <= pagesTotal) {
                currPage = parseInt(args[0]);
            };

            let left = uniq.length % 15;
            let showAnime = [];
            if (currPage < pagesTotal) {
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showAnime.push(uniq[i]);
                };
            } else {
                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                    showAnime.push(uniq[i]);
                };
            };

            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`**Anime Included** (${uniq.length})`)
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .setDescription(showAnime)
            .setFooter(`Page ${currPage}/${pagesTotal}`)
            message.channel.send(Embed).then(msg => {
                msg.react("⏪").then(r => {
                    msg.react("⏩");

                    const prevFilter = (reaction, user) => reaction.emoji.name === "⏪" && user.id === message.author.id;
                    const nextFilter = (reaction, user) => reaction.emoji.name === "⏩" && user.id === message.author.id;
                    const prev = msg.createReactionCollector(prevFilter, {time: 60000});
                    const next = msg.createReactionCollector(nextFilter, {time: 60000});

                    prev.on('collect', r => {
                        if (currPage > 1) {
                            currPage--;
                        } else {
                            currPage = pagesTotal;
                        };

                        let showAnime = [];
                        if (currPage < pagesTotal) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showAnime.push(uniq[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showAnime.push(uniq[i]);
                            };
                        };

                        Embed.setDescription(showAnime).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏪").users.remove(message.author);
                    });

                    next.on('collect', r => {
                        if (currPage < pagesTotal) {
                            currPage++;
                        } else {
                            currPage = 1;
                        };

                        let showAnime = [];
                        if (currPage < pagesTotal) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showAnime.push(uniq[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showAnime.push(uniq[i]);
                            };
                        };

                        Embed.setDescription(showAnime).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit(Embed);
                        msg.reactions.resolve("⏩").users.remove(message.author);
                    });
                });
            });
            
        };

    }
};