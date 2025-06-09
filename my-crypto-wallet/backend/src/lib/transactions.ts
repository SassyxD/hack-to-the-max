import { prisma } from './prisma';
import { ethers } from 'ethers';
import * as bitcoin from 'bitcoinjs-lib';
import { TronWeb } from 'tronweb';
import { LNBits } from './lightning';
import {
    TransactionError,
    InsufficientBalanceError,
    InvalidAddressError,
    NetworkError,
    LightningError
} from './errors';
import { getNetworkProvider } from './providers';
import { decimalToBigInt, bigIntToDecimal } from './utils';

interface TransferParams {
    senderId: string;
    receiverId: string;
    amount: string;
    coinType: 'BTC' | 'ETH' | 'USDT';
}

interface WithdrawalParams {
    userId: string;
    address: string;
    amount: string;
    coinType: 'BTC' | 'ETH' | 'USDT';
    feeLevel: 'fast' | 'medium' | 'slow';
    withdrawType: 'ONCHAIN' | 'LIGHTNING';
}

// Process internal transfer between users
export async function processInternalTransfer({
    senderId,
    receiverId,
    amount,
    coinType,
}: TransferParams) {
    return await prisma.$transaction(async (tx) => {
        // Get sender's balance
        const senderBalance = await tx.balance.findUnique({
            where: {
                userId_coinType: {
                    userId: senderId,
                    coinType,
                },
            },
        });

        if (!senderBalance) {
            throw new InsufficientBalanceError(coinType);
        }

        const transferAmount = decimalToBigInt(amount);
        const currentBalance = BigInt(senderBalance.amount);

        if (currentBalance < transferAmount) {
            throw new InsufficientBalanceError(coinType);
        }

        // Update sender's balance
        await tx.balance.update({
            where: {
                userId_coinType: {
                    userId: senderId,
                    coinType,
                },
            },
            data: {
                amount: (currentBalance - transferAmount).toString(),
            },
        });

        // Update or create receiver's balance
        await tx.balance.upsert({
            where: {
                userId_coinType: {
                    userId: receiverId,
                    coinType,
                },
            },
            create: {
                userId: receiverId,
                coinType,
                amount: transferAmount.toString(),
            },
            update: {
                amount: {
                    increment: transferAmount.toString(),
                },
            },
        });

        // Create transaction record
        const transaction = await tx.transaction.create({
            data: {
                senderId,
                receiverId,
                amount: amount.toString(),
                coinType,
                txType: 'INTERNAL',
                status: 'COMPLETED',
            },
        });

        return transaction;
    });
}

// Process withdrawal to external address
export async function processWithdrawal({
    userId,
    address,
    amount,
    coinType,
    feeLevel,
    withdrawType,
}: WithdrawalParams) {
    if (withdrawType === 'LIGHTNING' && coinType !== 'BTC') {
        throw new TransactionError('Lightning Network is only available for BTC');
    }

    return await prisma.$transaction(async (tx) => {
        // Get user's balance
        const balance = await tx.balance.findUnique({
            where: {
                userId_coinType: {
                    userId,
                    coinType,
                },
            },
        });

        if (!balance) {
            throw new InsufficientBalanceError(coinType);
        }

        const withdrawalAmount = decimalToBigInt(amount);
        const currentBalance = BigInt(balance.amount);
        const fees = await getFees();
        const fee = decimalToBigInt(fees[coinType][feeLevel]);

        if (currentBalance < withdrawalAmount + fee) {
            throw new InsufficientBalanceError(coinType);
        }

        // Create pending transaction
        const transaction = await tx.transaction.create({
            data: {
                senderId: userId,
                amount: amount.toString(),
                coinType,
                txType: 'WITHDRAWAL',
                status: 'PENDING',
                txHash: null,
            },
        });

        // Update user's balance
        await tx.balance.update({
            where: {
                userId_coinType: {
                    userId,
                    coinType,
                },
            },
            data: {
                amount: (currentBalance - withdrawalAmount - fee).toString(),
            },
        });

        // Process the withdrawal based on type
        if (withdrawType === 'LIGHTNING') {
            await processLightningWithdrawal(transaction.id, address, amount);
        } else {
            await processOnChainWithdrawal(transaction.id, address, amount, coinType, fee);
        }

        return transaction;
    });
}

