const { Sequelize } = require('sequelize');

// Replace with your actual MySQL database credentials
const sequelize = new Sequelize('chat_db', 'root', 'Daisy@2020', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database connected successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDB };
