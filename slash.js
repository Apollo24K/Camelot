/*eslint-disable no-mixed-spaces-and-tabs */
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

const commands = [
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
	// {
	// 	data: new SlashCommandBuilder()
	// 			.setName('activate')
	// 			.setDescription('Activate your premium')
	// 			.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false)),
	// }.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('admin')
				.setDescription('Only bot administrators can use this command')
				.addStringOption(option => option.setName('action').setDescription('Choose an action to take').setRequired(true))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
				.addStringOption(option =>
					option.setName('ephemeral')
						.setDescription('Ephemeral?')
						.setRequired(false)
						.addChoices(
							{ name: 'true', value: "true" },
							{ name: 'false', value: "false" },
						)
				)
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
				.addStringOption(option =>
					option.setName('currency')
						.setDescription('Select a currency to view')
						.setRequired(false)
						.addChoices(
							{ name: 'coins', value: "coins" },
							{ name: 'genesis gems', value: "gems" },
							{ name: 'lilies', value: "lilies" },
						)
				)
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('boss')
				.setDescription('An event gamemode')
				.addSubcommand((subcommand) => subcommand.setName('rush').setDescription('boss rush (event)'))
				.addSubcommand((subcommand) => subcommand.setName('hunt').setDescription('boss hunt (event)')),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('buy')
				.setDescription('Buy something from the shop')
				.addSubcommand((subcommand) => subcommand.setName('character').setDescription('Buy a character pack!')
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
					))
				.addSubcommand((subcommand) => subcommand.setName('chest').setDescription('Buy a chest!')
					.addStringOption(option =>
						option.setName('item')
							.setDescription('Select item to buy')
							.setRequired(true)
							.addChoices(
								{ name: 'Common Chest', value: "451" },
								{ name: 'Rare Chest', value: "452" },
								{ name: 'Sublime Chest', value: "453" },
								{ name: 'Glorious Chest', value: "454" },
								{ name: 'Luxurious Chest', value: "456" },
								{ name: 'Royal Chest', value: "457" },
								{ name: 'Deluxe Chest', value: "458" },
							)
					)
					.addIntegerOption(option => option.setName('amount').setDescription('amount to purchase').setRequired(false)))
				.addSubcommand((subcommand) => subcommand.setName('exchange').setDescription('Buy an item!')
					.addStringOption(option => option.setName('item').setDescription('select an item').setRequired(true)))
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
				.addSubcommand((subcommand) => subcommand.setName('shards').setDescription('convert shards')
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
					.addStringOption(option => option.setName('amount').setDescription('Amount of shards to get | Keywords: max').setRequired(false)))
				.addSubcommand((subcommand) => subcommand.setName('scrolls').setDescription('convert levelup material')
					.addStringOption(option =>
						option.setName('type')
							.setDescription('choose if you want to convert weapon or armor levelup materials')
							.setRequired(true)
							.addChoices(
								{ name: 'weapon', value: '0' },
								{ name: 'armor', value: '1' },
							)
					)
					.addStringOption(option =>
						option.setName('from')
							.setDescription('Select shards to use')
							.setRequired(true)
							.addChoices(
								{ name: 'Mythical', value: '54' },
								{ name: 'Rare', value: '52' },
								{ name: 'Common', value: '50' },
							)
					)
					.addStringOption(option =>
						option.setName('to')
							.setDescription('Select shards to get')
							.setRequired(true)
							.addChoices(
								{ name: 'Divine', value: '56' },
								{ name: 'Mythical', value: '54' },
								{ name: 'Rare', value: '52' },
							)
					)
					.addStringOption(option => option.setName('amount').setDescription('Amount of shards to get | Keywords: max').setRequired(false)))
}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('cd')
				.setDescription('See all your timers at once')
				.addUserOption(option => option.setName('user').setDescription('See someone elses cooldown')),
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
				.addSubcommand((subcommand) => subcommand.setName('transfer').setDescription('Transfer your class xp to another class')
					.addStringOption(option => option.setName('from').setDescription('Your old class').setRequired(true))
					.addStringOption(option => option.setName('to').setDescription('Your new class').setRequired(true))),
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
	// {
	// 	data: new SlashCommandBuilder()
	// 			.setName('disable')
	// 			.setDescription('Disable a channel - users won\'t be able to play there')
	// 			.addChannelOption(option => option.setName('channel').setDescription('Select a channel').setRequired(false)),
	// }.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('disassemble')
				.setDescription('Disassemble your items')
				.addSubcommand((subcommand) => subcommand.setName('items').setDescription('Dissassemble an item').addStringOption(option => option.setName('items').setDescription('Select items to disassemble (use their IDs separated by comma ",")').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('all').setDescription('Dissassemble items in mass')
					.addStringOption(option =>
					option.setName('grade')
						.setDescription('Select grade of items | all rarities (excluding genesis) will be sold if left empty')
						.setRequired(false)
						.addChoices(
							{ name: 'Mythical', value: 'mythical' },
							{ name: 'Legendary', value: 'legendary' },
							{ name: 'Unique', value: 'unique' },
							{ name: 'Rare', value: 'rare' },
							{ name: 'Special', value: 'special' },
							{ name: 'Normal', value: 'normal' },
						)
					)
					.addStringOption(option =>
						option.setName('type')
							.setDescription('Select type of items | all types will be sold if left empty')
							.setRequired(false)
							.addChoices(
								{ name: 'Sword', value: 'sword' },
								{ name: 'Staff', value: 'staff' },
								{ name: 'Axe', value: 'axe' },
								{ name: 'Bow', value: 'bow' },
								{ name: 'Lance', value: 'lance' },
								{ name: 'Dagger', value: 'dagger' },
								{ name: 'Shield', value: 'shield' },
								{ name: 'Helmet', value: 'helmet' },
								{ name: 'Cuirass', value: 'cuirass' },
								{ name: 'Gloves', value: 'gloves' },
								{ name: 'Boots', value: 'boots' },
							)
					)
					.addStringOption(option => option.setName('exclude').setDescription('Select items to be excluded (use their IDs separated by comma ",")').setRequired(false))
				)
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('dungeon')
				.setDescription('Challenge yourself in the dungeon')
				.addIntegerOption(option => option.setName('floor').setDescription('Choose a floor to play in').setRequired(false))
				.addStringOption(option =>
					option.setName('difficulty')
						.setDescription('Choose a difficulty')
						.setRequired(false)
						.addChoices(
							{ name: 'easy', value: '0' },
							{ name: 'difficult', value: '1' },
							{ name: 'hardcore', value: '2' },
						)
				)
				.addStringOption(option =>
					option.setName('flag')
						.setDescription('Choose a flag')
						.setRequired(false)
						.addChoices(
							{ name: 'skip', value: 'skip' },
							{ name: 'skip all', value: 'all' },
						)
				)
	}.data.toJSON(),
	// {
	// 	data: new SlashCommandBuilder()
	// 			.setName('enable')
	// 			.setDescription('Enable a channel - users will be able to play there')
	// 			.addChannelOption(option => option.setName('channel').setDescription('Select a channel').setRequired(false)),
	// }.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('ep')
				.setDescription('EP calculator')
				.addNumberOption(option => option.setName('hp').setDescription('Choose your HP').setRequired(true))
				.addNumberOption(option => option.setName('atk').setDescription('Choose your ATK').setRequired(true))
				.addNumberOption(option => option.setName('def').setDescription('Choose your DEF').setRequired(true))
				.addNumberOption(option => option.setName('crit_rate').setDescription('Choose your crit rate').setRequired(false))
				.addNumberOption(option => option.setName('crit_damage').setDescription('Choose your crit damage').setRequired(false))
				.addNumberOption(option => option.setName('dodge').setDescription('Choose your dodge chance').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('event')
				.setDescription('Event commands')
				.addSubcommand((subcommand) => subcommand.setName('rewards').setDescription('Event rewards')),
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
				.setName('fish')
				.setDescription('Catch some fish'),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('forge')
				.setDescription('Buy an item from the forgery')
				.addStringOption(option => option.setName('item').setDescription('Write the name or ID of the item to forge').setRequired(false))
				.addStringOption(option =>
					option.setName('grade')
						.setDescription('filter for a specific grade')
						.setRequired(false)
						.addChoices(
							{ name: 'legendary', value: 'legendary' },
							{ name: 'unique', value: 'unique' },
							{ name: 'rare', value: 'rare' },
							{ name: 'special', value: 'special' },
							{ name: 'normal', value: 'normal' },
						)
				)
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
				.addSubcommand((subcommand) => subcommand.setName('character').setDescription('Guess the character minigame')
					.addStringOption(option =>
						option.setName('difficulty')
							.setDescription('Choose a difficulty')
							.setRequired(false)
							.addChoices(
								{ name: 'easy', value: 'easy' },
								{ name: 'normal', value: 'normal' },
								{ name: 'hard', value: 'hard' },
								{ name: 'impossible', value: 'impossible' },
							)
					))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('guild')
				.setDescription('Item related commands')
				.addSubcommand((subcommand) => subcommand.setName('create').setDescription('Create a guild')
					.addStringOption(option => option.setName('name').setDescription('name your guild').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('find').setDescription('Search for a guild')
					.addStringOption(option => option.setName('name').setDescription('name to search for').setRequired(false))
					.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false)))
				.addSubcommand((subcommand) => subcommand.setName('join').setDescription('Join a guild')
					.addStringOption(option => option.setName('code').setDescription('join code of the guild').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('leave').setDescription('Leave a guild'))
				.addSubcommand((subcommand) => subcommand.setName('promote').setDescription('Promote someone in your guild')
					.addUserOption(option => option.setName('user').setDescription('Select a user to be kicked').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('demote').setDescription('Demote someone in your guild')
					.addUserOption(option => option.setName('user').setDescription('Select a user to be kicked').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('kick').setDescription('Kick someone from your guild')
					.addUserOption(option => option.setName('user').setDescription('Select a user to be kicked').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('invite').setDescription('Invite someone to your guild')
					.addUserOption(option => option.setName('user').setDescription('Select a user to invite').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('view').setDescription('View a guild')
					.addStringOption(option => option.setName('id').setDescription('search for a guild using its ID').setRequired(false))
					.addUserOption(option => option.setName('user').setDescription('Select a user to be kicked').setRequired(false)))
				.addSubcommand((subcommand) => subcommand.setName('edit').setDescription('Edit guild settings')
					.addStringOption(option =>
						option.setName('setting')
							.setDescription('Choose a difficulty')
							.setRequired(true)
							.addChoices(
								{ name: 'Embed Color', value: 'color' },
								{ name: 'Description', value: 'description' },
								{ name: 'Banner', value: 'banner'},
								{ name: 'Icon', value: 'icon'},
								{ name: 'Rename', value: 'rename' },
								{ name: 'Join Settings', value: 'canjoin' },
								{ name: 'Change Join Code', value: 'changecode' },
							)
					)
					.addStringOption(option => option.setName('input').setDescription('setting').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('top').setDescription('See the guild leaderboards')
					.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false)))
				.addSubcommand((subcommand) => subcommand.setName('donate').setDescription('Donate coins or gems to your guild')
					.addStringOption(option =>
						option.setName('currency')
							.setDescription('choose the currency to donate')
							.setRequired(true)
							.addChoices(
								{ name: 'Coins', value: 'coins' },
								{ name: 'Gems', value: 'gems' },
							)
					)
					.addIntegerOption(option => option.setName('amount').setDescription('choose how much you want to donate').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('levelup').setDescription('Level up a guild'))
				.addSubcommand((subcommand) => subcommand.setName('upgrade').setDescription('upgrade a perk of your guild')
					.addStringOption(option =>
						option.setName('perk')
							.setDescription('choose the perk you want to upgrade')
							.setRequired(true)
							.addChoices(
								{ name: 'XP Buffs', value: 'xpbuff' },
								{ name: 'Loot Buffs', value: 'lootbuff' },
								{ name: 'Timers', value: 'cdreduction' },
							)
					))
				.addSubcommand((subcommand) => subcommand.setName('convert').setDescription('Convert gems in your treasury into coins')
					.addIntegerOption(option => option.setName('amount').setDescription('Choose how many you want to convert').setRequired(true)))

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
							// { name: 'skins', value: 'skins' },
							{ name: 'chronological', value: 'chronological' },
						)
				)
				.addIntegerOption(option => option.setName('page').setDescription('Choose a page to jump to').setRequired(false))
				.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('item')
				.setDescription('Item related commands')
				.addSubcommand((subcommand) => subcommand.setName('list').setDescription('List all available items')
					.addStringOption(option =>
						option.setName('type')
							.setDescription('filter for a specific type of item')
							.setRequired(true)
							.addChoices(
								{ name: 'weapons', value: 'weapons' },
								{ name: 'armor', value: 'armor' },
								{ name: 'fish', value: 'fish' },
								{ name: 'loot', value: 'loot' },
								{ name: 'sword', value: 'sword' },
								{ name: 'staff', value: 'staff' },
								{ name: 'axe', value: 'axe' },
								{ name: 'bow', value: 'bow' },
								{ name: 'lance', value: 'lance' },
								{ name: 'dagger', value: 'dagger' },
								{ name: 'shield', value: 'shield' },
							)
					)
					.addIntegerOption(option => option.setName('page').setDescription('Select a page to jump to').setRequired(false)))
				.addSubcommand((subcommand) => subcommand.setName('info').setDescription('See detailed info about an item')
					.addStringOption(option => option.setName('item').setDescription('choose an item').setRequired(true))
					.addStringOption(option =>
						option.setName('flag')
							.setDescription('Choose how to display the item')
							.setRequired(true)
							.addChoices(
								{ name: 'base', value: 'base' },
								{ name: 'my', value: 'my' },
							)
					)
					.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false)))
				.addSubcommand((subcommand) => subcommand.setName('equip').setDescription('Equip your character with an item')
					.addStringOption(option => option.setName('character').setDescription('Choose a character').setRequired(true))
					.addStringOption(option => option.setName('item').setDescription('Choose an item').setRequired(true)))
				.addSubcommand((subcommand) => subcommand.setName('levelup').setDescription('Levelup an item')
					.addStringOption(option => option.setName('id').setDescription('Choose an item to level up').setRequired(true)))
				// .addSubcommand((subcommand) => subcommand.setName('pick').setDescription('Pick a beginner class'))
				// .addSubcommand((subcommand) => subcommand.setName('level').setDescription('See your class level')
				// 	.addStringOption(option => option.setName('class').setDescription('Choose a class').setRequired(false))
				// 	.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false)))
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('items')
				.setDescription('Look up your item inventory')
				.addSubcommand((subcommand) => subcommand.setName('loot').setDescription('See your loot inventory')
					.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
					.addIntegerOption(option => option.setName('page').setDescription('Select a page to jump to').setRequired(false))
					.addStringOption(option =>
						option.setName('type')
							.setDescription('filter for a specific item')
							.setRequired(false)
							.addChoices(
								{ name: 'loot', value: 'loot' },
								{ name: 'chest', value: 'chest' },
								{ name: 'fish', value: 'fish' },
								{ name: 'ascension', value: 'ascension' },
								{ name: 'crafting', value: 'crafting' },
								{ name: 'levelup', value: 'levelup' },
							)
					))
				.addSubcommand((subcommand) => subcommand.setName('weapons').setDescription('See your weapon inventory')
					.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
					.addIntegerOption(option => option.setName('page').setDescription('Select a page to jump to').setRequired(false))
					.addStringOption(option =>
						option.setName('type')
							.setDescription('filter for a specific type of weapon')
							.setRequired(false)
							.addChoices(
								{ name: 'sword', value: 'sword' },
								{ name: 'staff', value: 'staff' },
								{ name: 'axe', value: 'axe' },
								{ name: 'bow', value: 'bow' },
								{ name: 'lance', value: 'lance' },
								{ name: 'dagger', value: 'dagger' },
								{ name: 'shield', value: 'shield' },
							)
					))
				.addSubcommand((subcommand) => subcommand.setName('armor').setDescription('See your armor inventory')
					.addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
					.addIntegerOption(option => option.setName('page').setDescription('Select a page to jump to').setRequired(false))
					.addStringOption(option =>
						option.setName('type')
							.setDescription('filter for a specific type of armor')
							.setRequired(false)
							.addChoices(
								{ name: 'sets', value: 'sets' },
								{ name: 'helmet', value: 'helmet' },
								{ name: 'cuirass', value: 'cuirass' },
								{ name: 'gloves', value: 'gloves' },
								{ name: 'boots', value: 'boots' },
							)
					))
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
				.addStringOption(option =>
					option.setName('filter')
						.setDescription('Select a filter')
						.setRequired(false)
						.addChoices(
							{ name: 'unowned', value: 'unowned' },
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
				.addStringOption(option => option.setName('calculation').setDescription('Provide a calculation').setRequired(true))
				.addStringOption(option =>
					option.setName('ephemeral')
						.setDescription('Ephemeral?')
						.setRequired(false)
						.addChoices(
							{ name: 'true', value: 'true' },
							{ name: 'false', value: 'false' },
						)
				),
	}.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('open')
				.setDescription('Open a lootbox')
				.addStringOption(option =>
					option.setName('item')
						.setDescription('open a lootbox or chest')
						.setRequired(true)
						.addChoices(
							{ name: 'lootbox', value: 'lootbox' },
							{ name: 'common chest', value: '451' },
							{ name: 'rare chest', value: '452' },
							{ name: 'sublime chest', value: '453' },
							{ name: 'glorious chest', value: '454' },
							{ name: 'premium chest', value: '455' },
							{ name: 'luxurious chest', value: '456' },
							{ name: 'royal chest', value: '457' },
							{ name: 'deluxe chest', value: '458' },
						)
				)
				.addStringOption(option => option.setName('amount').setDescription('select how many you want to open').setRequired(false)),
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
				.setName('quests')
				.setDescription('See your daily quests')
				.addUserOption(option => option.setName('user').setDescription('See someone elses daily quests')),
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
				.setName('reminder')
				.setDescription('Enable or disable reminders')
				.addStringOption(option =>
					option.setName('select')
						.setDescription('Select reminder')
						.setRequired(true)
						.addChoices(
							{ name: 'pulls', value: 'pulls' },
							{ name: 'votes', value: 'votes' },
						)
				)
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
				.setName('ruin')
				.setDescription('Let me ruin your favorite anime by changing only 1 letter')
				.addStringOption(option => option.setName('title').setDescription('Choose an anime to ruin').setRequired(true))
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
				.addSubcommand((subcommand) => subcommand.setName('all').setDescription('Sell multiple characters')
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
				.setDescription('See the ingame shop')
				.addStringOption(option =>
					option.setName('option')
						.setDescription('Select shop')
						.setRequired(false)
						.addChoices(
							{ name: 'character packs', value: "0" },
							{ name: 'chests', value: "1" },
							{ name: 'exchange', value: "2" },
							{ name: 'premium', value: "3" },
						)
				),
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
		.addStringOption(option =>
			option.setName('open') //if empty => show all tickets
				.setDescription('Select the type of ticket')
				.setRequired(false)
				.addChoices(
					{ name: 'SS Ticket', value: 'ssticket'},
					{ name: 'S Ticket', value: 'sticket'},
					{ name: 'A Ticket', value: 'aticket'},
					{ name: 'B Ticket', value: 'bticket'},
					{ name: 'C Ticket', value: 'cticket'},
					{ name: 'D Ticket', value: 'dticket'},
				))
		.addStringOption(option => option.setName('amount').setDescription('Select how many you want to use').setRequired(false)) //if empty => use all tickets
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
							{ name: 'anime', value: 'anime' },
							{ name: 'lilies', value: 'lilies' },
							{ name: 'achievements', value: 'achievements' },
							{ name: 'coins', value: 'coins' },
							{ name: 'class', value: 'class' },
							{ name: 'event', value: 'event' },
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
	// {
	// 	data: new SlashCommandBuilder()
	// 			.setName('transactions')
	// 			.setDescription('See your past transactions')
	// 			.addUserOption(option => option.setName('user').setDescription('See transactions')),
	// }.data.toJSON(),
	{
		data: new SlashCommandBuilder()
				.setName('trial')
				.setDescription('Try out characters and classes')
				.addStringOption(option => option.setName('character').setDescription('Choose a character to try').setRequired(false))
				.addStringOption(option => option.setName('class').setDescription('Choose a class to try').setRequired(false))
				.addIntegerOption(option => option.setName('character-level').setDescription('Set the character level').setRequired(false))
				.addIntegerOption(option => option.setName('class-level').setDescription('Set the class level').setRequired(false))
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
const clientId = '695286837568340119'; // Elder: "695286837568340119" Camelot: "706183309943767112"

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
	}

	console.log(`Added ${commands.length} commands ✓`);

})();