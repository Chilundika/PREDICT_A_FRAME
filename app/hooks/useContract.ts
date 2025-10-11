"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { createContractInstance, PredictAFrameContract, MarketEvent, Prediction } from '@/lib/contract';
import { CONTRACT_CONFIG } from '@/lib/contract';

export function usePredictAFrameContract() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [contract, setContract] = useState<PredictAFrameContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract
  useEffect(() => {
    if (publicClient && CONTRACT_CONFIG.baseSepolia.contractAddress) {
      const contractInstance = createContractInstance(
        CONTRACT_CONFIG.baseSepolia.contractAddress,
        publicClient,
        walletClient
      );
      setContract(contractInstance);
    }
  }, [publicClient, walletClient]);

  // Contract interaction functions
  const makePrediction = useCallback(async (
    eventId: number,
    outcome: boolean,
    amount: string
  ) => {
    if (!contract || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.makePrediction(eventId, outcome, amount);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, isConnected]);

  const claimRewards = useCallback(async (predictionId: number) => {
    if (!contract || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.claimRewards(predictionId);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, isConnected]);

  const createMarketEvent = useCallback(async (
    description: string,
    durationHours: number
  ) => {
    if (!contract || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.createMarketEvent(description, durationHours);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, isConnected]);

  const resolveMarketEvent = useCallback(async (
    eventId: number,
    outcome: boolean
  ) => {
    if (!contract || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contract.resolveMarketEvent(eventId, outcome);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, isConnected]);

  // Read functions
  const getMarketEvent = useCallback(async (eventId: number): Promise<MarketEvent> => {
    if (!contract) {
      throw new Error('Contract not available');
    }

    try {
      return await contract.getMarketEvent(eventId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [contract]);

  const getPrediction = useCallback(async (predictionId: number): Promise<Prediction> => {
    if (!contract) {
      throw new Error('Contract not available');
    }

    try {
      return await contract.getPrediction(predictionId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [contract]);

  const getUserPredictions = useCallback(async (): Promise<number[]> => {
    if (!contract || !address) {
      throw new Error('Contract not available or address not connected');
    }

    try {
      return await contract.getUserPredictions(address);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [contract, address]);

  const getActiveEvents = useCallback(async (): Promise<MarketEvent[]> => {
    if (!contract) {
      throw new Error('Contract not available');
    }

    try {
      return await contract.getActiveEvents();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [contract]);

  const isAddressAllowed = useCallback(async (): Promise<boolean> => {
    if (!contract || !address) {
      return false;
    }

    try {
      return await contract.isAddressAllowed(address);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [contract, address]);

  const getContractBalance = useCallback(async (): Promise<string> => {
    if (!contract) {
      throw new Error('Contract not available');
    }

    try {
      return await contract.getContractBalance();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [contract]);

  return {
    contract,
    isLoading,
    error,
    isConnected,
    address,
    // Write functions
    makePrediction,
    claimRewards,
    createMarketEvent,
    resolveMarketEvent,
    // Read functions
    getMarketEvent,
    getPrediction,
    getUserPredictions,
    getActiveEvents,
    isAddressAllowed,
    getContractBalance,
  };
}

// Hook for market events
export function useMarketEvents() {
  const { getActiveEvents, isLoading, error } = usePredictAFrameContract();
  const [events, setEvents] = useState<MarketEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    try {
      const activeEvents = await getActiveEvents();
      setEvents(activeEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }, [getActiveEvents]);

  useEffect(() => {
    fetchEvents();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}

// Hook for user predictions
export function useUserPredictions() {
  const { getUserPredictions, getPrediction, isLoading, error, address } = usePredictAFrameContract();
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const fetchPredictions = useCallback(async () => {
    if (!address) return;

    try {
      const predictionIds = await getUserPredictions();
      const predictionPromises = predictionIds.map(id => getPrediction(id));
      const predictionData = await Promise.all(predictionPromises);
      setPredictions(predictionData);
    } catch (err) {
      console.error('Failed to fetch predictions:', err);
    }
  }, [getUserPredictions, getPrediction, address]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return {
    predictions,
    isLoading,
    error,
    refetch: fetchPredictions,
  };
}
