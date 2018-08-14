var passport	= require('passport');
var Promise 	= require('bluebird');
var Profile		= require('../models/profiles');
var sql				= require('mssql');
var JSONStringify = require('streaming-json-stringify');

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
	// res.render('index_semanticui');
}

/*
== ABS
==========================================
*/

exports.listservers = function(req, res) {
	if(config.sqlstring.database!= ''){
	sequelize.query("SELECT \
isnull(rg.[Description],'none') as [Description]\
,rg.[Alias]\
,rg.[Notes]\
,max(hb.[timestamp]) as [hbtimestamp]\
,datediff(MINUTE,max(hb.[timestamp]),getdate())-(case when rg.Description in ('JVC-SQL01','JVC-SQL02') then 60 else 0 end) as [hbMin_ago]\
,max(rq.[timestamp]) as [timestamp]\
,datediff(MINUTE,max(rq.[timestamp]),getdate())-(case when rg.Description in ('JVC-SQL01','JVC-SQL02') then 60 else 0 end) as [Min_ago]\
FROM [ServerMonitor].[axerrio].[RegisteredServer] rg with(readuncommitted)\
OUTER APPLY	(\
	SELECT  TOP 1 * FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] rq with(readuncommitted)\
	WHERE (rq.[InstanceName] = rg.[Description] and Metric = 'Heartbeat') order by [RemoteQueuedMetricKey] desc\
) hb \
OUTER APPLY	(\
	SELECT  TOP 1 * FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] rq with(readuncommitted)\
	WHERE ((rq.[InstanceName] = rg.[Description] and rq.DatabaseName = rg.Notes) and Metric <> 'Heartbeat') order by [RemoteQueuedMetricKey] desc\
) rq \
GROUP BY rg.[Description],rg.[Alias],rg.[Notes]\
ORDER BY [Min_ago] desc,[hbMin_ago] desc,rg.[Alias]", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
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

/*
SELECT max(rqm.[RemoteQueuedMetricKey]) as [RemoteQueuedMetricKey],max(rqm.[Timestamp]) as [Timestamp]\
,rqm.InstanceName,rqm.DatabaseName,rqm.Metric,max(rqm.MetricValue) as MetricValue,rqm.MetricThreshold,rqm.ThresholdValue\
,max(rqm.LastQueuedMetricKey) as LastQueuedMetricKey,rqm.[Message],rs.Alias\
FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] as rqm with(readuncommitted)\
JOIN [ServerMonitor].[axerrio].[RegisteredServer] as rs with(readuncommitted)\
on rs.[Description] = rqm.InstanceName and rs.Notes = rqm.DatabaseName\
WHERE [Metric] NOT IN ('Heartbeat')\
group by rqm.InstanceName,rqm.DatabaseName,rqm.Metric,rqm.MetricThreshold,rqm.ThresholdValue,rqm.[Message],rs.Alias\
order by [RemoteQueuedMetricKey] desc
*/
exports.getqueue = function(req, res) {
	if(config.sqlstring.database!= ''){
	sequelize.query("SELECT rqm.[RemoteQueuedMetricKey] as [RemoteQueuedMetricKey],rqm.[Timestamp] as [Timestamp]\
	,rqm.InstanceName,rqm.DatabaseName,rqm.Metric,rqm.MetricValue as MetricValue,rqm.MetricThreshold,rqm.ThresholdValue\
	,rqm.LastQueuedMetricKey as LastQueuedMetricKey,rqm.[Message],rs.Alias\
	FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] as rqm with(readuncommitted)\
	JOIN [ServerMonitor].[axerrio].[RegisteredServer] as rs with(readuncommitted)\
	on rs.[Description] = rqm.InstanceName and rs.Notes = rqm.DatabaseName\
	WHERE [RemoteQueuedMetricKey] in (\
		select max(rqm.[RemoteQueuedMetricKey]) \
		FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] as rqm with(readuncommitted)\
		WHERE [Metric] NOT IN ('Heartbeat')\
		group by rqm.InstanceName,rqm.DatabaseName,rqm.Metric)\
	union all\
	select rqm.[RemoteQueuedMetricKey] as [RemoteQueuedMetricKey],rqm.[Timestamp] as [Timestamp]\
	,rqm.InstanceName,rqm.DatabaseName,rqm.Metric as [Metric],rqm.MetricValue as MetricValue,null as [MetricThreshold],null as [ThresholdValue]\
	,null as LastQueuedMetricKey,'No heartbeat!' as [message],null as [Alias]\
	FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] as rqm with(readuncommitted)\
	WHERE [RemoteQueuedMetricKey] in (\
		select max(rqm.[RemoteQueuedMetricKey]) \
		FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] as rqm with(readuncommitted)\
		WHERE [Metric] IN ('Heartbeat')\
		group by rqm.InstanceName,rqm.DatabaseName,rqm.Metric\
	) and datediff(MI,rqm.[Timestamp],(case when rqm.InstanceName in ('JVC-SQL01','JVC-SQL02') then (SELECT * FROM OPENQUERY(VVD, 'SELECT getdate()')) else GETDATE() end))>10\
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

exports.gettempdb = function(req, res) {
	if(config.sqlstring.database!= ''){
	sequelize.query("SELECT instance_name AS 'Database',\
		[Data File(s) Size (KB)]/1024 AS [Data_file],\
		[Log File(s) Size (KB)]/1024 AS [Log_file],\
		[Log File(s) Used Size (KB)]/1024 AS [Log_file_used]\
		FROM (SELECT * FROM [A4Y].[master].sys.dm_os_performance_counters\
		WHERE counter_name IN\
		('Data File(s) Size (KB)',\
		'Log File(s) Size (KB)',\
		'Log File(s) Used Size (KB)')\
		AND instance_name = 'tempdb') AS A\
		PIVOT\
		(MAX(cntr_value) FOR counter_name IN\
		([Data File(s) Size (KB)],\
		[LOG File(s) Size (KB)],\
		[Log File(s) Used Size (KB)])) AS B", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
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

exports.dismissoccurence = function(req,res){
	// if(config.sqlstring.database!= '' && req.params.db!='none'){
	// 	if(req.params.alias && req.params.key && req.params.value){
	// 		sequelize.query("update m set ThresholdValue = " + req.params.value + "\
	// 		from [ServerMonitor].[axerrio].[RemoteQueuedMetric] m with(readuncommitted)\
	// 		where m.RemoteQueuedMetricKey = " + req.params.key, {
	// 		raw: true,
	// 		type: sequelize.QueryTypes.UPDATE
	// 		}).then(result => {
	// 			res.status(200).send(result);
	// 		})
	// 		.catch(err => {
	// 			console.log(err);
	// 		});
	// 		//res.status(200).send('ok!');
	// 	}
	// }
	// else {
	// 	res.status(200).send(null);
	// }
}

exports.dismissseries = function(req,res){

}

/*
SELECT max([RemoteQueuedMetricKey]) as [RemoteQueuedMetricKey],max([Timestamp]) as [Timestamp]\
,InstanceName,DatabaseName,Metric,max(MetricValue) as MetricValue,MetricThreshold,ThresholdValue\
,max(LastQueuedMetricKey) as LastQueuedMetricKey,[Message]\
FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] with(readuncommitted)\
WHERE [Metric] NOT IN ('Heartbeat')\
AND [RemoteQueuedMetrickey] > " + req.params.lastkey+ " \
group by InstanceName,DatabaseName,Metric,MetricThreshold,ThresholdValue,[Message]\
order by [RemoteQueuedMetricKey] desc
*/

exports.getmutations = function(req, res) {
	sequelize.query("SELECT rqm.[RemoteQueuedMetricKey] as [RemoteQueuedMetricKey],rqm.[Timestamp] as [Timestamp]\
	,rqm.InstanceName,rqm.DatabaseName,rqm.Metric,rqm.MetricValue as MetricValue,rqm.MetricThreshold,rqm.ThresholdValue\
	,rqm.LastQueuedMetricKey as LastQueuedMetricKey,rqm.[Message],rs.Alias\
	FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] as rqm with(readuncommitted)\
	JOIN [ServerMonitor].[axerrio].[RegisteredServer] as rs with(readuncommitted)\
	on rs.[Description] = rqm.InstanceName and rs.Notes = rqm.DatabaseName\
	WHERE [RemoteQueuedMetricKey] in (\
		select max(rqm.[RemoteQueuedMetricKey]) \
		FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] as rqm with(readuncommitted)\
		WHERE [Metric] NOT IN ('Heartbeat')\
		group by rqm.InstanceName,rqm.DatabaseName,rqm.Metric)\
	AND [RemoteQueuedMetrickey] > " + req.params.lastkey+ " \
	union all\
	select rqm.[RemoteQueuedMetricKey] as [RemoteQueuedMetricKey],rqm.[Timestamp] as [Timestamp]\
	,rqm.InstanceName,rqm.DatabaseName,rqm.Metric as [Metric],rqm.MetricValue as MetricValue,null as [MetricThreshold],null as [ThresholdValue]\
	,null as LastQueuedMetricKey,'No heartbeat!' as [message],null as [Alias]\
	FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] as rqm with(readuncommitted)\
	WHERE [RemoteQueuedMetricKey] in (\
		select max(rqm.[RemoteQueuedMetricKey]) \
		FROM [ServerMonitor].[axerrio].[RemoteQueuedMetric] as rqm with(readuncommitted)\
		WHERE [Metric] IN ('Heartbeat')\
		group by rqm.InstanceName,rqm.DatabaseName,rqm.Metric\
	) and datediff(MI,rqm.[Timestamp],(case when rqm.InstanceName in ('JVC-SQL01','JVC-SQL02') then (SELECT * FROM OPENQUERY(VVD, 'SELECT getdate()')) else GETDATE() end))>10\
	AND [RemoteQueuedMetrickey] > " + req.params.lastkey+ " \
	order by [RemoteQueuedMetricKey] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
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
	WHERE [InstanceName] = '" + req.params.server + "' AND DatabaseName in ('ServerMonitor','" + req.params.db + "')\
	AND [Metric] NOT IN ('Heartbeat') order by [RemoteQueuedMetricKey] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
		res.status(200).send(result);
	})
	.catch(err => {
		console.log(err);
	});
}
}

exports.getarchivecounters = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
	sequelize.query("select top 10 *\
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
/*
select\
count(lt.[ID]) as ActiveLicenses, case when lt.[licenses] = count(lt.[ID]) then 'all used' else convert(nvarchar,lt.[licenses] - count(lt.[ID]))+' left' end as [status]\
, lt.[ID], lt. [description], lt.[licenses],case when (lt.id < 500 or lt.id > 599) then 'Multiple' else max(fp.HostName) end as [hostname]\
from [" + req.params.alias + "].[" + req.params.db + "].[dbo].[fpprocess] fp with(readuncommitted)\
	join [" + req.params.alias + "].[" + req.params.db + "].[dbo].[licensetype] lt with(readuncommitted) on lt.[key] = fp.[licensetypekey]\
	join [" + req.params.alias + "].[" + req.params.db + "].[dbo].[user] u with(readuncommitted) on u.[key] = fp.[userkey]\
group by lt.[ID], lt. [description], lt.[licenses]
*/
exports.getlicenses = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select\
		count(fp.LicenseTypeKey) as ActiveLicenses\
		, case when lt.[licenses] = count(fp.LicenseTypeKey) then 'all used' else convert(nvarchar,lt.[licenses] - count(fp.LicenseTypeKey))+' left' end as [status]\
		, lt.[ID], lt. [description], lt.[licenses]\
		, case when (lt.id < 500 or lt.id > 599) then 'Multiple' else max(fp.HostName) end as [hostname]\
		from [" + req.params.alias + "].[" + req.params.db + "].[dbo].[licensetype] lt with(readuncommitted)\
			left join [" + req.params.alias + "].[" + req.params.db + "].[dbo].fpprocess fp with(readuncommitted) on lt.[key] = fp.[licensetypekey]\
			left join [" + req.params.alias + "].[" + req.params.db + "].[dbo].[user] u with(readuncommitted) on u.[key] = fp.[userkey]\
		where lt.Licenses > 0\
		group by fp.LicenseTypeKey, lt.[ID], lt. [description], lt.[licenses]", {raw: true,type: sequelize.QueryTypes.SELECT})
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

/*
select * \
from openquery ([" + req.params.alias + "], '\
SELECT distinct dovs.logical_volume_name AS LogicalName,\
dovs.volume_mount_point AS Drive,\
CONVERT(INT,dovs.available_bytes/1048576.0) AS FreeSpaceInMB\
,CONVERT(INT,total_bytes/1048576.0) AS TotalSpaceInMB\
FROM [" + req.params.db + "].sys.master_files mf with(readuncommitted)\
CROSS APPLY sys.dm_os_volume_stats(mf.database_id, mf.FILE_ID) dovs\
ORDER BY FreeSpaceInMB ASC')
*/
exports.getdiskspace = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		//var query = req.body.sp.toString();
		sequelize
		//.query("select * from openquery(["+req.params.alias+"],'[master].[dbo].xp_fixeddrives')",
		.query("select * \
		from openquery ([" + req.params.alias + "], 'SELECT distinct dovs.logical_volume_name AS LogicalName,\
		dovs.volume_mount_point AS Drive,\
		CONVERT(INT,dovs.available_bytes/1048576.0) AS FreeSpaceInMB\
		,CONVERT(INT,total_bytes/1048576.0) AS TotalSpaceInMB\
		FROM [" + req.params.db + "].sys.master_files mf with(readuncommitted)\
		CROSS APPLY sys.dm_os_volume_stats(mf.database_id, mf.FILE_ID) dovs\
		union all\
		SELECT instance_name AS LogicalName,\
		'''' as Drive,\
		convert(int,(([Log File(s) Size (KB)]/1024)-([Log File(s) Used Size (KB)]/1024))) AS FreeSpaceInMB,\
		convert(int,[Log File(s) Size (KB)]/1024) AS TotalSpaceInMB\
		FROM (SELECT * FROM [master].sys.dm_os_performance_counters\
		WHERE counter_name IN\
		(''Data File(s) Size (KB)'',\
		''Log File(s) Size (KB)'',\
		''Log File(s) Used Size (KB)'')\
		AND instance_name = ''tempdb'') AS A\
		PIVOT\
		(MAX(cntr_value) FOR counter_name IN\
		([Data File(s) Size (KB)],\
		[LOG File(s) Size (KB)],\
		[Log File(s) Used Size (KB)])) AS B\
		ORDER BY FreeSpaceInMB ASC')",
		{raw: true,type: sequelize.QueryTypes.SELECT})
		.then(function(result) {
			res.status(200).send(result);
		})
		.catch(function(err) {
			console.log(err);
		});
}
else {
	res.status(200).send(null);
}
}

/*
select top 10\
	count(el.loggedfromsub) as [count],el.loggedfromsub,[message]\
	from (select top 10000 * from [" + req.params.alias + "].[" + req.params.db + "].[dbo].errorlog with(readuncommitted)\
	where loggedfromsub not in ('FlowerPower\\DBProcessBoughtVirtualParties.ProcessBoughtVirtualParties')\
	order by loggedtimestamp desc) el\
	group by el.loggedfromsub,[message]\
	order by count(el.loggedfromsub) desc
*/
exports.gettop10errors = function(req,res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select top 1000 *\
			from [" + req.params.alias + "].[" + req.params.db + "].[dbo].errorlog el with(readuncommitted)\
			where loggedfromsub not in ('FlowerPower\\DBProcessBoughtVirtualParties.ProcessBoughtVirtualParties')\
			order by loggedtimestamp desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
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
				//console.log(err);
				res.status(200).send(err);
			});
	}
	else {
		res.status(200).send(null);
	}
}


exports.getpccpcalcs2 = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sql.connect(config2, () => {
			res.setHeader('Cache-Control', 'no-cache');
			//res.status(206);
			res.setHeader('Content-Type', 'application/json; charset=utf-8');

			const request = new sql.Request()
			request.stream = true;
			request.pipe(new JSONStringify()).pipe(res);
			//request.query("select top 100 * from [HUS].[ABSHUS].[dbo].errorlog");
			request.query("select d.[Key], d.[Description], d.CalculationImportance,\
				COUNT(1) as ToCalculate\
				from [" + req.params.alias + "].[" + req.params.db + "].dbo.partycalculationcontextprice pccp with (readuncommitted)\
				join [" + req.params.alias + "].[" + req.params.db + "].dbo.Party p with (readuncommitted) on pccp.PartyKey = p.[Key]\
				join [" + req.params.alias + "].[" + req.params.db + "].dbo.Department d with (readuncommitted) on p.DepartmentKey = d.[Key]\
				left join [" + req.params.alias + "].[" + req.params.db + "].dbo.PartyVirtual pv with (readuncommitted) on p.[Key] = pv.PartyKey\
				where pccp.Calculate = 1 and isnull (pv.Deleted,0) = 0\
				group by d.[Key], d.CalculationImportance, d.[Description]\
				order by d.CalculationImportance, d.[Key]")
			res.on('error', err => {
				res.send(err);
				res.end();
			})
			res.on('finish',() => {
				res.status(200);
				res.end();
				sql.close();
			})
		});
	}
}

exports.getpccpcalcsnewwithdate = function(req,res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		if (!req.body.startdate && !req.body.enddate && !req.body.starttime && !req.body.endtime){
			datefrom = moment(moment().format("YYYY-MM-DD") + " 00:00:00.000").format("YYYY-MM-DD HH:mm:ss:SSS");
			var dateuntil = moment(moment().format("YYYY-MM-DD") + " 23:59:59.999").format("YYYY-MM-DD HH:mm:ss:SSS");
		}
		else {
			var datefrom = moment(req.body.startdate + " " + req.body.starttime).format("YYYY-MM-DD HH:mm:ss:SSS");
			var dateuntil = moment(req.body.enddate + " " + req.body.endtime).format("YYYY-MM-DD HH:mm:ss:SSS");
		}
		sequelize.query("select \
			convert(char(10),cq.EnqueuedTimestamp,105) as [date]\
			, cq.PricingEngineID\
			, cqps.[Description]\
			, COUNT(1) as [count]\
			from [" + req.params.alias + "].[" + req.params.db + "].dbo.CalculationQueuePCCP cq with (readuncommitted)\
				join [" + req.params.alias + "].[" + req.params.db + "].dbo.CalculationQueueProcessingStatus cqps with (readuncommitted) on cqps.CalculationQueueProcessingStatusID = cq.CalculationQueueProcessingStatusID\
			where cq.EnqueuedTimestamp between '"+datefrom+"' and '"+dateuntil+"'\
			group by cq.PricingEngineID, cqps.[Description], convert(char(10),cq.EnqueuedTimestamp,105)\
			order by [PricingEngineID], convert(char(10),cq.EnqueuedTimestamp,105)", {raw: true,type: sequelize.QueryTypes.SELECT})
		.then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				//console.log(err);
				res.status(200).send(err);
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
		[InstanceName] = '" + req.params.server + "' AND DatabaseName in ('ServerMonitor','" + req.params.db + "')\
		AND [Metric] NOT IN ('Heartbeat') order by [RemoteQueuedMetricKey] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
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
exports.getcustomerentitycounts = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		var tmpservers = ['HOL','HUS','VVP','VUS','VVI','VVT'];
		// temporary workaround, difference between entitycounts.db_id and entitycounts.dbid
		//if(req.params.alias=='HOL' || req.params.alias=='HUS'  || req.params.alias=='VVP'){
		if(tmpservers.indexOf(req.params.alias)!=-1){
			sequelize.query("select top 100 ec.ID,ec.Timestamp,ec.TotalLots,ec.RealLots,ec.VirtualLots,ec.VirtualLotsToBeDeleted,ec.TotalOrders,\
			ec.TotalOrderRows,ec.ABSOrders,ec.ABSOrderRows,ec.WebShopOrders,ec.WebShopOrderRows,ec.ProductionOrders,ec.ProductionOrderRows,ec.PCCPTotal,\
			ec.PCCPToBeCalculated,ec.VPSupplyLineTotal,ec.TotalPricelists,ec.TotalPricelistRows\
			from [" + req.params.alias + "].ServerMonitor.dbo.EntityCounts ec with(readuncommitted)\
				join [" + req.params.alias + "].[master].sys.databases dbs with(readuncommitted) on dbs.database_id = ec.[dbid] and dbs.name = '" + req.params.db + "'\
			where datepart(mi,timestamp) between 0 and 5\
			 order by [id] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				console.log(err);
			});
		}
		else if(req.params.alias=='VVB'){
			sequelize.query("select top 100 ec.ID,ec.Timestamp,ec.TotalLots,ec.RealLots,ec.VirtualLots,ec.VirtualLotsToBeDeleted,ec.TotalOrders,\
			ec.TotalOrderRows,ec.ABSOrders,ec.ABSOrderRows,ec.WebShopOrders,ec.WebShopOrderRows,ec.ProductionOrders,ec.ProductionOrderRows,ec.PCCPTotal,\
			ec.PCCPToBeCalculated,ec.VPSupplyLineTotal,ec.TotalPricelists,ec.TotalPricelistRows\
			from [" + req.params.alias + "].ServerMonitor.dbo.EntityCounts ec with(readuncommitted)\
			where datepart(mi,timestamp) between 0 and 5\
			 order by [id] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				console.log(err);
			});
		}
		else {
			sequelize.query("select top 100 ec.ID,ec.Timestamp,ec.TotalLots,ec.RealLots,ec.VirtualLots,ec.VirtualLotsToBeDeleted,ec.TotalOrders,\
			ec.TotalOrderRows,ec.ABSOrders,ec.ABSOrderRows,ec.WebShopOrders,ec.WebShopOrderRows,ec.ProductionOrders,ec.ProductionOrderRows,ec.PCCPTotal,\
			ec.PCCPToBeCalculated,ec.VPSupplyLineTotal,ec.TotalPricelists,ec.TotalPricelistRows\
			from [" + req.params.alias + "].ServerMonitor.dbo.EntityCounts ec with(readuncommitted)\
				join [" + req.params.alias + "].[master].sys.databases dbs with(readuncommitted) on dbs.database_id = ec.[db_id] and dbs.name = '" + req.params.db + "'\
			where datepart(mi,ec.timestamp) between 0 and 5\
			 order by [id] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				console.log(err);
			});
		}
	}
	else {
		res.status(200).send(null);
	}
}
*/

