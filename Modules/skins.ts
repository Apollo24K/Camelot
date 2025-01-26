export default class skinInfo {
    private _name: string;
    private _cid: number;
    private _obtain: string;
    private _creator: string;
    private _artist: string;
    private _price: number;
    private _currency: string;
    private _image: string;
    private _id: number;

    constructor(name: string, cid: number, obtain: string, creator: string, artist: string, price: number, currency: string, image: string, id: number) {
        this._name = name;
        this._cid = cid;
        this._obtain = obtain;
        this._creator = creator;
        this._artist = artist;
        this._price = price;
        this._currency = currency;
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
    get price() {
        return this._price;
    };
    get currency() {
        return this._currency;
    };
    get image() {
        return this._image;
    };
    get id() {
        return this._id;
    };
};

export const skins: skinInfo[] = [
    new skinInfo("Luminous (Christmas 2022)", 10517, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/VUOjq6d.png", 0),
    new skinInfo("Victoria (Christmas 2022)", 10520, "winter event 2022", "", "", 0, "", "https://i.imgur.com/A69MXza.png", 1),
    new skinInfo("Altair (Christmas 2022)", 10518, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/7x98Yvy.png", 2),
    new skinInfo("Cecilia (Christmas 2022)", 10519, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/aJ50aKo.png", 3),
    new skinInfo("Senna (Christmas 2022)", 10521, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/HkxZV8g.png", 4),
    new skinInfo("Luna (Christmas 2022)", 10522, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/ww2OCpQ.png", 5),
    new skinInfo("Fiona (Christmas 2022)", 10523, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/zojZpIf.png", 6),
    new skinInfo("Rimuru Tempest (Christmas 2022)", 238, "winter event 2022", "seki#0001", "", 20000, "", "https://i.ibb.co/WxfWSN1/rimuru.png", 7),
    new skinInfo("Erza Scarlet (Christmas 2022)", 8189, "winter event 2022", "seki#0001", "", 20000, "", "https://i.ibb.co/2cy4Qf9/erza.png", 8),
    new skinInfo("Marin Kitagawa (Christmas 2022)", 5802, "winter event 2022", "seki#0001", "", 20000, "", "https://i.ibb.co/5Wg3f2c/marin.png", 9),
    new skinInfo("Rosalia (Christmas 2022)", 10524, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/CEWzaVP.png", 10),
    new skinInfo("Anastasia (Christmas 2022)", 10525, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/W9ow7H2.png", 11),
    new skinInfo("Luxuria (Christmas 2022)", 10526, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/uZSW05F.png", 12),
    new skinInfo("Kaith (Christmas 2022)", 10527, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/tErq1zw.png", 13),
    new skinInfo("Dalus (Christmas 2022)", 10528, "winter event 2022", "", "", 5000, "", "https://i.imgur.com/ULi5XDt.png", 14),
    new skinInfo("Senna (New Year 2023)", 10521, "2023 new years gift", "", "", 5000, "", "https://i.imgur.com/bN91Ev4.png", 15),
    new skinInfo("Luminous (Birthday)", 10517, "birthday", "", "", 0, "", "https://i.ibb.co/C0C5sC7/luminous.png", 16),
    new skinInfo("Luminous (Valentine 2023)", 10517, "valentine's event 2023", "", "", 5000, "", "https://i.imgur.com/Z79scNB.png", 17),
    new skinInfo("Luna (Valentine 2023)", 10522, "valentine's event 2023", "", "", 5000, "", "https://i.imgur.com/XTkRPyx.png", 18),
    new skinInfo("Fiona (Valentine 2023)", 10523, "valentine's event 2023", "", "", 5000, "", "https://i.imgur.com/2hLXdcP.png", 19),
    new skinInfo("Anastasia (Valentine 2023)", 10525, "valentine's event 2023", "", "", 5000, "", "https://i.imgur.com/T8AxMRV.png", 20),
    new skinInfo("Rias Gremory (Valentine 2023)", 2291, "valentine's event 2023", "seki#0001", "", 20000, "", "https://i.imgur.com/5jMRZ8t.png", 21),
    new skinInfo("Nino Nakano (Valentine 2023)", 2, "valentine's event 2023", "seki#0001", "", 20000, "", "https://i.imgur.com/RpBiydW.png", 22),
    new skinInfo("Miku Nakano (Valentine 2023)", 3, "valentine's event 2023", "seki#0001", "", 20000, "", "https://i.imgur.com/1vPP5Ko.png", 23),
    new skinInfo("Mahiru Shiina (Maid)", 12400, "shop", "seki#0001", "", 20000, "", "https://i.imgur.com/GaytFe7.png", 24),
    new skinInfo("Vladilena Milizé (Easter 2023)", 6029, "easter event 2023", "seki#0001", "", 20000, "", "https://i.imgur.com/uGzMQUk.png", 25),
    new skinInfo("Asuna Yuuki (Easter 2023)", 72, "easter event 2023", "seki#0001", "", 20000, "", "https://i.imgur.com/KepgFb2.png", 26),
    new skinInfo("Albedo (Easter 2023)", 2079, "easter event 2023", "seki#0001", "", 0, "", "https://i.ibb.co/yFhVx0W/Albedo.png", 27),
    new skinInfo("Shalltear Bloodfallen (Easter 2023)", 2080, "easter event 2023", "seki#0001", "", 0, "", "https://i.imgur.com/s3u2EcZ.png", 28),
    new skinInfo("Aqua (Easter 2023)", 768, "easter event 2023", "seki#0001", "", 20000, "", "https://i.imgur.com/gidex1T.png", 29),
    new skinInfo("Nami (Easter 2023)", 999, "easter event 2023", "seki#0001", "", 0, "", "https://i.imgur.com/e4Bbwyu.png", 30),
    new skinInfo("Dalus (Easter 2023)", 10528, "easter event 2023", "", "", 5000, "", "https://i.imgur.com/rh1rPvS.png", 31),
    new skinInfo("Luminous (Easter 2023)", 10517, "easter event 2023", "", "", 5000, "", "https://i.imgur.com/7EK1Aph.png", 32),
    new skinInfo("Senna (Easter 2023)", 10521, "easter event 2023", "", "", 5000, "", "https://i.imgur.com/AEfLUKl.png", 33),
    new skinInfo("Cecilia (Easter 2023)", 10519, "easter event 2023", "", "", 5000, "", "https://i.imgur.com/1REadqQ.png", 34),
    new skinInfo("Luna (Easter 2023)", 10522, "easter event 2023", "", "", 5000, "", "https://i.imgur.com/YzXpM8n.png", 35),
    new skinInfo("Altair (Easter 2023)", 10518, "easter event 2023", "", "", 5000, "", "https://i.imgur.com/a1BAeG7.png", 36),
    new skinInfo("Fiona (Easter 2023)", 10523, "easter event 2023", "", "", 5000, "", "https://i.imgur.com/l57NW9y.png", 37),
    new skinInfo("Rosalia (Easter 2023)", 10524, "easter event 2023", "", "", 5000, "", "https://i.imgur.com/kiJmLLx.png", 38),
    new skinInfo("Nilima (Easter 2023)", 12387, "easter event 2023", "", "", 0, "", "https://i.ibb.co/Df3CH6B/nilima.png", 39),
    new skinInfo("Rosalia (Summer 2023)", 10524, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/lj6yele.png", 40),
    new skinInfo("Luna (Summer 2023)", 10522, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/GCmJtEo.png", 41),
    new skinInfo("Luminous (Summer 2023)", 10517, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/n6tUx2q.png", 42),
    new skinInfo("Senna (Summer 2023)", 10521, "summer event 2023", "", "", 5000, "", "https://i.ibb.co/MnHqQHH/Senna.png", 43),
    new skinInfo("Nilima (Summer 2023)", 12387, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/G9cbFLg.png", 44),
    new skinInfo("Fiona (Summer 2023)", 10523, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/36JPYdk.png", 45),
    new skinInfo("Luxuria (Summer 2023)", 10526, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/G89Hmra.png", 46),
    new skinInfo("Cecilia (Summer 2023)", 10519, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/v45XHZF.png", 47),
    new skinInfo("Altair (Summer 2023)", 10518, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/NbffLgO.png", 48),
    new skinInfo("Kaith (Summer 2023)", 10527, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/saDWCkb.png", 49),
    new skinInfo("Ai Hoshino (Summer 2023)", 4931, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/P8PpVgt.png", 50),
    new skinInfo("Vladilena Milizé (Summer 2023)", 6029, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/s4JdP9x.png", 51),
    new skinInfo("Rimuru Tempest (Summer 2023)", 238, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/7mARsA6.png", 52),
    new skinInfo("Artoria Pendragon (Summer 2023)", 405, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/IrIF3Pe.png", 53),
    new skinInfo("Nami (Summer 2023)", 999, "summer event 2023", "", "", 5000, "", "https://i.ibb.co/jRF7ss3/c.png", 54),
    new skinInfo("Nico Robin (Summer 2023)", 1002, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/4SAsnY6.png", 55),
    new skinInfo("Nino Nakano (Summer 2023)", 2, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/5YSzMWR.png", 56),
    new skinInfo("Miku Nakano (Summer 2023)", 3, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/7a48D80.png", 57),
    new skinInfo("Itsuki Nakano (Summer 2023)", 4, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/ZlQd2jQ.png", 58),
    new skinInfo("Yotsuba Nakano (Summer 2023)", 5, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/vI4HNv0.png", 59),
    new skinInfo("Ichika Nakano (Summer 2023)", 6, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/UFse6tj.png", 60),
    new skinInfo("Origami Tobiichi (Summer 2023)", 13188, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/CktkdOL.png", 61),
    new skinInfo("Milim Nava (Summer 2023)", 240, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/vSFMIFb.png", 62),
    new skinInfo("Asuna Yuuki (Summer 2023)", 72, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/UKdqQKo.png", 63),
    new skinInfo("Sinon (Summer 2023)", 77, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/VtFzzw1.png", 64),
    new skinInfo("Quinella (Summer 2023)", 79, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/ixGR9Ir.png", 65),
    new skinInfo("Emilia (Summer 2023)", 5049, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/EO8nfoB.png", 66),
    new skinInfo("Echidna (Summer 2023)", 5052, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/oiT8YJo.png", 67),
    new skinInfo("Eula (Summer 2023)", 688, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/cvAZRbU.png", 68),
    new skinInfo("Yoimiya (Summer 2023)", 735, "summer event 2023", "", "", 5000, "", "https://i.ibb.co/PwjzGgL/c.png", 69),
    new skinInfo("C.C. (Summer 2023)", 2360, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/CcngqOr.png", 70),
    new skinInfo("Monika (Summer 2023)", 9643, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/dVAjKbj.png", 71),
    new skinInfo("Ryuuko Matoi (Summer 2023)", 1824, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/puwrfM4.png", 72),
    new skinInfo("Hitori Gotou (Summer 2023)", 12842, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/BDJA0MN.png", 73),
    new skinInfo("Kaguya Shinomiya (Summer 2023)", 2024, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/GDd3xcW.png", 74),
    new skinInfo("Chika Fujiwara (Summer 2023)", 2025, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/5iPUflQ.png", 75),
    new skinInfo("Ai Hayasaka (Summer 2023)", 2026, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/ObpM8Nw.png", 76),
    new skinInfo("Luminous (alter) (Summer 2023)", 12450, "summer event 2023", "", "", 5000, "", "https://i.imgur.com/IC8RKzE.png", 77),
    new skinInfo("Dalus (Halloween 2023)", 10528, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/KvrIiJD.png", 78),
    new skinInfo("Altair (Halloween 2023)", 10518, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/tunAGDt.png", 79),
    new skinInfo("Luna (Halloween 2023)", 10522, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/NjsNv7x.png", 80),
    new skinInfo("Luminous (Halloween 2023)", 10517, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/d0gosUN.png", 81),
    new skinInfo("Senna (Halloween 2023)", 10521, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/wvrIuFv.png", 82),
    new skinInfo("Rosalia (Halloween 2023)", 10524, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/2SDoCf0.png", 83),
    new skinInfo("Luxuria (Halloween 2023)", 10526, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/PgTcQ5Y.png", 84),
    new skinInfo("Fiona (Halloween 2023)", 10523, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/NI2HHqV.png", 85),
    new skinInfo("Cecilia (Halloween 2023)", 10519, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/FtqJ7qY.png", 86),
    new skinInfo("Kaith (Halloween 2023)", 10527, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/OvrwqLm.png", 87),
    new skinInfo("Marin Kitagawa (Halloween 2023)", 5802, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/c2FWSqg.png", 88),
    new skinInfo("Nami (Halloween 2023)", 999, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/qMkKSZY.png", 89),
    new skinInfo("Nico Robin (Halloween 2023)", 1002, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/aN7h28N.png", 90),
    new skinInfo("Monkey D. Luffy (Halloween 2023)", 1000, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/poFKWLN.png", 91),
    new skinInfo("Roronoa Zoro (Halloween 2023)", 1001, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/oWpgV8t.png", 92),
    new skinInfo("Brook (Halloween 2023)", 996, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/9TUPFxs.png", 93),
    new skinInfo("Lucy Heartfilia (Halloween 2023)", 8188, "halloween event 2023", "", "", 3000, "", "https://i.imgur.com/Sivtq6W.png", 94),
    new skinInfo("Marin Kitagawa (Easter 2024)", 5802, "easter event 2024", "1083065632490274948", "", 8000, "", "https://i.ibb.co/mvLRmBt/marin.png", 95),
    new skinInfo("Rem (Easter 2024)", 5050, "easter event 2024", "", "", 8000, "", "https://i.ibb.co/9GfVDcg/rem.png", 96),
    new skinInfo("Rika (Easter 2024)", 12397, "easter event 2024", "", "", 8000, "", "https://i.ibb.co/mHj6TvZ/rika.png", 97),
    new skinInfo("Amber (Easter 2024)", 681, "easter event 2024", "", "", 8000, "", "https://i.ibb.co/1mZ12nH/amber.png", 98),
    new skinInfo("Eula (Easter 2024)", 688, "easter event 2024", "", "", 8000, "", "https://i.ibb.co/zZHq3Nf/eula.png", 99),
    new skinInfo("Ai Hoshino (Easter 2024)", 4931, "easter event 2024", "1083065632490274948", "", 69420, "", "https://i.ibb.co/9pNrhsk/c.png", 100),
    new skinInfo("Ai Hoshino (Easter 2024, younger)", 4931, "easter event 2024", "1083065632490274948", "", 8000, "", "https://i.ibb.co/0KjqPVJ/ai.png", 101),
    new skinInfo("Keqing (Easter 2024)", 696, "easter event 2024", "", "", 8000, "", "https://i.ibb.co/ZB9VK6w/keqing.png", 102),
    new skinInfo("Lucy (CP) (Easter 2024)", 10123, "easter event 2024", "", "", 8000, "", "https://i.ibb.co/SdsyM7W/lucy.png", 103),
    new skinInfo("Lumine (Easter 2024)", 709, "easter event 2024", "", "", 8000, "", "https://i.ibb.co/vk81Ypm/lumine.png", 104),
    new skinInfo("Isolde EX (Happy Milkshake Monday!)", 17116, "yes", "animeblaze", "", 9999999999, "", "https://i.ibb.co/DVF0Wq8/Isolde-Happy-Milkshake-Monday.gif", 105),
    new skinInfo("Raphael EX (Birthday)", 17583, "yes", "seki#0001", "", 9999999999, "", "https://i.ibb.co/3FX4nHH/Raphael-EX-Birthday.png", 106),
    new skinInfo("Kisogi (Summer 2024)", 12398, "summer event 2024", "trulylost", "", 20000, "", "https://i.ibb.co/nRXHHHV/kisogi.png", 107),
    new skinInfo("Dalus (Summer 2024)", 10528, "summer event 2024", "trulylost", "", 20000, "", "https://i.ibb.co/zPw4cCp/dalus.png", 108),
    new skinInfo("Boa Hancock EX (Summer 2024)", 21928, "summer event 2024", "trulylost", "", 20000, "", "https://i.ibb.co/ChmSsJX/Boa-Hancock-EX-2.png", 109),
    new skinInfo("Neco-Arc EX", 17118, "yes", "animeblaze", "", 9999999999, "", "https://i.ibb.co/6BPNFnk/Neco-Arc-EX.gif", 110),
    new skinInfo("Eliza (Halloween 2024)", 12393, "halloween event 2024", "iceflvke", "", 20000, "", "https://i.ibb.co/HqMw6ZM/c.png", 111),


];
