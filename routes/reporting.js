var passport	= require('passport');
var Promise 	= require('bluebird');
var Profile		= require('../models/profiles');

var Sequelize = require('sequelize');
var mockjson = require('./mockmetrics.json');
var SequelizeAuto = require('sequelize-auto');
var moment = require('moment');

//The following file isn't included and needs to be created
//Example below
/*
var config = {};
config.sqlstring = {
		user: '',
		password: '',
		server: '',
		database: '',
		connectionString: '',
		driver: 'tedious',
		pool: {
				max: 10,
				min: 0,
				idleTimeoutMillis: 30000
		},
		options: {
				database: ''
		}
}
module.exports = config;
*/

var config		= require('../config/config.js');

//if(config.sqlstring.database!= ''){
var sequelize = new Sequelize(config.sqlstring.database, config.sqlstring.user, config.sqlstring.password, {
	host: config.sqlstring.server,
	port: 1437,
	dialect: 'mssql',

	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	define: {
				timestamps: false
		},
	logging: false
});
//}

exports.getweekstats = function(req, res) {
	var datefrom = moment(req.body.datefrom).format("YYYY-MM-DD HH:mm:ss:SSS");
	var dateuntil = moment(req.body.dateuntil).format("YYYY-MM-DD HH:mm:ss:SSS");
	//var query = "["+req.params.db+"].[dbo].axspFRDWEEKSTATS";
	sequelize
	// .query('CALL ['+req.params.alias+'].['+req.params.db+'].[dbo].axspFRDWEEKSTATS (:datefrom, :dateuntil)',
	// 			{replacements: {
	// 				datefrom: moment(req.body.datefrom).format("YYYY-MM-DD HH:mm:ss:SSS"),
	// 				dateuntil: moment(req.body.dateuntil).format("YYYY-MM-DD HH:mm:ss:SSS")
	// 			}})
	// .then(function(result) {
	// 	res.status(200).send(result);
	// })
	// .catch(function(err) {
	// 	console.log(err);
	// });
	//.query("["+req.params.alias+"].["+req.params.db+"].[dbo].axspFRDWEEKSTATS '"+datefrom.toString()+"','"+dateuntil.toString()+"'",
	.query("select * from openquery(["+req.params.alias+"],'["+req.params.db+"].[dbo].axspFRDInvoicedAndPaymentsPerPeriod \""+datefrom.toString()+"\",\""+dateuntil.toString()+"\"')",
	{raw: true,type: sequelize.QueryTypes.SELECT})
	.then(function(result) {
		res.status(200).send(result);
	})
	.catch(function(err) {
		console.log(err);
	});
	//res.status(200).send(req);
}
