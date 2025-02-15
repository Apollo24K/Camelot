import { SlashCommand } from '../types';

interface MatchesType {
   [key: string]: string[];
};

function weightedRandom(options: MatchesType): string {
   const entries = Object.entries(options);

   const weights = [entries[0][1].length];
   for (let i = 1; i < entries.length; i++) {
      weights[i] = entries[i][1].length + weights[i - 1];
   }

   const random = Math.random() * weights[weights.length - 1];

   for (let i = 0; i < weights.length; i++) {
      if (weights[i] > random) return entries[i][0];
   }
   return entries[0][0];
};

const levenshteinDistance = (str1 = '', str2 = ''): number => {
   const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
   for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
   }
   for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
   }
   for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
         const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
         track[j][i] = Math.min(
            track[j][i - 1] + 1, // deletion
            track[j - 1][i] + 1, // insertion
            track[j - 1][i - 1] + indicator, // substitution
         );
      }
   }
   return track[str2.length][str1.length];
};

const words = ["Overload", "layer", "laid", "bender", "jail", "clock", "tea", "torn", "fame", "pinch", "fins", "stroke", "bell", "farce", "bust", "lice", "ride", "brand", "baka", "futa", "call", "land", "hand", "funny", "blond", "deal", "dealer", "heal", "healer", "calls", "slide", "ride", "leg", "soup", "bill", "water", "clone", "cloner", "bent", "slack", "bribe", "nope", "lame", "bang", "bar", "puke", "slave", "slaver", "glue", "casket", "you", "die", "lie", "dire", "dent", "bear", "bears", "dnd", "dad", "hair", "hairy", "fry", "moan", "play", "player", "voice", "noice", "mod", "yuri", "brothel", "nail", "fail", "dater", "date", "rate", "kink", "kinks", "wank", "wanking", "teats", "beans", "food", "foot", "herpes", "defective", "lick", "lunch", "stab", "wife", "wives", "fate", "fade", "late", "right", "tight", "niece", "lemon", "demon", "suit", "gojo", "jojo", "lime", "dnd", "bitch", "witch", "trick", "truck", "kintama", "scone", "lamers", "slack", "grass", "brat", "brats", "beach", "far", "war", "netherland", "topless", "mate", "made", "pie", "eats", "beast", "yeast", "drag-on", "can", "lane", "pain"];

function ruin(input: string): string {
   const matches: MatchesType = {};
   input.toLowerCase().split(/[- /!?.]/).forEach((e) => {
      words.forEach((w) => {
         if (levenshteinDistance(e, w) === 1) {
            if (e in matches) matches[e].push(w);
            else matches[e] = [w];
         }
      });
   });

   if (Object.keys(matches).length === 0) return `I'm sorry I couldn't ruin \`${input}\` by changing only 1 letter.\nIf you know of a good pun, feel free to let us know on our \`/support\` server so we can improve the algorithm!`;
   const weightedMatch = weightedRandom(matches);

   return input.toLowerCase().replace(weightedMatch, matches[weightedMatch][Math.floor(Math.random() * matches[weightedMatch].length)]);
};

const exportCommand: SlashCommand = {
   name: 'ruin',
   async execute({ interaction }) {
      const title = interaction.options.getString('title');
      if (!title) return interaction.reply('Please provide a title to ruin');

      if (title.toLowerCase() === "naruto") return interaction.reply("boruto");

      return interaction.reply(ruin(title));
   },
};

export default exportCommand;
