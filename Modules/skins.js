/* eslint-disable no-extra-semi */
class skinInfo {
    constructor(name, cid, obtain, creator, artist, price, currency, image, id) {
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


const skins = [
    new skinInfo("Luminous (Christmas 2022)", 10517, "winter event 2022", "", "", 0, "", "https://i.ibb.co/2YH8ddB/luminous.png", 0),
    new skinInfo("Victoria (Christmas 2022)", 10520, "winter event 2022", "", "", 0, "", "https://i.ibb.co/fqY9wTQ/victoria.png", 1),
    new skinInfo("Altair (Christmas 2022)", 10518, "winter event 2022", "", "", 0, "", "https://i.ibb.co/Twh8Jn5/altair.png", 2),
    new skinInfo("Cecilia (Christmas 2022)", 10519, "winter event 2022", "", "", 0, "", "https://i.ibb.co/kcPHTnL/cecilia.png", 3),
    new skinInfo("Senna (Christmas 2022)", 10521, "winter event 2022", "", "", 0, "", "https://i.ibb.co/G208bvK/senna.png", 4),
    new skinInfo("Luna (Christmas 2022)", 10522, "winter event 2022", "", "", 0, "", "https://i.ibb.co/qD7wh6D/luna.png", 5),
    new skinInfo("Fiona (Christmas 2022)", 10523, "winter event 2022", "", "", 0, "", "https://i.ibb.co/dPSVSks/fiona.png", 6),
    new skinInfo("Rimuru Tempest (Christmas 2022)", 238, "winter event 2022", "seki#0001", "", 0, "", "https://i.ibb.co/WxfWSN1/rimuru.png", 7),
    new skinInfo("Erza Scarlet (Christmas 2022)", 8189, "winter event 2022", "seki#0001", "", 0, "", "https://i.ibb.co/2cy4Qf9/erza.png", 8),
    new skinInfo("Marin Kitagawa (Christmas 2022)", 5802, "winter event 2022", "seki#0001", "", 0, "", "https://i.ibb.co/5Wg3f2c/marin.png", 9),
    new skinInfo("Rosalia (Christmas 2022)", 10524, "winter event 2022", "", "", 0, "", "https://i.ibb.co/zn5dqf4/rosalia.png", 10),
    new skinInfo("Anastasia (Christmas 2022)", 10525, "winter event 2022", "", "", 0, "", "https://i.ibb.co/C9yGb6S/anastasia.png", 11),
    new skinInfo("Luxuria (Christmas 2022)", 10526, "winter event 2022", "", "", 0, "", "https://i.ibb.co/17VrCy8/luxuria.png", 12),
    new skinInfo("Kaith (Christmas 2022)", 10527, "winter event 2022", "", "", 0, "", "https://i.ibb.co/HNG21xN/kaith.png", 13),
    new skinInfo("Dalus (Christmas 2022)", 10528, "winter event 2022", "", "", 0, "", "https://i.ibb.co/7CmFCb4/kaian.png", 14),
    new skinInfo("Senna (New Year 2023)", 10521, "2023 new years gift", "", "", 0, "", "https://i.ibb.co/88r6q3G/senna.png", 15),
    new skinInfo("Luminous (Birthday)", 10517, "birthday", "", "", 0, "", "https://i.ibb.co/C0C5sC7/luminous.png", 16),
    new skinInfo("Luminous (Valentine 2023)", 10517, "valentine's event 2023", "", "", 0, "", "https://i.imgur.com/WjUiR27.png", 17),
    new skinInfo("Luna (Valentine 2023)", 10522, "valentine's event 2023", "", "", 0, "", "https://i.imgur.com/axP9DOa.png", 18),
    new skinInfo("Fiona (Valentine 2023)", 10523, "valentine's event 2023", "", "", 0, "", "https://i.imgur.com/gv8aAwa.png", 19),
    new skinInfo("Anastasia (Valentine 2023)", 10525, "valentine's event 2023", "", "", 0, "", "https://i.imgur.com/mxB8l7M.png", 20),
    new skinInfo("Rias Gremory (Valentine 2023)", 2291, "valentine's event 2023", "seki#0001", "", 0, "", "https://i.imgur.com/5jMRZ8t.png", 21),
    new skinInfo("Nino Nakano (Valentine 2023)", 2, "valentine's event 2023", "seki#0001", "", 0, "", "https://i.imgur.com/RpBiydW.png", 22),
    new skinInfo("Miku Nakano (Valentine 2023)", 3, "valentine's event 2023", "seki#0001", "", 0, "", "https://i.imgur.com/1vPP5Ko.png", 23),
    new skinInfo("Mahiru Shiina (Maid)", 12400, "shop", "seki#0001", "", 0, "", "https://i.imgur.com/GaytFe7.png", 24),

    
];


module.exports.skins = skins;