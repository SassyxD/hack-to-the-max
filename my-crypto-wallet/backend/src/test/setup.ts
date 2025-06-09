import dotenv from 'dotenv';
import '@jest/globals';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
    // Add any global setup here (e.g., database connection)
});

// Global test teardown
afterAll(async () => {
    // Add any global cleanup here
}); 