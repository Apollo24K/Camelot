const { Console, time } = require("console");
const { MessageEmbed, Message } = require("discord.js");
const prefix = "§";

var fs = require('fs');
const { to, e } = require("mathjs");
var inventory = JSON.parse(fs.readFileSync('Storage/inventory.json', 'utf8'));
var pullcount = JSON.parse(fs.readFileSync('Storage/pullcount.json', 'utf8'));
var pulltime = JSON.parse(fs.readFileSync('Storage/pulltime.json', 'utf8'));
var favChar = JSON.parse(fs.readFileSync('Storage/favchar.json', 'utf8'));


module.exports = {
    name: 'characters',
    description: 'Characters',
    execute(message, args, disbut, client) {

        function rarity(a) {
            if (a === "SS") {
                return "https://i.imgur.com/n3qj4i2.png";
            } else if (a === "S") {
                return "https://i.imgur.com/aSXEB8J.png";
            } else if (a === "A") {
                return "https://i.imgur.com/MNNSMIP.png";
            } else if (a === "B") {
                return "https://i.imgur.com/C8GpHnb.png";
            } else if (a === "C") {
                return "https://i.imgur.com/bF4Uwq7.png";
            } else if (a === "D") {
                return "https://i.imgur.com/qHR5lBz.png";
            } else {
                return "https://i.imgur.com/zPpfb14.jpeg";
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
                    refinement = "<:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
                } else if (dupes.length < 2) {
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
                .setFooter("You have " + (dupes.length + 1) + ` ${copy} of this`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
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
            new charInfo("Donquixote Rosinante", ["Corazon"], "One Piece", "", "M", "https://i.imgur.com/lbg3UeV.png", 0, "SS"),
            new charInfo("Zenitsu Agatsuma", [], "Demon Slayer", "", "M", "https://i.imgur.com/P54BqWy.png", 1, "A"),
            new charInfo("Nino Nakano", [], "5-toubun no Hanayome", "", "F", "https://imgur.com/k0CY0zg.jpg", 2, "S"),
            new charInfo("Miku Nakano", [], "5-toubun no Hanayome", "", "F", "https://imgur.com/YBkHZ1D.jpg", 3, "S"),
            new charInfo("Itsuki Nakano", [], "5-toubun no Hanayome", "", "F", "https://i.imgur.com/zGURdtZ.png", 4, "A"),
            new charInfo("Yotsuba Nakano", [], "5-toubun no Hanayome", "", "F", "https://i.imgur.com/2VgyqAm.png", 5, "B"),
            new charInfo("Ichika Nakano", [], "5-toubun no Hanayome", "", "F", "https://i.imgur.com/1SpSENc.png", 6, "B"),
            new charInfo("Fuutarou Uesugi", [], "5-toubun no Hanayome", "", "M", "https://i.imgur.com/C16wbDI.png", 7, "B"),
            new charInfo("Raiha Uesugi", [], "5-toubun no Hanayome", "", "F", "https://i.imgur.com/qb5AL7S.png", 8, "C"),
            new charInfo("Isanari Uesugi", [], "5-toubun no Hanayome", "", "M", "https://i.imgur.com/FXG4kPy.png", 9, "D"),
            new charInfo("Maruo Nakano", [], "5-toubun no Hanayome", "", "M", "https://i.imgur.com/Di6ChiN.png", 10, "D"),
            new charInfo("Matsui", [], "5-toubun no Hanayome", "", "F", "https://i.imgur.com/xSvNNhu.png", 11, "D"),
            new charInfo("Victorique de Blois", ["The Golden Fairy", "Gray Wolf", "Monstre Charmant"], "Gosick", "", "F", "https://imgur.com/CzoxzRi.png", 12, "A"),
            new charInfo("Kazuya Kujou", ["The Black Reaper", "Baby Squirrel"], "Gosick", "", "M", "https://imgur.com/yR8KV9T.png", 13, "C"),
            new charInfo("Cordelia Gallo", [], "Gosick", "", "F", "https://i.imgur.com/l57SjsC.png", 14, "D"),
            new charInfo("Brian Roscoe", [], "Gosick", "", "M", "https://i.imgur.com/xmmaaSg.png", 15, "D"),
            new charInfo("Grevil de Blois", ["Pointy Head"], "Gosick", "", "M", "https://i.imgur.com/Gtrm63p.png", 16, "D"),
            new charInfo("Cecile Lafitte", [], "Gosick", "", "F", "https://i.imgur.com/zEYYK0p.png", 17, "C"),
            new charInfo("Avril Bradley", [], "Gosick", "", "F", "https://i.imgur.com/jLggZGx.png", 18, "D"),
            new charInfo("Ambrose", [], "Gosick", "", "M", "https://i.imgur.com/qDKFDC2.png", 19, "D"),
            new charInfo("Albert de Blois", [], "Gosick", "", "M", "https://i.imgur.com/FjKzWUp.png", 20, "D"),
            new charInfo("Izumi Miyamura", [], "Horimiya", "", "M", "https://imgur.com/DmQ4GTu.png", 21, "B"),
            new charInfo("Kyouko Hori", [], "Horimiya", "", "F", "https://i.imgur.com/ptPDIdN.png", 22, "S"),
            new charInfo("Yuki Yoshikawa", [], "Horimiya", "", "F", "https://i.imgur.com/lR1DeLm.png", 23, "A"),
            new charInfo("Kyousuke Hori", [], "Horimiya", "", "M", "https://i.imgur.com/40oXTnX.png", 24, "D"),
            new charInfo("Honoka Sawada", [], "Horimiya", "", "F", "https://i.imgur.com/TsYGnEj.png", 25, "B"),
            new charInfo("Tooru Ishikawa", [], "Horimiya", "", "M", "https://imgur.com/xN5ahlV.png", 26, "C"),
            new charInfo("Akane Yanagi", [], "Horimiya", "", "M", "https://imgur.com/nGctW1M.png", 27, "D"),
            new charInfo("Remi Ayasaki", [], "Horimiya", "", "F", "https://imgur.com/c89Ykp6.png", 28, "B"),
            new charInfo("Shuu Iura", [], "Horimiya", "", "M", "https://imgur.com/0HGcmqI.png", 29, "D"),
            new charInfo("Sakura Kouno", [], "Horimiya", "", "F", "https://imgur.com/GWXtjHZ.png", 30, "D"),
            new charInfo("Kouichi Shindou", [], "Horimiya", "", "M", "https://i.imgur.com/aTgvaln.png", 31, "D"),
            new charInfo("Yume", [], "Grimgar: Ashes and Illusions", "", "F", "https://i.imgur.com/uViM4Px.png", 32, "B"),
            new charInfo("Merry", [], "Grimgar: Ashes and Illusions", "", "F", "https://i.imgur.com/LwMW67M.png", 33, "A"),
            new charInfo("Haruhiro", ["Hal"], "Grimgar: Ashes and Illusions", "", "M", "https://i.imgur.com/teozchH.png", 34, "C"),
            new charInfo("Manato", [], "Grimgar: Ashes and Illusions", "", "M", "https://i.imgur.com/XjqMQq9.png", 35, "C"),
            new charInfo("Ranta", [], "Grimgar: Ashes and Illusions", "", "M", "https://i.imgur.com/gUPRek1.png", 36, "C"),
            new charInfo("Shihoru", [], "Grimgar: Ashes and Illusions", "", "F", "https://i.imgur.com/3yisyUF.png", 37, "B"),
            new charInfo("Moguzo", [], "Grimgar: Ashes and Illusions", "", "M", "https://i.imgur.com/FMq2r44.png", 38, "C"),
            new charInfo("Barbara", [], "Grimgar: Ashes and Illusions", "", "F", "https://i.imgur.com/4GF6SHD.png", 39, "D"),
            new charInfo("Renji", [], "Grimgar: Ashes and Illusions", "", "M", "https://i.imgur.com/kQ6gh4o.png", 40, "C"),
            new charInfo("Chibi", [], "Grimgar: Ashes and Illusions", "", "F", "https://i.imgur.com/6HYneZF.png", 41, "D"),
            new charInfo("Choco", [], "Grimgar: Ashes and Illusions", "", "F", "https://i.imgur.com/zAyBN0F.png", 42, "C"),
            new charInfo("Aka Onda", [], "Rec", "", "F", "https://i.imgur.com/GCZGr6J.png", 43, "B"),
            new charInfo("Fumihiko Matsumaru", [], "Rec", "", "M", "https://i.imgur.com/R1HhmuN.png", 44, "D"),
            new charInfo("Tanaka (Rec)", [], "Rec", "", "F", "https://i.imgur.com/pio3oZz.png", 45, "D"),
            new charInfo("Yoshio Hatakeda", [], "Rec", "", "M", "https://i.imgur.com/tq57MkG.png", 46, "D"),
            new charInfo("Hyakkimaru", [], "Dororo", "", "M", "https://i.imgur.com/xBSmo3h.png", 47, "A"),
            new charInfo("Dororo", [], "Dororo", "", "F", "https://i.imgur.com/tyhcXQZ.png", 48, "A"),
            new charInfo("Mio", [], "Dororo", "", "F", "https://i.imgur.com/FjgZFIA.png", 49, "C"),
            new charInfo("Jukai", [], "Dororo", "", "M", "https://i.imgur.com/CMOKmMu.png", 50, "D"),
            new charInfo("Tahoumaru", [], "Dororo", "", "M", "https://i.imgur.com/rjOU6h5.png", 51, "D"),
            new charInfo("Shichika Yasuri", [], "Katanagatari", "", "M", "https://i.imgur.com/7HbQTwq.png", 52, "C"),
            new charInfo("Togame", [], "Katanagatari", "", "F", "https://i.imgur.com/17UfgzO.png", 53, "B"),
            new charInfo("Nanami Yasuri", [], "Katanagatari", "", "F", "https://i.imgur.com/uKfujyB.png", 54, "C"),
            new charInfo("Hitei", [], "Katanagatari", "", "F", "https://imgur.com/VzFnIEd.png", 55, "C"),
            new charInfo("Emonzaemon Souda", [], "Katanagatari", "", "M", "https://i.imgur.com/nUGJEIl.png", 56, "D"),
            new charInfo("Rinne Higaki", [], "Katanagatari", "", "M", "https://i.imgur.com/PUOy7jE.png", 57, "D"),
            new charInfo("Meisai Tsuruga", [], "Katanagatari", "", "F", "https://i.imgur.com/DnQ0Hi0.png", 58, "C"),
            new charInfo("Houou Maniwa", [], "Katanagatari", "", "M", "https://i.imgur.com/j2y2k5y.png", 59, "D"),
            new charInfo("Zanki Kiguchi", [], "Katanagatari", "", "F", "https://i.imgur.com/3ozpmGT.png", 60, "D"),
            new charInfo("Kyouken Maniwa", [], "Katanagatari", "", "F", "https://i.imgur.com/NvW06O5.png", 61, "C"),
            new charInfo("Hakuhei Sabi", [], "Katanagatari", "", "M", "https://i.imgur.com/tahoP8r.png", 62, "C"),
            new charInfo("Ginkaku Uneri", [], "Katanagatari", "", "M", "https://i.imgur.com/fjx6qck.png", 63, "D"),
            new charInfo("Fushi", [], "Fumetsu no Anata e", "", "M", "https://i.imgur.com/LZPJ0gY.png", 64, "SS"),
            new charInfo("Parona", [], "Fumetsu no Anata e", "", "F", "https://i.imgur.com/9Sfze53.png", 65, "A"),
            new charInfo("Gugu", [], "Fumetsu no Anata e", "", "M", "https://i.imgur.com/wzoaRMk.png", 66, "S"),
            new charInfo("March", [], "Fumetsu no Anata e", "", "F", "https://i.imgur.com/LVaAF6d.png", 67, "B"),
            new charInfo("Rynn Cropp", [], "Fumetsu no Anata e", "", "F", "https://i.imgur.com/38Rsjgl.png", 68, "C"),
            new charInfo("Tonari Dalton", [], "Fumetsu no Anata e", "", "F", "https://i.imgur.com/8pY6nN6.png", 69, "C"),
            new charInfo("Pyoran", [], "Fumetsu no Anata e", "", "F", "https://i.imgur.com/R8DptII.png", 70, "D"),
            new charInfo("Hayase", [], "Fumetsu no Anata e", "", "F", "https://i.imgur.com/5zNO8wY.png", 71, "D"),
            new charInfo("Yuuki Asuna", ["Asuna Yuuki"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/hFfvuHy.png", 72, "SS"),
            new charInfo("Kirigaya Kazuto", ["Kirito", "Kazuto Kirigaya", "Beater"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/xCuvs7C.png", 73, "A"),
            new charInfo("Alice Zuberg", ["Synthesis Thirty"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/c3LXIFJ.jpeg", 74, "S"),
            new charInfo("Konno Yuuki", ["Yuuki Konno"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/CkxbsJb.png", 75, "S"),
            new charInfo("Kirigaya Suguha", ["Leafa", "Suguha Kirigaya"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/rUglxLU.png", 76, "A"),
            new charInfo("Sinon", ["Asada Shino"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/GPA9sj0.png", 77, "A"),
            new charInfo("Eugeo", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/oKmV7V4.png", 78, "B"),
            new charInfo("Quinella", ["Administrator"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://imgur.com/He45omC.png", 79, "B"),
            new charInfo("Yui", ["Yui-MHCP001"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://imgur.com/HlT0odh.png", 80, "B"),
            new charInfo("Klein", ["Tsuboi Ryoutarou"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/KXY2HyV.png", 81, "B"),
            new charInfo("Andrew Gilbert Mills", ["Agil"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/QHkQbPU.png", 82, "C"),
            new charInfo("Silica", ["Keiko Ayano"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/ID6omse.png", 83, "B"),
            new charInfo("Lisbeth", ["Rika Shinozaki"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://imgur.com/UzVvmcY.png", 84, "B"),
            new charInfo("Kayaba Akihiko", ["Akihiko Kayaba", "Heathcliff"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/OnkWRSG.png", 85, "B"),
            new charInfo("Vassago Casals", ["PoH"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/52CWt3v.png", 86, "D"),
            new charInfo("Kuradeel", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/Zssooan.jpg", 87, "D"),
            new charInfo("Sugou Nobuyuki", ["Oberon"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/HDYuWj2.png", 88, "D"),
            new charInfo("Death Gun", ["Shinkawa Shouichi", "Sterben", "XaXa"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/iKl6G63.png", 89, "C"),
            new charInfo("Gabriel Miller", ["Subtilizer", "Veta"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/KISlyKD.png", 90, "C"),
            new charInfo("Lipia Zancale", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/d3zNKfT.png", 91, "D"),
            new charInfo("Sachi", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/DnH3cIH.png", 92, "C"),
            new charInfo("Argo", ["Hosaka Carina Tomo", "The Rat"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/5nTBcal.png", 93, "D"),
            new charInfo("Sakuya", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://imgur.com/bYAu5m3.png", 94, "D"),
            new charInfo("Alicia Rue", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/f45e09Q.png", 95, "D"),
            new charInfo("Eugene", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/BMMaZn1.jpg", 96, "D"),
            new charInfo("Selka Zuberg", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/Nm4sDFj.png", 97, "C"),
            new charInfo("Tiese Shtolienen", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/Yu8dWaa.png", 98, "C"),
            new charInfo("Ronye Arabel", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/AKrjstX.png", 99, "D"),
            new charInfo("Yuna (SAO)", ["Shigemura Yuuna", "Yuuna Shigemura"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/RTVsVH4.png", 100, "A"),
            new charInfo("Sortiliena Serlut", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/heufWsG.png", 101, "C"),
            new charInfo("Nochizawa Eiji", ["Nautilus"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/ZsmBzFD.png", 102, "C"),
            new charInfo("Shigemura Tetsuhiro", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/j0VrPyF.png?1", 103, "D"),
            new charInfo("Philia", ["Takemiya Kotone"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://imgur.com/sJcmx8P.png", 104, "B"),
            new charInfo("Strea", ["Strea-MHCP002"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/uJ6lYHt.png", 105, "C"),
            new charInfo("Rain", ["Karatachi Nijika"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://imgur.com/WWTxIC1.png", 106, "B"),
            new charInfo("Premiere", [], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://imgur.com/pkoPdhC.png", 107, "D"),
            new charInfo("Kureha", ["Takamine Momiji"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/cqlBTcf.png", 108, "B"),
            new charInfo("Kohiruimaki Karen", ["LLENN", "Pink Devil"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/cbdT6ad.png", 109, "C"),
            new charInfo("Pitohui", ["Kanzaki Elsa"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "F", "https://i.imgur.com/9tHgE6y.png", 110, "D"),
            new charInfo("Asougi Goushi", ["M (SAO)"], "Sword Art Online", ["SAO", "Alicization", "Ordinal Scale", "War of Underworld", "Gun Gale Online"], "M", "https://i.imgur.com/QKjKICa.png", 111, "D"),
            new charInfo("Kaori Miyazono", ["Kao-chan", "Miyazono Kaori"], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://imgur.com/gVq44JT.png", 112, "S"),
            new charInfo("Arima Kousei", ["Kousei Arima"], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://imgur.com/6iImUfB.png", 113, "S"),
            new charInfo("Sawabe Tsubaki", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.imgur.com/1SqCLnI.png", 114, "A"),
            new charInfo("Watari Ryota", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.imgur.com/FFMF3lp.png", 115, "B"),
            new charInfo("Aiza Takeshi", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.imgur.com/8QmEfjs.png", 116, "C"),
            new charInfo("Igawa Emi", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://imgur.com/KZblVRy.png", 117, "B"),
            new charInfo("Arima Saki", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.imgur.com/7KIKwWl.png", 118, "D"),
            new charInfo("Seto Hiroko", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.imgur.com/2pJStwH.png", 119, "C"),
            new charInfo("Aiza Nagi", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.imgur.com/QXVYRT3.png", 120, "C"),
            new charInfo("Kashiwagi Nao", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.imgur.com/24nxkMt.png", 121, "C"),
            new charInfo("Miike Toshiya", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.imgur.com/FFr2NYm.jpg", 122, "D"),
            new charInfo("Seto Koharu", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.imgur.com/d7rZiLs.png", 123, "D"),
            new charInfo("Ochiai Yuriko", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://i.imgur.com/SyexScK.jpg", 124, "D"),
            new charInfo("Takayanagi Akira", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.imgur.com/Oe9mAHj.jpg", 125, "D"),
            new charInfo("Miyazono Ryouko", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "F", "https://imgur.com/l22dDM8.png", 126, "D"),
            new charInfo("Miyazono Yoshiyuki", [], "Your Lie in April", ["Shigatsu wa Kimi no Uso", "YLiA"], "M", "https://i.imgur.com/PMzvQiD.png", 127, "D"),
            new charInfo("Hanako Honda", [], "Asobi Asobase", [], "F", "https://i.imgur.com/9tEqv2e.png", 128, "A"),
            new charInfo("Olivia", [], "Asobi Asobase", [], "F", "https://i.imgur.com/sYEz9dV.png", 129, "A"),
            new charInfo("Kasumi Nomura", [], "Asobi Asobase", [], "F", "https://i.imgur.com/hdM5wJ2.png", 130, "A"),
            new charInfo("Maeda", [], "Asobi Asobase", [], "M", "https://i.imgur.com/3chkI9X.png", 131, "D"),
            new charInfo("Tsugumi Aozora", [], "Asobi Asobase", [], "F", "https://i.imgur.com/oowniNN.png", 132, "C"),
            new charInfo("Tokuko Sharekoube", [], "Asobi Asobase", [], "F", "https://i.imgur.com/OYJc6c0.png", 133, "D"),
            new charInfo("Akira Takizawa", ["Air King"], "Eden of The East", ["Higashi no Eden"], "M", "https://i.imgur.com/dCj636b.png", 134, "B"),
            new charInfo("Saki Morimi", [], "Eden of The East", ["Higashi no Eden"], "F", "https://i.imgur.com/30TbbbV.png", 135, "B"),
            new charInfo("Kuroha Shiratori", ["Diana (HnE)"], "Eden of The East", ["Higashi no Eden"], "F", "https://i.imgur.com/kWRNreN.png", 136, "D"),
            new charInfo("Kazuomi Hirasawa", [], "Eden of The East", ["Higashi no Eden"], "M", "https://i.imgur.com/IHAz1vH.png", 137, "C"),
            new charInfo("Yutaka Itazu", [], "Eden of The East", ["Higashi no Eden"], "M", "https://i.imgur.com/WrqyVBo.png", 138, "C"),
            new charInfo("Mikuru Katsuhara", ["Micchon", "Mittan"], "Eden of The East", ["Higashi no Eden"], "F", "https://i.imgur.com/DRYnY7x.png", 139, "C"),
            new charInfo("Satoshi Ohsugi", [], "Eden of The East", ["Higashi no Eden"], "M", "https://i.imgur.com/iSrdd5K.png", 140, "D"),
            new charInfo("Yuusei Kondou", [], "Eden of The East", ["Higashi no Eden"], "M", "https://i.imgur.com/aCz13fn.png", 141, "D"),
            new charInfo("Tachibana Kanade", ["Kanade Tachibana"], "Angel Beats!", ["Angel Beats"], "F", "https://imgur.com/tu4umn4.png", 142, "SS"),
            new charInfo("Yuri Nakamura", ["Yurippe"], "Angel Beats!", ["Angel Beats"], "F", "https://imgur.com/wJ2IjyU.png", 143, "A"),
            new charInfo("Yui (AB)", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.imgur.com/QyH97El.png", 144, "A"),
            new charInfo("Yuzuru Otonashi", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.imgur.com/At0ieyA.png", 145, "B"),
            new charInfo("Hideki Hinata", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.imgur.com/KOwG8xW.png", 146, "B"),
            new charInfo("T.K.", ["TK"], "Angel Beats!", ["Angel Beats"], "M", "https://i.imgur.com/i5MGzc8.png", 147, "D"),
            new charInfo("Masami Iwasawa", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.imgur.com/rZRcZD7.png", 148, "B"),
            new charInfo("Ayato Naoi", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.imgur.com/tAYHNF0.png", 149, "C"),
            new charInfo("Shiina", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.imgur.com/ydmVgC7.png", 150, "C"),
            new charInfo("Noda", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.imgur.com/ewP4giE.png", 151, "D"),
            new charInfo("Fujimaki", [], "Angel Beats!", ["Angel Beats"], "M", "https://i.imgur.com/X0YIBZr.png", 152, "D"),
            new charInfo("Hisako", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.imgur.com/EeFoyiH.png", 153, "C"),
            new charInfo("Hitomi", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.imgur.com/tWHKPwz.png", 154, "D"),
            new charInfo("Miyuki Irie", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.imgur.com/EXYL5fS.png", 155, "C"),
            new charInfo("Yusa", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.imgur.com/hewh7sE.png", 156, "C"),
            new charInfo("Hatsune Otonashi", [], "Angel Beats!", ["Angel Beats"], "F", "https://i.imgur.com/ZSd0g5p.png", 157, "D"),
            new charInfo("Zenitsu Agatsuma", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/P54BqWy.png", 158, "S"),
            new charInfo("Tanjirou Kamado", ["Kamado Tanjirou", "Gonpachirou Kamaboko", "Kamaboko Gonpachirou", "Monjirou"], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/RqsLOue.png", 159, "S"),
            new charInfo("Mitsuri Kanroji", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/HCvkjV3.png", 160, "A"),
            new charInfo("Shinobu Kochou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/pzCg8Pn.png", 161, "S"),
            new charInfo("Kanao Tsuyuri", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/Ukj0VSo.png", 162, "A"),
            new charInfo("Giyuu Tomioka", ["Tomioka Giyuu"], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/tb3UHR6.png", 163, "A"),
            new charInfo("Inosuke Hashibira", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/lwTCWVV.png", 164, "A"),
            new charInfo("Kyoujurou Rengoku", ["Rengoku Kyoujurou"], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/0r7isIJ.png", 165, "B"),
            new charInfo("Kibutsuji Muzan", ["Muzan Kibutsuji"], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/HtDM46i.png", 166, "B"),
            new charInfo("Muichirou Tokitou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/MNvq0XX.png", 167, "C"),
            new charInfo("Enmu", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/UuHSWtS.png", 168, "B"),
            new charInfo("Aoi Kanzaki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/7Vrl6GH.png", 169, "C"),
            new charInfo("Gotou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/dSVQChd.png", 170, "D"),
            new charInfo("Hisa", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/iKea5EB.png", 171, "D"),
            new charInfo("Kozo Kanamori", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/CKaRrPu.png", 172, "D"),
            new charInfo("Hotaru Haganezuka", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/YkVIfBc.png", 173, "C"),
            new charInfo("Gyoumei Himejima", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/1f6Ikuo.png", 174, "C"),
            new charInfo("Shigeru Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/vH4emSW.png", 175, "D"),
            new charInfo("Rokuta Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/UFX3ISW.png", 176, "D"),
            new charInfo("Takeo Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/U23adFJ.png", 177, "D"),
            new charInfo("Hanako Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/GgK79YJ.png", 178, "D"),
            new charInfo("Kie Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/xWFKqPe.png", 179, "D"),
            new charInfo("Tanjuurou Kamado", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/uIi3njP.png", 180, "C"),
            new charInfo("Kamanue", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/8fQK1V5.png", 181, "D"),
            new charInfo("Kazumi", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/kgp0Cgq.png", 182, "D"),
            new charInfo("Kiyoshi", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/p2YTsPS.png", 183, "D"),
            new charInfo("Kanae Kochou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/x4WBwVX.png", 184, "B"),
            new charInfo("Jigorou Kuwajima", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/IuhUD1o.png", 185, "C"),
            new charInfo("Makomo", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/VKpog7E.png", 186, "C"),
            new charInfo("Murata", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/6NwWhzA.png", 187, "D"),
            new charInfo("Sumi Nakahara", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/YU1rRRg.png", 188, "D"),
            new charInfo("Rui", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/bWwcoY8.png", 189, "B"),
            new charInfo("Sabito", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/mVzAKFB.png", 190, "B"),
            new charInfo("Genya Shinazugawa", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/GznXxvV.png", 191, "C"),
            new charInfo("Shoichi", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/C68Eo0G.png", 192, "D"),
            new charInfo("Susamaru", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/2uuvtgW.png", 193, "D"),
            new charInfo("Naho Takada", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/kSBodEb.png", 194, "D"),
            new charInfo("Tamayo", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/BfrASpa.png", 195, "C"),
            new charInfo("Kiyo Terauchi", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/rOHiAPZ.png", 196, "D"),
            new charInfo("Kagaya Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/cefiLm7.png", 197, "C"),
            new charInfo("Kiriya Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/szZXunC.png", 198, "C"),
            new charInfo("Nichika Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/K5WlWIb.png", 199, "C"),
            new charInfo("Hinaki Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/P29sjf4.png", 200, "C"),
            new charInfo("Kanata Ubuyashiki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "F", "https://i.imgur.com/TZJQbMj.png", 201, "C"),
            new charInfo("Sakonji Urokodaki", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/XmRUdTM.png", 202, "B"),
            new charInfo("Tengen Uzui", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/1xiLGWM.png", 203, "C"),
            new charInfo("Yahaba", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/Xy5tquR.png", 204, "D"),
            new charInfo("Yushirou", [], "Demon Slayer", ["Kimetsu no Yaiba"], "M", "https://i.imgur.com/hYbg0YY.png", 205, "C"),
            new charInfo("Tsunemori Akane", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://imgur.com/pXXmN8N.png", 206, "A"),
            new charInfo("Kogami Shinya", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/5zXd1Sf.png", 207, "S"),
            new charInfo("Makishima Shogo", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://imgur.com/KvDyljr.png", 208, "S"),
            new charInfo("Ginoza Nobuchika", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://imgur.com/mO0sVao.png", 209, "A"),
            new charInfo("Kunidzuka Yayoi", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.imgur.com/kyIqsJC.png", 210, "A"),
            new charInfo("Kagari Shuusei", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/zaejTyA.png", 211, "B"),
            new charInfo("Masaoka Tomomi", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/yDCcguq.png", 212, "B"),
            new charInfo("Karanomori Shion", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.imgur.com/RlJd7TX.png", 213, "B"),
            new charInfo("Saiga Jouji", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/DC2WgbE.png", 214, "B"),
            new charInfo("Aoyanagai Risa", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://imgur.com/BX10k9n.png", 215, "C"),
            new charInfo("Funahara Yuki", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.imgur.com/Lz0p9uJ.jpg", 216, "D"),
            new charInfo("Kasei Joushuu", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.imgur.com/alGkWkk.png", 217, "B"),
            new charInfo("Tougane Sakuya", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://imgur.com/xrwtsFp.png", 218, "C"),
            new charInfo("Shimotsuki Mika", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.imgur.com/4qvTIJ9.png", 219, "C"),
            new charInfo("Kamui  Kirito", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://imgur.com/Dw8ahfi.png", 220, "C"),
            new charInfo("Aikawa Tsubaki", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.imgur.com/2V8tIUJ.jpg", 221, "D"),
            new charInfo("Hasuike Kaede", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/JBaKD9R.jpg", 222, "D"),
            new charInfo("Suzuki Moe", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/oHdYKzf.jpg", 223, "D"),
            new charInfo("Hinakawa Shou", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/5Ptm39A.png", 224, "C"),
            new charInfo("Sugou Teppei", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/DsdKgAf.jpg", 225, "D"),
            new charInfo("Tougane Misako", [], "Psycho Pass", ["Psycho-Pass"], "F", "https://i.imgur.com/VeMImBi.jpg", 226, "D"),
            new charInfo("Shindou Arata", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/dGwremD.png", 227, "B"),
            new charInfo("Ignatov Kei Mikhail", [], "Psycho Pass", ["Psycho-Pass"], "M", "https://i.imgur.com/LjR1Dha.jpg", 228, "C"),
        ];
       
        // Profile
        if (message.content.startsWith("§pr") || message.content.startsWith("§Pr") || message.content.startsWith("§pR") || message.content.startsWith("§PR")) {
            
            var user
            const mentionUser =  message.guild.member(message.mentions.users.first());
            if (mentionUser) user = mentionUser.user;
            if (!mentionUser) user = message.author;

                 
            if (!inventory[user.id + message.guild.id] || inventory[user.id + message.guild.id][0] === undefined) {
                if (mentionUser) return message.channel.send(`${user.username} doesn't have any characters`);
                if (!mentionUser) return message.channel.send(`You don't have any characters`);
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

            let aniCompleted = 0;
            for (i=0; i < aTuniq.length; i++) {
                let animeCheck = characters.filter((e) => e.anime === aTuniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === aTuniq[i]).length;
                if (animeCheck === invCheck) {
                    aniCompleted++;
                };
            };
            
            // Thumbnail
            var thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image
            if (favChar[user.id + message.guild.id]) thumbnail = characters[favChar[user.id + message.guild.id]].image

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s profile`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("_ _\n**Collected**: " + collected + "/" + charsTotal + " (" + collectedF + "/" + charsTotalF + "<:female:870076411430436914> " + collectedM + "/" + charsTotalM + "<:male:870076394649047080>)\n**Completion**: " + collRatio + "% (" + collRatioF + "%<:female:870076411430436914> " + collRatioM + "%<:male:870076394649047080>)\n**Anime Completed**: " + aniCompleted + "/" + aTuniq.length)
            .setThumbnail(thumbnail)
            .addFields(
                { name: 'Rarity', value: "<:SSTier:869316489931546644> **Tier**: " + `${collSS}/${ssT}` + "\n<:ATier:869316558013464627> **Tier**: " + `${collA}/${aT}` + "\n<:CTier:869316602858991657> **Tier**: " + `${collC}/${cT}`, inline: true },
                { name: '_ _', value: "<:STier:869316518675095552> **Tier**: " + `${collS}/${sT}` + "\n<:BTier:869316586803179571> **Tier**: " + `${collB}/${bT}` + "\n<:DTier:869316616071032843> **Tier**: " + `${collD}/${dT}`, inline: true },
            )
            message.channel.send(Embed);
            
            return;
        };

        // Favourite Character

        if (message.content.startsWith("§fav") || message.content.startsWith("§Fav") || message.content.startsWith("§FAv") || message.content.startsWith("§FAV") || message.content.startsWith("§fAv") || message.content.startsWith("§fAV") || message.content.startsWith("§faV")) {

            var favCharUpdate = false;
            const inv = [];
            if (!inventory[message.author.id + message.guild.id]) return message.channel.send("You don't have any characters");
            for (i=0; i < inventory[message.author.id + message.guild.id].length; i++) inv.push(inventory[message.author.id + message.guild.id][i]);

                const uniq =  inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
                },[]);

           for (i = 0; i < uniq.length; i++) 
            {
                const charArray = characters.filter((e) => e.id === uniq[i])
                const favCharArray = charArray.filter((e) => e.name === args.join(" ")); 
                if (favCharArray[0] !== undefined) {
                    favChar[message.author.id + message.guild.id] = favCharArray[0].id;
                    fs.writeFile('Storage/favchar.json', JSON.stringify(favChar), (err) => {
                        if (err) console.error(err);
                    });
        
                    const embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setTitle(`${message.author.username}'s favourite character`)
                    .setImage(characters[favChar[message.author.id + message.guild.id]].image)
                    message.channel.send(embed);

                    favCharUpdate = true;
                }
                if (favCharUpdate === false && i === uniq.length - 1) message.channel.send("Please provide a character in your inventory");
            }
        };

        // Pull
        if (message.content.startsWith("§p") || message.content.startsWith("§P")) {

             var timeMinutes = new Date().getMinutes();
            var timeHours = new Date().getHours();
            var pullReady = false;
            if (!pulltime[message.author.id + message.guild.id]) pulltime[message.author.id + message.guild.id] = [];
            if (pullcount[message.author.id + message.guild.id] === null || pullcount[message.author.id + message.guild.id] === undefined || !(pullcount[message.author.id + message.guild.id]) && pullcount[message.author.id + message.guild.id] != 0) pullcount[message.author.id + message.guild.id] = -1;
            if(pulltime[message.author.id + message.guild.id][0] > timeHours) pulltime[message.author.id + message.guild.id][0] = 0;

            
            if(pulltime[message.author.id + message.guild.id][0] < timeHours - 2) pullcount[message.author.id + message.guild.id] = -1
            if(pulltime[message.author.id + message.guild.id][0] < timeHours - 2) pulltime[message.author.id + message.guild.id][0] = timeHours - 1

            if (pullcount[message.author.id + message.guild.id] === 2) {
                timeHours = new Date().getHours();
                pulltime[message.author.id + message.guild.id][0] = timeHours;
                pulltime[message.author.id + message.guild.id][1] = timeMinutes;
            }
            fs.writeFile('Storage/pullcount.json', JSON.stringify(pullcount), (err) => { if (err) console.error(err) });
            fs.writeFile('Storage/pulltime.json', JSON.stringify(pulltime), (err) => { if (err) console.error(err) });
            
            if (pulltime[message.author.id + message.guild.id][0] === timeHours - 1 && (timeHours%2 === 0) || pulltime[message.author.id + message.guild.id][0] === timeHours - 2 && (timeHours%2 === 1 || -1%2 === -1) || pulltime[message.author.id + message.guild.id][0] === timeHours - 2 && (timeHours%2 === 0)) pullReady = true;
            if (pulltime[message.author.id + message.guild.id][0] === timeHours - 1 && (timeHours%2 === 0) || pulltime[message.author.id + message.guild.id][0] === timeHours - 2 && (timeHours%2 === 1) || pulltime[message.author.id + message.guild.id][0] === timeHours - 2 && (timeHours%2 === 0) && pullcount[message.author.id + message.guild.id] >= 3) pullReady = true;
            
            if (pullReady && pullcount[message.author.id + message.guild.id] >= 3) pullcount[message.author.id + message.guild.id] = 0;
            // Pull Command
            if (pullReady && pullcount[message.author.id + message.guild.id] < 3) {

            if (!inventory[message.author.id + message.guild.id]) inventory[message.author.id + message.guild.id] = []

            //Rarity Control
            const ranRar = Math.floor(Math.random() * 1000); // 0-999

            if (ranRar < 3) {
                const ssClass = characters.filter((e) => e.rarity === "SS");
                const ssNum = Math.floor(Math.random() * Object.keys(ssClass).length);
                ssClass[ssNum].displayMy();
                inventory[message.author.id + message.guild.id].push(ssClass[ssNum].id);
                pullcount[message.author.id + message.guild.id]++;
            } else if (ranRar < 24) {
                const sClass = characters.filter((e) => e.rarity === "S");
                const sNum = Math.floor(Math.random() * Object.keys(sClass).length);
                sClass[sNum].displayMy();
                inventory[message.author.id + message.guild.id].push(sClass[sNum].id);
                pullcount[message.author.id + message.guild.id]++;
            } else if (ranRar < 108) {
                const aClass = characters.filter((e) => e.rarity === "A");
                const aNum = Math.floor(Math.random() * Object.keys(aClass).length);
                aClass[aNum].displayMy();
                inventory[message.author.id + message.guild.id].push(aClass[aNum].id);
                pullcount[message.author.id + message.guild.id]++;
            } else if (ranRar < 246) {
                const bClass = characters.filter((e) => e.rarity === "B");
                const bNum = Math.floor(Math.random() * Object.keys(bClass).length);
                bClass[bNum].displayMy();
                inventory[message.author.id + message.guild.id].push(bClass[bNum].id);
                pullcount[message.author.id + message.guild.id]++;
            } else if (ranRar < 509) {
                const cClass = characters.filter((e) => e.rarity === "C");
                const cNum = Math.floor(Math.random() * Object.keys(cClass).length);
                cClass[cNum].displayMy();
                inventory[message.author.id + message.guild.id].push(cClass[cNum].id);
                pullcount[message.author.id + message.guild.id]++;
            } else if (ranRar < 1000) {
                const dClass = characters.filter((e) => e.rarity === "D");
                const dNum = Math.floor(Math.random() * Object.keys(dClass).length);
                dClass[dNum].displayMy();
                inventory[message.author.id + message.guild.id].push(dClass[dNum].id);
                pullcount[message.author.id + message.guild.id]++;
            };
        }        
            
            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => { if (err) console.error(err) });
            
            // cooldown Message
        if (!pullReady || (pulltime[message.author.id + message.guild.id][0] === 0 && (timeHours === 0 || timeHours === 1)) || pullcount[message.author.id + message.guild.id] === -1) {
            timeLeftMinutes = 60 - pulltime[message.author.id + message.guild.id][1];
            if (!(timeHours%2 === 0)) message.channel.send(`The Pull System is limited to 3 uses per 2 hours \n You have ${timeLeftMinutes} minutes left to wait`);
            if (timeHours%2 === 0) message.channel.send(`The Pull System is limited to 3 uses per 2 hours \n You have 1 hour and ${timeLeftMinutes} minutes left to wait`);
        }
        };

        // Inventory
        if (message.content.startsWith("§inv") || message.content.startsWith("§Inv") || message.content.startsWith("§iNv") || message.content.startsWith("§inV") || message.content.startsWith("§INv") || message.content.startsWith("§InV") || message.content.startsWith("§iNV") || message.content.startsWith("§INV")) {
            
            var user
            const mentionUser =  message.guild.member(message.mentions.users.first());
            if (mentionUser) user = mentionUser.user;
            if (!mentionUser) user = message.author;
            
            if (!inventory[user.id + message.guild.id]) {
                if (mentionUser) return message.channel.send(`${user.username} don't have any characters`);
                if (!mentionUser) return message.channel.send("You don't have any characters");
            };

            const inv = [];
            for (i=0; i < inventory[user.id + message.guild.id].length; i++) {
                inv.push(inventory[user.id + message.guild.id][i]);
            };
            
            const uniq =  inv.reduce(function(a,b) {
                if (a.indexOf(b) < 0 ) a.push(b);
                return a;
            },[]);

            // Thumbnail
            var thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image
            if (favChar[user.id + message.guild.id]) thumbnail = characters[favChar[user.id + message.guild.id]].image
            let chars = [];
            for (i=0; i < uniq.length; i++) {
                chars.push(characters[uniq[i]].name);
            };

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (!isNaN(parseInt(args[0])) && parseInt(args[0]) <= pagesTotal) {
                currPage = parseInt(args[0]);
            };

            let showChars = [];
            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                showChars = [];
                showChars.push(chars[i]);
            };
        

            let button1 = new disbut.MessageButton()
            .setLabel("previous")
            .setID("button1")
            .setStyle("blurple");

            let button2 = new disbut.MessageButton()
            .setLabel("next")
            .setID("button2")
            .setStyle("blurple");


            if (uniq.length < 16) {
                var Embed = new MessageEmbed()
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

                var Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(showChars.join('\n'))
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                message.channel.send(Embed, { buttons: [button1, button2] });

                client.on('clickButton', async (button) => {
                    if (button.id === 'button2') {
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
                            console.log(showChars);
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showChars.push(chars[i]);
                            };
                        };
                        var Embed2 = new MessageEmbed()
                        .setColor(0xbbffff)
                        .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                        .setThumbnail(thumbnail)
                        .setDescription(showChars.join('\n'))
                        .setFooter(`Page ${currPage}/${pagesTotal}`)
                        
                        button.message.edit(Embed2);
                    };
                    button.reply.defer();
                    
                });
                client.on('clickButton', async (button) => {
                    if (button.id === 'button1') {
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
                            console.log(showChars);
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showChars.push(chars[i]);
                            };
                        };
                        const Embed2 = new MessageEmbed()
                        .setColor(0xbbffff)
                        .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                        .setThumbnail(thumbnail)
                        .setDescription(showChars.join('\n'))
                        .setFooter(`Page ${currPage}/${pagesTotal}`)

                        button.message.edit(Embed2);
                    };
                    button.reply.defer();
                    
                });
            }
        };
    
        // Stats
        if (message.content.startsWith("§st") || message.content.startsWith("§St") || message.content.startsWith("§sT") || message.content.startsWith("§ST")) {
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
            .setThumbnail("https://i.imgur.com/WWM4K98.png")
            .addFields(
                { name: 'Characters', value: "<:Rem:869894433385095198> **Waifu total**: " + waifuT.length + "\n<:Yato:869897062672642118> **Husbando total**: " + husbT.length + "\n<:Gawrgura:869894477752447007> **Characters total**: " + charT, inline: true},
                { name: 'Anime', value: "<:Menhera:869913008686649374> **Anime total**: " + uniq.length, inline: true },
                { name: '\u200B', value: '_ _' },
                { name: 'Rarity', value: "<:SSTier:869316489931546644> **Tier**: " + ssT.length + "\n<:ATier:869316558013464627> **Tier**: " + aT.length + "\n<:CTier:869316602858991657> **Tier**: " + cT.length, inline: true },
                { name: '_ _', value: "<:STier:869316518675095552> **Tier**: " + sT.length + "\n<:BTier:869316586803179571> **Tier**: " + bT.length + "\n<:DTier:869316616071032843> **Tier**: " + dT.length, inline: true },
            )
            message.channel.send(Embed);
        };

        // Charakter search
        if (message.content.startsWith("§i ") || message.content.startsWith("§I ") || message.content === "§i" || message.content === "§I" || message.content.startsWith("§inf") || message.content.startsWith("§Inf") || message.content.startsWith("§iNf") || message.content.startsWith("§inF") || message.content.startsWith("§INf") || message.content.startsWith("§InF") || message.content.startsWith("§iNF") || message.content.startsWith("§INF")) {

            if (!args[0]) {
                return message.channel.send("Please provide a name");
            };
            
            let fastCheck = characters.filter((e) => e.name.toLowerCase() === args.join(' ').toLowerCase() || e.alias.some((a => a.toLowerCase() === args.join(' ').toLowerCase())));
            if (fastCheck[0] !== undefined) {
                return fastCheck[0].display();
            };

            let fArray = characters.filter((e) => e.name.toLowerCase()[0] === args[0].toLowerCase()[0] || e.alias.some((a => a.toLowerCase()[0] === args[0].toLowerCase()[0])));

            let i = 1;
            
            for (j=0; j < args.length; j++) {
                let argsW = args[j].length;

                while (argsW > 1) {
                    fArray = fArray.filter((e) => e.name.toLowerCase()[i] === args[j].toLowerCase()[i] || e.alias.some((a => a.toLowerCase()[i] === args[j].toLowerCase()[i])));
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
        if (message.content.startsWith("§s ") || message.content.startsWith("§S ") || message.content === "§s" || message.content === "§S" || message.content.startsWith("§se") || message.content.startsWith("§Se") || message.content.startsWith("§sE") || message.content.startsWith("§SE")) {
            
            if (!args[0]) {
                return message.channel.send("Please provide a name");
            };

            let fastCheck = characters.filter((e) => e.anime.toLowerCase() === args.join(' ').toLowerCase() || e.anialias.toLowerCase() === args.join(' ').toLowerCase());
            if (fastCheck[0] !== undefined) {
                return console.log(fastCheck);
            };
        };

    }
}
