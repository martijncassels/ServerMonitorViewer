/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('RemoteQueuedMetric', {
		RemoteQueuedMetricKey: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		Timestamp: {
			type: DataTypes.DATE,
			allowNull: true
		},
		InstanceName: {
			type: DataTypes.STRING,
			allowNull: true
		},
		DatabaseName: {
			type: DataTypes.STRING,
			allowNull: true
		},
		Metric: {
			type: DataTypes.STRING,
			allowNull: true
		},
		MetricValue: {
			type: DataTypes.STRING,
			allowNull: true
		},
		MetricThreshold: {
			type: DataTypes.STRING,
			allowNull: true
		},
		ThresholdValue: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		LastQueuedMetricKey: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		Message: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		tableName: 'RemoteQueuedMetric'
	});
};
