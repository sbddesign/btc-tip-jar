// Voltage API configuration
export const voltageConfig = {
  apiKey: import.meta.env.VITE_VOLTAGE_API_KEY,
  orgId: import.meta.env.VITE_VOLTAGE_ORG_ID,
  envId: import.meta.env.VITE_VOLTAGE_ENV_ID,
  walletId: import.meta.env.VITE_VOLTAGE_WALLET_ID,
  // Use proxy in development, direct API in production
  baseUrl: import.meta.env.DEV ? '/api/voltage' : 'https://voltageapi.com/v1'
};

export function isVoltageConfigured(): boolean {
  return !!(
    voltageConfig.apiKey &&
    voltageConfig.orgId &&
    voltageConfig.envId &&
    voltageConfig.walletId
  );
}
