const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Station = require('./Station');

const PriceReport = sequelize.define('PriceReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fuelType: {
    type: DataTypes.ENUM('petrol', 'diesel', 'kerosene', 'gas'),
    allowNull: false,
    defaultValue: 'petrol',
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  reportedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'anonymous',
  },
  fuelAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'price_reports',
  timestamps: true,
});

Station.hasMany(PriceReport, { foreignKey: 'stationId', onDelete: 'CASCADE' });
PriceReport.belongsTo(Station, { foreignKey: 'stationId' });

module.exports = PriceReport;
