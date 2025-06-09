import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { Picker } from '@react-native-picker/picker';

type CoinType = 'BTC' | 'ETH' | 'USDT';

export default function SendScreen() {
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');
    const [coinType, setCoinType] = useState<CoinType>('BTC');
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { mutate: sendCoins, isLoading } = useMutation({
        mutationFn: async () => {
            const response = await fetch('YOUR_API_URL/api/transaction/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await user?.getIdToken()}`,
                },
                body: JSON.stringify({
                    receiverId,
                    amount,
                    coinType,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Transfer failed');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['balances']);
            Alert.alert('Success', 'Transfer completed successfully');
            setReceiverId('');
            setAmount('');
        },
        onError: (error: Error) => {
            Alert.alert('Error', error.message);
        },
    });

    const handleSend = () => {
        if (!receiverId || !amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please fill in all fields with valid values');
            return;
        }
        sendCoins();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Send Coins</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Recipient ID</Text>
                <TextInput
                    style={styles.input}
                    value={receiverId}
                    onChangeText={setReceiverId}
                    placeholder="Enter recipient's ID"
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

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSend}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
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
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 