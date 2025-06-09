declare module 'tronweb' {
    interface TronWeb {
        createAccount(): Promise<{
            address: string;
            privateKey: string;
        }>;
    }

    const TronWeb: {
        createAccount(): Promise<{
            address: string;
            privateKey: string;
        }>;
    };

    export default TronWeb;
} 