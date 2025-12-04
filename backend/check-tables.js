const { sequelize } = require('./src/models');

async function checkTables() {
    try {
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('📋 Tables existantes dans la base de données:');
        results.forEach(row => {
            console.log('  -', Object.values(row)[0]);
        });
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkTables();
