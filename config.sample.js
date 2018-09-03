module.exports = {
	'knex': {
		'client': 'sqlite3',
		'connection': {
			'filename': 'rra_bot.sqlite',
		},
		'useNullAsDefault': true,
	},
	'twitter': {
		'consumer_key': '',
		'consumer_secret': '',
		'access_token': '',
		'access_token_secret': '',
	},
};
