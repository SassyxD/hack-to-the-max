import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

type Balance = {
    coinType: 'BTC' | 'ETH' | 'USDT';
    amount: string;
};

export default function DashboardScreen() {
    const { user } = useAuth();

    const { data: balances, isLoading, refetch } = useQuery<Balance[]>({
        queryKey: ['balances', user?.uid],
        queryFn: async () => {
            const response = await fetch('YOUR_API_URL/balances', {
                headers: {
                    Authorization: `Bearer ${await user?.getIdToken()}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch balances');
            }
            return response.json();
        },
        enabled: !!user,
    });

    const getCoinIcon = (coinType: string) => {
        switch (coinType) {
            case 'BTC':
                return '₿';
            case 'ETH':
                return 'Ξ';
            case 'USDT':
                return '₮';
            default:
                return '$';
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
        >
            <Text style={styles.title}>Your Balances</Text>

            <View style={styles.balancesContainer}>
                {balances?.map((balance) => (
                    <View key={balance.coinType} style={styles.balanceCard}>
                        <View style={styles.coinInfo}>
                            <Text style={styles.coinIcon}>{getCoinIcon(balance.coinType)}</Text>
                            <Text style={styles.coinType}>{balance.coinType}</Text>
                        </View>
                        <Text style={styles.amount}>{balance.amount}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 20,
    },
    balancesContainer: {
        padding: 10,
    },
    balanceCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    coinInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coinIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    coinType: {
        fontSize: 18,
        fontWeight: '500',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
}); 