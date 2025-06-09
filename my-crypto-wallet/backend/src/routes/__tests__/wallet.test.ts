import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/lib/prisma';

describe('Wallet Routes', () => {
    beforeAll(async () => {
        // Setup: Create test data if needed
        await prisma.wallet.create({
            data: {
                userId: 'test-user',
                balance: '1000.00',
                currency: 'BTC'
            }
        });
    });

    afterAll(async () => {
        // Cleanup: Remove test data
        await prisma.wallet.deleteMany({
            where: { userId: 'test-user' }
        });
        await prisma.$disconnect();
    });

    describe('GET /api/wallet/balance', () => {
        it('should return wallet balance for authenticated user', async () => {
            const response = await request(app)
                .get('/api/wallet/balance')
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('balance');
            expect(response.body).toHaveProperty('currency');
        });

        it('should return 401 for unauthenticated request', async () => {
            const response = await request(app)
                .get('/api/wallet/balance');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/wallet/transfer', () => {
        it('should transfer funds between wallets', async () => {
            const response = await request(app)
                .post('/api/wallet/transfer')
                .set('Authorization', 'Bearer test-token')
                .send({
                    toUserId: 'recipient-user',
                    amount: '100.00',
                    currency: 'BTC'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('transactionId');
        });

        it('should fail with insufficient funds', async () => {
            const response = await request(app)
                .post('/api/wallet/transfer')
                .set('Authorization', 'Bearer test-token')
                .send({
                    toUserId: 'recipient-user',
                    amount: '10000.00', // Amount greater than balance
                    currency: 'BTC'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
}); 