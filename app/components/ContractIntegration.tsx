"use client";

import { useState, useEffect } from 'react';
import { usePredictAFrameContract, useMarketEvents, useUserPredictions } from '@/app/hooks/useContract';
import { AddressValidation } from '@/app/components/AddressValidation';
import { CONTRACT_CONFIG } from '@/lib/contract';

interface PredictionFormProps {
  eventId: number;
  onPredictionMade?: () => void;
}

export function PredictionForm({ eventId, onPredictionMade }: PredictionFormProps) {
  const { makePrediction, approveUSDC, getUSDCBalance, getUSDCAllowance, isLoading, error, address } = usePredictAFrameContract();
  const [amount, setAmount] = useState('0.01');
  const [outcome, setOutcome] = useState<boolean>(true);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        try {
          const balance = await getUSDCBalance(address);
          setUsdcBalance(balance);
          
          const currentAllowance = await getUSDCAllowance(address, CONTRACT_CONFIG.baseSepolia.contractAddress);
          setAllowance(currentAllowance);
        } catch (err) {
          console.error('Failed to fetch USDC balance:', err);
        }
      }
    };

    fetchBalance();
  }, [address, getUSDCBalance, getUSDCAllowance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check if user has enough USDC
      if (parseFloat(usdcBalance) < parseFloat(amount)) {
        alert('Insufficient USDC balance');
        return;
      }

      // Check if user has approved enough USDC
      if (parseFloat(allowance) < parseFloat(amount)) {
        const approveTx = await approveUSDC(amount);
        await approveTx.wait();
        alert('USDC approved! Please submit your prediction again.');
        return;
      }

      await makePrediction(eventId, outcome, amount);
      onPredictionMade?.();
      alert('Prediction made successfully!');
    } catch (err) {
      const error = err as Error;
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <AddressValidation>
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">Make a Prediction</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Prediction Amount (USDC)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="10000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <div className="text-sm text-gray-600 mt-1">
            Balance: {parseFloat(usdcBalance).toFixed(2)} USDC
          </div>
          <div className="text-sm text-gray-600">
            Allowance: {parseFloat(allowance).toFixed(2)} USDC
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Min: 0.01 USDC | Max: 10,000 USDC
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Outcome</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={outcome === true}
                onChange={() => setOutcome(true)}
                className="mr-2"
              />
              YES
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={outcome === false}
                onChange={() => setOutcome(false)}
                className="mr-2"
              />
              NO
            </label>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Making Prediction...' : 'Make Prediction'}
        </button>
      </form>
    </AddressValidation>
  );
}

interface MarketEventCardProps {
  event: {
    id: number;
    description: string;
    endTime: number;
    resolved: boolean;
    outcome: boolean;
    totalPool: string;
    yesPool: string;
    noPool: string;
  };
}

export function MarketEventCard({ event }: MarketEventCardProps) {
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = event.endTime - now;
      
      if (remaining <= 0) {
        setTimeRemaining('Event Ended');
        return;
      }

      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event.endTime]);

  const formatUSDC = (amount: string) => {
    return parseFloat(amount).toFixed(2);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{event.description}</h3>
        <span className="text-sm text-gray-600">{timeRemaining}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Total Pool:</span>
          <span className="ml-2">{formatUSDC(event.totalPool)} USDC</span>
        </div>
        <div>
          <span className="font-medium">YES Pool:</span>
          <span className="ml-2">{formatUSDC(event.yesPool)} USDC</span>
        </div>
        <div>
          <span className="font-medium">NO Pool:</span>
          <span className="ml-2">{formatUSDC(event.noPool)} USDC</span>
        </div>
        <div>
          <span className="font-medium">Status:</span>
          <span className="ml-2">{event.resolved ? 'Resolved' : 'Active'}</span>
        </div>
      </div>

      {!event.resolved && timeRemaining !== 'Event Ended' && (
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPredictionForm(!showPredictionForm)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            {showPredictionForm ? 'Hide' : 'Make Prediction'}
          </button>
        </div>
      )}

      {showPredictionForm && (
        <PredictionForm
          eventId={event.id}
          onPredictionMade={() => setShowPredictionForm(false)}
        />
      )}
    </div>
  );
}

export function ContractDashboard() {
  const { events, isLoading, refetch } = useMarketEvents();
  const { predictions } = useUserPredictions();
  const { getContractBalance } = usePredictAFrameContract();
  const [contractBalance, setContractBalance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await getContractBalance();
        setContractBalance(balance);
      } catch (err) {
        console.error('Failed to fetch contract balance:', err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [getContractBalance]);

  if (isLoading) {
    return <div className="text-center py-8">Loading market events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Prediction Market</h2>
        <div className="text-sm text-gray-600">
          Contract Balance: {parseFloat(contractBalance).toFixed(2)} USDC
        </div>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active market events. Check back later!
          </div>
        ) : (
          events.map((event) => (
            <MarketEventCard key={event.id} event={event} />
          ))
        )}
      </div>

      {predictions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Your Predictions</h3>
          <div className="space-y-2">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <span className="font-medium">Event #{prediction.eventId}</span>
                  <span className="ml-2 text-sm text-gray-600">
                    {prediction.outcome ? 'YES' : 'NO'} - {parseFloat(prediction.amount).toFixed(2)} USDC
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {prediction.claimed ? 'Claimed' : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={refetch}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        Refresh Events
      </button>
    </div>
  );
}
