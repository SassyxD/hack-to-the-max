import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
];

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { t, i18n } = useTranslation();
    const [biometricEnabled, setBiometricEnabled] = React.useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(false);

    React.useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem('userSettings');
            if (settings) {
                const { biometric, notifications, dark } = JSON.parse(settings);
                setBiometricEnabled(biometric);
                setNotificationsEnabled(notifications);
                setDarkMode(dark);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const saveSettings = async (
        biometric: boolean,
        notifications: boolean,
        dark: boolean
    ) => {
        try {
            await AsyncStorage.setItem(
                'userSettings',
                JSON.stringify({
                    biometric,
                    notifications,
                    dark,
                })
            );
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const handleLanguageChange = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    const handleBiometricToggle = (value: boolean) => {
        setBiometricEnabled(value);
        saveSettings(value, notificationsEnabled, darkMode);
    };

    const handleNotificationsToggle = (value: boolean) => {
        setNotificationsEnabled(value);
        saveSettings(biometricEnabled, value, darkMode);
    };

    const handleDarkModeToggle = (value: boolean) => {
        setDarkMode(value);
        saveSettings(biometricEnabled, notificationsEnabled, value);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('Account')}</Text>
                <View style={styles.userInfo}>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('Language')}</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={i18n.language}
                        onValueChange={handleLanguageChange}
                        style={styles.picker}
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <Picker.Item
                                key={lang.code}
                                label={lang.name}
                                value={lang.code}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('Security')}</Text>
                <View style={styles.setting}>
                    <Text style={styles.settingText}>{t('Biometric Authentication')}</Text>
                    <Switch
                        value={biometricEnabled}
                        onValueChange={handleBiometricToggle}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('Preferences')}</Text>
                <View style={styles.setting}>
                    <Text style={styles.settingText}>{t('Push Notifications')}</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={handleNotificationsToggle}
                    />
                </View>
                <View style={styles.setting}>
                    <Text style={styles.settingText}>{t('Dark Mode')}</Text>
                    <Switch
                        value={darkMode}
                        onValueChange={handleDarkModeToggle}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
            >
                <Text style={styles.signOutText}>{t('Sign Out')}</Text>
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.version}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    userInfo: {
        marginBottom: 10,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    setting: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    settingText: {
        fontSize: 16,
        color: '#333',
    },
    signOutButton: {
        backgroundColor: '#FF3B30',
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    signOutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    version: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
    },
}); 