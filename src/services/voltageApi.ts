import { voltageConfig } from '../config/voltage';
import { v4 as uuidv4 } from 'uuid';
import { convertUsdToSats } from './priceApi';

// Types based on Voltage API documentation
export interface VoltageAmount {
  amount: number;
  currency: 'btc' | 'usd';
  unit: 'sat' | 'msat' | 'btc' | 'usd';
}

// Receive payment request structure (what we need for creating invoices)
export interface CreateReceivePaymentRequest {
  id: string;
  payment_kind: 'bolt11' | 'onchain' | 'bip21';
  wallet_id: string;
  amount_msats: number; // Amount in millisatoshis
  currency: 'btc' | 'usd';
  description?: string;
}

export interface PaymentData {
  amount_msats: number;
  expiration?: string | null;
  memo?: string;
  payment_request: string; // Lightning invoice
}

export interface RequestedAmount {
  amount: number;
  currency: 'btc' | 'usd';
  unit: 'msats' | 'sats' | 'btc';
}

export interface Payment {
  id: string;
  organization_id: string;
  environment_id: string;
  wallet_id: string;
  bip21_uri?: string;
  created_at: string;
  currency: 'btc' | 'usd';
  data: PaymentData;
  direction: 'receive' | 'send';
  error?: string | null;
  frozen: any[];
  requested_amount: RequestedAmount;
  status: 'receiving' | 'completed' | 'failed' | 'pending' | 'expired';
  type: 'bolt11' | 'onchain' | 'bip21';
  updated_at: string;
}

export class VoltageApiError extends Error {
  public status?: number;
  public response?: any;

  constructor(
    message: string,
    status?: number,
    response?: any
  ) {
    super(message);
    this.name = 'VoltageApiError';
    this.status = status;
    this.response = response;
  }
}

class VoltageApi {
  private baseUrl: string;
  private apiKey: string;
  private orgId: string;
  private envId: string;

  constructor() {
    this.baseUrl = voltageConfig.baseUrl;
    this.apiKey = voltageConfig.apiKey;
    this.orgId = voltageConfig.orgId;
    this.envId = voltageConfig.envId;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('Voltage API Request:', { 
      url, 
      method: options.method || 'GET',
      body: options.body ? JSON.parse(options.body as string) : null 
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      console.error('Voltage API Error:', { status: response.status, errorText });
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.detail || errorMessage;
      } catch {
        // Use the raw text if it's not JSON
        errorMessage = errorText || errorMessage;
      }
      
      throw new VoltageApiError(errorMessage, response.status, errorText);
    }

    // Handle responses with no body (like 202)
    if (response.status === 202 || response.headers.get('content-length') === '0') {
      console.log('Voltage API Response: 202 Accepted (no body)');
      return undefined as T;
    }
    
    const result = await response.json();
    console.log('Voltage API Response:', result);
    return result;
  }

  async createPayment(request: CreateReceivePaymentRequest): Promise<void> {
    // In production, use serverless function to avoid CORS issues
    if (!import.meta.env.DEV) {
      const response = await fetch('/api/voltage-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new VoltageApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorText
        );
      }

      // 202 response has no body, just return
      return;
    }

    // Development: use proxy
    const endpoint = `/organizations/${this.orgId}/environments/${this.envId}/payments`;
    
    await this.makeRequest<void>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const endpoint = `/organizations/${this.orgId}/environments/${this.envId}/payments/${paymentId}`;
    
    return this.makeRequest<Payment>(endpoint, {
      method: 'GET',
    });
  }
}

export const voltageApi = new VoltageApi();

// Helper function to poll payment status until payment methods are available
async function pollPaymentStatus(
  paymentId: string,
  maxAttempts: number = 30,
  intervalMs: number = 1000
): Promise<Payment> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const payment = await voltageApi.getPayment(paymentId);
      
      // Check if payment data is available with Lightning invoice
      if (payment.data && payment.data.payment_request) {
        console.log(`Payment data ready after ${attempt + 1} attempts`);
        return payment;
      }
      
      console.log(`Attempt ${attempt + 1}: Payment data not ready yet, polling again...`);
      
      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);
      
      // If it's the last attempt, throw the error
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new VoltageApiError('Payment data not ready after maximum polling attempts');
}

// Helper function to poll payment status until completed
async function pollPaymentCompletion(
  paymentId: string,
  maxAttempts: number = 300, // 5 minutes at 1 second intervals
  intervalMs: number = 1000
): Promise<Payment> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const payment = await voltageApi.getPayment(paymentId);
      
      console.log(`Payment status check ${attempt + 1}: ${payment.status}`);
      
      // Check if payment is completed
      if (payment.status === 'completed') {
        console.log(`Payment completed after ${attempt + 1} attempts!`);
        return payment;
      }
      
      // If payment failed or expired, throw error
      if (payment.status === 'failed' || payment.status === 'expired') {
        throw new VoltageApiError(`Payment ${payment.status}`);
      }
      
      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error(`Payment status polling attempt ${attempt + 1} failed:`, error);
      
      // If it's the last attempt, throw the error
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new VoltageApiError('Payment not completed after maximum polling attempts');
}

// Helper function to create tip payment methods
export async function createTipPaymentMethods(
  amountUsd: number,
  description: string = 'Bitcoin Tip'
): Promise<{
  lightningInvoice?: string;
  onchainAddress?: string;
  payment: Payment;
  pollForCompletion: () => Promise<Payment>;
}> {
  try {
    // Convert USD to satoshis using real-time Bitcoin price
    console.log(`Converting $${amountUsd} USD to satoshis...`);
    const amountSats = await convertUsdToSats(amountUsd);
    const amountMsats = amountSats * 1000; // Convert sats to millisats

    const paymentId = uuidv4(); // Generate unique ID for this payment request
    
    const paymentRequest: CreateReceivePaymentRequest = {
      id: paymentId,
      payment_kind: 'bolt11', // Creates Lightning-only payment
      wallet_id: voltageConfig.walletId,
      amount_msats: amountMsats, // Amount in millisatoshis
      currency: 'btc',
      description,
    };

    // Create the payment request (returns 202 with no body)
    await voltageApi.createPayment(paymentRequest);
    
    console.log(`Payment request created with ID: ${paymentId}, polling for payment data...`);
    
    // Poll for payment status until payment data is ready
    const payment = await pollPaymentStatus(paymentId);

    // Extract Lightning invoice from payment data
    return {
      lightningInvoice: payment.data.payment_request,
      onchainAddress: '', // Leave empty for bolt11 payments
      payment,
      pollForCompletion: () => pollPaymentCompletion(paymentId),
    };
  } catch (error) {
    if (error instanceof VoltageApiError) {
      throw error;
    }
    throw new VoltageApiError(
      `Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
