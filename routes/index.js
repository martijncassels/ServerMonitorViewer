var passport	= require('passport');
var Promise 	= require('bluebird');
var Profile		= require('../models/profiles');

var Sequelize = require('sequelize');
var mockjson = require('./mockmetrics.json');
var SequelizeAuto = require('sequelize-auto');

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
    }
});
//}

var auto = new SequelizeAuto(config.sqlstring.database, config.sqlstring.user, config.sqlstring.password, {
	host: config.sqlstring.server,
	port: 1437,
	dialect: 'mssql',
	tables: ['RegisteredServer','RemoteQueuedMetric'],
	schema: ['axerrio','dbo'],
	directory: './models',
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	additional: {
		timestamps: false
	}
})

exports.index = function(req, res){
	res.render('index');
}

exports.listservers = function(req, res) {
	if(config.sqlstring.database!= ''){
	sequelize.query("SELECT isnull(rg.[Description],'none') as [Description],rg.[Alias],max(rq.[timestamp]) as [timestamp],datediff(MINUTE,max(rq.[timestamp]),getdate()) as [Min_ago]\
FROM [ServerMonitor].[axerrio].[RegisteredServer] rg with(readuncommitted)\
OUTER APPLY	(\
	SELECT  TOP 1 * FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] rq with(readuncommitted)\
	WHERE (rq.[InstanceName] = rg.[Description]) order by [RemoteQueuedMetricKey] desc\
) rq GROUP BY rg.[Description],rg.[Alias]\
	ORDER BY rg.[Description]", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
		res.status(200).send(result);
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

exports.listserversv2 = function(req, res) {
	var RegisteredServer = sequelize.import("../models/RegisteredServer");
	//var RemoteQueuedMetric = sequelize.import("../models/RemoteQueuedMetric");
	RegisteredServer.findAll()
	.then(function(result){
		res.status(200).send(result);
	})
	.catch(function(err){
		res.status(200).send(err);
	});
}

exports.getmodels = function(req, res) {
	auto.run(function (err) {
  if (err) throw err;

  res.status(200).send(auto.tables); // table list
  //res.status(200).send(auto.foreignKeys); // foreign key list
});
}

exports.getqueue = function(req, res) {
	if(config.sqlstring.database!= ''){
	sequelize.query("SELECT TOP 100 *\
	FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] with(readuncommitted)\
	WHERE [Metric] NOT IN ('Heartbeat')\
	order by [RemoteQueuedMetricKey] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
		res.status(200).send(result);
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
	FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] with(readuncommitted)\
	WHERE [RemoteQueuedMetrickey] > " + req.params.lastkey+ " \
	AND [Metric] NOT IN ('Heartbeat') order by [RemoteQueuedMetricKey] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
		res.status(200).send(result);
	})
	.catch(err => {
		console.log(err);
	});
}

exports.getcustomermetrics = function(req, res) {
	if(config.sqlstring.database!= ''){
	sequelize.query("SELECT TOP 100 *\
	FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] with(readuncommitted)\
	WHERE [InstanceName] = '" + req.params.server + "' AND [Metric] NOT IN ('Heartbeat') order by [RemoteQueuedMetricKey] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
		res.status(200).send(result);
	})
	.catch(err => {
		console.log(err);
	});
}
}

exports.getarchivecounters = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
	sequelize.query("select top 10 [ArchiveCounterKey],[CounterTimestamp],[OrderCount],[OrderRowCount],[PartyCount],[PartyVirtualCount],[PartyMutationCount],[ExinvoiceCount],[PricelistCount],[VPSupplylineCount],[PartyTransactionCount]\
	from [" + req.params.alias + "].[" + req.params.db + "].[dbo].[ArchiveCounters] with(readuncommitted)\
	order by [Archivecounterkey] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
		res.status(200).send(result);
	})
	.catch(err => {
		console.log(err);
	});
}
else {
	res.status(200).send(null);
}
}

