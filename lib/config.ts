/**
 * Application configuration
 */

export interface BaseBuilderConfig {
  allowedAddresses: string[];
}

export interface AppConfig {
  baseBuilder: BaseBuilderConfig;
}

// Default configuration
const defaultConfig: AppConfig = {
  baseBuilder: {
    allowedAddresses: ["0xA67323BE0685019F6B7D2dF308E17e3C00958b05"]
  }
};

// Load configuration from environment variables
function loadConfigFromEnv(): AppConfig {
  const allowedAddressesEnv = process.env.BASE_BUILDER_ALLOWED_ADDRESSES;
  
  const allowedAddresses = allowedAddressesEnv 
    ? allowedAddressesEnv.split(',').map(addr => addr.trim())
    : defaultConfig.baseBuilder.allowedAddresses;

  return {
    baseBuilder: {
      allowedAddresses
    }
  };
}

// Export the configuration
export const config = loadConfigFromEnv();

// Validation helpers
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isAddressAllowed(address: string): boolean {
  if (!isValidEthereumAddress(address)) {
    return false;
  }
  
  return config.baseBuilder.allowedAddresses.includes(address.toLowerCase());
}

export function getAllowedAddresses(): string[] {
  return config.baseBuilder.allowedAddresses;
}
