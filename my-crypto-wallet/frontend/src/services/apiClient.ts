import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';
import { Balance, Transaction, TransferParams, WithdrawalParams, WalletInfo } from '@crypto-wallet/shared';

export class ApiClient {
    private client: AxiosInstance;
    private static instance: ApiClient;

    private constructor() {
        this.client = axios.create({
            baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add auth token to requests
        this.client.interceptors.request.use(async (config) => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        });

        // Handle errors globally
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Handle unauthorized error (e.g., redirect to login)
                    getAuth().signOut();
                }
                return Promise.reject(error);
            }
        );
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    // Wallet endpoints
    public async getWallet(): Promise<WalletInfo> {
        const { data } = await this.client.get('/wallet');
        return data;
    }

    public async getBalances(): Promise<Balance[]> {
        const { data } = await this.client.get('/wallet/balances');
        return data;
    }

    public async getBalance(coinType: string): Promise<Balance> {
        const { data } = await this.client.get(`/wallet/balance/${coinType}`);
        return data;
    }

    // Transaction endpoints
    public async getTransactions(): Promise<Transaction[]> {
        const { data } = await this.client.get('/transaction/history');
        return data;
    }

    public async transfer(params: TransferParams): Promise<Transaction> {
        const { data } = await this.client.post('/transaction/transfer', params);
        return data;
    }

    public async withdraw(params: WithdrawalParams): Promise<Transaction> {
        const { data } = await this.client.post('/transaction/withdraw', params);
        return data;
    }

    public async getTransaction(id: string): Promise<Transaction> {
        const { data } = await this.client.get(`/transaction/${id}`);
        return data;
    }
} 