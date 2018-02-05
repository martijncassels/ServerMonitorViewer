var passport	= require('passport');
var Promise 	= require('bluebird');
var Profile		= require('../models/profiles');

var Sequelize = require('sequelize');
var mockjson = require('./mockmetrics.json')

var config		= require('../config/config.js');

//if(typeof(config.sqlstring.database)!== 'undefined'){
const sequelize = new Sequelize(config.sqlstring.database, config.sqlstring.user, config.sqlstring.password, {
  host: config.sqlstring.server,
	port: 1437,
  dialect: 'mssql',

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
//}

exports.index = function(req, res){
	res.render('index');
}

exports.listservers = function(req, res) {
  if(typeof(config.sqlstring.database)!== 'undefined'){
	sequelize.query("SELECT rq.[InstanceName],max(rq.[timestamp]) as [timestamp],datediff(MINUTE,max(rq.[timestamp]),getdate()) as [Min_ago]\
FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] rq\
	left join [ServerMonitor].[axerrio].[RegisteredServer] rg on rq.[InstanceName] = rg.[Description]\
WHERE [Metric] = 'Heartbeat'\
GROUP BY rq.[InstanceName]").then(result => {
		res.status(200).send(result[0]);
	})
  .catch(err => {
    console.log(err);
  });
}
else{
  res.status(200).send([
    {
    InstanceName: 'BA-SQL12',
    timestamp: '2018-02-02 19:50:00.477',
    Min_ago: 3
    },
    {
    InstanceName: 'HO-SQL01',
    timestamp: '2018-02-02 19:50:00.477',
    Min_ago: 3
    },
    {
    InstanceName: 'VVB-SQL03',
    timestamp: '2018-02-02 19:50:00.477',
    Min_ago: 3
  }]);
}
}

exports.getqueue = function(req, res) {
  if(typeof(config.sqlstring.database)!== 'undefined'){
	sequelize.query("SELECT TOP 100 *\
  FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric]\
  order by [RemoteQueuedMetricKey] desc").then(result => {
		res.status(200).send(result[0]);
	})
  .catch(err => {
    console.log(err);
  });
}
else {
  res.status(200).send([{
    RemoteQueuedMetricKey: null,
    Timestamp: null,
    InstanceName: null,
    DatabaseName: null,
    Metric: null,
    MetricValue: null,
    MetricThreshold: null,
    ThresholdValue: null,
    LastQueuedMetricKey: null,
    Message: null
  }]);
}
}

exports.getmutations = function(req, res) {
	sequelize.query("SELECT *\
  FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric]\
  WHERE [RemoteQueuedMetrickey] > " + req.params.lastkey).then(result => {
		res.status(200).send(result[0]);
	})
  .catch(err => {
    console.log(err);
  });
}

exports.getcustomermetrics = function(req, res) {
  if(typeof(config.sqlstring.database)!== 'undefined'){
	sequelize.query("SELECT TOP 100 *\
  FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric]\
  WHERE [InstanceName] = '" + req.params.server + "' AND [Metric] NOT IN ('Heartbeat') order by [RemoteQueuedMetricKey] desc").then(result => {
		res.status(200).send(result[0]);
	})
  .catch(err => {
    console.log(err);
  });
}
else {
  res.status(200).send(mockjson);
}
}

exports.getlicenses = function(req, res) {
  if(typeof(config.sqlstring.database)!== 'undefined'){
	sequelize.query("select\
  count(lt.[ID]) as ActiveLicenses, case when lt.[licenses] = count(lt.[ID]) then 'all used' else convert(nvarchar,lt.[licenses] - count(lt.[ID]))+' left' end as [status]\
  , lt.[ID], lt. [description], lt.[licenses]\
from [" + req.params.customer + "].[" + req.params.db + "].[dbo].[fpprocess] fp\
	join [" + req.params.customer + "].[" + req.params.db + "].[dbo].[licensetype] lt on lt.[key] = fp.[licensetypekey]\
	join [" + req.params.customer + "].[" + req.params.db + "].[dbo].[user] u on u.[key] = fp.[userkey]\
group by lt.[ID], lt. [description], lt.[licenses]\
  ").then(result => {
		res.status(200).send(result[0]);
	})
  .catch(err => {
    console.log(err);
  });
}
else {
  res.status(200).send([{
    hostname: 'BA-COM04',
    ActiveLicenses: 1,
    status: 'all used',
    ID: 501,
    description: 'ABS EKT Message Processing',
    licenses: 1
  },
  {
    hostname: 'BA-COM04',
    ActiveLicenses: 1,
    status: 'all used',
    ID: 502,
    description: 'ABS Batch Lot Checkin',
    licenses: 1
  },
  {
    hostname: 'BA-COM04',
    ActiveLicenses: 1,
    status: 'all used',
    ID: 503,
    description: 'ABS eTrade Client',
    licenses: 2
  },
  {
    hostname: 'BA-COM04',
    ActiveLicenses: 6,
    status: 'all used',
    ID: 504,
    description: 'ABS Calculate Sales Prices',
    licenses: 6
  },
  {
    hostname: 'BA-COM04',
    ActiveLicenses: 1,
    status: '9 left',
    ID: 800,
    description: 'ABS Support',
    licenses: 10
  }]);
}
}

exports.getcustomermutations = function(req, res) {
	sequelize.query("SELECT *\
  FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric]\
  WHERE [RemoteQueuedMetrickey] > " + req.params.lastkey + " AND\
  [InstanceName] = '" + req.params.server + "' AND [Metric] NOT IN ('Heartbeat') order by [RemoteQueuedMetricKey] desc").then(result => {
		res.status(200).send(result[0]);
	})
  .catch(err => {
    console.log(err);
  });
}

exports.lastheartbeat = function(req, res) {
	sequelize.query("select top 1 *\
  from [ServerMonitor].[axerrio].[RemoteQueuedMetric]\
  where [InstanceName] = 'HO-SQL01'\
  and [metric] = 'Heartbeat'\
  order by [timestamp] desc").then(result => {
		res.status(200).send(result[0]);
	})
  .catch(err => {
    console.log(err);
  });
}

exports.partial = function (req, res) {
	var name = req.params.name;
	var sub = req.params.sub
	res.render('partials/'+ sub + '/' + name);
}

exports.register = function(req, res) {
	Profile.register(new Profile({
				username:           req.body.username,
				firstname:          req.body.firstname,
				lastname:           req.body.lastname,
				skills:             req.body.skills
	}),
		req.body.password, function(err, account) {
		if (err) {
			return res.status(500).json({
				err: err
			});
		}
		passport.authenticate('local')(req, res, function () {
			return res.status(200).json({
				status: 'Registration successful!'
			});
		});
	});
}

exports.login = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(401).json({
				err: info
			});
		}
		req.logIn(user, function(err) {
			if (err) {
				return res.status(500).json({
					err: 'Could not log in user'
				});
				//console.log('Could not log in user ',user);
			}
			res.status(200).json({
				status: 'Login successful!'
			});
			//console.log('Login successful! ',user);
		});
	})(req, res, next);
}

exports.logout = function(req, res) {
	req.logOut();
	req.session.destroy();
	// store.destroy(req.sessionID, err)
	// if(err) res.status(500).json({ err: 'Something went wrong deleting your session' });
	res.status(200).json({
		status: 'Bye!'
	});
}

exports.status = function(req, res) {
	if (!req.isAuthenticated()) {
		return res.status(200).json({
			status: false
		});
	}
	//console.log(req.user);
	res.status(200).json({
		status: true,
		user: {username: req.user.username, // only username, safer
		id: req.user._id}
	});
}