//NEW
exports.getcustomerentitycounts = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		//var tmpservers = ['HOL','HUS','VVP','VUS','VVI','VVT'];
		// temporary workaround, difference between entitycounts.db_id and entitycounts.dbid
		//if(req.params.alias=='HOL' || req.params.alias=='HUS'  || req.params.alias=='VVP'){
		sequelize.query("select top 100 ec.ID,ec.Timestamp,ec.TotalLots,ec.RealLots,ec.VirtualLots,ec.VirtualLotsToBeDeleted,ec.TotalOrders,\
		ec.TotalOrderRows,ec.ABSOrders,ec.ABSOrderRows,ec.WebShopOrders,ec.WebShopOrderRows,ec.ProductionOrders,ec.ProductionOrderRows,ec.PCCPTotal,\
		ec.PCCPToBeCalculated,ec.VPSupplyLineTotal,ec.TotalPricelists,ec.TotalPricelistRows\
		from [" + req.params.alias + "].ServerMonitor.dbo.EntityCounts ec with(readuncommitted)\
			join [" + req.params.alias + "].[master].sys.databases dbs with(readuncommitted) on dbs.database_id = ec.[dbid]\
			and dbs.name = '" + req.params.db + "'\
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

/*
exports.getcustomerentitycountmutations = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select ec.ID,ec.Timestamp,ec.TotalLots,ec.RealLots,ec.VirtualLots,ec.VirtualLotsToBeDeleted,ec.TotalOrders,\
		ec.TotalOrderRows,ec.ABSOrders,ec.ABSOrderRows,ec.WebShopOrders,ec.WebShopOrderRows,ec.ProductionOrders,ec.ProductionOrderRows,ec.PCCPTotal,\
		ec.PCCPToBeCalculated,ec.VPSupplyLineTotal,ec.TotalPricelists,ec.TotalPricelistRows\
		from [" + req.params.alias + "].ServerMonitor.dbo.EntityCounts ec with(readuncommitted)\
			join [" + req.params.alias + "].[master].sys.databases dbs with(readuncommitted) on dbs.database_id = ec.[dbid] and dbs.name = '" + req.params.db + "'\
		where ID > " + req.params.lastkey+" and datepart(mi,ec.timestamp) between 0 and 5", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
		});
	}
	else {
		res.status(200).send(null);
	}
}*/

//NEW
exports.getcustomerentitycountmutations = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select top 100 ec.ID,ec.Timestamp,ec.TotalLots,ec.RealLots,ec.VirtualLots,ec.VirtualLotsToBeDeleted,ec.TotalOrders,\
		ec.TotalOrderRows,ec.ABSOrders,ec.ABSOrderRows,ec.WebShopOrders,ec.WebShopOrderRows,ec.ProductionOrders,ec.ProductionOrderRows,ec.PCCPTotal,\
		ec.PCCPToBeCalculated,ec.VPSupplyLineTotal,ec.TotalPricelists,ec.TotalPricelistRows\
		from [" + req.params.alias + "].ServerMonitor.dbo.EntityCounts ec with(readuncommitted)\
			join [" + req.params.alias + "].[master].sys.databases dbs with(readuncommitted) on dbs.database_id = ec.[dbid]\
			and dbs.name = '" + req.params.db + "'\
		where ID > " + req.params.lastkey+" and datepart(mi,ec.timestamp) between 0 and 5", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
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

exports.getcustomerentitycountswithdate = function(req, res) {
	if(config.sqlstring.database!= '' && req.body.starttime && req.body.starttime && req.body.enddate && req.body.endtime){
		var datefrom = moment(req.body.startdate + " " + req.body.starttime).format("YYYY-MM-DD HH:mm:ss:SSS");
		var dateuntil = moment(req.body.enddate + " " + req.body.endtime).format("YYYY-MM-DD HH:mm:ss:SSS");
		sequelize.query("select top 100 ec.ID,ec.Timestamp,ec.TotalLots,ec.RealLots,ec.VirtualLots,ec.VirtualLotsToBeDeleted,ec.TotalOrders,\
		ec.TotalOrderRows,ec.ABSOrders,ec.ABSOrderRows,ec.WebShopOrders,ec.WebShopOrderRows,ec.ProductionOrders,ec.ProductionOrderRows,ec.PCCPTotal,\
		ec.PCCPToBeCalculated,ec.VPSupplyLineTotal,ec.TotalPricelists,ec.TotalPricelistRows\
		from [" + req.params.alias + "].ServerMonitor.dbo.EntityCounts ec with(readuncommitted)\
			join [" + req.params.alias + "].[master].sys.databases dbs with(readuncommitted) on dbs.database_id = ec.[dbid]\
			and dbs.name = '" + req.params.db + "'\
		where datepart(mi,timestamp) between 0 and 5\
		and timestamp between '" + datefrom + "' and '" + dateuntil + "'\
		 order by [id] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			console.log(err);
			res.status(200).send(err);
		});
	}
}

