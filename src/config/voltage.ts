// Voltage API configuration
const IS_DEV = import.meta.env.DEV;

export const voltageConfig = {
  // Only read VITE_* variables in development to avoid bundling secrets in production
  apiKey: IS_DEV ? import.meta.env.VITE_VOLTAGE_API_KEY : undefined,
  orgId: IS_DEV ? import.meta.env.VITE_VOLTAGE_ORG_ID : undefined,
  envId: IS_DEV ? import.meta.env.VITE_VOLTAGE_ENV_ID : undefined,
  walletId: IS_DEV ? import.meta.env.VITE_VOLTAGE_WALLET_ID : undefined,
  // Use proxy in development; production uses Netlify Functions, baseUrl is unused
  baseUrl: IS_DEV ? '/api/voltage' : 'https://voltageapi.com/v1'
};

export function isVoltageConfigured(): boolean {
  // In development we need client-side credentials to call the Voltage API via proxy.
  if (IS_DEV) {
    return !!(
      voltageConfig.apiKey &&
      voltageConfig.orgId &&
      voltageConfig.envId &&
      voltageConfig.walletId
    );
  }

  // In production, serverless function handles credentials; allow proceeding.
  return true;
}
