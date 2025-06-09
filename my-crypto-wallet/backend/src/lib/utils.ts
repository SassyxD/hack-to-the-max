const DECIMALS = {
    BTC: 8,
    ETH: 18,
    USDT: 6,
};

/**
 * Converts a decimal string to a BigInt, handling the appropriate number of decimals
 * @param amount Decimal string (e.g., "0.01")
 * @param coinType Cryptocurrency type (BTC, ETH, USDT)
 * @returns BigInt representation of the amount
 */
export function decimalToBigInt(amount: string, coinType: keyof typeof DECIMALS = 'BTC'): bigint {
    const [whole = '0', fraction = '0'] = amount.split('.');
    const decimals = DECIMALS[coinType];
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(whole + paddedFraction);
}

/**
 * Converts a BigInt to a decimal string with the appropriate number of decimals
 * @param amount BigInt amount
 * @param coinType Cryptocurrency type (BTC, ETH, USDT)
 * @returns Decimal string representation of the amount
 */
export function bigIntToDecimal(amount: bigint, coinType: keyof typeof DECIMALS = 'BTC'): string {
    const amountStr = amount.toString().padStart(DECIMALS[coinType] + 1, '0');
    const decimalIndex = amountStr.length - DECIMALS[coinType];
    const whole = amountStr.slice(0, decimalIndex) || '0';
    const fraction = amountStr.slice(decimalIndex).replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : whole;
}

/**
 * Validates if a string represents a valid positive decimal number
 * @param amount String to validate
 * @returns boolean indicating if the string is a valid positive decimal
 */
export function isValidDecimal(amount: string): boolean {
    const regex = /^\d+(\.\d+)?$/;
    if (!regex.test(amount)) return false;

    const num = parseFloat(amount);
    return num > 0 && Number.isFinite(num);
}

/**
 * Formats a timestamp to a human-readable date string
 * @param timestamp ISO date string or number
 * @returns Formatted date string
 */
export function formatDate(timestamp: string | number): string {
    return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    });
}

/**
 * Formats an amount with the appropriate number of decimal places for the coin type
 * @param amount Amount to format
 * @param coinType Cryptocurrency type
 * @returns Formatted amount string
 */
export function formatAmount(amount: string, coinType: keyof typeof DECIMALS): string {
    const num = parseFloat(amount);
    if (!Number.isFinite(num)) return '0';
    return num.toFixed(DECIMALS[coinType]);
}

/**
 * Generates a random transaction ID
 * @returns Random transaction ID string
 */
export function generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
} 