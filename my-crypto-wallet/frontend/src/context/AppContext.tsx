import React, { createContext, useContext, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { CoinType } from '@crypto-wallet/shared';

interface AppContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    selectedCoin: CoinType;
    setSelectedCoin: (coin: CoinType) => void;
    isLoading: boolean;
    refreshApp: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
    const [selectedCoin, setSelectedCoin] = useState<CoinType>('BTC');

    const { user, loading: authLoading } = useAuth();
    const { isLoading: walletLoading, refreshBalances } = useWallet();

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    const refreshApp = useCallback(async () => {
        if (user) {
            await refreshBalances();
        }
    }, [user, refreshBalances]);

    const value = {
        isDarkMode,
        toggleDarkMode,
        selectedCoin,
        setSelectedCoin,
        isLoading: authLoading || walletLoading,
        refreshApp,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
} 