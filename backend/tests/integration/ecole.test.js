const request = require('supertest');
const app = require('../../app');
const db = require('../../src/models');
const { setupTestDatabase, cleanupTestDatabase, clearAllTables } = require('../helpers/db-setup');
const { getAdminToken } = require('../helpers/auth-helper');

describe('Ecole Integration Tests', () => {
    let adminToken;

    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await cleanupTestDatabase();
    });

    beforeEach(async () => {
        await clearAllTables();
        const { token } = await getAdminToken();
        adminToken = token;
    });

    describe('POST /api/academic/ecoles', () => {
        it('should create a new school with valid data', async () => {
            const response = await request(app)
                .post('/api/academic/ecoles')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nom: 'Test University' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.nom).toBe('Test University');

            const school = await db.Ecole.findByPk(response.body.id);
            expect(school).not.toBeNull();
            expect(school.nom).toBe('Test University');
        });

        it('should return 400 if nom is missing', async () => {
            const response = await request(app)
                .post('/api/academic/ecoles')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 400 if nom is too short', async () => {
            const response = await request(app)
                .post('/api/academic/ecoles')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nom: 'Ab' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/academic/ecoles', () => {
        let suffix;
        beforeEach(async () => {
            suffix = Math.random().toString(36).substring(7);
            await db.Ecole.bulkCreate([
                { nom: 'School A ' + suffix },
                { nom: 'School B ' + suffix },
                { nom: 'University X ' + suffix }
            ]);
        });

        it('should return all schools with pagination', async () => {
            const response = await request(app)
                .get('/api/academic/ecoles?page=1&limit=2')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.rows.length).toBeGreaterThanOrEqual(2);
            expect(response.body.count).toBeGreaterThanOrEqual(3);
        });

        it('should filter schools by search term', async () => {
            const response = await request(app)
                .get(`/api/academic/ecoles?search=University`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.rows.length).toBeGreaterThanOrEqual(1);
            expect(response.body.rows[0].nom).toContain('University X');
        });
    });

    describe('GET /api/academic/ecoles/:id', () => {
        it('should return a school by id', async () => {
            const school = await db.Ecole.create({ nom: 'Specific School' });

            const response = await request(app)
                .get(`/api/academic/ecoles/${school.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.nom).toBe('Specific School');
        });

        it('should return 404 for non-existent school', async () => {
            const response = await request(app)
                .get('/api/academic/ecoles/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/academic/ecoles/:id', () => {
        it('should update a school', async () => {
            const school = await db.Ecole.create({ nom: 'Old Name' });

            const response = await request(app)
                .put(`/api/academic/ecoles/${school.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nom: 'New Name' });

            expect(response.status).toBe(200);
            expect(response.body.nom).toBe('New Name');

            const updated = await db.Ecole.findByPk(school.id);
            expect(updated.nom).toBe('New Name');
        });
    });

    describe('DELETE /api/academic/ecoles/:id', () => {
        it('should delete a school', async () => {
            const school = await db.Ecole.create({ nom: 'To Delete' });

            const response = await request(app)
                .delete(`/api/academic/ecoles/${school.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);

            const deleted = await db.Ecole.findByPk(school.id);
            expect(deleted).toBeNull();
        });
    });
});
