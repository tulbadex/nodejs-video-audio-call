// backend/models/File.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const File = sequelize.define('File', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mimetype: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = File;