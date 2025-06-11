import api from './api';
import { Transaction, TransferParams, WithdrawalParams } from '../../../shared/types';

export const transactionService = {
    getTransactions: async (): Promise<Transaction[]> => {
        const response = await api.get('/transaction/history');
        return response.data;
    },

    transfer: async (params: TransferParams): Promise<Transaction> => {
        const response = await api.post('/transaction/transfer', params);
        return response.data;
    },

    withdraw: async (params: WithdrawalParams): Promise<Transaction> => {
        const response = await api.post('/transaction/withdraw', params);
        return response.data;
    },

    getTransaction: async (id: string): Promise<Transaction> => {
        const response = await api.get(`/transaction/${id}`);
        return response.data;
    },
}; 