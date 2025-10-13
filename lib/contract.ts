import { ethers } from 'ethers';

// Contract ABI and types
export const PREDICT_A_FRAME_ABI = [
  "function makePrediction(uint256 eventId, bool outcome, uint256 amount) external",
  "function claimRewards(uint256 predictionId) external",
  "function createMarketEvent(string memory description, uint256 durationHours) external returns (uint256)",
  "function resolveMarketEvent(uint256 eventId, bool outcome) external",
  "function getMarketEvent(uint256 eventId) external view returns (tuple(uint256 id, string description, uint256 endTime, bool resolved, bool outcome, uint256 totalPool, uint256 yesPool, uint256 noPool))",
  "function getPrediction(uint256 predictionId) external view returns (tuple(uint256 id, uint256 eventId, address user, uint256 amount, bool outcome, bool claimed, uint256 timestamp))",
  "function getUserPredictions(address user) external view returns (uint256[])",
  "function getActiveEvents() external view returns (tuple(uint256 id, string description, uint256 endTime, bool resolved, bool outcome, uint256 totalPool, uint256 yesPool, uint256 noPool)[])",
  "function allowedAddresses(address) external view returns (bool)",
  "function getUSDCAddress() external view returns (address)",
  "function getContractBalance() external view returns (uint256)",
  "event PredictionCreated(uint256 indexed predictionId, address indexed user, uint256 amount, bool outcome)",
  "event PredictionResolved(uint256 indexed predictionId, bool outcome, uint256 totalRewards)",
  "event MarketEventCreated(uint256 indexed eventId, string description, uint256 endTime)",
  "event RewardsDistributed(uint256 indexed predictionId, address indexed user, uint256 amount)"
];

// USDC ABI for token interactions
export const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

// Contract configuration
export const CONTRACT_CONFIG = {
  baseSepolia: {
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    // Contract address with 0.01 USDC minimum prediction
    contractAddress: '0xca29F50d9b54C8bf52c636861F77f6a595860Ffe',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },
  // Add mainnet config for future
  base: {
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    contractAddress: '',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  }
};

// Types
export interface MarketEvent {
  id: number;
  description: string;
  endTime: number;
  resolved: boolean;
  outcome: boolean;
  totalPool: string;
  yesPool: string;
  noPool: string;
}

export interface Prediction {
  id: number;
  eventId: number;
  user: string;
  amount: string;
  outcome: boolean;
  claimed: boolean;
  timestamp: number;
}

export interface ContractInteraction {
  makePrediction: (eventId: number, outcome: boolean, amount: string) => Promise<unknown>;
  claimRewards: (predictionId: number) => Promise<unknown>;
  createMarketEvent: (description: string, durationHours: number) => Promise<unknown>;
  resolveMarketEvent: (eventId: number, outcome: boolean) => Promise<unknown>;
  getMarketEvent: (eventId: number) => Promise<MarketEvent>;
  getPrediction: (predictionId: number) => Promise<Prediction>;
  getUserPredictions: (userAddress: string) => Promise<number[]>;
  getActiveEvents: () => Promise<MarketEvent[]>;
  approveUSDC: (amount: string) => Promise<unknown>;
  getUSDCBalance: (address: string) => Promise<string>;
  getUSDCAllowance: (owner: string, spender: string) => Promise<string>;
}

// Contract interaction class
export class PredictAFrameContract {
  private contract: ethers.Contract;
  private usdcContract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private usdcAddress: string;

  constructor(
    contractAddress: string,
    usdcAddress: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.signer = signer;
    this.usdcAddress = usdcAddress;
    this.contract = new ethers.Contract(
      contractAddress,
      PREDICT_A_FRAME_ABI,
      signer || provider
    );
    this.usdcContract = new ethers.Contract(
      usdcAddress,
      USDC_ABI,
      signer || provider
    );
  }

  // Connect with a new signer
  connect(signer: ethers.Signer): PredictAFrameContract {
    return new PredictAFrameContract(
      this.contract.target as string,
      this.usdcAddress,
      this.provider,
      signer
    );
  }

  // USDC Token functions
  async approveUSDC(amount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for USDC approval');
    }