// Validate cryptocurrency address
export async function validateAddress(
    address: string,
    coinType: string,
    withdrawType: 'ONCHAIN' | 'LIGHTNING'
): Promise<boolean> {
    try {
        if (withdrawType === 'LIGHTNING') {
            return LNBits.validateInvoice(address);
        }

        switch (coinType) {
            case 'BTC':
                try {
                    bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
                    return true;
                } catch {
                    return false;
                }

            case 'ETH':
                return ethers.isAddress(address);

            case 'USDT':
                return TronWeb.isAddress(address);

            default:
                return false;
        }
    } catch (error) {
        console.error('Address validation failed:', error);
        return false;
    }
}

// Get network fees for different cryptocurrencies
export async function getFees() {
    try {
        const [btcFees, ethFees, usdtFees] = await Promise.all([
            getBTCFees(),
            getETHFees(),
            getUSDTFees(),
        ]);

        return {
            BTC: btcFees,
            ETH: ethFees,
            USDT: usdtFees,
        };
    } catch (error) {
        throw new NetworkError('Failed to fetch network fees');
    }
}

// Helper functions for processing withdrawals
async function processLightningWithdrawal(
    transactionId: string,
    invoice: string,
    amount: string
) {
    try {
        const paymentHash = await LNBits.payInvoice(invoice, amount);

        await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: 'COMPLETED',
                lightning: {
                    create: {
                        paymentHash,
                        status: 'PAID',
                    },
                },
            },
        });
    } catch (error) {
        await handleWithdrawalFailure(transactionId, error);
        throw new LightningError(error instanceof Error ? error.message : 'Payment failed');
    }
}

async function processOnChainWithdrawal(
    transactionId: string,
    address: string,
    amount: string,
    coinType: string,
    fee: bigint
) {
    try {
        const provider = await getNetworkProvider(coinType);
        const txHash = await provider.sendTransaction(address, amount, fee);

        await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: 'COMPLETED',
                txHash,
            },
        });
    } catch (error) {
        await handleWithdrawalFailure(transactionId, error);
        throw new NetworkError('Transaction failed');
    }
}

async function handleWithdrawalFailure(transactionId: string, error: unknown) {
    console.error('Withdrawal failed:', error);

    const failedTx = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { sender: true },
    });

    if (failedTx) {
        // Refund the user
        await prisma.$transaction([
            prisma.transaction.update({
                where: { id: transactionId },
                data: { status: 'FAILED' },
            }),
            prisma.balance.update({
                where: {
                    userId_coinType: {
                        userId: failedTx.senderId,
                        coinType: failedTx.coinType,
                    },
                },
                data: {
                    amount: {
                        increment: failedTx.amount,
                    },
                },
            }),
        ]);
    }
}

// Network-specific fee calculation functions
async function getBTCFees() {
    const provider = await getNetworkProvider('BTC');
    const baseFee = await provider.estimateGas();

    return {
        fast: bigIntToDecimal(baseFee * 3n),
        medium: bigIntToDecimal(baseFee * 2n),
        slow: bigIntToDecimal(baseFee),
    };
}

async function getETHFees() {
    const provider = await getNetworkProvider('ETH');
    const baseFee = await provider.estimateGas();

    return {
        fast: bigIntToDecimal(baseFee * 2n),
        medium: bigIntToDecimal(baseFee * 15n / 10n),
        slow: bigIntToDecimal(baseFee),
    };
}

async function getUSDTFees() {
    const provider = await getNetworkProvider('USDT');
    const baseFee = await provider.estimateGas();

    return {
        fast: bigIntToDecimal(baseFee * 2n),
        medium: bigIntToDecimal(baseFee * 15n / 10n),
        slow: bigIntToDecimal(baseFee),
    };
} 