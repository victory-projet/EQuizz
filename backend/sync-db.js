const { sequelize } = require('./src/models');

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();