exports.getetradeservercounter = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("IF (EXISTS (SELECT * \
		FROM [" + req.params.alias + "].[" + req.params.db + "].INFORMATION_SCHEMA.TABLES \
		WHERE TABLE_SCHEMA = 'axerrio' \
		AND TABLE_NAME = 'ETradeServerCounter'))\
		BEGIN\
			select top 100 \
			es.ETradeServerCounterkey,eu.Remark,es.LoggedTimeStamp,es.NumberOfSuccesfullPurchases,es.NumberOfFailedPurchases,es.AvgResponseTimeMS,es.MinResponseTimeMS,es.MaxResponseTimeMS\
			from [" + req.params.alias + "].[" + req.params.db + "].axerrio.ETradeServerCounter es with(readuncommitted)\
			join [" + req.params.alias + "].[" + req.params.db + "].etradeserver.EtradeUser eu with(readuncommitted) on eu.[EtradeUserKey] = es.EtradeUserKey\
			order by ETradeServerCounterkey desc\
		END\
		ELSE\
		select null", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
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
		sequelize.query("select vmp.[Description], m.*\
		from [" + req.params.alias + "].ServerMonitor.dbo.VirtualMarketPlaceMutation m with(readuncommitted)\
		join [" + req.params.alias + "].[" + req.params.db + "].[dbo].virtualmarketplace vmp with(readuncommitted) on m.virtualmarketplacekey = vmp.[key]\
		where [Timestamp] > dateadd(hour,-1,getdate())\
		order by [Timestamp] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
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

exports.getvirtualmarketplacemutationswithdate = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none' && req.body.starttime && req.body.starttime && req.body.enddate && req.body.endtime){
		var datefrom = moment(req.body.startdate + " " + req.body.starttime).format("YYYY-MM-DD HH:mm:ss:SSS");
		var dateuntil = moment(req.body.enddate + " " + req.body.endtime).format("YYYY-MM-DD HH:mm:ss:SSS");
		sequelize.query("select vmp.[Description], m.*\
		from [" + req.params.alias + "].ServerMonitor.dbo.VirtualMarketPlaceMutation m with(readuncommitted)\
		join [" + req.params.alias + "].[" + req.params.db + "].[dbo].virtualmarketplace vmp with(readuncommitted) on m.virtualmarketplacekey = vmp.[key]\
		where [Timestamp] between '" + datefrom + "' and '" + dateuntil + "'\
		order by [Timestamp] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
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
		from [" + req.params.alias + "].ServerMonitor.dbo.Blocking with(readuncommitted)\
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
from [" + req.params.alias + "].[" + req.params.db + "].monitor.Metric m with(readuncommitted)\
join [" + req.params.alias + "].[" + req.params.db + "].monitor.MetricThreshold mt with(readuncommitted)\
on m.MetricThresholdKey = mt.MetricThresholdKey\
where m.Active = 1

select m.*\
from [" + req.params.alias + "].[" + req.params.db + "].monitor.Metric m with(readuncommitted)\
where m.Active = 1

select ec.AVGValue,m.*
from [HOL].[FlowerCore].monitor.Metric m with(readuncommitted)
	join
	(
	SELECT AVG(convert(int,Value)) as AVGValue, metrickey
	FROM [HOL].[ServerMonitor].[monitor].[AllMetrics]
	where DatabaseName = 'FlowerCore'
	and timestamp between DATEADD(month,-6,getdate()) and GETDATE()
	group by metrickey
	) ec on ec.metrickey = m.metrickey
where m.Active = 1
*/
exports.getthresholds = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		sequelize.query("select ec1.AVGValue as [AVGValue1],ec3.AVGValue as [AVGValue3],ec6.AVGValue as [AVGValue6],m.*\
		from [" + req.params.alias + "].[" + req.params.db + "].monitor.Metric m with(readuncommitted)\
			join \
			(\
			SELECT AVG(convert(int,Value)) as AVGValue, metrickey\
			FROM [" + req.params.alias + "].[ServerMonitor].[monitor].[AllMetrics]\
			where DatabaseName = '" + req.params.db + "'\
			and timestamp between DATEADD(month,-6,getdate()) and GETDATE()\
			group by metrickey\
		) ec6 on ec6.metrickey = m.metrickey\
			join \
			(\
			SELECT AVG(convert(int,Value)) as AVGValue, metrickey\
			FROM [" + req.params.alias + "].[ServerMonitor].[monitor].[AllMetrics]\
			where DatabaseName = '" + req.params.db + "'\
			and timestamp between DATEADD(month,-3,getdate()) and GETDATE()\
			group by metrickey\
		) ec3 on ec3.metrickey = m.metrickey\
			join \
			(\
			SELECT AVG(convert(int,Value)) as AVGValue, metrickey\
			FROM [" + req.params.alias + "].[ServerMonitor].[monitor].[AllMetrics]\
			where DatabaseName = '" + req.params.db + "'\
			and timestamp between DATEADD(month,-1,getdate()) and GETDATE()\
			group by metrickey\
		) ec1 on ec1.metrickey = m.metrickey\
		where m.Active = 1", {
			raw: true,
			type: sequelize.QueryTypes.SELECT
		}).then(result => {
			res.status(200).send(result);
		})
		.catch(err => {
			//console.log(err);
			res.status(200).send(err);
		});
	}
	else {
		res.status(200).send(null);
	}
}

exports.updatethreshold = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		// console.log("update m set ThresholdValue = " + req.params.value + "\
		// from [" + req.params.alias + "].[" + req.params.db + "].monitor.Metric m with(readuncommitted)\
		// where m.Active = 1 and m.[MetricKey] = " + req.params.key);
		if(req.params.alias && req.params.key && req.params.value){
			sequelize.query("update m set ThresholdValue = " + req.params.value + "\
			from [" + req.params.alias + "].[" + req.params.db + "].monitor.Metric m with(readuncommitted)\
			where m.Active = 1 and m.[MetricKey] = " + req.params.key, {
			raw: true,
			type: sequelize.QueryTypes.UPDATE
			}).then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				console.log(err);
			});
			//res.status(200).send('ok!');
		}
	}
	else {
		res.status(200).send(null);
	}
}
/*
SELECT TOP 100 MetricKey,MetricValueKey,Timestamp,convert(int,Value) as [Value],Metric,InstanceKey,\
	DatabaseName,MetricThreshold,ThresholdValue,MetricContainerKey,Publish\
	FROM [" + req.params.alias + "].[ServerMonitor].[monitor].[AllMetrics] where Metric = 'CPU_SQL' order by [Timestamp] desc
*/
exports.getcpu = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
		if(req.params.lastkey=='new') {
			sequelize.query("SELECT TOP 100 Timestamp,convert(int,Value) as [Value],MetricValueKey\
				FROM [" + req.params.alias + "].[ServerMonitor].[monitor].[AllMetrics] with(readuncommitted)\
				where Metric = 'CPU_SQL' order by [Timestamp] desc", {raw: true,type: sequelize.QueryTypes.SELECT}).then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				console.log(err);
			});
		}
		else {
			sequelize.query("SELECT Timestamp,convert(int,Value) as [Value],MetricValueKey\
				FROM [" + req.params.alias + "].[ServerMonitor].[monitor].[AllMetrics] with(readuncommitted)\
				where Metric = 'CPU_SQL' and MetricValueKey > " + req.params.lastkey + " order by [Timestamp] desc", {raw: true,type: sequelize.QueryTypes.SELECT})
			.then(result => {
				res.status(200).send(result);
			})
			.catch(err => {
				console.log(err);
			});
		}
	}
	else {
		res.status(200).send(null);
	}
}

