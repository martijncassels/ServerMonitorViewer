module.exports = {
	apps: [
		{
			name: "ServerMonitor_dev",
			script: "app.js",
			env: {
				"PORT": 4000,
				NODE_ENV: "development"
			},
			env_production: {
				"PORT": 4000,
				NODE_ENV: "production"
			},
			instances: 1,
			exec_mode: "fork"
		}],
		"deploy" : {
		 // "production" is the environment name
		 "production" : {
			 "user" : "MCassels",
			 "host" : ["ax-wts37.local"],
			 "ref"  : "origin/material",
			 "repo" : "git@github.com:martijncassels/ServerMonitorViewer.git",
			 "path" : "c:\\nodes\\servermonitorviewer_dev\\",
			 "post-deploy" : "npm install"
			},
	 }
}
