/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('RegisteredServer', {
		RegisteredServerID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		Description: {
			type: DataTypes.STRING,
			allowNull: true
		},
		Alias: {
			type: "NCHAR",
			allowNull: true
		},
		Notes: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		tableName: 'RegisteredServer',
		schema: 'axerrio'
	});
};
