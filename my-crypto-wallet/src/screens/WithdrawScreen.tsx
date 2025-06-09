import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { Picker } from '@react-native-picker/picker';

type CoinType = 'BTC' | 'ETH' | 'USDT';
type WithdrawType = 'ONCHAIN' | 'LIGHTNING';

interface NetworkFees {
    BTC: { fast: string; medium: string; slow: string };
    ETH: { fast: string; medium: string; slow: string };
    USDT: { fast: string; medium: string; slow: string };
}

export default function WithdrawScreen() {
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [coinType, setCoinType] = useState<CoinType>('BTC');
    const [withdrawType, setWithdrawType] = useState<WithdrawType>('ONCHAIN');
    const [feeLevel, setFeeLevel] = useState<'fast' | 'medium' | 'slow'>('medium');
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch network fees
    const { data: networkFees } = useQuery<NetworkFees>({
        queryKey: ['networkFees'],
        queryFn: async () => {
            const response = await fetch('YOUR_API_URL/api/fees');
            if (!response.ok) throw new Error('Failed to fetch fees');
            return response.json();
        },
        refetchInterval: 60000, // Refresh every minute
    });

    const { mutate: withdraw, isLoading } = useMutation({
        mutationFn: async () => {
            const endpoint = withdrawType === 'LIGHTNING'
                ? 'YOUR_API_URL/api/lightning/pay'
                : 'YOUR_API_URL/api/transaction/withdraw';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await user?.getIdToken()}`,
                },
                body: JSON.stringify({
                    address,
                    amount,
                    coinType,
                    feeLevel,
                    withdrawType,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Withdrawal failed');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['balances']);
            Alert.alert('Success', 'Withdrawal initiated successfully');
            setAddress('');
            setAmount('');
        },
        onError: (error: Error) => {
            Alert.alert('Error', error.message);
        },
    });

    const handleWithdraw = () => {
        if (!address || !amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please fill in all fields with valid values');
            return;
        }
        withdraw();
    };

    const getCurrentFee = () => {
        if (!networkFees || !coinType) return null;
        return networkFees[coinType][feeLevel];
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Withdraw</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Coin Type</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={coinType}
                        onValueChange={(value) => setCoinType(value as CoinType)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Bitcoin (BTC)" value="BTC" />
                        <Picker.Item label="Ethereum (ETH)" value="ETH" />
                        <Picker.Item label="Tether (USDT)" value="USDT" />
                    </Picker>
                </View>

                {coinType === 'BTC' && (
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={withdrawType}
                            onValueChange={(value) => setWithdrawType(value as WithdrawType)}
                            style={styles.picker}
                        >
                            <Picker.Item label="On-chain Transaction" value="ONCHAIN" />
                            <Picker.Item label="Lightning Network" value="LIGHTNING" />
                        </Picker>
                    </View>
                )}

                <Text style={styles.label}>
                    {withdrawType === 'LIGHTNING' ? 'Lightning Invoice' : 'Withdrawal Address'}
                </Text>
                <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder={withdrawType === 'LIGHTNING' ? 'Enter Lightning Invoice' : 'Enter Address'}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Amount</Text>
                <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                />

                {withdrawType === 'ONCHAIN' && (
                    <>
                        <Text style={styles.label}>Network Fee</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={feeLevel}
                                onValueChange={(value) => setFeeLevel(value as 'fast' | 'medium' | 'slow')}
                                style={styles.picker}
                            >
                                <Picker.Item label="Fast" value="fast" />
                                <Picker.Item label="Medium" value="medium" />
                                <Picker.Item label="Slow" value="slow" />
                            </Picker>
                        </View>

                        {getCurrentFee() && (
                            <Text style={styles.feeText}>
                                Current fee: {getCurrentFee()}
                            </Text>
                        )}
                    </>
                )}

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleWithdraw}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Withdraw</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    feeText: {
        fontSize: 14,
        color: '#666',
        marginTop: -8,
        marginBottom: 16,
    },
}); 