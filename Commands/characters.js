// var fs = require('fs');
// const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
// const { characters } = require("../Modules/chars.js");
// const { db, query } = require("../db_handler.js");

// module.exports = {
//     name: 'characters',
//     description: 'Characters',
//     execute(message, args, cmd, client) {

//         let dailies = [ // Type 1: xp, 2: coins, 3: shards, 4: tickets, 5: lootbox
//             new achievInfo("Daily I", "Pull an S tier character", 2, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily II", "Spend 500 Coins", 6, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily III", "Refine a character using shards", 7, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily IV", "Level a character up", 8, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily V", "Open a lootbox", 11, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily VI", "Gift someone a character (A/S/SS Tier)", 12, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily VII", "Gift 5 characters", 13, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily VIII", "Sell 3 characters", 14, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily IX", "Use 5 tickets", 15, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily X", "Block 2 attacks in a row (dungeon)", 16, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily XI", "Use a character ability 10 times", 17, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily XII", "Use a class skill 10 times", 18, "1,2", "xp|10", "coins|125"),
//             new achievInfo("Daily XIII", "Revive yourself 3 times in the dungeon", 19, "1,2", "xp|10", "coins|125"),
//         ];

//         // /* /* Commands */ */ //
//         // /* /* Commands */ */ //
//         // /* /* Commands */ */ //


//         // -- -- -- PLAYGROUND -- -- -- //
//         // -- -- -- PLAYGROUND -- -- -- //
//         // -- -- -- PLAYGROUND -- -- -- //

//         // Simulate completion of the game
//         if (cmd === "sim" && message.author.id === "489490486734880774") {
//             let st = new Date().getTime();
//             let chrlen = characters.length;
//             let lim = Math.ceil(chrlen/2);
//             if (args[0] === "all") lim = chrlen;
//             if (!isNaN(args[0])) lim = parseInt(args[0]);
            
//             let li = lim;
//             let invSim = [];
//             while (li--) invSim.push(Math.floor(Math.random() * chrlen));
//             while ([...new Set(invSim)].length < lim) invSim.push(Math.floor(Math.random() * chrlen));

//             let et = new Date().getTime();
//             message.channel.send(`Time: ${et-st}ms\nPulls: ${invSim.length}\nUnique: ${[...new Set(invSim)].length}\n\nF2P average: ${Math.ceil(invSim.length/(6*9))} days, peak: ${Math.ceil(invSim.length/(6*14))} days\nT1 average: ${Math.ceil(invSim.length/(8*9))} days, peak: ${Math.ceil(invSim.length/(8*14))} days\nT2 average: ${Math.ceil(invSim.length/(9*9))} days, peak: ${Math.ceil(invSim.length/(9*14))} days\nT3-5 average: ${Math.ceil(invSim.length/(10*9))} days, peak: ${Math.ceil(invSim.length/(10*14))} days\nT6 average: ${Math.ceil(invSim.length/(12*9))} days, peak: ${Math.ceil(invSim.length/(12*14))} days\nT7 average: ${Math.ceil(invSim.length/(14*9))} days, peak: ${Math.ceil(invSim.length/(14*14))} days`);
//         };

//         // Calculate the probability of completing the game
//         if (cmd === "prob") {
//             let st = new Date().getTime();
//             let pA = 0;
//             let ca = characters.length;
//             if (args[0]) ca = parseInt(args[0]);
//             for (let ci = ca; ci > 0; ci--) pA += ca/ci;
//             let et = new Date().getTime();
//             message.channel.send(`Time: ${et-st}ms\nAverage Pulls: ${Math.floor(pA*100)/100}`);
//         };

//     }
// };