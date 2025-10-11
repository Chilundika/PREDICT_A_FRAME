"use client";

import { useState, useEffect } from 'react';
import { usePredictAFrameContract, useMarketEvents, useUserPredictions } from '@/app/hooks/useContract';
import { AddressValidation } from '@/app/components/AddressValidation';
import { Button } from '@coinbase/onchainkit';

interface PredictionFormProps {
  eventId: number;
  onPredictionMade?: () => void;
}

export function PredictionForm({ eventId, onPredictionMade }: PredictionFormProps) {
  const { makePrediction, isLoading, error } = usePredictAFrameContract();
  const [amount, setAmount] = useState('0.01');
  const [outcome, setOutcome] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await makePrediction(eventId, outcome, amount);
      onPredictionMade?.();
      alert('Prediction made successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <AddressValidation>
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">Make a Prediction</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Prediction Amount (ETH)</label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            max="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
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

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Making Prediction...' : 'Make Prediction'}
        </Button>
      </form>
    </AddressValidation>
  );
}

export function MarketEventCard({ event }: { event: any }) {
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

  const formatEther = (wei: string) => {
    return (parseFloat(wei) / 1e18).toFixed(4);
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
          <span className="ml-2">{formatEther(event.totalPool)} ETH</span>
        </div>
        <div>
          <span className="font-medium">YES Pool:</span>
          <span className="ml-2">{formatEther(event.yesPool)} ETH</span>
        </div>
        <div>
          <span className="font-medium">NO Pool:</span>
          <span className="ml-2">{formatEther(event.noPool)} ETH</span>
        </div>
        <div>
          <span className="font-medium">Status:</span>
          <span className="ml-2">{event.resolved ? 'Resolved' : 'Active'}</span>
        </div>
      </div>

      {!event.resolved && timeRemaining !== 'Event Ended' && (
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowPredictionForm(!showPredictionForm)}
            variant="secondary"
          >
            {showPredictionForm ? 'Hide' : 'Make Prediction'}
          </Button>
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
  const { predictions, isLoading: predictionsLoading } = useUserPredictions();
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
          Contract Balance: {parseFloat(contractBalance).toFixed(4)} ETH
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
                    {prediction.outcome ? 'YES' : 'NO'} - {parseFloat(prediction.amount).toFixed(4)} ETH
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

      <Button onClick={refetch} variant="secondary">
        Refresh Events
      </Button>
    </div>
  );
}
