// backend/get-admin-token.js
const db = require('./src/models');
const jwtService = require('./src/services/jwt.service');

async function getToken() {
    try {
        const user = await db.Utilisateur.findOne({
            where: { email: 'super.admin@saintjeaningenieur.org' },
            include: [{ model: db.Administrateur }]
        });

        if (!user) {
            console.error('❌ Admin user not found');
            process.exit(1);
        }

        const token = jwtService.generateToken(user);
        console.log(token);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

getToken();
