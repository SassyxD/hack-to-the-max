import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { auth } from './middleware/auth';
import { errorHandler } from './middleware/error';
import walletRoutes from './routes/wallet';
import transactionRoutes from './routes/transaction';
import lightningRoutes from './routes/lightning';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wallet', auth, walletRoutes);
app.use('/api/transaction', auth, transactionRoutes);
app.use('/api/lightning', auth, lightningRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
