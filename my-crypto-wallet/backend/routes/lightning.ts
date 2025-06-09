import { Router } from 'express';
import { PrismaClient, CoinType, TxType, TxStatus, LNStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

// LNbits configuration
const LNBITS_URL = process.env.LNBITS_URL;
const LNBITS_ADMIN_KEY = process.env.LNBITS_ADMIN_KEY;

if (!LNBITS_URL || !LNBITS_ADMIN_KEY) {
    throw new Error('LNbits configuration missing');
}

// Pay Lightning Invoice
router.post('/pay', async (req: AuthRequest, res) => {
    const { paymentRequest, amount } = req.body;
    const userId = req.user?.uid;

    if (!userId) throw new AppError('User not found', 404);
    if (!paymentRequest) throw new AppError('Payment request required', 400);

    try {
        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // Get user's wallet and balance
            const wallet = await tx.wallet.findUnique({
                where: { userId },
                include: { balances: true },
            });

            if (!wallet) {
                throw new AppError('Wallet not found', 404);
            }

            // Check BTC balance
            const btcBalance = wallet.balances.find(b => b.coinType === 'BTC');
            if (!btcBalance || parseFloat(btcBalance.amount) < parseFloat(amount)) {
                throw new AppError('Insufficient balance', 400);
            }

            // Create transaction record
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    senderId: userId,
                    receiverId: userId, // Same user for Lightning payments
                    coinType: CoinType.BTC,
                    amount,
                    txType: TxType.LIGHTNING,
                    status: TxStatus.PENDING,
                },
            });

            // Create Lightning invoice record
            const invoice = await tx.lNInvoice.create({
                data: {
                    transactionId: transaction.id,
                    paymentHash: '', // Will be updated after payment
                    paymentRequest,
                    amount,
                    status: LNStatus.PENDING,
                },
            });

            try {
                // Pay invoice using LNbits
                const response = await axios.post(
                    `${LNBITS_URL}/api/v1/payments`,
                    {
                        out: true,
                        bolt11: paymentRequest,
                    },
                    {
                        headers: {
                            'X-Api-Key': LNBITS_ADMIN_KEY,
                        },
                    }
                );

                // Update invoice with payment hash
                await tx.lNInvoice.update({
                    where: { id: invoice.id },
                    data: {
                        paymentHash: response.data.payment_hash,
                        status: LNStatus.PAID,
                    },
                });

                // Update transaction status
                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: TxStatus.COMPLETED,
                    },
                });

                // Update user's balance
                await tx.balance.update({
                    where: {
                        walletId_coinType: {
                            walletId: wallet.id,
                            coinType: CoinType.BTC,
                        },
                    },
                    data: {
                        amount: (parseFloat(btcBalance.amount) - parseFloat(amount)).toString(),
                    },
                });

                return { transaction, invoice };
            } catch (error) {
                // Update status to failed if payment fails
                await tx.lNInvoice.update({
                    where: { id: invoice.id },
                    data: { status: LNStatus.FAILED },
                });

                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: { status: TxStatus.FAILED },
                });

                throw new AppError('Lightning payment failed', 500);
            }
        });

        res.json(result);
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Lightning payment failed', 500);
    }
});

// Get Lightning payment status
router.get('/status/:paymentHash', async (req: AuthRequest, res) => {
    try {
        const { paymentHash } = req.params;
        const userId = req.user?.uid;

        if (!userId) throw new AppError('User not found', 404);

        const invoice = await prisma.lNInvoice.findFirst({
            where: {
                paymentHash,
                transaction: {
                    userId,
                },
            },
            include: {
                transaction: true,
            },
        });

        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }

        res.json(invoice);
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch payment status', 500);
    }
});

export default router;
