const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('./db.config');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    room: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    }
}, {
    timestamps: false,
    tableName: 'messages'
});

// Synchronize the model with the database (creates table if not exists)
Message.sync({ alter: true }).then(() => {
    console.log("Messages table synced.");
}).catch((err) => {
    console.error("Error syncing Messages table:", err);
});

module.exports = Message;
