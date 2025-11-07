import { CostTypes } from "./profileDecorations";


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
    new skinInfo("Blade (Fall 2025)", 14909, "fall season 2025", "snowflake.ex", "", {}, "https://i.ibb.co/prQ516M7/image.png", 125),
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




    // new skinInfo("Monster Garou", 23390, "fall season 2025", "skykey291", "", { season_keys: 0 }, "https://i.ibb.co/kVP4TCBZ/image.png", 127),

];
