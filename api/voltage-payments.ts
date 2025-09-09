// Serverless function for handling Voltage API requests in production
// This can be deployed to Vercel, Netlify, or similar platforms

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface VoltageAmount {
  amount: number;
  currency: 'btc' | 'usd';
  unit: 'sat' | 'msat' | 'btc' | 'usd';
}

interface CreateReceivePaymentRequest {
  id: string;
  payment_kind: 'bolt11' | 'onchain' | 'bip21';
  wallet_id: string;
  amount_msats: number; // Amount in millisatoshis
  currency: 'btc' | 'usd';
  description?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { 
      VOLTAGE_API_KEY, 
      VOLTAGE_ORG_ID, 
      VOLTAGE_ENV_ID 
    } = process.env;

    if (!VOLTAGE_API_KEY || !VOLTAGE_ORG_ID || !VOLTAGE_ENV_ID) {
      res.status(500).json({ error: 'Voltage API configuration missing' });
      return;
    }

    const paymentRequest: CreateReceivePaymentRequest = req.body;

    const response = await fetch(
      `https://voltageapi.com/v1/organizations/${VOLTAGE_ORG_ID}/environments/${VOLTAGE_ENV_ID}/payments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': VOLTAGE_API_KEY,
        },
        body: JSON.stringify(paymentRequest),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Voltage API Error:', { status: response.status, errorText });
      res.status(response.status).json({ 
        error: `Voltage API Error: ${response.status}`,
        details: errorText 
      });
      return;
    }

    // Payment creation returns 202 with no body
    if (response.status === 202) {
      res.status(202).json({ success: true, message: 'Payment request created' });
      return;
    }

    const payment = await response.json();
    res.status(200).json(payment);
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
