var passport	= require('passport');
var Promise 	= require('bluebird');
var Profile		= require('../models/profiles');
var sql				= require('mssql');
var JSONStringify = require('streaming-json-stringify');

// var app = require('express')();
// var http = require('http').Server(app);
//var io = require('socket.io')(exports.http);
//var io = require('socket.io').listen(exports.server);

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
var config2 = {
	user: config.sqlstring.user,
	//userName: config.sqlstring.user,
	connectionString: config.sqlstring.connectionString,
	password: config.sqlstring.password,
	server: '94.103.159.131',
	database: config.sqlstring.database,
	host: config.sqlstring.server,
	port: 1437,
	dialect: 'mssql',
	driver: 'tedious'
};

exports.getreport = function(req, res) {
	var datefrom = moment(req.body.datefrom).format("YYYY-MM-DD HH:mm:ss:SSS");
	var dateuntil = moment(req.body.dateuntil).format("YYYY-MM-DD HH:mm:ss:SSS");
	//var query = "axspFRDInvoicedAndPaymentsPerPeriod";
	var query = req.body.sp.toString();
	sequelize
	.query("select * from openquery(["+req.params.alias+"],'["+req.params.db+"].[dbo]."+query+" \""+datefrom.toString()+"\",\""+dateuntil.toString()+"\"')",
	{raw: true,type: sequelize.QueryTypes.SELECT})
	.then(function(result) {
		res.status(200).send(result);
	})
	.catch(function(err) {
		console.log(err);
	});
}

// Streaming report data for big reports!
exports.getreport2 = function(req, res) {
	var datefrom = moment(req.body.datefrom).format("YYYY-MM-DD HH:mm:ss:SSS");
	var dateuntil = moment(req.body.dateuntil).format("YYYY-MM-DD HH:mm:ss:SSS");
	var query = req.body.sp.toString();
	//console.log(req.body.sp);

	sql.connect(config2, () => {
		res.setHeader('Cache-Control', 'no-cache');

		const request = new sql.Request()
		request.stream = true;
		//request.query("select * from openquery(["+req.params.alias+"],'["+req.params.db+"].[dbo]."+query+" \""+datefrom.toString()+"\",\""+dateuntil.toString()+"\"')")
		request.query("select * from openquery(["+req.params.alias+"],'["+req.params.db+"].[dbo]."+query+" \""+datefrom.toString()+"\",\""+dateuntil.toString()+"\"')")
		let rowCount = 0;
		const BATCH_SIZE = 50;

		request.on('recordset', () => {
			res.setHeader('Content-Type', 'application/json');
			res.write('[');
		})

		request.on('row', row => {
			if (rowCount > 0)
				res.write(',');

			if (row % BATCH_SIZE === 0)
				res.flush();

			res.write(JSON.stringify(row));
			rowCount++;
		})

		request.on('done', ()=> {
			res.write(']');
			sql.close();
			res.end();
		});
});
}
// Streaming report data for big reports!
exports.getreport3 = function(req, res) {
	var datefrom = moment(req.body.datefrom).format("YYYY-MM-DD HH:mm:ss:SSS");
	var dateuntil = moment(req.body.dateuntil).format("YYYY-MM-DD HH:mm:ss:SSS");
	var query = req.body.sp.toString();

	sql.connect(config2, () => {
		res.setHeader('Cache-Control', 'no-cache');
		//res.status(206);
		res.setHeader('Content-Type', 'application/json; charset=utf-8');

		const request = new sql.Request()
		request.stream = true;
		request.pipe(new JSONStringify()).pipe(res);
		//request.query("select top 100 * from [HUS].[ABSHUS].[dbo].errorlog");
		request.query("select * from openquery(["+req.params.alias+"],'["+req.params.db+"].[dbo]."+query+" \""+datefrom.toString()+"\",\""+dateuntil.toString()+"\"')")
		res.on('error', err => {
			res.end();
		})
		res.on('finish',() => {
			res.status(200);
			res.end();
			sql.close();
		})
	});
}
// Streaming report data for big reports!
/*
exports.getreport4 = function(req, res) {
	var datefrom = moment(req.body.datefrom).format("YYYY-MM-DD HH:mm:ss:SSS");
	var dateuntil = moment(req.body.dateuntil).format("YYYY-MM-DD HH:mm:ss:SSS");
	var query = req.body.sp.toString();

	sql.connect(config2, () => {
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Content-Type', 'application/json; charset=utf-8');

		const request = new sql.Request()
		request.stream = true;
		request.pipe(new JSONStringify()).pipe(res);
		request.query("select top 10000 * from [HUS].[ABSHUS].[dbo].errorlog");
		res.on('error', err => {
			res.end();
		})
		res.on('finish',() => {
			io.on('connection', function(socket){
				socket.on('chat message', function(msg){
					io.emit('chat message', msg);
				});
			});
			res.end();
			sql.close();
		})
		// io.on('connection', function(socket){
		// 	socket.on('chat message', function(msg){
		// 		io.emit('chat message', msg);
		// 	});
		// });
	});
}
*/