exports.getlicenses = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select\
		count(lt.[ID]) as ActiveLicenses, case when lt.[licenses] = count(lt.[ID]) then 'all used' else convert(nvarchar,lt.[licenses] - count(lt.[ID]))+' left' end as [status]\
		, lt.[ID], lt. [description], lt.[licenses],case when (lt.id < 500 or lt.id > 599) then 'Multiple' else max(fp.HostName) end as [hostname]\
		from [" + req.params.alias + "].[" + req.params.db + "].[dbo].[fpprocess] fp with(readuncommitted)\
			join [" + req.params.alias + "].[" + req.params.db + "].[dbo].[licensetype] lt with(readuncommitted) on lt.[key] = fp.[licensetypekey]\
			join [" + req.params.alias + "].[" + req.params.db + "].[dbo].[user] u with(readuncommitted) on u.[key] = fp.[userkey]\
		group by lt.[ID], lt. [description], lt.[licenses]", {raw: true,type: sequelize.QueryTypes.SELECT})
		.then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
		});
}
else {
	res.status(200).send(null);
}
}

exports.gettop10errors = function(req,res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select top 10\
			count(el.loggedfromsub) as [count],el.loggedfromsub,max(el.message) as [lastmessage]\
			from (select top 10000 * from [" + req.params.alias + "].[" + req.params.db + "].[dbo].errorlog with(readuncommitted)\
			where loggedfromsub not in ('FlowerPower\\DBProcessBoughtVirtualParties.ProcessBoughtVirtualParties')) el\
			group by el.loggedfromsub\
			order by count(el.loggedfromsub) desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				console.log(err);
			});
	}
	else {
		res.status(200).send(null);
	}
}
//getvmptransactions
exports.getpccpcalcs = function(req,res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select d.[Key], d.[Description], d.CalculationImportance,\
			COUNT(1) as ToCalculate\
			from [" + req.params.alias + "].[" + req.params.db + "].dbo.partycalculationcontextprice pccp with (readuncommitted)\
			join [" + req.params.alias + "].[" + req.params.db + "].dbo.Party p with (readuncommitted) on pccp.PartyKey = p.[Key]\
			join [" + req.params.alias + "].[" + req.params.db + "].dbo.Department d with (readuncommitted) on p.DepartmentKey = d.[Key]\
			left join [" + req.params.alias + "].[" + req.params.db + "].dbo.PartyVirtual pv with (readuncommitted) on p.[Key] = pv.PartyKey\
			where pccp.Calculate = 1 and isnull (pv.Deleted,0) = 0\
			group by d.[Key], d.CalculationImportance, d.[Description]\
			order by d.CalculationImportance, d.[Key]", {raw: true,type: sequelize.QueryTypes.SELECT})
		.then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				console.log(err);
			});
	}
	else {
		res.status(200).send(null);
	}
}

exports.getcustomermutations = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.lastkey){
		sequelize.query("SELECT *\
		FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] with(readuncommitted)\
		WHERE [RemoteQueuedMetrickey] > " + req.params.lastkey + " AND\
		[InstanceName] = '" + req.params.server + "' AND [Metric] NOT IN ('Heartbeat') order by [RemoteQueuedMetricKey] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
		});
	}
	else {
		res.status(200).send(null);
	}
}
//PCCPTotal removed
exports.getcustomerentitycounts = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select top 100 * from [" + req.params.alias + "].ServerMonitor.dbo.EntityCounts with(readuncommitted)\
		where datepart(mi,timestamp) between 0 and 5\
		 order by [id] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
		});
	}
	else {
		res.status(200).send(null);
	}
}

