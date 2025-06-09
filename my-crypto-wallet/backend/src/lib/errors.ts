export class TransactionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TransactionError';
    }
}

export class InsufficientBalanceError extends TransactionError {
    constructor(coinType: string) {
        super(`Insufficient ${coinType} balance`);
        this.name = 'InsufficientBalanceError';
    }
}

export class InvalidAddressError extends TransactionError {
    constructor(coinType: string) {
        super(`Invalid ${coinType} address`);
        this.name = 'InvalidAddressError';
    }
}

export class NetworkError extends TransactionError {
    constructor(message: string) {
        super(`Network error: ${message}`);
        this.name = 'NetworkError';
    }
}

export class LightningError extends TransactionError {
    constructor(message: string) {
        super(`Lightning error: ${message}`);
        this.name = 'LightningError';
    }
} 