import axios from 'axios';
import { LightningError } from './errors';

const LNBITS_URL = process.env.LNBITS_URL || 'https://legend.lnbits.com';
const LNBITS_ADMIN_KEY = process.env.LNBITS_ADMIN_KEY;
const LNBITS_INVOICE_READ_KEY = process.env.LNBITS_INVOICE_READ_KEY;

if (!LNBITS_ADMIN_KEY || !LNBITS_INVOICE_READ_KEY) {
    throw new Error('LNBits API keys not configured');
}

export class LNBits {
    private static async makeRequest(endpoint: string, method: string, data?: any) {
        try {
            const response = await axios({
                method,
                url: `${LNBITS_URL}/api/v1${endpoint}`,
                headers: {
                    'X-Api-Key': LNBITS_ADMIN_KEY,
                    'Content-Type': 'application/json',
                },
                data,
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new LightningError(error.response?.data?.message || error.message);
            }
            throw error;
        }
    }

    static async validateInvoice(bolt11: string): Promise<boolean> {
        try {
            const response = await axios.get(`${LNBITS_URL}/api/v1/payments/decode/${bolt11}`, {
                headers: {
                    'X-Api-Key': LNBITS_INVOICE_READ_KEY,
                },
            });
            return response.status === 200;
        } catch {
            return false;
        }
    }

    static async createInvoice(amount: string, memo: string): Promise<string> {
        const data = {
            amount: Math.round(parseFloat(amount) * 100000000), // Convert to sats
            memo,
            out: false,
        };

        const response = await this.makeRequest('/payments', 'POST', data);
        return response.payment_request;
    }

    static async payInvoice(bolt11: string, amount: string): Promise<string> {
        const data = {
            bolt11,
            out: true,
        };

        const response = await this.makeRequest('/payments', 'POST', data);
        return response.payment_hash;
    }

    static async getInvoiceStatus(paymentHash: string): Promise<'PENDING' | 'PAID' | 'EXPIRED'> {
        const response = await this.makeRequest(`/payments/${paymentHash}`, 'GET');

        if (response.paid) {
            return 'PAID';
        } else if (response.expired) {
            return 'EXPIRED';
        }
        return 'PENDING';
    }

    static async getBalance(): Promise<string> {
        const response = await this.makeRequest('/wallet', 'GET');
        return (response.balance / 100000000).toString(); // Convert from sats to BTC
    }
} 