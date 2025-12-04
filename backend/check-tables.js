require('dotenv').config();
const sequelize = require('./src/config/database');

async function checkTables() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Tables in database:', tables);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkTables();
