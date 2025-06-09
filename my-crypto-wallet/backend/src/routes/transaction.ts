import { Router } from 'express';
import { PrismaClient, CoinType, TxType, TxStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { ethers } from 'ethers';
import { networks, Psbt } from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { initEccLib } from 'bitcoinjs-lib';
import TronWeb from 'tronweb';

initEccLib(ecc);
const router = Router();
const prisma = new PrismaClient();

// Internal transfer
router.post('/transfer', async (req: AuthRequest, res) => {
    const { receiverId, amount, coinType } = req.body;
    const senderId = req.user?.uid;

    if (!senderId) throw new AppError('User not found', 404);
    if (!amount || !coinType || !receiverId) {
        throw new AppError('Missing required fields', 400);
    }

    try {
        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // Get sender's wallet and balance
            const senderWallet = await tx.wallet.findUnique({
                where: { userId: senderId },
                include: { balances: true },
            });

            if (!senderWallet) {
                throw new AppError('Sender wallet not found', 404);
            }

            // Get receiver's wallet
            const receiverWallet = await tx.wallet.findUnique({
                where: { userId: receiverId },
                include: { balances: true },
            });

            if (!receiverWallet) {
                throw new AppError('Receiver wallet not found', 404);
            }

            // Check sender's balance
            const senderBalance = senderWallet.balances.find(b => b.coinType === coinType);
            if (!senderBalance || parseFloat(senderBalance.amount) < parseFloat(amount)) {
                throw new AppError('Insufficient balance', 400);
            }

            // Update sender's balance
            await tx.balance.update({
                where: {
                    walletId_coinType: {
                        walletId: senderWallet.id,
                        coinType: coinType as CoinType,
                    },
                },
                data: {
                    amount: (parseFloat(senderBalance.amount) - parseFloat(amount)).toString(),
                },
            });

            // Update receiver's balance
            const receiverBalance = receiverWallet.balances.find(b => b.coinType === coinType);
            await tx.balance.update({
                where: {
                    walletId_coinType: {
                        walletId: receiverWallet.id,
                        coinType: coinType as CoinType,
                    },
                },
                data: {
                    amount: (parseFloat(receiverBalance?.amount || '0') + parseFloat(amount)).toString(),
                },
            });

            // Create transaction record
            const transaction = await tx.transaction.create({
                data: {
                    userId: senderId,
                    senderId,
                    receiverId,
                    coinType: coinType as CoinType,
                    amount,
                    txType: TxType.INTERNAL,
                    status: TxStatus.COMPLETED,
                },
            });

            return transaction;
        });

        res.json(result);
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Transfer failed', 500);
    }
});

// Get transaction history
router.get('/history', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) throw new AppError('User not found', 404);

        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { userId },
                    { senderId: userId },
                    { receiverId: userId },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                sender: true,
                receiver: true,
                lightning: true,
            },
        });

        res.json(transactions);
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch transaction history', 500);
    }
});

export default router; 