    const amountWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals
    return await this.usdcContract.approve(this.contract.target as string, amountWei);
  }

  async getUSDCBalance(address: string): Promise<string> {
    const balance = await this.usdcContract.balanceOf(address);
    return ethers.formatUnits(balance, 6); // USDC has 6 decimals
  }

  async getUSDCAllowance(owner: string, spender: string): Promise<string> {
    const allowance = await this.usdcContract.allowance(owner, spender);
    return ethers.formatUnits(allowance, 6); // USDC has 6 decimals
  }

  // Make a prediction
  async makePrediction(
    eventId: number,
    outcome: boolean,
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for making predictions');
    }

    const amountWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals
    return await this.contract.makePrediction(eventId, outcome, amountWei);
  }

  // Claim rewards
  async claimRewards(
    predictionId: number
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for claiming rewards');
    }

    return await this.contract.claimRewards(predictionId);
  }

  // Create market event (only allowed addresses)
  async createMarketEvent(
    description: string,
    durationHours: number
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for creating events');
    }

    return await this.contract.createMarketEvent(description, durationHours);
  }

  // Resolve market event (only allowed addresses)
  async resolveMarketEvent(
    eventId: number,
    outcome: boolean
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for resolving events');
    }

    return await this.contract.resolveMarketEvent(eventId, outcome);
  }

  // Get market event details
  async getMarketEvent(eventId: number): Promise<MarketEvent> {
    const event = await this.contract.getMarketEvent(eventId);
    return {
      id: Number(event.id),
      description: event.description,
      endTime: Number(event.endTime),
      resolved: event.resolved,
      outcome: event.outcome,
      totalPool: event.totalPool.toString(),
      yesPool: event.yesPool.toString(),
      noPool: event.noPool.toString(),
    };
  }

  // Get prediction details
  async getPrediction(predictionId: number): Promise<Prediction> {
    const prediction = await this.contract.getPrediction(predictionId);
    return {
      id: Number(prediction.id),
      eventId: Number(prediction.eventId),
      user: prediction.user,
      amount: prediction.amount.toString(),
      outcome: prediction.outcome,
      claimed: prediction.claimed,
      timestamp: Number(prediction.timestamp),
    };
  }

  // Get user predictions
  async getUserPredictions(userAddress: string): Promise<number[]> {
    const predictions = await this.contract.getUserPredictions(userAddress);
    return predictions.map((id: bigint) => Number(id));
  }

  // Get active events
  async getActiveEvents(): Promise<MarketEvent[]> {
    const events = await this.contract.getActiveEvents();
    return events.map((event: {
      id: bigint;
      description: string;
      endTime: bigint;
      resolved: boolean;
      outcome: boolean;
      totalPool: bigint;
      yesPool: bigint;
      noPool: bigint;
    }) => ({
      id: Number(event.id),
      description: event.description,
      endTime: Number(event.endTime),
      resolved: event.resolved,
      outcome: event.outcome,
      totalPool: event.totalPool.toString(),
      yesPool: event.yesPool.toString(),
      noPool: event.noPool.toString(),
    }));
  }

  // Check if address is allowed
  async isAddressAllowed(address: string): Promise<boolean> {
    return await this.contract.allowedAddresses(address);
  }

  // Get contract balance
  async getContractBalance(): Promise<string> {
    const balance = await this.contract.getContractBalance();
    return ethers.formatUnits(balance, 6); // USDC has 6 decimals
  }

  // Get USDC address
  async getUSDCAddress(): Promise<string> {
    return await this.contract.getUSDCAddress();
  }

  // Listen to events
  on(eventName: string, callback: (...args: unknown[]) => void) {
    this.contract.on(eventName, callback);
  }

  off(eventName: string, callback: (...args: unknown[]) => void) {
    this.contract.off(eventName, callback);
  }
}

// Utility functions
export function formatUSDC(value: string | bigint): string {
  return ethers.formatUnits(value, 6);
}

export function parseUSDC(value: string): bigint {
  return ethers.parseUnits(value, 6);
}

export function formatEther(value: string | bigint): string {
  return ethers.formatEther(value);
}

export function parseEther(value: string): bigint {
  return ethers.parseEther(value);
}

export function formatUnits(value: string | bigint, decimals: number = 18): string {
  return ethers.formatUnits(value, decimals);
}

export function parseUnits(value: string, decimals: number = 18): bigint {
  return ethers.parseUnits(value, decimals);
}

// Create contract instance
export function createContractInstance(
  contractAddress: string,
  usdcAddress: string,
  provider: ethers.Provider,
  signer?: ethers.Signer
): PredictAFrameContract {
  return new PredictAFrameContract(contractAddress, usdcAddress, provider, signer);
}
