import { ethers } from 'ethers';
import { PredictAFrame__factory } from './types';

// Contract ABI and types
export const PREDICT_A_FRAME_ABI = [
  "function makePrediction(uint256 eventId, bool outcome) external payable",
  "function claimRewards(uint256 predictionId) external",
  "function createMarketEvent(string memory description, uint256 durationHours) external returns (uint256)",
  "function resolveMarketEvent(uint256 eventId, bool outcome) external",
  "function getMarketEvent(uint256 eventId) external view returns (tuple(uint256 id, string description, uint256 endTime, bool resolved, bool outcome, uint256 totalPool, uint256 yesPool, uint256 noPool))",
  "function getPrediction(uint256 predictionId) external view returns (tuple(uint256 id, uint256 eventId, address user, uint256 amount, bool outcome, bool claimed, uint256 timestamp))",
  "function getUserPredictions(address user) external view returns (uint256[])",
  "function getActiveEvents() external view returns (tuple(uint256 id, string description, uint256 endTime, bool resolved, bool outcome, uint256 totalPool, uint256 yesPool, uint256 noPool)[])",
  "function allowedAddresses(address) external view returns (bool)",
  "event PredictionCreated(uint256 indexed predictionId, address indexed user, uint256 amount, bool outcome)",
  "event PredictionResolved(uint256 indexed predictionId, bool outcome, uint256 totalRewards)",
  "event MarketEventCreated(uint256 indexed eventId, string description, uint256 endTime)",
  "event RewardsDistributed(uint256 indexed predictionId, address indexed user, uint256 amount)"
];

// Contract configuration
export const CONTRACT_CONFIG = {
  baseSepolia: {
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    // Contract address will be set after deployment
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
  },
  // Add mainnet config for future
  base: {
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    contractAddress: '',
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
  makePrediction: (eventId: number, outcome: boolean, amount: string) => Promise<any>;
  claimRewards: (predictionId: number) => Promise<any>;
  createMarketEvent: (description: string, durationHours: number) => Promise<any>;
  resolveMarketEvent: (eventId: number, outcome: boolean) => Promise<any>;
  getMarketEvent: (eventId: number) => Promise<MarketEvent>;
  getPrediction: (predictionId: number) => Promise<Prediction>;
  getUserPredictions: (userAddress: string) => Promise<number[]>;
  getActiveEvents: () => Promise<MarketEvent[]>;
}

// Contract interaction class
export class PredictAFrameContract {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(
    contractAddress: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      contractAddress,
      PREDICT_A_FRAME_ABI,
      signer || provider
    );
  }

  // Connect with a new signer
  connect(signer: ethers.Signer): PredictAFrameContract {
    return new PredictAFrameContract(
      this.contract.target as string,
      this.provider,
      signer
    );
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

    const tx = await this.contract.makePrediction(eventId, outcome, {
      value: ethers.parseEther(amount)
    });

    return tx;
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
    return predictions.map((id: any) => Number(id));
  }

  // Get active events
  async getActiveEvents(): Promise<MarketEvent[]> {
    const events = await this.contract.getActiveEvents();
    return events.map((event: any) => ({
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
    const balance = await this.provider.getBalance(this.contract.target as string);
    return ethers.formatEther(balance);
  }

  // Listen to events
  on(eventName: string, callback: (...args: any[]) => void) {
    this.contract.on(eventName, callback);
  }

  off(eventName: string, callback: (...args: any[]) => void) {
    this.contract.off(eventName, callback);
  }
}

// Utility functions
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
  provider: ethers.Provider,
  signer?: ethers.Signer
): PredictAFrameContract {
  return new PredictAFrameContract(contractAddress, provider, signer);
}
