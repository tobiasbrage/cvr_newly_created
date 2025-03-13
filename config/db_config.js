module.exports = function(app) {

	const mysql = require('mysql');

	const connection = mysql.createConnection({
		host     : 'mysql118.unoeuro.com',
		user     : 'atrengoering_dk',
		password : 'gH3hGbE2dARmnBc6rpak',
		database : 'atrengoering_dk_db',
		port : 3306
	});

	connection.connect();

	global.db = connection;

};