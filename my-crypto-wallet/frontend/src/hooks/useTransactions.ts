import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../services/apiClient';
import { TransferParams, WithdrawalParams, Transaction } from '@crypto-wallet/shared';
import { useWallet } from './useWallet';

const api = ApiClient.getInstance();

export function useTransactions() {
    const queryClient = useQueryClient();
    const { refreshBalances } = useWallet();

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => api.getTransactions(),
    });

    const { mutate: transfer, isLoading: isTransferring } = useMutation({
        mutationFn: (params: TransferParams) => api.transfer(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            refreshBalances();
        },
    });

    const { mutate: withdraw, isLoading: isWithdrawing } = useMutation({
        mutationFn: (params: WithdrawalParams) => api.withdraw(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            refreshBalances();
        },
    });

    const getTransaction = async (id: string): Promise<Transaction> => {
        return api.getTransaction(id);
    };

    return {
        transactions,
        transfer,
        withdraw,
        getTransaction,
        isLoading,
        isTransferring,
        isWithdrawing,
    };
} 