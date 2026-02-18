// backend/fix-admin-for-verification.js
const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function fix() {
    try {
        const email = 'super.admin@saintjeaningenieur.org';
        const password = 'admin123';

        // We update the password and LET THE HOOK handle hashing
        const user = await db.Utilisateur.findOne({ where: { email } });
        if (user) {
            user.motDePasseHash = password;
            await user.save();
            console.log('✅ Admin password updated and hashed via hook');
        } else {
            console.error('❌ Admin user not found');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

fix();
