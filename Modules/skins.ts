import { CostTypes } from "./profileDecorations";

// new skinInfo("Monster Garou", 23390, "fall season 2025", "skykey291", "", { season_keys: 0 }, "https://i.ibb.co/kVP4TCBZ/image.png", 127),

export default class skinInfo {
    private _name: string;
    private _cid: number;
    private _obtain: string;
    private _creator: string;
    private _artist: string;
    private _cost: CostTypes;
    private _image: string;
    private _id: number;

    constructor(name: string, cid: number, obtain: string, creator: string, artist: string, cost: CostTypes, image: string, id: number) {
        this._name = name;
        this._cid = cid;
        this._obtain = obtain;
        this._creator = creator;
        this._artist = artist;
        this._cost = cost;
        this._image = image;
        this._id = id;
    };
    get name() {
        return this._name;
    };
    get cid() {
        return this._cid;
    };
    get obtain() {
        return this._obtain;
    };
    get creator() {
        return this._creator;
    };
    get artist() {
        return this._artist;
    };
    get cost() {
        return this._cost;
    };
    get image() {
        return this._image;
    };
    get id() {
        return this._id;
    };


};

export const skins: skinInfo[] = [
    /* Christmas 2022 */
    new skinInfo("Luminous (Christmas 2022)", 10517, "winter event 2022", "", "", {}, "https://i.ibb.co/hRf3y4JC/VUOjq6d.png", 0),
    new skinInfo("Victoria (Christmas 2022)", 10520, "winter event 2022", "", "", {}, "https://i.ibb.co/qYw5V4sk/A69MXza.png", 1),
    new skinInfo("Altair (Christmas 2022)", 10518, "winter event 2022", "", "", {}, "https://i.ibb.co/4R7Xndtj/7x98Yvy.png", 2),
    new skinInfo("Cecilia (Christmas 2022)", 10519, "winter event 2022", "", "", {}, "https://i.ibb.co/RkypPKct/aJ50aKo.png", 3),
    new skinInfo("Senna (Christmas 2022)", 10521, "winter event 2022", "", "", {}, "https://i.ibb.co/HpKWYZw9/HkxZV8g.png", 4),
    new skinInfo("Luna (Christmas 2022)", 10522, "winter event 2022", "", "", {}, "https://i.ibb.co/G3kyfZ3P/ww2OCpQ.png", 5),
    new skinInfo("Fiona (Christmas 2022)", 10523, "winter event 2022", "", "", {}, "https://i.ibb.co/DfgVm3hQ/zojZpIf.png", 6),
    new skinInfo("Rimuru Tempest (Christmas 2022)", 238, "winter event 2022", "seki#0001", "", {}, "https://i.ibb.co/gF3p811X/rimuru.png", 7),
    new skinInfo("Erza Scarlet (Christmas 2022)", 8189, "winter event 2022", "seki#0001", "", {}, "https://i.ibb.co/8nrkKKy9/erza.png", 8),
    new skinInfo("Marin Kitagawa (Christmas 2022)", 5802, "winter event 2022", "seki#0001", "", {}, "https://i.ibb.co/YFnm6KLv/marin.png", 9),
    new skinInfo("Rosalia (Christmas 2022)", 10524, "winter event 2022", "", "", {}, "https://i.ibb.co/TN93L1f/CEWzaVP.png", 10),
    new skinInfo("Anastasia (Christmas 2022)", 10525, "winter event 2022", "", "", {}, "https://i.ibb.co/rfdFqsgy/W9ow7H2.png", 11),
    new skinInfo("Luxuria (Christmas 2022)", 10526, "winter event 2022", "", "", {}, "https://i.ibb.co/HfjZHd4S/uZSW05F.png", 12),
    new skinInfo("Kaith (Christmas 2022)", 10527, "winter event 2022", "", "", {}, "https://i.ibb.co/zWGM1tH5/tErq1zw.png", 13),
    new skinInfo("Dalus (Christmas 2022)", 10528, "winter event 2022", "", "", {}, "https://i.ibb.co/8nWMXXrt/8fd59f022de4.png", 14),

    /* New Year 2023 */
    new skinInfo("Senna (New Year 2023)", 10521, "2023 new years gift", "", "", {}, "https://i.ibb.co/yFwHLqb5/bN91Ev4.png", 15),
    new skinInfo("Luminous (Birthday)", 10517, "birthday", "", "", {}, "https://i.ibb.co/mrsg6JNj/luminous.png", 16),

    /* Valentine's 2023 */
    new skinInfo("Luminous (Valentine 2023)", 10517, "valentine's event 2023", "", "", {}, "https://i.ibb.co/YFg9Fy3B/Z79scNB.png", 17),
    new skinInfo("Luna (Valentine 2023)", 10522, "valentine's event 2023", "", "", {}, "https://i.ibb.co/SD6wJDLG/XTkRPyx.png", 18),
    new skinInfo("Fiona (Valentine 2023)", 10523, "valentine's event 2023", "", "", {}, "https://i.ibb.co/v4jpVvY4/2hLXdcP.png", 19),
    new skinInfo("Anastasia (Valentine 2023)", 10525, "valentine's event 2023", "", "", {}, "https://i.ibb.co/kgDRmKqg/T8AxMRV.png", 20),
    new skinInfo("Rias Gremory (Valentine 2023)", 2291, "valentine's event 2023", "seki#0001", "", {}, "https://i.ibb.co/62rc0g9/5jMRZ8t.png", 21),
    new skinInfo("Nino Nakano (Valentine 2023)", 2, "valentine's event 2023", "seki#0001", "", {}, "https://i.ibb.co/Lh5xBPFr/RpBiydW.png", 22),
    new skinInfo("Miku Nakano (Valentine 2023)", 3, "valentine's event 2023", "seki#0001", "", {}, "https://i.ibb.co/7dYTM2Qx/1vPP5Ko.png", 23),

    /* Maid */
    new skinInfo("Mahiru Shiina (Maid)", 12400, "shop", "seki#0001", "", {}, "https://i.ibb.co/Z6k6W9mn/GaytFe7.png", 24),

    /* Easter 2023 */
    new skinInfo("Vladilena Milizé (Easter 2023)", 6029, "easter event 2023", "seki#0001", "", {}, "https://i.ibb.co/7tqqTMGV/uGzMQUk.png", 25),
    new skinInfo("Asuna Yuuki (Easter 2023)", 72, "easter event 2023", "seki#0001", "", {}, "https://i.ibb.co/B5Xxwwcm/KepgFb2.png", 26),
    new skinInfo("Albedo (Easter 2023)", 2079, "easter event 2023", "seki#0001", "", {}, "https://i.ibb.co/27H8bt8T/Albedo.png", 27),
    new skinInfo("Shalltear Bloodfallen (Easter 2023)", 2080, "easter event 2023", "seki#0001", "", {}, "https://i.ibb.co/HpGfHKjb/s3u2EcZ.png", 28),
    new skinInfo("Aqua (Easter 2023)", 768, "easter event 2023", "seki#0001", "", {}, "https://i.ibb.co/PvYLTWY8/gidex1T.png", 29),
    new skinInfo("Nami (Easter 2023)", 999, "easter event 2023", "seki#0001", "", {}, "https://i.ibb.co/Q3XVYGyy/e4Bbwyu.png", 30),
    new skinInfo("Dalus (Easter 2023)", 10528, "easter event 2023", "", "", {}, "https://i.ibb.co/hF3h1Z60/6669d9cdff83.png", 31),
    new skinInfo("Luminous (Easter 2023)", 10517, "easter event 2023", "", "", {}, "https://i.ibb.co/W4W9VDW6/7EK1Aph.png", 32),
    new skinInfo("Senna (Easter 2023)", 10521, "easter event 2023", "", "", {}, "https://i.ibb.co/7txS0pmM/AEfLUKl.png", 33),
    new skinInfo("Cecilia (Easter 2023)", 10519, "easter event 2023", "", "", {}, "https://i.ibb.co/W93smZX/1REadqQ.png", 34),
    new skinInfo("Luna (Easter 2023)", 10522, "easter event 2023", "", "", {}, "https://i.ibb.co/d0sD5jZ9/YzXpM8n.png", 35),
    new skinInfo("Altair (Easter 2023)", 10518, "easter event 2023", "", "", {}, "https://i.ibb.co/G33Hw6rf/a1BAeG7.png", 36),
    new skinInfo("Fiona (Easter 2023)", 10523, "easter event 2023", "", "", {}, "https://i.ibb.co/FbxgNJ5g/l57NW9y.png", 37),
    new skinInfo("Rosalia (Easter 2023)", 10524, "easter event 2023", "", "", {}, "https://i.ibb.co/7Jg7mJmJ/kiJmLLx.png", 38),
    new skinInfo("Nilima (Easter 2023)", 12387, "easter event 2023", "", "", {}, "https://i.ibb.co/ZzX121Ny/nilima.png", 39),

    /* Summer 2023 */
    new skinInfo("Rosalia (Summer 2023)", 10524, "summer event 2023", "", "", {}, "https://i.ibb.co/5WgdzZDv/lj6yele.png", 40),
    new skinInfo("Luna (Summer 2023)", 10522, "summer event 2023", "", "", {}, "https://i.ibb.co/BHmr1KJp/GCmJtEo.png", 41),
    new skinInfo("Luminous (Summer 2023)", 10517, "summer event 2023", "", "", {}, "https://i.ibb.co/KzNsh88S/n6tUx2q.png", 42),
    new skinInfo("Senna (Summer 2023)", 10521, "summer event 2023", "", "", {}, "https://i.ibb.co/SXfp78kX/Senna.png", 43),
    new skinInfo("Nilima (Summer 2023)", 12387, "summer event 2023", "", "", {}, "https://i.ibb.co/4ggbggkC/G9cbFLg.png", 44),
    new skinInfo("Fiona (Summer 2023)", 10523, "summer event 2023", "", "", {}, "https://i.ibb.co/ds3FVM7N/36JPYdk.png", 45),
    new skinInfo("Luxuria (Summer 2023)", 10526, "summer event 2023", "", "", {}, "https://i.ibb.co/v4J6g8x9/G89Hmra.png", 46),
    new skinInfo("Cecilia (Summer 2023)", 10519, "summer event 2023", "", "", {}, "https://i.ibb.co/KcL7RVkn/v45XHZF.png", 47),
    new skinInfo("Altair (Summer 2023)", 10518, "summer event 2023", "", "", {}, "https://i.ibb.co/WrL4sW4/NbffLgO.png", 48),
    new skinInfo("Kaith (Summer 2023)", 10527, "summer event 2023", "", "", {}, "https://i.ibb.co/chWkJPXf/saDWCkb.png", 49),
    new skinInfo("Ai Hoshino (Summer 2023)", 4931, "summer event 2023", "", "", {}, "https://i.ibb.co/mVW4d9jK/P8PpVgt.png", 50),
    new skinInfo("Vladilena Milizé (Summer 2023)", 6029, "summer event 2023", "", "", {}, "https://i.ibb.co/Rkq2VqBN/s4JdP9x.png", 51),
    new skinInfo("Rimuru Tempest (Summer 2023)", 238, "summer event 2023", "", "", {}, "https://i.ibb.co/qL3DWZ65/7mARsA6.png", 52),
    new skinInfo("Artoria Pendragon (Summer 2023)", 405, "summer event 2023", "", "", {}, "https://i.ibb.co/pBRMBnYZ/IrIF3Pe.png", 53),
    new skinInfo("Nami (Summer 2023)", 999, "summer event 2023", "", "", {}, "https://i.ibb.co/LDPWFhmT/c.png", 54),
    new skinInfo("Nico Robin (Summer 2023)", 1002, "summer event 2023", "", "", {}, "https://i.ibb.co/hJHHqjxD/4SAsnY6.png", 55),
    new skinInfo("Nino Nakano (Summer 2023)", 2, "summer event 2023", "", "", {}, "https://i.ibb.co/MD7Z6h87/5YSzMWR.png", 56),
    new skinInfo("Miku Nakano (Summer 2023)", 3, "summer event 2023", "", "", {}, "https://i.ibb.co/JwBYj15S/7a48D80.png", 57),
    new skinInfo("Itsuki Nakano (Summer 2023)", 4, "summer event 2023", "", "", {}, "https://i.ibb.co/nNb8yXdW/ZlQd2jQ.png", 58),
    new skinInfo("Yotsuba Nakano (Summer 2023)", 5, "summer event 2023", "", "", {}, "https://i.ibb.co/xt1DmrjS/vI4HNv0.png", 59),
    new skinInfo("Ichika Nakano (Summer 2023)", 6, "summer event 2023", "", "", {}, "https://i.ibb.co/QWR6KvK/UFse6tj.png", 60),
    new skinInfo("Origami Tobiichi (Summer 2023)", 13188, "summer event 2023", "", "", {}, "https://i.ibb.co/DDntpNbg/CktkdOL.png", 61),
    new skinInfo("Milim Nava (Summer 2023)", 240, "summer event 2023", "", "", {}, "https://i.ibb.co/B2Phk83z/vSFMIFb.png", 62),
    new skinInfo("Asuna Yuuki (Summer 2023)", 72, "summer event 2023", "", "", {}, "https://i.ibb.co/VYVkcNFK/UKdqQKo.png", 63),
    new skinInfo("Sinon (Summer 2023)", 77, "summer event 2023", "", "", {}, "https://i.ibb.co/5hk1STMg/VtFzzw1.png", 64),
    new skinInfo("Quinella (Summer 2023)", 79, "summer event 2023", "", "", {}, "https://i.ibb.co/TMRJ3yVM/ixGR9Ir.png", 65),
    new skinInfo("Emilia (Summer 2023)", 5049, "summer event 2023", "", "", {}, "https://i.ibb.co/kWz3V69/EO8nfoB.png", 66),
    new skinInfo("Echidna (Summer 2023)", 5052, "summer event 2023", "", "", {}, "https://i.ibb.co/wF0wptHX/oiT8YJo.png", 67),
    new skinInfo("Eula (Summer 2023)", 688, "summer event 2023", "", "", {}, "https://i.ibb.co/PzhHqTgM/cvAZRbU.png", 68),
    new skinInfo("Yoimiya (Summer 2023)", 735, "summer event 2023", "", "", {}, "https://i.ibb.co/Xv0N39m/c.png", 69),
    new skinInfo("C.C. (Summer 2023)", 2360, "summer event 2023", "", "", {}, "https://i.ibb.co/HTQfbW35/CcngqOr.png", 70),
    new skinInfo("Monika (Summer 2023)", 9643, "summer event 2023", "", "", {}, "https://i.ibb.co/5XFX0wbB/dVAjKbj.png", 71),
    new skinInfo("Ryuuko Matoi (Summer 2023)", 1824, "summer event 2023", "", "", {}, "https://i.ibb.co/Q7KRMQ0g/puwrfM4.png", 72),
    new skinInfo("Hitori Gotou (Summer 2023)", 12842, "summer event 2023", "", "", {}, "https://i.ibb.co/Pv3Jxr6y/BDJA0MN.png", 73),
    new skinInfo("Kaguya Shinomiya (Summer 2023)", 2024, "summer event 2023", "", "", {}, "https://i.ibb.co/ZzbLy9Bs/GDd3xcW.png", 74),
    new skinInfo("Chika Fujiwara (Summer 2023)", 2025, "summer event 2023", "", "", {}, "https://i.ibb.co/kgwg0FrL/5iPUflQ.png", 75),
    new skinInfo("Ai Hayasaka (Summer 2023)", 2026, "summer event 2023", "", "", {}, "https://i.ibb.co/PzmFkwFp/ObpM8Nw.png", 76),
    new skinInfo("Luminous (alter) (Summer 2023)", 12450, "summer event 2023", "", "", {}, "https://i.ibb.co/d4dRb1bc/IC8RKzE.png", 77),

    /* Halloween 2023 */
    new skinInfo("Dalus (Halloween 2023)", 10528, "halloween event 2023", "", "", {}, "https://i.ibb.co/KjP7CpXx/e1bc6b213b28.png", 78),
    new skinInfo("Altair (Halloween 2023)", 10518, "halloween event 2023", "", "", {}, "https://i.ibb.co/Lz4HrGw5/tunAGDt.png", 79),
    new skinInfo("Luna (Halloween 2023)", 10522, "halloween event 2023", "", "", {}, "https://i.ibb.co/TxhYBxYC/NjsNv7x.png", 80),
    new skinInfo("Luminous (Halloween 2023)", 10517, "halloween event 2023", "", "", {}, "https://i.ibb.co/4wkfhfjq/d0gosUN.png", 81),
    new skinInfo("Senna (Halloween 2023)", 10521, "halloween event 2023", "", "", {}, "https://i.ibb.co/1fmfL10f/wvrIuFv.png", 82),
    new skinInfo("Rosalia (Halloween 2023)", 10524, "halloween event 2023", "", "", {}, "https://i.ibb.co/gHNgZDw/2SDoCf0.png", 83),
    new skinInfo("Luxuria (Halloween 2023)", 10526, "halloween event 2023", "", "", {}, "https://i.ibb.co/sJ21Djh3/PgTcQ5Y.png", 84),
    new skinInfo("Fiona (Halloween 2023)", 10523, "halloween event 2023", "", "", {}, "https://i.ibb.co/XrWzmr5K/NI2HHqV.png", 85),
    new skinInfo("Cecilia (Halloween 2023)", 10519, "halloween event 2023", "", "", {}, "https://i.ibb.co/V66d9wD/FtqJ7qY.png", 86),
    new skinInfo("Kaith (Halloween 2023)", 10527, "halloween event 2023", "", "", {}, "https://i.ibb.co/YB7dph2S/OvrwqLm.png", 87),
    new skinInfo("Marin Kitagawa (Halloween 2023)", 5802, "halloween event 2023", "", "", {}, "https://i.ibb.co/JFbxV8rB/c2FWSqg.png", 88),
    new skinInfo("Nami (Halloween 2023)", 999, "halloween event 2023", "", "", {}, "https://i.ibb.co/355kb36p/qMkKSZY.png", 89),
    new skinInfo("Nico Robin (Halloween 2023)", 1002, "halloween event 2023", "", "", {}, "https://i.ibb.co/DD8j1NF2/aN7h28N.png", 90),
    new skinInfo("Monkey D. Luffy (Halloween 2023)", 1000, "halloween event 2023", "", "", {}, "https://i.ibb.co/JW7PyvQf/poFKWLN.png", 91),
    new skinInfo("Roronoa Zoro (Halloween 2023)", 1001, "halloween event 2023", "", "", {}, "https://i.ibb.co/2wWd536/oWpgV8t.png", 92),
    new skinInfo("Brook (Halloween 2023)", 996, "halloween event 2023", "", "", {}, "https://i.ibb.co/MY24MF8/9TUPFxs.png", 93),
    new skinInfo("Lucy Heartfilia (Halloween 2023)", 8188, "halloween event 2023", "", "", {}, "https://i.ibb.co/jk96tq3f/Sivtq6W.png", 94),

    /* Easter 2024 */
    new skinInfo("Marin Kitagawa (Easter 2024)", 5802, "easter event 2024", "1083065632490274948", "", {}, "https://i.ibb.co/NdTqXLNt/marin.png", 95),
    new skinInfo("Rem (Easter 2024)", 5050, "easter event 2024", "", "", {}, "https://i.ibb.co/hxbDmR6S/rem.png", 96),
    new skinInfo("Rika (Easter 2024)", 12397, "easter event 2024", "", "", {}, "https://i.ibb.co/4R9vnM9p/rika.png", 97),
    new skinInfo("Amber (Easter 2024)", 681, "easter event 2024", "", "", {}, "https://i.ibb.co/XZYnQr5F/amber.png", 98),
    new skinInfo("Eula (Easter 2024)", 688, "easter event 2024", "", "", {}, "https://i.ibb.co/jPRjk7sM/eula.png", 99),
    new skinInfo("Ai Hoshino (Easter 2024)", 4931, "easter event 2024", "1083065632490274948", "", {}, "https://i.ibb.co/chC7j67y/c.png", 100),
    new skinInfo("Ai Hoshino (Easter 2024, younger)", 4931, "easter event 2024", "1083065632490274948", "", {}, "https://i.ibb.co/gbVyLKcs/ai.png", 101),
    new skinInfo("Keqing (Easter 2024)", 696, "easter event 2024", "", "", {}, "https://i.ibb.co/wFYSKyZP/keqing.png", 102),
    new skinInfo("Lucy (CP) (Easter 2024)", 10123, "easter event 2024", "", "", {}, "https://i.ibb.co/9kLqsWxb/lucy.png", 103),
    new skinInfo("Lumine (Easter 2024)", 709, "easter event 2024", "", "", {}, "https://i.ibb.co/JRLbbFtF/lumine.png", 104),

    /* Summer 2024 */
    new skinInfo("Isolde EX (Happy Milkshake Monday!)", 17116, "yes", "animeblaze", "", {}, "https://i.ibb.co/DVF0Wq8/Isolde-Happy-Milkshake-Monday.gif", 105),
    new skinInfo("Raphael EX (Birthday)", 17583, "yes", "seki#0001", "", {}, "https://i.ibb.co/nq0sMdnj/Raphael-EX-Birthday.png", 106),
    new skinInfo("Kisogi (Summer 2024)", 12398, "summer event 2024", "trulylost", "", {}, "https://i.ibb.co/6Jv3GyRN/c.png", 107),
    new skinInfo("Dalus (Summer 2024)", 10528, "summer event 2024", "trulylost", "", {}, "https://i.ibb.co/chjpsCRP/1fe026d708dd.png", 108),
    new skinInfo("Boa Hancock EX (Summer 2024)", 21928, "summer event 2024", "trulylost", "", {}, "https://i.ibb.co/PzZMZBfG/Boa-Hancock-EX-2.png", 109),

    /* Halloween 2024 */
    new skinInfo("Neco-Arc EX", 17118, "yes", "animeblaze", "", {}, "https://i.ibb.co/tMn1zHg2/Neco-Arc-EX.gif", 110),
    new skinInfo("Eliza (Halloween 2024)", 12393, "halloween event 2024", "iceflvke", "", {}, "https://i.ibb.co/TxzxzXgf/c.png", 111),
    new skinInfo("Cosmic Garou EX", 23390, "easter event 2025", "<@897369859757842473>", "", {}, "https://i.ibb.co/7NxyvkPS/Cosmic-Garou-EX.png", 112),

    /* Fall 2025 */
    new skinInfo("Artoria Pendragon (Fall 2025)", 405, "fall season 2025", "youalreadylost7799", "", {}, "https://i.ibb.co/FbfPtcCZ/c.png", 113),
    new skinInfo("Kaedehara Kazuha (Fall 2025)", 693, "fall season 2025", "kidsad", "", {}, "https://i.ibb.co/G3kR391x/KazuhaK.png", 114),
    new skinInfo("Yukino Yukinoshita (Fall 2025)", 2551, "fall season 2025", "kidsad", "", {}, "https://i.ibb.co/rGj77xRm/Yuki-NOshita.webp", 115),
    new skinInfo("Asuna Yuuki (Fall 2025)", 72, "fall season 2025", "kidsad", "", {}, "https://i.ibb.co/8GPGZ3P/AASuna.png", 116),
    new skinInfo("Sakura Yamauchi (Fall 2025)", 2008, "fall season 2025", "kidsad", "", {}, "https://i.ibb.co/8nxZYPfK/SSakuraY.png", 117),
    new skinInfo("Gin (Fall 2025)", 1716, "fall season 2025", "kidsad", "", {}, "https://i.ibb.co/Df2VDjNW/GinG.png", 118),
    new skinInfo("Dalus (Fall 2025)", 10528, "fall season 2025", "beaca", "", {}, "https://i.ibb.co/23YkTzfM/Dalus-Rain-Season-Fall-Skin.png", 119),
    new skinInfo("Gaius (Fall 2025)", 12388, "fall season 2025", "beaca", "", {}, "https://i.ibb.co/wrNGhnzH/Gaius-Fall-Skin.png", 120),
    new skinInfo("Tetsuya Kuroko (Fall 2025)", 4330, "fall season 2025", "freezerfallen._", "", {}, "https://i.ibb.co/4gT25D76/kuroko.png", 121),
    new skinInfo("Arlecchino (Fall 2025)", 16195, "fall season 2025", "snowflake.ex", "", {}, "https://i.ibb.co/4g9Szy9z/6-OIIgk-AAAAGSURBVAMAM52-FMGr-QMk-AAAAASUVORK5-CYII.png", 122),
    new skinInfo("Alisa Kujou (Fall 2025)", 22054, "fall season 2025", "snowflake.ex", "", {}, "https://i.ibb.co/Pst5k0Dd/image.png", 123),
    new skinInfo("Apple EX (Fall 2025)", 19275, "fall season 2025", "snowflake.ex", "", {}, "https://i.ibb.co/v4zdkyDC/image.png", 124),
    new skinInfo("Blade (HSR) (Fall 2025)", 14909, "fall season 2025", "snowflake.ex", "", {}, "https://i.ibb.co/prQ516M7/image.png", 125),
    new skinInfo("Kyouko Hori (Fall 2025)", 24, "fall season 2025", "kidsad", "", {}, "https://i.ibb.co/GQHT3JS7/Hori-1.png", 126),

    /* Halloween 2025 */
    new skinInfo("Yvolka Strashur (Halloween 2025)", 24450, "halloween season 2025", "mercy4afool", "", { season_keys: 25 }, "https://i.ibb.co/k2Rqp6r9/c.png", 127),
    new skinInfo("Kurumi Tokisaki (Halloween 2025)", 13186, "halloween season 2025", "skykey291", "", { season_keys: 25 }, "https://i.ibb.co/rRpkmqR0/export202509161654366980.jpg", 128),
    new skinInfo("Tokoyami Towa (Halloween 2025)", 5835, "halloween season 2025", "youalreadylost7799", "", { season_keys: 25 }, "https://i.ibb.co/tTM5DJ3c/c.png", 129),
    new skinInfo("Makima (Halloween 2025)", 10530, "halloween season 2025", "youalreadylost7799", "", { season_keys: 30 }, "https://i.ibb.co/C3M3H10N/mkm2.png", 130),
    new skinInfo("Marin Kitagawa (Halloween 2025)", 5802, "halloween season 2025", "skykey291", "", { season_keys: 30 }, "https://i.ibb.co/WvwhCv61/export202509161654258400.jpg", 131),
    new skinInfo("Phrolova (Halloween 2025)", 22309, "halloween season 2025", "skykey291", "", { season_keys: 40 }, "https://i.ibb.co/qMS37dDB/export202510152319494220.png", 132),
    new skinInfo("Frieren (Halloween 2025)", 18106, "halloween season 2025", "youalreadylost7799", "", { season_keys: 25 }, "https://i.ibb.co/LzfZVffm/frnhwnm.png", 133),
    new skinInfo("Nico Robin (Halloween 2025)", 1002, "halloween season 2025", "kidsad", "", { season_keys: 30 }, "https://i.ibb.co/nsCMKhHc/Robin-Nico.png", 134),
    new skinInfo("Hae-In Shin (Halloween 2025)", 25033, "halloween season 2025", "youalreadylost7799", "", { season_keys: 30 }, "https://i.ibb.co/Wv6GLGkW/haebhlwn3.png", 135),
    new skinInfo("Kibutsuji Muzan (Halloween 2025)", 166, "halloween season 2025", "skykey291", "", { season_keys: 30 }, "https://i.ibb.co/mV1nMC5f/export202509162352304330.png", 136),
    new skinInfo("Yor Forger (Halloween 2025)", 6308, "halloween season 2025", "kidsad", "", { season_keys: 50 }, "https://i.ibb.co/VWGzVVRJ/Yerforger.png", 137),
    new skinInfo("Homura Akemi (Halloween 2025)", 9366, "halloween season 2025", "freezerfallen._", "", { season_keys: 30 }, "https://i.ibb.co/W4YFRhpz/homuraakemidemonic-1.png", 138),
    new skinInfo("Denji (Halloween 2025)", 10529, "halloween season 2025", "skykey291", "", { season_keys: 25 }, "https://i.ibb.co/9HVv8Z9Q/export202509162256101320.jpg", 139),
    new skinInfo("Chrollo Lucilfer (Halloween 2025)", 8587, "halloween season 2025", "kidsad", "", { season_keys: 30 }, "https://i.ibb.co/BVvWYvrH/Lucifer.png", 140),
    new skinInfo("Kafka (Halloween 2025)", 14904, "halloween season 2025", "mercy4afool", "", { season_keys: 40 }, "https://i.ibb.co/chwfW4Jw/kafka.png", 141),
    new skinInfo("Minato Aqua (Halloween 2025)", 5831, "halloween season 2025", "youalreadylost7799", "", { season_keys: 30 }, "https://i.ibb.co/x8RBqxpV/aqua2.png", 142),
    new skinInfo("Tanjirou Kamado (Halloween 2025)", 159, "halloween season 2025", "kidsad", "", { season_keys: 35 }, "https://i.ibb.co/DHt6GHSz/Rou.png", 143),
    new skinInfo("Brant White (Halloween 2025)", 24177, "halloween season 2025", "freezerfallen._", "", { season_keys: 25 }, "https://i.ibb.co/qL0jrBb0/Brant-Skin-Fontless.png", 144),
    new skinInfo("Sukuna Ryoumen (Halloween 2025)", 922, "halloween season 2025", "kidsad", "", { season_keys: 40 }, "https://i.ibb.co/NdPqXsDm/Ryoumen.png", 145),
    new skinInfo("Rias Gremory (Halloween 2025)", 2291, "halloween season 2025", "kidsad", "", { season_keys: 35 }, "https://i.ibb.co/35TFLX4P/rias-sweety.png", 146),

    /* Winter 2025 */
    new skinInfo("Robin (HSR) (Winter 2025)", 23194, "winter season 2025", "skykey291", "", { season_keys: 25 }, "https://i.ibb.co/bg70QGDL/export202510160346094320.png", 147),
    new skinInfo("Nahida (Winter 2025)", 16199, "winter season 2025", "kaito.1412", "", { season_keys: 25 }, "https://i.ibb.co/0ps6RLcJ/media-1762443986.png", 148),
    new skinInfo("High Elf Archer (Winter 2025)", 13287, "winter season 2025", "kaito.1412", "", { season_keys: 30 }, "https://i.ibb.co/0jPMFGf4/media-1764670968-2.png", 149),
    new skinInfo("Acheron EX (Winter 2025)", 21931, "winter season 2025", "snowflake.ex", "", { season_keys: 45 }, "https://i.ibb.co/N2bnMsS5/export202511020320138690.png", 150),
    new skinInfo("Arlecchino (Winter 2025)", 16195, "winter season 2025", "snowflake.ex", "", { season_keys: 40 }, "https://i.ibb.co/PvjM8rPW/export202511012244108600.png", 151),
    new skinInfo("Ganyu (Winter 2025)", 690, "winter season 2025", "kidsad", "", { season_keys: 40 }, "https://i.ibb.co/fY5ZQkkR/ggantyu.png", 152),
    new skinInfo("Sephiroth (Winter 2025)", 19671, "winter season 2025", "kaito.1412", "", { season_keys: 25 }, "https://i.ibb.co/tPJKLBKX/sep.png", 153),
    new skinInfo("Seishirou Nagi (Winter 2025)", 13314, "winter season 2025", "kaito.1412", "", { season_keys: 30 }, "https://i.ibb.co/Z1LqrCHH/media-1762788177-1.png", 154),
    new skinInfo("Rukia Kuchiki (Winter 2025)", 9004, "winter season 2025", "youalreadylost7799", "", { season_keys: 30 }, "https://i.ibb.co/ytydFSN/c.png", 155),
    new skinInfo("Morgan le Fay (Winter 2025)", 500, "winter season 2025", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/V0shnydJ/00040-3715527986.png", 156),
    new skinInfo("Shenhe (Winter 2025)", 1925, "winter season 2025", "skykey291", "", { season_keys: 45 }, "https://i.ibb.co/7JC5NDZw/export202509292239512810.png", 157),
    new skinInfo("Cartethyia (Winter 2025)", 24167, "winter season 2025", "skykey291", "", { season_keys: 40 }, "https://i.ibb.co/zhJtmDJw/export202510160303373530.png", 158),
    new skinInfo("Tetsuya Kuroko (Winter 2025)", 4330, "winter season 2025", "freezerfallen._", "", { season_keys: 35 }, "https://i.ibb.co/zWm31K34/Kuroko-Skin-1.png", 159),
    new skinInfo("Mikasa Ackerman (Winter 2025)", 275, "winter season 2025", "mercy4afool", "", { season_keys: 25 }, "https://i.ibb.co/m573csv5/1146528660.png", 160),
    new skinInfo("Mei Mei (Winter 2025)", 941, "winter season 2025", "kidsad", "", { season_keys: 35 }, "https://i.ibb.co/2Jn6n5v/meimei.png", 161),
    new skinInfo("Tarou Sakamoto (Winter 2025)", 17852, "winter season 2025", "kaito.1412", "", { season_keys: 25 }, "https://i.ibb.co/gFRpY9K9/1763323403286.png", 162),
    new skinInfo("Blade (HSR) (Winter 2025)", 14909, "winter season 2025", "kaito.1412", "", { season_keys: 35 }, "https://i.ibb.co/Rp6BRFS3/blade.png", 163),
    new skinInfo("Raviel Ivansia (Winter 2025)", 24463, "winter season 2025", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/KctCKVSz/00002-638227603.png", 164),
    new skinInfo("Carlotta (Winter 2025)", 24169, "winter season 2025", "youalreadylost7799", "", { season_keys: 30 }, "https://i.ibb.co/W4h96km8/c.png", 165),
    new skinInfo("The Herta (Winter 2025)", 23225, "winter season 2025", "youalreadylost7799", "", { season_keys: 30 }, "https://i.ibb.co/DdhjC4M/thehertabutnohat.png", 166),

    // Frostbound Yule Event (Christmas 2025)
    new skinInfo("Aneira (Winter Veil)", 12394, "christmas event 2025", "skykey291", "", {}, "https://i.ibb.co/dsR2s0pM/aneira-bride.png", 167),
    new skinInfo("Aneira EX (Glacial Waltz)", 25829, "christmas event 2025", "mercy4afool", "", {}, "https://i.ibb.co/hRRz1G6Y/aneira-skin.png", 168),

    /* Valentine's 2026 */
    new skinInfo("Sang Lang (Valentine's 2026)", 25753, "valentines season 2026", "kaito.1412", "", { season_keys: 25 }, "https://i.ibb.co/fKVMrJ8/c.jpg", 169),
    new skinInfo("Kaguya Shinomiya (Valentine's 2026)", 2024, "valentines season 2026", "kidsad", "", { season_keys: 40 }, "https://i.ibb.co/kRKcxRp/kaguya2.png", 170),
    new skinInfo("Frieren (Valentine's 2026)", 18106, "valentines season 2026", "kaito.1412", "", { season_keys: 30 }, "https://i.ibb.co/Myc7bZvX/c.png", 171),
    new skinInfo("Roy Mustang (Valentine's 2026)", 13054, "valentines season 2026", "kaito.1412", "", { season_keys: 30 }, "https://i.ibb.co/xtkR9QwW/c.jpg", 172),
    new skinInfo("Reze (Valentine's 2026)", 25890, "valentines season 2026", "mercy4afool", "", { season_keys: 35 }, "https://i.ibb.co/KxdgLnyH/c.png", 173),
    new skinInfo("Violet Evergarden (Valentine's 2026)", 5000, "valentines season 2026", "kidsad", "", { season_keys: 40 }, "https://i.ibb.co/YBQgwDZV/image.png", 174),
    new skinInfo("C.C. (Valentine's 2026)", 2360, "valentines season 2026", "kaito.1412", "", { season_keys: 35 }, "https://i.ibb.co/Y7gt7w2b/image.png", 175),
    new skinInfo("Zero Two (Valentine's 2026)", 861, "valentines season 2026", "ranahunter", "", { season_keys: 30 }, "https://i.ibb.co/ZzcLwrsz/c.jpg", 176),
    new skinInfo("Mahiru Shiina (Valentine's 2026)", 12400, "valentines season 2026", "truleho", "", { season_keys: 30 }, "https://i.ibb.co/KjHbG6kP/Mahiru-Shiina.png", 177),
    new skinInfo("Yumeko Jabami (Valentine's 2026)", 3219, "valentines season 2026", "kaito.1412", "", { season_keys: 35 }, "https://i.ibb.co/gMMKwHmK/yumeko.png", 178),
    new skinInfo("Hae-in Shin (Valentine's 2026)", 25033, "valentines season 2026", "youalreadylost7799", "", { season_keys: 40 }, "https://i.ibb.co/G4dfMcfp/c.png", 179),
    new skinInfo("Kana Arima (Valentine's 2026)", 4932, "valentines season 2026", "ranahunter", "", { season_keys: 35 }, "https://i.ibb.co/tpm27QkM/kanaarima.png", 180),
    new skinInfo("Arlecchino (Valentine's 2026)", 16195, "valentines season 2026", "snowflake.ex", "", { season_keys: 30 }, "https://i.ibb.co/KjsDMfFC/c.png", 181),
    new skinInfo("Ai Hoshino (Valentine's 2026)", 4931, "valentines season 2026", "kaito.1412", "", { season_keys: 30 }, "https://i.ibb.co/hxGyJ6HW/oshiai.png", 182),
    new skinInfo("Raiden Shogun (Valentine's 2026)", 680, "valentines season 2026", "kaito.1412", "", { season_keys: 30 }, "https://i.ibb.co/Dgr6Yz5q/c.jpg", 183),
    new skinInfo("Shinobu Kochou (Valentine's 2026)", 161, "valentines season 2026", "kaito.1412", "", { season_keys: 35 }, "https://i.ibb.co/WrwRzjM/ge.png", 184),
    new skinInfo("Tohru (Valentine's 2026)", 12356, "valentines season 2026", "youalreadylost7799", "", { season_keys: 25 }, "https://i.ibb.co/KMBm9dR/c.png", 185),
    new skinInfo("Ram (Valentine's 2026)", 5051, "valentines season 2026", "mercy4afool", "", { season_keys: 25 }, "https://i.ibb.co/zWmRsgTL/ram.png", 186),
    new skinInfo("Rem (Valentine's 2026)", 5050, "valentines season 2026", "cyber_46", "", { season_keys: 30 }, "https://i.ibb.co/R4v5W2Fy/rem.png", 187),
    new skinInfo("Momo Ayase (Valentine's 2026)", 22416, "valentines season 2026", "youalreadylost7799", "", { season_keys: 30 }, "https://i.ibb.co/Z6y2XHHY/c.png", 188),

    /* Easter 2026 */
    new skinInfo("Chisa (Easter 2026)", 26188, "easter season 2026", "reixier", "", { season_keys: 40 }, "https://i.ibb.co/d0fqb0Hf/chisa.png", 189),
    new skinInfo("Scathach (Easter 2026)", 518, "easter season 2026", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/MybtX4g3/c.png", 190),
    new skinInfo("Isolde (Easter 2026)", 17116, "easter season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/rRHnx375/c.png", 191),
    new skinInfo("Satoru Gojo (Easter 2026)", 19048, "easter season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/TD5DZRXv/gojo.png", 192),
    new skinInfo("Shea Haulia (Easter 2026)", 5550, "easter season 2026", "truleho", "", { season_keys: 30 }, "https://i.ibb.co/fVsWBSJT/shea.png", 193),
    new skinInfo("Anya Forger (Easter 2026)", 6307, "easter season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/9mtWtV6k/c.png", 194),
    new skinInfo("Castorice (Easter 2026)", 23186, "easter season 2026", "truleho", "", { season_keys: 35 }, "https://i.ibb.co/RGzjHjKS/c.png", 195),
    new skinInfo("Shinei Nouzen (Easter 2026)", 6030, "easter season 2026", "freezerfallen._", "", { season_keys: 25 }, "https://i.ibb.co/tVzW0jM/c.png", 196),
    new skinInfo("2B (Easter 2026)", 13780, "easter season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/sv8ky81R/2b.png", 197),
    new skinInfo("Saber (alter) (Easter 2026)", 510, "easter season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/m5F3G5fV/saber.png", 198),
    new skinInfo("Tanya Degurechaff (Easter 2026)", 2814, "easter season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/B50KwScr/tanya.png", 199),
    new skinInfo("Neko (Easter 2026)", 16250, "easter season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/Y7m1cKx9/c.png", 200),
    new skinInfo("Ayanami Rei (Easter 2026)", 1851, "easter season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/Gv7v9b0h/c.png", 201),
    new skinInfo("Hoshimachi Suisei (Easter 2026)", 5820, "easter season 2026", "reixier", "", { season_keys: 40 }, "https://i.ibb.co/zVhLTnYx/c.png", 202),
    new skinInfo("Holo (Easter 2026)", 5032, "easter season 2026", "reixier", "", { season_keys: 40 }, "https://i.ibb.co/ZzPgkCp5/holo.png", 203),
    new skinInfo("Epsilon (Easter 2026)", 4948, "easter season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/S4hzBSZC/c.png", 204),
    new skinInfo("Kaoruko Waguri (Easter 2026)", 24316, "easter season 2026", "kidsad", "", { season_keys: 35 }, "https://i.ibb.co/3y7qHyq4/waguri.png", 205),
    new skinInfo("Ceres Fauna (Easter 2026)", 5862, "easter season 2026", "mercy4afool", "", { season_keys: 35 }, "https://i.ibb.co/ZR4nX49n/c.png", 206),
    new skinInfo("Hwaryun (Easter 2026)", 3412, "easter season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/C5nYvMzM/c.png", 207),
    new skinInfo("Fei Xiao (Easter 2026)", 23193, "easter season 2026", "youalreadylost7799", "", { season_keys: 40 }, "https://i.ibb.co/Q76XsbdP/c.png", 208),

    /* Summer 2026 PT 1*/
    new skinInfo("Lucy EX (Summer 2026)", 21930, "summer season 2026", "reixier/beaca", "", { season_keys: 50 }, "https://i.ibb.co/kg8Z0L0C/c.gif", 209),
    new skinInfo("Houshou Marine (Summer 2026)", 5829, "summer season 2026", "mercy4afool", "", { season_keys: 35 }, "https://i.ibb.co/ksfdR7cq/c.png", 210),
    new skinInfo("Rin Tohsaka (Summer 2026)", 412, "summer season 2026", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/C3tXj99g/c.png", 211),
    new skinInfo("Kafka (Summer 2026)", 14904, "summer season 2026", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/5VNZDNK/c.png", 212),
    new skinInfo("Miyu Suzuki (Summer 2026)", 26055, "summer season 2026", "youalreadylost7799", "", { season_keys: 25 }, "https://i.ibb.co/ynx25V2m/c.png", 213),
    new skinInfo("Yuki Sorimachi (Summer 2026)", 26201, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/hRtRPtfN/c.png", 214),
    new skinInfo("Asuna Yuuki (Summer 2026)", 72, "summer season 2026", "reixier", "", { season_keys: 25 }, "https://i.ibb.co/SDjKww6y/c.png", 215),
    new skinInfo("Alisa Kujou (Summer 2026)", 22054, "summer season 2026", "truleho", "", { season_keys: 30 }, "https://i.ibb.co/wZ7fJ9GG/c.png", 216),
    new skinInfo("Carlotta (Summer 2026)", 24169, "summer season 2026", "kidsad", "", { season_keys: 30 }, "https://i.ibb.co/GvxZLPR2/c.png", 217),
    new skinInfo("Changli (Summer 2026)", 22303, "summer season 2026", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/QF08CBPn/c.png", 218),
    new skinInfo("Ellen Joe (Summer 2026)", 24978, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/4wRNtrVn/c.png", 219),
    new skinInfo("Lucina (Summer 2026)", 9677, "summer season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/dwY93h5d/c.png", 220),
    new skinInfo("Shikimori (Summer 2026)", 6335, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/0VFMXHr7/c.png", 221),
    new skinInfo("Yuki Suou (Summer 2026)", 22055, "summer season 2026", "truleho", "", { season_keys: 30 }, "https://i.ibb.co/JRrQ32BQ/c.png", 222),
    new skinInfo("Apollo EX (Summer 2026)", 17688, "summer season 2026", "reixier", "", { season_keys: 40 }, "https://i.ibb.co/7JybZjY2/c.png", 223),
    new skinInfo("Kiyotaka Ayanokouji (Summer 2026)", 8521, "summer season 2026", "ig_hexcreed", "", { season_keys: 35 }, "https://i.ibb.co/3yk9QxQy/c.png", 224),
    new skinInfo("Nobara Kugisaki (Summer 2026)", 920, "summer season 2026", "mercy4afool", "", { season_keys: 35 }, "https://i.ibb.co/pv72k2pg/c.png", 225),
    new skinInfo("A2 (Summer 2026)", 13781, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/V07DJf8w/c.png", 226),
    new skinInfo("Kana Arima (Summer 2026)", 4932, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/B2J5GRDP/c.png", 227),
    new skinInfo("Raviel Ivansia (Summer 2026)", 24463, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/gZDVcqB3/c.png", 228),

    /* Summer 2026 PT 2*/
    /*
    1 - https://discord.com/channels/1358078718949720264/1508268197319544852 (Art. Pend. EX)
    2 - https://discord.com/channels/1358078718949720264/1503608648566575155/1504932702980149358 (Hae In Cha)
    3 - https://discord.com/channels/1358078718949720264/1502765311185784872/1502765311185784872 (Marin Kitagawa)
    4 - https://discord.com/channels/1358078718949720264/1499474910102425612/1499474910102425612 (Maple)
    5 - https://discord.com/channels/1358078718949720264/1498489567085465752/1498748767984291890 (Yin Lin)
    6 - https://discord.com/channels/1358078718949720264/1498364763267399854/1498364763267399854 (Kanon Matsubara)
    7 - https://discord.com/channels/1358078718949720264/1494977379897053317/1495209014265516082 (9S)
    8 - Aerith
    9 - https://discord.com/channels/1358078718949720264/1492785054366306376/1492785054366306376 (Narberal)
    10 - https://discord.com/channels/1358078718949720264/1492652078542225459/1492652078542225459 (Evelyn)
    11 - https://discord.com/channels/1358078718949720264/1491186539097620520/1491186539097620520 (Uzumaki)
    12 - https://discord.com/channels/1358078718949720264/1493418150585434323 (gawr gura)
    13 - https://discord.com/channels/1358078718949720264/1507673637224710285 (Albedo)
    14 - https://discord.com/channels/1358078718949720264/1504934681236209785 (Rover (F))
    15 - https://discord.com/channels/1358078718949720264/1504921094077943910 (Tifa Lockhart)
    16 - https://discord.com/channels/1358078718949720264/1500052147855818822/1500052147855818822 (Azusa)
    17 - https://discord.com/channels/1358078718949720264/1493272680583921764/1495433915106595018 (Lugh Tuatha De)
    18 - https://discord.com/channels/1358078718949720264/1494349602340605952/1494349602340605952 (Reze)
    19 - https://discord.com/channels/1358078718949720264/1492693580165415045/1492693580165415045 (Hinata)
    20 - https://discord.com/channels/1358078718949720264/1492472335616442441/1492472335616442441 (Mao Mao)
    */
    new skinInfo("Artoria Pendragon EX (Summer 2026)", 17118, "summer season 2026", "reixier", "", { season_keys: 40 }, "https://i.ibb.co/JRgTcB1g/c.webp", 229),
    new skinInfo("Hae-In Cha (Summer 2026)", 3151, "summer season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/PZTb77S5/IMG-1645.webp", 230),
    new skinInfo("Marin Kitagawa (Summer 2026)", 5802, "summer season 2026", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/spvj9q1D/c.webp", 231),
    new skinInfo("Maple (Summer 2026)", 3109, "summer season 2026", "mercy4afool", "", { season_keys: 35 }, "https://i.ibb.co/h1K7FTzY/c.webp", 232),
    new skinInfo("YinLin (Summer 2026)", 22298, "summer season 2026", "ig_hexcreed", "", { season_keys: 25 }, "https://i.ibb.co/2YS5CvkP/c.webp", 233),
    new skinInfo("Kanon Matsubara (Summer 2026)", 16782, "summer season 2026", "kaito.1412", "", { season_keys: 25 }, "https://i.ibb.co/RkXfY4y4/c.webp", 234),
    new skinInfo("9S (Summer 2026)", 13782, "summer season 2026", "freezerfallen._", "", { season_keys: 30 }, "https://i.ibb.co/3ykgN0Py/c.webp", 235),
    new skinInfo("Aerith Gainsborough (Summer 2026)", 20016, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/VcQ5VXk6/c.webp", 236),
    new skinInfo("Narberal Gamma (Summer 2026)", 2081, "summer season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/XZKKK3Xr/c.webp", 237),
    new skinInfo("Evelyn Chevalier (Summer 2026)", 24989, "summer season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/KgYMc0v/c.webp", 238),
    new skinInfo("Boruto Uzumaki (Summer 2026)", 12548, "summer season 2026", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/CKYXF3dh/c.webp", 239),
    new skinInfo("Gawr Gura (Summer 2026)", 5818, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/d4kBCjtC/c.webp", 240),
    new skinInfo("Albedo (Summer 2026)", 2079, "summer season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/LhZmV8b9/c.webp", 241),
    new skinInfo("Rover (F) (Summer 2026)", 22300, "summer season 2026", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/JjtHx5Ws/c.webp", 242),
    new skinInfo("Tifa Lockhart (Summer 2026)", 20015, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/C5qPtpdW/c.webp", 243),
    new skinInfo("Azusa Aizawa (Summer 2026)", 20348, "summer season 2026", "reixier", "", { season_keys: 30 }, "https://i.ibb.co/21zXJz1b/c.webp", 244),
    new skinInfo("Lugh Tuatha De (Summer 2026)", 4913, "summer season 2026", "freezerfallen._", "", { season_keys: 40 }, "https://i.ibb.co/21dQ27Th/c.webp", 245),
    new skinInfo("Reze (Summer 2026)", 25890, "summer season 2026", "mercy4afool", "", { season_keys: 30 }, "https://i.ibb.co/gbV3q2k6/c.webp", 246),
    new skinInfo("Hinata Shouyou (Summer 2026)", 596, "summer season 2026", "truleho", "", { season_keys: 30 }, "https://i.ibb.co/6JJRNk6s/c.webp", 247),
    new skinInfo("MaoMao (Summer 2026)", 19348, "summer season 2026", "reixier", "", { season_keys: 35 }, "https://i.ibb.co/MkVmfgcp/c.webp", 248),

];

