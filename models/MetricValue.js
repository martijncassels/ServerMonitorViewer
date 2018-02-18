/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('MetricValue', {
		MetricValueKey: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		MetricKey: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		Value: {
			type: DataTypes.STRING,
			allowNull: true
		},
		MetricContainerKey: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: 'MetricContainer',
				key: 'MetricContainerKey'
			}
		},
		Status: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: '((0))'
		},
		ColumnName: {
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
		}
	}, {
		tableName: 'MetricValue'
	});
};
