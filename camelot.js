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

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Extract the required classes from the discord.js module
const { MessageEmbed, MessageAttachment } = require('discord.js');

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
	client.user.setPresence({ activity: { name: 'SAO', type: 'WATCHING'}, status: 'online'})

  // Timer -> if hour == even && minute == 0 -> delete every content in pullcount
  var timeMinutes = new Date().getMinutes();
  var timeHours = new Date().getHours();
  var checkminutes = 1, checkthe_interval = checkminutes * 60 * 1000;
		  setInterval(function () 
      {
        console.log("Minute");
			  if (timeHours%2 === 0 && timeMinutes === 0)
			  {
				    message.channel.send("You can now repull!");
            fs.truncate('Storage/pullcount.json', 0, (err) => { if (err) console.error(err) });
			  }
		  }, checkthe_interval);
          
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
/*
  client.on('clickButton', async(button) => {
    if (button.id === "button") {
    button.channel.send("I like green!")
    } 
    else if (button.id === "button1") {
      button.channel.send("I like red");
  }
  console.log(button.reply.defer());
  });
*/

  const prefix = "§";
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

  // Command List
  if (cmd === "commands" || cmd === "cmd" || cmd === "help" || cmd === "h") {
    client.commands.get('help').execute(message, args);
  };

  // User Avatar
  if (cmd === "avatar" || cmd === "a") {
    client.commands.get('avatar').execute(message, args);
  };

  // Color Picker
  if (cmd === "colorpicker" || cmd === "cp") {
    message.channel.send("https://htmlcolorcodes.com/color-picker/")
  };

  // Characters
  if (cmd === "pull" || cmd === "p") {
    client.commands.get('characters').execute(message, args);
  };
  if (cmd === "chika") {
    client.commands.get('chika').execute(message, args);
  };
  if (cmd === "asuna") {
    client.commands.get('asuna').execute(message, args);
  };

  // Favourite Character
  if (cmd === "favourite" || cmd === "fav") {
    client.commands.get('characters').execute(message, args);
  };

  // Inventory
  if (cmd === "inv" || cmd === "inventory") {
    client.commands.get('characters').execute(message, args, disbut, client);
  };

  // Profile
  if (cmd === "profile" || cmd === "pr") {
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

  // CCG stats
  if (cmd === "stats") {
    client.commands.get('characters').execute(message, args);
  };

  // Playground
  if (cmd === "test") {
    client.commands.get('test').execute(message, args, client);
  };

  // Recommendations
  if (cmd === "recommendations"|| cmd === "recommend" || cmd === "rec" || cmd === "r") {
    if (args[0]) return;
    client.commands.get('recommendations').execute(message, args);
  };

  
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

  if (cmd === "test2") {
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



  // Button test
  if (cmd === "em") {
    
    let button = new disbut.MessageButton()
      .setLabel("This is a button!")
      .setID("click_to_function")
      .setStyle("blurple");

    message.channel.send("Message with a button!", button);

    /*
    client.on('clickButton', async (button) => {
      if (button.id === 'click_to_function') {
        button.channel.send("test UwU");
        button.reply.defer();
      };
      //button.reply.defer();
    });
    */
   
    client.on('clickButton', async (button) => {
        button.channel.send("test UwU");
      //await button.reply.send('Button Interaction Test');
    })
    button.reply.defer();
    
    // PROBLEM: button.reply.defer()  is wrong
    
  };

});