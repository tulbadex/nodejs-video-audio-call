const { Sequelize } = require('sequelize');
const config = require('./config')

const sequelize = new Sequelize(config.DATABASE_URL) // Example for postgres

module.exports = sequelize