exports.getetradeservercounter = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select top 100 \
		es.ETradeServerCounterkey,eu.Remark,es.LoggedTimeStamp,es.NumberOfSuccesfullPurchases,es.NumberOfFailedPurchases,es.AvgResponseTimeMS,es.MinResponseTimeMS,es.MaxResponseTimeMS\
		from [" + req.params.alias + "].[" + req.params.db + "].axerrio.ETradeServerCounter es with(readuncommitted)\
		join [" + req.params.alias + "].[" + req.params.db + "].etradeserver.EtradeUser eu with(readuncommitted) on eu.[EtradeUserKey] = es.EtradeUserKey\
		order by ETradeServerCounterkey desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
			res.status(200).send(err);
		});
	}
	else {
		res.status(200).send(null);
	}
}

exports.getvirtualmarketplacemutations = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select vmp.[Description], m.* from [" + req.params.alias + "].ServerMonitor.dbo.VirtualMarketPlaceMutation m with(readuncommitted)\
		join [" + req.params.alias + "].[" + req.params.db + "].[dbo].virtualmarketplace vmp with(readuncommitted) on m.virtualmarketplacekey = vmp.[key]\
		where [Timestamp] > dateadd(hour,-1,getdate())\
		order by [Timestamp] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
		});
	}
	else {
		res.status(200).send(null);
	}
}

exports.lastheartbeat = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select top 1 *\
		from [ServerMonitor].[axerrio].[RemoteQueuedMetric] with(readuncommitted)\
		where [InstanceName] = '" + req.params.server + "'\
		and [metric] = 'Heartbeat'\
		order by [timestamp] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
		});
	}
	else {
		res.status(200).send(null);
	}
}

exports.getblocking = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select top 100 *\
		from [" + req.params.alias + "].ServerMonitor.dbo.Blocking\
		order by MeasureTime desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
		});
	}
	else {
		res.status(200).send(null);
	}
}
/*
select m.MetricThresholdKey,m.ColumnName, mt.Description, mt.Value, mt.Timespan\
from [" + req.params.alias + "].[ServerMonitor].monitor.Metric m with(readuncommitted)\
join [" + req.params.alias + "].[ServerMonitor].monitor.MetricThreshold mt with(readuncommitted)\
on m.MetricThresholdKey = mt.MetricThresholdKey\
where m.Active = 1\
union all\
select m.MetricThresholdKey,m.ColumnName, mt.Description, mt.Value, mt.Timespan\
from [" + req.params.alias + "].[" + req.params.db + "].monitor.Metric m with(readuncommitted)\
join [" + req.params.alias + "].[" + req.params.db + "].monitor.MetricThreshold mt with(readuncommitted)\
on m.MetricThresholdKey = mt.MetricThresholdKey\
where m.Active = 1
*/
exports.getthresholds = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select m.MetricThresholdKey,m.ColumnName, mt.Description, mt.Value, mt.Timespan\
	from [" + req.params.alias + "].[" + req.params.db + "].monitor.Metric m with(readuncommitted)\
	join [" + req.params.alias + "].[" + req.params.db + "].monitor.MetricThreshold mt with(readuncommitted)\
		on m.MetricThresholdKey = mt.MetricThresholdKey\
	where m.Active = 1", {
			raw: true,
			type: sequelize.QueryTypes.SELECT
		}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
		});
	}
	else {
		res.status(200).send(null);
	}
}

exports.updatethreshold = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		console.log("update m set Value = " + req.params.value + "\
		from [" + req.params.alias + "].[" + req.params.db + "].monitor.Metric m with(readuncommitted)\
		where m.Active = 1 and m.[MetricThresholdKey] = " + req.params.key);
		// sequelize.query("update \
		// [" + req.params.alias + "].[ServerMonitor].[monitor].[MetricThreshold]\
		// set Value = " + req.body.value + " where [key] = " + req.params.key, {raw: true,type: sequelize.QueryTypes.UPDATE}).then(result => {
		// 	res.status(200).send(result);
		// })
		// .catch(err => {
		// 	console.log(err);
		// });
		res.status(200).send('ok!');
	}
	else {
		res.status(200).send(null);
	}
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