exports.gettop10tableusage = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
			sequelize.query("SELECT TOP 10\
					a3.name AS SchemaName,\
					a2.name AS TableName,\
					a1.rows as Row_Count,\
					(a1.reserved )* 8.0 / 1024 AS reserved_mb,\
					a1.data * 8.0 / 1024 AS data_mb,\
					(CASE WHEN (a1.used ) > a1.data THEN (a1.used ) - a1.data ELSE 0 END) * 8.0 / 1024 AS index_size_mb,\
					(CASE WHEN (a1.reserved ) > a1.used THEN (a1.reserved ) - a1.used ELSE 0 END) * 8.0 / 1024 AS unused_mb\
			FROM (\
				SELECT ps.object_id\
					,SUM ( CASE WHEN (ps.index_id < 2) THEN row_count    ELSE 0 END ) AS [rows]\
					,SUM (ps.reserved_page_count) AS reserved\
					,SUM (CASE WHEN (ps.index_id < 2) THEN (ps.in_row_data_page_count + ps.lob_used_page_count + ps.row_overflow_used_page_count) ELSE (ps.lob_used_page_count + ps.row_overflow_used_page_count) END) AS data\
					,SUM (ps.used_page_count) AS used\
					FROM [" + req.params.alias + "].[" + req.params.db + "].sys.dm_db_partition_stats ps\
					GROUP BY ps.object_id\
				) AS a1\
			INNER JOIN [" + req.params.alias + "].[" + req.params.db + "].sys.all_objects a2  ON ( a1.object_id = a2.object_id )\
			INNER JOIN [" + req.params.alias + "].[" + req.params.db + "].sys.schemas a3 ON (a2.schema_id = a3.schema_id)\
			WHERE a2.type <> N'S' and a2.type <> N'IT'   \
			order by a1.data desc", {raw: true,type: sequelize.QueryTypes.SELECT})
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

