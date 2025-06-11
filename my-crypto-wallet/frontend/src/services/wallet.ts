import api from './api';
import { WalletInfo, Balance } from '../../../shared/types';

export const walletService = {
    getWallet: async (): Promise<WalletInfo> => {
        const response = await api.get('/wallet');
        return response.data;
    },

    getBalances: async (): Promise<Balance[]> => {
        const response = await api.get('/wallet/balances');
        return response.data;
    },

    getBalance: async (coinType: string): Promise<Balance> => {
        const response = await api.get(`/wallet/balance/${coinType}`);
        return response.data;
    },
}; 