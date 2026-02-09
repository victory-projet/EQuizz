const jwt = require('jsonwebtoken');
const db = require('../../src/models');

async function getAdminToken() {
    // Generate a random alphabetic string to satisfy the NO DIGITS constraint
    const random = Math.random().toString(36).replace(/[^a-z]/g, '').substring(0, 5) || 'suite';
    const admin = await db.Utilisateur.create({
        nom: 'Admin' + random,
        prenom: 'Test',
        email: `test.admin${random}@saintjeaningenieur.org`,
        motDePasseHash: 'password'
    });

    // Check if role is handled by Utilisateur or if we need to create an Administrateur entry
    if (db.Administrateur) {
        await db.Administrateur.create({
            id: admin.id
        });
    }

    const token = jwt.sign(
        { id: admin.id, role: 'admin' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
    );

    return { token, admin };
}

module.exports = {
    getAdminToken
};
