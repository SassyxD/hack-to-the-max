import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

interface Transaction {
    id: string;
    coinType: 'BTC' | 'ETH' | 'USDT';
    amount: string;
    txType: 'INTERNAL' | 'WITHDRAWAL' | 'LIGHTNING';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
    sender: { email: string };
    receiver: { email: string };
    txHash?: string;
    lightning?: {
        paymentHash: string;
        status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
    };
}

export default function HistoryScreen() {
    const { user } = useAuth();

    const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
        queryKey: ['transactions'],
        queryFn: async () => {
            const response = await fetch('YOUR_API_URL/api/transaction/history', {
                headers: {
                    Authorization: `Bearer ${await user?.getIdToken()}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch transactions');
            return response.json();
        },
    });

    const getTransactionIcon = (type: Transaction['txType']) => {
        switch (type) {
            case 'INTERNAL':
                return '↔️';
            case 'WITHDRAWAL':
                return '↗️';
            case 'LIGHTNING':
                return '⚡';
            default:
                return '❓';
        }
    };

    const getStatusColor = (status: Transaction['status']) => {
        switch (status) {
            case 'COMPLETED':
                return '#4CAF50';
            case 'PENDING':
                return '#FFC107';
            case 'FAILED':
                return '#F44336';
            default:
                return '#666';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <View style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
                <View style={styles.typeContainer}>
                    <Text style={styles.typeIcon}>{getTransactionIcon(item.txType)}</Text>
                    <Text style={styles.type}>{item.txType}</Text>
                </View>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                    {item.status}
                </Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.amount}>
                    {item.txType === 'WITHDRAWAL' ? '-' : ''}{item.amount} {item.coinType}
                </Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.userText}>
                    From: {item.sender.email}
                </Text>
                <Text style={styles.userText}>
                    To: {item.receiver.email}
                </Text>
            </View>

            {item.txHash && (
                <Text style={styles.hash} numberOfLines={1}>
                    TX: {item.txHash}
                </Text>
            )}

            {item.lightning && (
                <Text style={styles.hash} numberOfLines={1}>
                    Lightning Payment Hash: {item.lightning.paymentHash}
                </Text>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Transaction History</Text>
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No transactions found</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 20,
    },
    listContent: {
        padding: 10,
    },
    transactionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    type: {
        fontSize: 16,
        fontWeight: '500',
    },
    status: {
        fontSize: 14,
        fontWeight: '500',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    userInfo: {
        marginBottom: 10,
    },
    userText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    hash: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
}); 