export type CoinType = 'BTC' | 'ETH' | 'USDT';
export type TransactionType = 'INTERNAL' | 'WITHDRAWAL';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type FeeLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type WithdrawType = 'ONCHAIN' | 'LIGHTNING';

export interface Balance {
    coinType: CoinType;
    amount: string;
}

export interface Transaction {
    id: string;
    senderId: string;
    receiverId?: string;
    amount: string;
    coinType: CoinType;
    txType: TransactionType;
    status: TransactionStatus;
    txHash?: string;
    error?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TransferParams {
    receiverId: string;
    amount: string;
    coinType: CoinType;
}

export interface WithdrawalParams {
    address: string;
    amount: string;
    coinType: CoinType;
    feeLevel: FeeLevel;
    withdrawType: WithdrawType;
}

export interface WalletInfo {
    id: string;
    userId: string;
    balances: Balance[];
    createdAt: string;
    updatedAt: string;
} 