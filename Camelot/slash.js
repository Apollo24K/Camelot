const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

var commands = [
	{
		data: new SlashCommandBuilder()
				.setName('ability')
				.setDescription('Look up characters with abilities')
				.addStringOption(option => option.setName('character').setDescription('Get more information about a characters ability').setRequired(false))
				.addIntegerOption(option => option.setName('page').setDescription('Select a page to jump to').setRequired(false))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('achievements')
				.setDescription('See your achievements')
				.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('admin')
				.setDescription('Only bot administrators can use this command')
				.addStringOption(option => option.setName('action').setDescription('Choose an action to take').setRequired(true))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('anime')
				.setDescription('Get a list of all anime included in the bot')
				.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('arena')
				.setDescription('Challenge someone to a 1v1')
				.addUserOption(option => option.setName('user').setDescription('user to challenge').setRequired(true)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('avatar')
				.setDescription('Display a users profile picture')
				.addUserOption(option => option.setName('user').setDescription('Get the profile picture of a user')),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('balance')
				.setDescription('Display a players coin balance')
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('buy')
				.setDescription('Buy something from the shop')
				.addStringOption(option =>
					option.setName('item')
						.setDescription('Select item to buy')
						.setRequired(true)
						.addChoices(
							{ name: 'Character Pack', value: "1" },
							{ name: 'Waifu Pack', value: "2" },
							{ name: 'Husbando Pack', value: "3" },
							{ name: 'Character Bundle', value: "4" },
							{ name: 'Rare Pack', value: "5" },
							{ name: 'Morpheus Blessing', value: "6" },
						)
				)
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('camelot')
				.setDescription('Info about Camelot'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('convert')
				.setDescription('Convert shards')
				.addStringOption(option =>
					option.setName('from')
						.setDescription('Select shards to use')
						.setRequired(true)
						.addChoices(
							{ name: 'SS Shards', value: 'ss' },
							{ name: 'S Shards', value: 's' },
							{ name: 'A Shards', value: 'a' },
							{ name: 'B Shards', value: 'b' },
							{ name: 'C Shards', value: 'c' },
							{ name: 'D Shards', value: 'd' },
						)
				)
				.addStringOption(option =>
					option.setName('to')
						.setDescription('Select shards to get')
						.setRequired(true)
						.addChoices(
							{ name: 'SS Shards', value: 'ss' },
							{ name: 'S Shards', value: 's' },
							{ name: 'A Shards', value: 'a' },
							{ name: 'B Shards', value: 'b' },
							{ name: 'C Shards', value: 'c' },
							{ name: 'D Shards', value: 'd' },
						)
				)
				.addStringOption(option => option.setName('amount').setDescription('Amount of shards to get | Keywords: max').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('cooldown')
				.setDescription('See all your timers at once'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('cd')
				.setDescription('See all your timers at once'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('changeimg')
				.setDescription('Change a characters image (premium only)')
				.addStringOption(option => option.setName('character').setDescription('select a character').setRequired(true))
				.addStringOption(option => option.setName('image-url').setDescription('Has to be an imgur.com or imgBB.com link | type reset to remove a characters image instead').setRequired(true))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('class')
				.setDescription('Choose one of 50+ unique classes!')
				.addSubcommand((subcommand) => subcommand.setName('list').setDescription('List all available classes')
					.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
					.addIntegerOption(option => option.setName('page').setDescription('Select a page to jump to').setRequired(false)))
				.addSubcommand((subcommand) => subcommand.setName('info').setDescription('See detailed info about a class')
					.addStringOption(option => option.setName('class').setDescription('Choose a class').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('assign').setDescription('Assign your character a class')
					.addStringOption(option => option.setName('character').setDescription('Choose a character').setRequired(true))
					.addStringOption(option => option.setName('class').setDescription('Choose a class').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('pick').setDescription('Pick a beginner class'))
				.addSubcommand((subcommand) => subcommand.setName('upgrade').setDescription('Upgrade to an advanced or master class')
					.addStringOption(option => option.setName('class').setDescription('Choose a class').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('level').setDescription('See your class level')
					.addStringOption(option => option.setName('class').setDescription('Choose a class').setRequired(false))
					.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false)))
					
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('curse')
				.setDescription('Give coins or characters to other players')
				.addSubcommand((subcommand) => subcommand.setName('list').setDescription('List all curses')
					.addIntegerOption(option => option.setName('page').setDescription('Select a page to jump to').setRequired(false)))
				.addSubcommand((subcommand) => subcommand.setName('info').setDescription('See detailed info about a class')
					.addStringOption(option => option.setName('curse').setDescription('Choose a curse for detailed info').setRequired(true)))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('daily')
				.setDescription('Claim your free daily reward!'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('delay')
				.setDescription('Change the dungeon animation delay (premium only)')
				.addIntegerOption(option => option.setName('int').setDescription('Enter an integer').setRequired(true))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('disable')
				.setDescription('Disable a channel - users won\'t be able to play there')
				.addChannelOption(option => option.setName('channel').setDescription('Select a channel').setRequired(false)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('dungeon')
				.setDescription('Challenge yourself in the dungeon')
				.addIntegerOption(option => option.setName('floor').setDescription('Choose a floor to play in').setRequired(false))
				.addStringOption(option =>
					option.setName('flag')
						.setDescription('Choose a flag')
						.setRequired(false)
						.addChoices(
							{ name: 'skip', value: 'skip' },
						)
				)
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('enable')
				.setDescription('Enable a channel - users will be able to play there')
				.addChannelOption(option => option.setName('channel').setDescription('Select a channel').setRequired(false)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('fav')
				.setDescription('Select your favorite character')
				.addStringOption(option => option.setName('character').setDescription('Select a character').setRequired(true))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('find')
				.setDescription('Find a character in your server')
				.addStringOption(option => option.setName('character').setDescription('Select a character to find').setRequired(true))
				.addIntegerOption(option => option.setName('page').setDescription('Select a page to jump to').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('give')
				.setDescription('Give coins or characters to other players')
				.addSubcommand((subcommand) => subcommand.setName('coins').setDescription('Give someone coins').addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true)).addIntegerOption(option => option.setName('amount').setDescription('How much coins should be sent?').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('character').setDescription('Give someone a character').addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true)).addStringOption(option => option.setName('character').setDescription('Select a character').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('premium').setDescription('Give someone premium (premium only)').addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true)).addIntegerOption(option => option.setName('tier').setDescription('Select the tier you want to gift').setRequired(true)))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('guess')
				.setDescription('Guess the ___ minigames')
				.addSubcommand((subcommand) => subcommand.setName('character').setDescription('Guess the character minigame'))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('help')
				.setDescription('List all commands')
				.addStringOption(option => option.setName('command').setDescription('Need help with a specific command? Type it\'s name in here').setRequired(false)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('info')
				.setDescription('Search for a character in our database')
				.addStringOption(option => option.setName('character').setDescription('Select a character').setRequired(true))
				.addStringOption(option =>
					option.setName('flag')
						.setDescription('Choose how to display the character')
						.setRequired(true)
						.addChoices(
							{ name: 'base', value: 'base' },
							{ name: 'my', value: 'my' },
							{ name: 'detailed', value: 'detailed' },
						)
				)
				.addUserOption(option => option.setName('user').setDescription('Level of user').setRequired(false)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('inventory')
				.setDescription('Look up your character inventory')
				.addStringOption(option =>
					option.setName('sort')
						.setDescription('Sort your inventory')
						.setRequired(false)
						.addChoices(
							{ name: 'alphabetical', value: 'alphabetical' },
							{ name: 'rarity', value: 'rarity' },
							{ name: 'dupes', value: 'dupes' },
						)
				)
				.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('level')
				.setDescription('Display your level')
				.addUserOption(option => option.setName('user').setDescription('Level of user').setRequired(false)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('levelup')
				.setDescription('Levelup your characters')
				.addStringOption(option => option.setName('character').setDescription('Select a character you own').setRequired(true))
				.addStringOption(option => option.setName('by').setDescription('Choose how many level you want your character to advance | Keywords: max').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('list')
				.setDescription('List all characters of a rarity')
				.addStringOption(option =>
					option.setName('rarity')
						.setDescription('Select a rarity')
						.setRequired(true)
						.addChoices(
							{ name: 'SS', value: 'SS' },
							{ name: 'S', value: 'S' },
							{ name: 'A', value: 'A' },
							{ name: 'B', value: 'B' },
							{ name: 'C', value: 'C' },
							{ name: 'D', value: 'D' },
						)
				)
				.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('lootbox')
				.setDescription('See and open your lootboxes')
				.addUserOption(option => option.setName('user').setDescription('See someone elses lootboxes').setRequired(false)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('math')
				.setDescription('Use Camelot\'s built in calculator')
				.addStringOption(option => option.setName('calculation').setDescription('Provide a calculation').setRequired(true)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('open')
				.setDescription('Open a lootbox'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('patreon')
				.setDescription('See our Patreon'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('premium')
				.setDescription('See our Patreon'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('ping')
				.setDescription('Test your latency'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('pity')
				.setDescription('See your pity')
				.addUserOption(option => option.setName('user').setDescription('See someone elses pity')),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('profile')
				.setDescription('Display User Profiles')
				.addUserOption(option => option.setName('user').setDescription('Profile of user')),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('ps')
				.setDescription('Use your stacked pulls (premium only)'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('pull')
				.setDescription('Pull a character')
				.addStringOption(option =>
					option.setName('premium')
						.setDescription('Use all your pulls at once (premium only)')
						.setRequired(false)
						.addChoices(
							{ name: 'all', value: 'all' },
						)
				),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('random')
				.setDescription('Random stuff generator')
				.addSubcommand((subcommand) => subcommand.setName('coin').setDescription('Flip a coin'))
				.addSubcommand((subcommand) => subcommand.setName('name').setDescription('Get a random name suggestion'))
				.addSubcommand((subcommand) => subcommand.setName('number').setDescription('Get a random number between 1-100'))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('rank')
				.setDescription('Rank characters based on their stats')
				.addStringOption(option =>
					option.setName('scope')
						.setDescription('Select server or global rankings')
						.setRequired(true)
						.addChoices(
							{ name: 'base', value: 'base' },
							{ name: 'inventory', value: 'inventory' },
							{ name: 'server', value: 'server' },
							{ name: 'global', value: 'global' },
						)
				)
				.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('recommend')
				.setDescription('Recommends an anime'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('refine')
				.setDescription('Refine a character using shards')
				.addStringOption(option => option.setName('character').setDescription('Select a character').setRequired(true))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('reset')
				.setDescription('Reset a characters level to get some of your invested ressources back')
				.addStringOption(option => option.setName('character').setDescription('Select a character').setRequired(true))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('rp')
				.setDescription('Reset your pull count'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('search')
				.setDescription('Search for an anime')
				.addStringOption(option => option.setName('anime').setDescription('Write the anime name | Possible keywords: last, latest').setRequired(true))
				.addStringOption(option =>
					option.setName('flags')
						.setDescription('Select a flag')
						.setRequired(false)
						.addChoices(
							{ name: 'image', value: 'image' },
						)
				)
				.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('select')
				.setDescription('Select a battle character for the dungeon and more')
				.addStringOption(option => option.setName('character').setDescription('Select a character').setRequired(true))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('sell')
				.setDescription('Sell your characters')
				.addSubcommand((subcommand) => subcommand.setName('character').setDescription('Sell a character').addStringOption(option => option.setName('character').setDescription('Select a character | Possible keywords: last').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('dupes').setDescription('Sell multiple characters')
														 .addIntegerOption(option => option.setName('copies').setDescription('How many copies should they have?').setRequired(false))
														 .addStringOption(option =>
															option.setName('rarity')
																.setDescription('Select rarity of dupes | all rarities will be sold if left empty')
																.setRequired(false)
																.addChoices(
																	{ name: 'S', value: 'S' },
																	{ name: 'A', value: 'A' },
																	{ name: 'B', value: 'B' },
																	{ name: 'C', value: 'C' },
																	{ name: 'D', value: 'D' },
																)
														))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('shards')
				.setDescription('See your shards')
				.addUserOption(option => option.setName('user').setDescription('See someone elses shards')),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('shop')
				.setDescription('See all shop items'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('stats')
				.setDescription('See some stats of camelot'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('submit')
				.setDescription('Send us your ideas and suggestions!')
				.addStringOption(option => option.setName('msg').setDescription('Write us a message').setRequired(true)),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('support')
				.setDescription('Get an invite link to our support server'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('tickets')
				.setDescription('See and open your tickets')
				.addUserOption(option => option.setName('user').setDescription('See someone elses tickets')),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('top')
				.setDescription('Rank players from your server or globally')
				.addStringOption(option =>
					option.setName('scope')
						.setDescription('Select server or global rankings')
						.setRequired(true)
						.addChoices(
							{ name: 'server', value: 'server' },
							{ name: 'global', value: 'global' },
						)
				)
				.addStringOption(option =>
					option.setName('flag')
						.setDescription('Choose how to rank')
						.setRequired(true)
						.addChoices(
							{ name: 'level', value: 'level' },
							{ name: 'pulls', value: 'pulls' },
							{ name: 'dungeon', value: 'dungeon' },
							{ name: 'chars', value: 'chars' },
							{ name: 'progress', value: 'progress' },
							// { name: 'anime', value: 'anime' },
							{ name: 'lilies', value: 'lilies' },
							{ name: 'achievements', value: 'achievements' },
						)
				)
				.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('trade')
				.setDescription('Trade characters')
				.addUserOption(option => option.setName('user').setDescription('Select a user to trade with').setRequired(true))
				.addStringOption(option => option.setName('give').setDescription('Select a character to give').setRequired(true))
				.addStringOption(option => option.setName('receive').setDescription('Select a character to receive').setRequired(true))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('trial')
				.setDescription('Try out characters and classes')
				.addStringOption(option => option.setName('character').setDescription('Choose a character to try').setRequired(false))
				.addStringOption(option => option.setName('class').setDescription('Choose a class to try').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('vote')
				.setDescription('Get a free lootbox and pull reset'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('weekly')
				.setDescription('Claim your weekly rewards! (premium only)'),
	}.data.toJSON(),
];


// Place your client and guild ids here
const clientId = '706183309943767112';

// commands = commands.map((e) => e.data.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	};

	console.log(`Added ${commands.length} commands ✓`);

})();
