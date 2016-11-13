'use strict';

export default function(sequelize, DataTypes) {
	let device = sequelize.define('device', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		date: DataTypes.STRING,
		type: DataTypes.STRING,
		model: DataTypes.STRING,
		manufacturer: DataTypes.STRING,
		tweet: DataTypes.INTEGER(1)
	});

	return device;
}
