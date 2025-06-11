import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import SendScreen from '../screens/SendScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#1E1E1E',
                },
                headerTintColor: '#fff',
            }}
        >
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'My Wallet' }}
            />
            <Stack.Screen
                name="Send"
                component={SendScreen}
                options={{ title: 'Send Crypto' }}
            />
            <Stack.Screen
                name="Withdraw"
                component={WithdrawScreen}
                options={{ title: 'Withdraw' }}
            />
            <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{ title: 'Transaction History' }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
            />
        </Stack.Navigator>
    );
} 