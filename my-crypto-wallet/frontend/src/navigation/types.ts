export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type MainStackParamList = {
    Dashboard: undefined;
    Send: undefined;
    Withdraw: {
        currency: string;
        balance: number;
    };
    History: undefined;
    Settings: undefined;
}; 