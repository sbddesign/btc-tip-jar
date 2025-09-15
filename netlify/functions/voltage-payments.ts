// Netlify serverless function for handling Voltage API requests
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface CreateReceivePaymentRequest {
  id: string;
  payment_kind: 'bolt11' | 'onchain' | 'bip21';
  wallet_id: string;
  amount_msats: number; // Amount in millisatoshis
  currency: 'btc' | 'usd';
  description?: string;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { 
      VOLTAGE_API_KEY, 
      VOLTAGE_ORG_ID, 
      VOLTAGE_ENV_ID 
    } = process.env;

    if (!VOLTAGE_API_KEY || !VOLTAGE_ORG_ID || !VOLTAGE_ENV_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Voltage API configuration missing' }),
      };
    }

    // Parse request body
    let paymentRequest: CreateReceivePaymentRequest;
    
    try {
      paymentRequest = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }),
      };
    }

    // Validate required fields
    if (!paymentRequest.id || !paymentRequest.payment_kind || !paymentRequest.wallet_id || 
        typeof paymentRequest.amount_msats !== 'number' || !paymentRequest.currency) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields in payment request',
          details: 'Required fields: id, payment_kind, wallet_id, amount_msats, currency'
        }),
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10s
    const response = await fetch(
      `https://voltageapi.com/v1/organizations/${VOLTAGE_ORG_ID}/environments/${VOLTAGE_ENV_ID}/payments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': VOLTAGE_API_KEY,
          'Idempotency-Key': paymentRequest.id
        },
        body: JSON.stringify(paymentRequest),
        signal: controller.signal
      }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Voltage API Error:', { status: response.status, errorText });
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Voltage API Error: ${response.status}`,
          details: errorText 
        }),
      };
    }

    // Payment creation returns 202 with no body
    if (response.status === 202) {
      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({ success: true, message: 'Payment request created' }),
      };
    }

    const payment = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(payment),
    };
  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
