var fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const math = require('mathjs');
const client = new Discord.Client();
const disbut = require('discord-buttons');
disbut(client);
client.commands = new Discord.Collection();
client.login(config.token)

var userData = JSON.parse(fs.readFileSync('Storage/userData.json', 'utf8'));
var pullCount = JSON.parse(fs.readFileSync('Storage/pullCount.json', 'utf8'));
var daily = JSON.parse(fs.readFileSync('Storage/daily.json', 'utf8'));
var xp = JSON.parse(fs.readFileSync('Storage/xp.json', 'utf8'));

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Extract the required classes from the discord.js module
const { MessageEmbed, MessageAttachment } = require('discord.js');

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
	client.user.setPresence({ activity: { name: 'Fate', type: 'WATCHING'}, status: 'online'})

  setInterval(function() {
    // Pull Reset
    if (new Date().getHours() % 2 === 0 && new Date().getMinutes() === 0) {
      let keys = Object.keys(pullCount);
      for (i=0; i < keys.length; i++) {
        pullCount[keys[i]] = 2;
        if (xp[keys[i]] > 380) pullCount[keys[i]]--;
        if (xp[keys[i]] > 1525) pullCount[keys[i]]--;
      };
      fs.writeFile('Storage/pullCount.json', JSON.stringify(pullCount), (err) => {
        if (err) console.error(err);
      });
    };

    // Daily Reset
    if (new Date().getHours() === 23 && new Date().getMinutes() === 59) {
      let keys = Object.keys(daily);
      for (i=0; i < keys.length; i++) {
        daily[keys[i]] = 0;
      };
      fs.writeFile('Storage/daily.json', JSON.stringify(daily), (err) => {
        if (err) console.error(err);
      });
    };

  }, 60000);
  
});