exports.getsqlstats = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
			sequelize.query("select * from [" + req.params.alias + "].[master].sys.dm_os_performance_counters\
				where instance_name = '" + req.params.db + "'\
				or object_name in ('SQLServer:General Statistics')", {raw: true,type: sequelize.QueryTypes.SELECT})
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

exports.gettop10queries = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
			sequelize.query("select top 10 [stats].* \
					from openquery ([" + req.params.alias + "], '\
					;WITH cte AS\
			(\
				SELECT stat.[sql_handle],\
							 stat.statement_start_offset,\
							 stat.statement_end_offset,\
							 COUNT(*) AS [NumExecutionPlans],\
							 SUM(stat.execution_count) AS [TotalExecutions],\
							 ((SUM(stat.total_logical_reads) * 1.0) / SUM(stat.execution_count)) AS [AvgLogicalReads],\
							 ((SUM(stat.total_worker_time) * 1.0) / SUM(stat.execution_count)) AS [AvgCPU]\
				FROM sys.dm_exec_query_stats stat\
				GROUP BY stat.[sql_handle], stat.statement_start_offset, stat.statement_end_offset\
			)\
			SELECT CONVERT(DECIMAL(15, 5), cte.AvgCPU) AS [AvgCPU],\
						 CONVERT(DECIMAL(15, 5), cte.AvgLogicalReads) AS [AvgLogicalReads],\
						 cte.NumExecutionPlans,\
						 cte.TotalExecutions,\
						 DB_NAME(txt.[dbid]) AS [DatabaseName],\
						 OBJECT_NAME(txt.objectid, txt.[dbid]) AS [ObjectName],\
						 SUBSTRING(txt.[text], (cte.statement_start_offset / 2) + 1,\
						 (\
							 (CASE cte.statement_end_offset \
								 WHEN -1 THEN DATALENGTH(txt.[text])\
								 ELSE cte.statement_end_offset\
								END - cte.statement_start_offset) / 2\
							) + 1\
						) as [Statement]\
			FROM cte\
			CROSS APPLY sys.dm_exec_sql_text(cte.[sql_handle]) txt\
			WHERE DB_NAME(txt.[dbid])=''" + req.params.db + "''\
			ORDER BY cte.AvgCPU DESC;') [stats]\
			order by [stats].AvgCPU desc", {raw: true,type: sequelize.QueryTypes.SELECT})
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
/*
== WEBSHOP
==========================================
*/
exports.getwseventerrors = function(req, res) {
	if(config.sqlstring.database!= '' && req.params.db!='none'){
			sequelize.query("declare @webdb nvarchar(15)\
			select @webdb = value from [EZF].[EZF_ABS].dbo.setting where name = 'WebshopDatabaseNameAndSchema'\
			declare @query nvarchar(4000)\
			set @query = 'select top 100 * from openquery([EZF],''select top 100 * from '+@webdb+'.[event] where eventtypeid = 6 order by [key] desc'')'\
			exec(@query)", {raw: true,type: sequelize.QueryTypes.SELECT})
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

/*
== MISC
==========================================
*/

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
