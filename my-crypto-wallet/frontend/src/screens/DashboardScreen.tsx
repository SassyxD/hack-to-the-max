import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, spacing, typography, shadows } from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;

interface CryptoBalance {
    currency: string;
    symbol: string;
    balance: number;
    fiatValue: number;
    icon: string;
}

const mockBalances: CryptoBalance[] = [
    {
        currency: 'Bitcoin',
        symbol: 'BTC',
        balance: 0.25,
        fiatValue: 7500,
        icon: 'bitcoin',
    },
    {
        currency: 'Ethereum',
        symbol: 'ETH',
        balance: 2.5,
        fiatValue: 5000,
        icon: 'ethereum',
    },
    {
        currency: 'Tether',
        symbol: 'USDT',
        balance: 1000,
        fiatValue: 1000,
        icon: 'currency-usd',
    },
];

export default function DashboardScreen({ navigation }: Props) {
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Add your refresh logic here
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    const totalFiatValue = mockBalances.reduce(
        (sum, balance) => sum + balance.fiatValue,
        0
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Your Portfolio</Text>
                    <Text style={styles.totalBalance}>
                        ${totalFiatValue.toLocaleString()}
                    </Text>
                </View>

                <View style={styles.actionButtons}>
                    <Button
                        title="Send"
                        onPress={() => navigation.navigate('Send')}
                        style={styles.actionButton}
                        size="small"
                    />
                    <Button
                        title="Receive"
                        onPress={() => { }} // Add receive functionality
                        style={styles.actionButton}
                        variant="outline"
                        size="small"
                    />
                </View>

                <Text style={styles.sectionTitle}>Your Assets</Text>
                {mockBalances.map((crypto, index) => (
                    <TouchableOpacity
                        key={crypto.symbol}
                        onPress={() =>
                            navigation.navigate('Withdraw', {
                                currency: crypto.symbol,
                                balance: crypto.balance,
                            })
                        }
                    >
                        <Card
                            style={[
                                styles.cryptoCard,
                                index === mockBalances.length - 1 && styles.lastCard,
                            ]}
                        >
                            <View style={styles.cryptoInfo}>
                                <View style={styles.cryptoIconContainer}>
                                    <Icon
                                        name={crypto.icon}
                                        size={24}
                                        color={colors.text.primary}
                                    />
                                </View>
                                <View style={styles.cryptoDetails}>
                                    <Text style={styles.cryptoName}>{crypto.currency}</Text>
                                    <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
                                </View>
                                <View style={styles.cryptoValues}>
                                    <Text style={styles.cryptoBalance}>
                                        {crypto.balance.toLocaleString()} {crypto.symbol}
                                    </Text>
                                    <Text style={styles.cryptoFiat}>
                                        ${crypto.fiatValue.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    welcomeText: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    totalBalance: {
        ...typography.h1,
        color: colors.text.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    actionButton: {
        minWidth: 100,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text.primary,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    cryptoCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.lg,
    },
    lastCard: {
        marginBottom: spacing.lg,
    },
    cryptoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cryptoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    cryptoDetails: {
        flex: 1,
        marginLeft: spacing.md,
    },
    cryptoName: {
        ...typography.body1,
        color: colors.text.primary,
        fontWeight: '500',
    },
    cryptoSymbol: {
        ...typography.caption,
        color: colors.text.secondary,
    },
    cryptoValues: {
        alignItems: 'flex-end',
    },
    cryptoBalance: {
        ...typography.body2,
        color: colors.text.primary,
        fontWeight: '500',
    },
    cryptoFiat: {
        ...typography.caption,
        color: colors.text.secondary,
    },
}); 