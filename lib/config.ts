/**
 * Application configuration
 */

export interface BaseBuilderConfig {
  allowedAddresses: string[];
}

export interface ContractConfig {
  address: string;
  network: string;
  chainId: number;
  explorerUrl: string;
}

export interface AppConfig {
  baseBuilder: BaseBuilderConfig;
  contract: ContractConfig;
}

// Hardcoded configuration
const config: AppConfig = {
  baseBuilder: {
    allowedAddresses: ["0xA67323BE0685019F6B7D2dF308E17e3C00958b05"]
  },
  contract: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f",
    network: "baseSepolia",
    chainId: 84532,
    explorerUrl: "https://sepolia.basescan.org"
  }
};

// Export the configuration
export { config };

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
