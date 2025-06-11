import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../services/apiClient';
import { Balance, CoinType } from '@crypto-wallet/shared';

const api = ApiClient.getInstance();

export function useWallet() {
    const queryClient = useQueryClient();

    const { data: wallet, isLoading: isWalletLoading } = useQuery({
        queryKey: ['wallet'],
        queryFn: () => api.getWallet(),
    });

    const { data: balances, isLoading: isBalancesLoading } = useQuery({
        queryKey: ['balances'],
        queryFn: () => api.getBalances(),
    });

    const { mutate: refreshBalances } = useMutation({
        mutationFn: () => api.getBalances(),
        onSuccess: (newBalances) => {
            queryClient.setQueryData(['balances'], newBalances);
        },
    });

    const getBalance = (coinType: CoinType) => {
        return balances?.find(b => b.coinType === coinType)?.amount || '0';
    };

    return {
        wallet,
        balances,
        getBalance,
        refreshBalances,
        isLoading: isWalletLoading || isBalancesLoading,
    };
} 