client.on("message", async message => {


  // User Data
  if (!userData[message.author.id + message.guild.id]) userData[message.author.id + message.guild.id] = {
    messagesSent: 0
  } 
  userData[message.author.id + message.guild.id].messagesSent++;

  fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
    if (err) console.error(err);
  });


  const prefix = "!";
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();


  // Exit and stop if it's not there
  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;


  // user stats
  if (cmd === "userstats") {
    if (!args[0]) return message.channel.send("You have sent **" + userData[message.author.id + message.guild.id].messagesSent + "** messages.");
    if (!args[0].startsWith('<@')) return message.channel.send("You have sent **" + userData[message.author.id + message.guild.id].messagesSent + "** messages.");
    if (getUserFromMention(args[0]).id === message.author.id) return message.channel.send("You have sent **" + userData[message.author.id + message.guild.id].messagesSent + "** messages.");
    let user = getUserFromMention(args[0])
    if (!userData[user.id + message.guild.id]) userData[user.id + message.guild.id] = {
      messagesSent: 0
    };
    if (args[0]) {
      let user = getUserFromMention(args[0]);
      message.channel.send("He has sent **" + userData[user.id + message.guild.id].messagesSent + "** messages.")
    };
  };

  // Get the mention ID
  function getUserFromMention(mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return;
    const id = matches[1];
    return client.users.cache.get(id);
  };
 
  // Ping!
  if (cmd === "ping") {
    const embed1 = new MessageEmbed()
    .setTitle('pong! 🏓')
    .setColor(0xbbffff)
    const msg = await message.channel.send(embed1);

    const embed2 = new MessageEmbed()
    .setTitle(`pong! 🏓 ${Math.floor(msg.createdAt - message.createdAt)}ms`)
    .setColor(0xbbffff)
    msg.edit(embed2);
  };
  if (cmd === "pong") {
    const embed1 = new MessageEmbed()
    .setTitle('ping! 🏓')
    .setColor(0xbbffff)
    const msg = await message.channel.send(embed1);

    const embed2 = new MessageEmbed()
    .setTitle(`ping! 🏓 ${Math.floor(msg.createdAt - message.createdAt)}ms`)
    .setColor(0xbbffff)
    msg.edit(embed2);
  }

  // Purge Command
  if (cmd === "purge") {
    client.commands.get('purge').execute(message, args);
  };

  // Command List
  if (cmd === "commands" || cmd === "cmd" || cmd === "help" || cmd === "h") {
    client.commands.get('help').execute(message, args);
  };

  // User Avatar
  if (cmd === "avatar") {
    client.commands.get('avatar').execute(message, args);
  };

  // Infos about the bot
  if (cmd === "camelot") {
    client.commands.get('info').execute(message, args);
  };

  // Characters
  if (cmd === "pull" || cmd === "p") {
    client.commands.get('characters').execute(message, args);
  };
  if (cmd === "chika") {
    client.commands.get('chika').execute(message, args);
  };

  // Inventory
  if (cmd === "inv" || cmd === "inventory") {
    client.commands.get('characters').execute(message, args, disbut, client);
  };

  // Profile
  if (cmd === "profile" || cmd === "pr") {
    client.commands.get('characters').execute(message, args);
  };

  // Level
  if (cmd === "level" || cmd === "lvl") {
    client.commands.get('characters').execute(message, args);
  };

  // Top
  if (cmd === "top") {
    client.commands.get('characters').execute(message, args);
  };

  // infomy
  if (cmd === "im" || cmd === "imy") {
    client.commands.get('characters').execute(message, args);
  };

  // Charakter info
  if (cmd === "info" || cmd === "i") {
    client.commands.get('characters').execute(message, args);
  };

  // Anime search
  if (cmd === "search" || cmd === "s") {
    client.commands.get('characters').execute(message, args);
  };

  // Daily
  if (cmd === "daily") {
    client.commands.get('characters').execute(message, args);
  };

  // Sell
  if (cmd === "sell") {
    client.commands.get('characters').execute(message, args);
  };

  // CCG stats
  if (cmd === "stats") {
    client.commands.get('characters').execute(message, args);
  };

  // List all anime
  if (cmd === "anime" || cmd === "a") {
    client.commands.get('characters').execute(message, args);
  };

  // Favourite Char
  if (cmd === "fav" || cmd === "favourite" || cmd === "favorite") {
    client.commands.get('characters').execute(message, args);
  };

  // Recommendations
  if (cmd === "recommendations"|| cmd === "recommend" || cmd === "rec" || cmd === "r") {
    if (args[0]) return;
    client.commands.get('recommendations').execute(message, args);
  };

  /* How to use Attachements
  if (cmd === "attachement") {
    const attachement = new MessageAttachement("url")
  };
  */
  
  // Math
  // RAM Usage
  if (cmd === "ram" || cmd === "memory") {
    const ramUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10;
    const ramEmbed = new MessageEmbed()
    .setTitle('Total Memory Usage')
    .setColor(0xbbffff)
    .setDescription(`Currently **${ramUsage}MB** is beeing used`)
    message.channel.send(ramEmbed);
  };

  // Calculator
  if (cmd === "math" || cmd === "m") {
    if (!args[0]) return message.channel.send("Please input a calculation.");
    let resp;
    try {
      resp = math.evaluate(args.join(" "));
    } catch (e) {
      return message.channel.send("Please input a valid calculation.");
    }
    const embedCalculator = new MessageEmbed()
    .setTitle('Camelot Calculator')
    .setColor(0xbbffff)
    .addField("The result is", `\`\`\`js\n${resp}\`\`\``)
    message.channel.send(embedCalculator)
  };

  // Arguments
  if (cmd === 'args-info') {
    if (!args.length) {
      return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
    }
    message.channel.send(`Command name: ${cmd}\nArguments: ${args}`);
  };


  // -- -- -- PLAYGROUND -- -- -- //
  // -- -- -- PLAYGROUND -- -- -- //
  // -- -- -- PLAYGROUND -- -- -- //

  if (cmd === "test") {
    const ranum = Math.floor(Math.random() * 2);
    let i = 0;
    class animeInfo {
      constructor(name, score, year, id) {
        this._name = name;
        this._score = score;
        this._year = year;
        this._id = id;
      };
      get name() {
        return this._name;
      };
      get score() {
        return this._score;
      };
      get year() {
        return this._year;
      };
      get id() {
        return this._id;
      };
    };
    const demon_slayer = new animeInfo("Demon Slayer", "9", "2019", 0);
    i++;
    const one_piece = new animeInfo("One Piece", "10", "1999", 1);
    i++;
    /*
    message.channel.send("**Anime: **" + demon_slayer.name + "\n**Score: **" + demon_slayer.score + "\n**Release Date: **" + demon_slayer.year);
    message.channel.send("**Anime: **" + one_piece.name + "\n**Score: **" + one_piece.score + "\n**Release Date: **" + one_piece.year);
    */

    if (ranum == demon_slayer.id) {
      message.channel.send("**Anime: **" + demon_slayer.name + "\n**Score: **" + demon_slayer.score + "\n**Release Date: **" + demon_slayer.year);
    } else if (ranum == one_piece.id) {
      message.channel.send("**Anime: **" + one_piece.name + "\n**Score: **" + one_piece.score + "\n**Release Date: **" + one_piece.year);
    };

  };


  // Empty
  if (cmd === "em") {
    let button = new disbut.MessageButton()
      .setLabel("This is a button!")
      .setID("click_to_function")
      .setStyle("blurple");

    message.channel.send("Message with a button!", button);

    client.on('clickButton', async (button) => {
      if (button.id === 'click_to_function') {
        button.channel.send("test UwU");
      };
      button.reply.defer();
    });
  };

  // Rarity Test
  if (cmd === "testss") {
    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setThumbnail("https://i.imgur.com/n3qj4i2.png")
    .setImage("https://i.ibb.co/YZXYshc/asna.png")
    .setDescription("**Asuna Yuuki**\nSword Art Online")
    message.channel.send(Embed);
  };
  if (cmd === "tests") {
    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setThumbnail("https://i.imgur.com/aSXEB8J.png")
    .setImage("https://i.ibb.co/YZXYshc/asna.png")
    .setDescription("**Asuna Yuuki**\nSword Art Online")
    message.channel.send(Embed);
  };
  if (cmd === "testa") {
    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setThumbnail("https://i.imgur.com/MNNSMIP.png")
    .setImage("https://i.ibb.co/YZXYshc/asna.png")
    .setDescription("**Asuna Yuuki**\nSword Art Online")
    message.channel.send(Embed);
  };
  if (cmd === "testb") {
    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setThumbnail("https://i.imgur.com/C8GpHnb.png")
    .setImage("https://i.ibb.co/YZXYshc/asna.png")
    .setDescription("**Asuna Yuuki**\nSword Art Online")
    message.channel.send(Embed);
  };
  if (cmd === "testc") {
    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setThumbnail("https://i.imgur.com/bF4Uwq7.png")
    .setImage("https://i.ibb.co/YZXYshc/asna.png")
    .setDescription("**Asuna Yuuki**\nSword Art Online")
    message.channel.send(Embed);
  };
  if (cmd === "testd") {
    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setThumbnail("https://i.imgur.com/qHR5lBz.png")
    .setImage("https://i.ibb.co/YZXYshc/asna.png")
    .setDescription("**Asuna Yuuki**\nSword Art Online")
    message.channel.send(Embed);
  };

  if (cmd === "test2") {
    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setThumbnail("https://i.imgur.com/n3qj4i2.png")
    .setImage("https://i.ibb.co/YZXYshc/asna.png")
    .setDescription("**Asuna Yuuki**\nSword Art Online\n<:starfiles:869132309125824552><:starfiles:869132309125824552><:starfiles_hollow:869132322857947136><:starfiles_hollow:869132322857947136><:starfiles_hollow:869132322857947136>")
    message.channel.send(Embed);
  };

  if (cmd === "test7") {

    class testClass {
      constructor(name, alias, anime, gender, image, id, rarity) {
        this._name = name;
        this._alias = alias;
        this._anime = anime;
        this._gender = gender;
        this._image = image;
        this._id = id;
        this._rarity = rarity;
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
    }

    const array2 = [
      new testClass("Donquixote Rosinante", "Corazon", "One Piece", "M", "https://i.imgur.com/lbg3UeV.png", 0, "SS"),
      new testClass("Zenitsu Agatsuma", "", "Demon Slayer", "M", "https://i.imgur.com/P54BqWy.png", 1, "B"),
      new testClass("Nino Nakano", "", "5-toubun no Hanayome", "F", "https://imgur.com/k0CY0zg.jpg", 2, "S")
    ];

    message.channel.send(array2[1].name);
  };

});