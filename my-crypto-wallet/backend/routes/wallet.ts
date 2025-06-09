import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { ethers } from 'ethers';
import { payments, networks, Psbt } from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { initEccLib } from 'bitcoinjs-lib';
import TronWeb from 'tronweb';

initEccLib(ecc);
const router = Router();
const prisma = new PrismaClient();

// Create wallet for new user
router.post('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) throw new AppError('User not found', 404);

        // Check if wallet already exists
        const existingWallet = await prisma.wallet.findUnique({
            where: { userId },
        });

        if (existingWallet) {
            throw new AppError('Wallet already exists', 400);
        }

        // Generate new wallet addresses
        const keyPair = ecc.createPrivateKey();
        const { address: btcAddress } = payments.p2wpkh({
            pubkey: Buffer.from(ecc.pointFromScalar(keyPair)!),
            network: networks.bitcoin,
        });

        const ethWallet = ethers.Wallet.createRandom();
        const tronWallet = await TronWeb.createAccount();

        // Create wallet in database
        const wallet = await prisma.wallet.create({
            data: {
                userId,
                btcAddress: btcAddress!,
                ethAddress: ethWallet.address,
                trcAddress: tronWallet.address,
                btcPrivateKey: keyPair.toString('hex'), // Encrypt in production
                ethPrivateKey: ethWallet.privateKey, // Encrypt in production
                trcPrivateKey: tronWallet.privateKey, // Encrypt in production
            },
        });

        // Initialize balances
        await prisma.balance.createMany({
            data: [
                { walletId: wallet.id, coinType: 'BTC', amount: '0' },
                { walletId: wallet.id, coinType: 'ETH', amount: '0' },
                { walletId: wallet.id, coinType: 'USDT', amount: '0' },
            ],
        });

        res.json({
            btcAddress: wallet.btcAddress,
            ethAddress: wallet.ethAddress,
            trcAddress: wallet.trcAddress,
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to create wallet', 500);
    }
});

// Get wallet balances
router.get('/balances', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) throw new AppError('User not found', 404);

        const wallet = await prisma.wallet.findUnique({
            where: { userId },
            include: { balances: true },
        });

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        res.json(wallet.balances);
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch balances', 500);
    }
});

// Get wallet addresses
router.get('/addresses', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) throw new AppError('User not found', 404);

        const wallet = await prisma.wallet.findUnique({
            where: { userId },
            select: {
                btcAddress: true,
                ethAddress: true,
                trcAddress: true,
            },
        });

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        res.json(wallet);
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch addresses', 500);
    }
});

export default router; 