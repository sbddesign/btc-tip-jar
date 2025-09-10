// Kraken API service for fetching Bitcoin prices

export interface KrakenTickerResponse {
  error: string[];
  result: {
    XXBTZUSD: {
      a: [string, string, string]; // ask [price, whole lot volume, lot volume]
      b: [string, string, string]; // bid [price, whole lot volume, lot volume]
      c: [string, string]; // last trade closed [price, lot volume]
      v: [string, string]; // volume [today, last 24 hours]
      p: [string, string]; // volume weighted average price [today, last 24 hours]
      t: [number, number]; // number of trades [today, last 24 hours]
      l: [string, string]; // low [today, last 24 hours]
      h: [string, string]; // high [today, last 24 hours]
      o: string; // today's opening price
    };
  };
}

export class PriceApiError extends Error {
  public status?: number;
  public response?: any;

  constructor(
    message: string,
    status?: number,
    response?: any
  ) {
    super(message);
    this.name = 'PriceApiError';
    this.status = status;
    this.response = response;
  }
}

class PriceApi {
  private baseUrl = 'https://api.kraken.com/0/public';

  async getBtcUsdPrice(): Promise<number> {
    try {
      console.log('Fetching BTC/USD price from Kraken...');
      
      const response = await fetch(`${this.baseUrl}/Ticker?pair=XBTUSD`);
      
      if (!response.ok) {
        throw new PriceApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data: KrakenTickerResponse = await response.json();
      
      if (data.error && data.error.length > 0) {
        throw new PriceApiError(`Kraken API Error: ${data.error.join(', ')}`);
      }

      if (!data.result?.XXBTZUSD) {
        throw new PriceApiError('Invalid response format from Kraken API');
      }

      // Use the last trade price (most recent actual trade)
      const lastPrice = parseFloat(data.result.XXBTZUSD.c[0]);
      
      console.log(`Current BTC/USD price: $${lastPrice.toLocaleString()}`);
      
      return lastPrice;
    } catch (error) {
      console.error('Failed to fetch BTC price:', error);
      
      if (error instanceof PriceApiError) {
        throw error;
      }
      
      throw new PriceApiError(
        `Failed to fetch Bitcoin price: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Convert USD amount to satoshis using current BTC price
  async convertUsdToSats(usdAmount: number): Promise<number> {
    const btcPrice = await this.getBtcUsdPrice();
    const btcAmount = usdAmount / btcPrice;
    const satoshis = Math.round(btcAmount * 100_000_000); // 1 BTC = 100,000,000 sats
    
    console.log(`$${usdAmount} USD = ${btcAmount.toFixed(8)} BTC = ${satoshis.toLocaleString()} sats`);
    
    return satoshis;
  }
}

export const priceApi = new PriceApi();

// Helper function to get current BTC/USD price with caching
let priceCache: { price: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

export async function getCurrentBtcPrice(): Promise<number> {
  const now = Date.now();
  
  // Return cached price if it's still fresh
  if (priceCache && (now - priceCache.timestamp) < CACHE_DURATION) {
    console.log(`Using cached BTC price: $${priceCache.price.toLocaleString()}`);
    return priceCache.price;
  }
  
  try {
    const price = await priceApi.getBtcUsdPrice();
    priceCache = { price, timestamp: now };
    return price;
  } catch (error) {
    // If we have a cached price and the API fails, use the cached price
    if (priceCache) {
      console.warn('Price API failed, using cached price:', error);
      return priceCache.price;
    }
    
    // If no cache and API fails, throw the error
    throw error;
  }
}

// Helper function to convert USD to sats with caching
export async function convertUsdToSats(usdAmount: number): Promise<number> {
  const btcPrice = await getCurrentBtcPrice();
  const btcAmount = usdAmount / btcPrice;
  const satoshis = Math.round(btcAmount * 100_000_000);
  
  return satoshis;
}
