const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Call = sequelize.define('Call', {
    caller: {
        type: DataTypes.STRING,
        allowNull: false
    },
    receiver: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false
    },
    recordingPath: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Call;