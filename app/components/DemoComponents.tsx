"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
  TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { CONTRACT_CONFIG } from "@/lib/contract";
import { useMarketEvents } from "../hooks/useContract";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyber-purple/50 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-cyber-gradient hover:shadow-cyber text-white font-semibold",
    secondary:
      "bg-cyber-darker/80 hover:bg-cyber-darker border border-cyber-purple/30 text-cyber-purple hover:text-white hover:border-cyber-purple",
    outline:
      "border border-cyber-teal hover:bg-cyber-teal/10 text-cyber-teal hover:shadow-cyber-lg",
    ghost:
      "hover:bg-cyber-purple/10 text-cyber-teal hover:text-cyber-purple",
  };

  const sizeClasses = {
    sm: "text-xs px-3 py-2 rounded-lg",
    md: "text-sm px-5 py-3 rounded-lg",
    lg: "text-base px-7 py-4 rounded-xl",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  );
}

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  headerAction?: ReactNode;
}

export function Card({
  title,
  children,
  className = "",
  onClick,
  headerAction,
}: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`cyber-card backdrop-blur-md rounded-xl shadow-cyber-lg border border-cyber-purple/20 overflow-hidden transition-all duration-300 hover:shadow-cyber-xl hover:border-cyber-purple/40 cyber-hologram ${className} ${onClick ? "cursor-pointer hover:scale-[1.02] cyber-pulse" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <div className="px-6 py-4 border-b border-cyber-purple/20 bg-cyber-darker/30 cyber-scan-line">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold gradient-text cyber-glow">
              {title}
            </h3>
            {headerAction && (
              <div className="flex items-center space-x-2">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-6 cyber-gradient-bg">{children}</div>
    </div>
  );
}

type FeaturesProps = {
  setActiveTab: (tab: string) => void;
};

export function Features({ setActiveTab }: FeaturesProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Predict-a-Frame Features">
        <ul className="space-y-3 mb-4">
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Decentralized prediction markets on Base network
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              OnchainKit wallet integration for seamless betting
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Proof-of-Foresight NFT rewards for accurate predictions
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Mobile-responsive design optimized for MiniKit
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Real-time market statistics and odds
            </span>
          </li>
        </ul>
        <Button variant="outline" onClick={() => setActiveTab("home")}>
          Start Predicting
        </Button>
      </Card>
    </div>
  );
}

type HomeProps = {
  setActiveTab: (tab: string) => void;
};

export function Home({ setActiveTab }: HomeProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="PREDICTA">
        <div className="space-y-4">
          <div className="flex space-x-3 pt-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => setActiveTab("prediction")}
            >
              Start Predicting →
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab("features")}
            >
              View Features
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

type IconProps = {
  name: "heart" | "star" | "check" | "plus" | "arrow-right";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Icon({ name, size = "md", className = "" }: IconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const icons = {
    heart: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Heart</title>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Star</title>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    check: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Check</title>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    plus: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Plus</title>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    "arrow-right": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Arrow Right</title>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
  };

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icons[name]}
    </span>
  );
}

type PredictionMarketProps = {
  setActiveTab: (tab: string) => void;
};

export function PredictionMarket({ setActiveTab: _setActiveTab }: PredictionMarketProps) {
  const { address } = useAccount();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0.01); // Default 0.01 USDC
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  
  // Constants for bet amount limits
  const MIN_BET = 0.01;
  const MAX_BET = 10;
  
  // Fetch real blockchain events
  const { events, isLoading: eventsLoading, refetch } = useMarketEvents();
  
  // Auto-select first active event if none selected
  const selectedEvent = selectedEventId 
    ? events.find(e => e.id === selectedEventId) 
    : events.find(e => !e.resolved) || events[0];
  
  // Update selected event ID when events load
  if (!selectedEventId && selectedEvent) {
    setSelectedEventId(selectedEvent.id);
  }

  // Transaction calls for betting with USDC
  const calls = useMemo(() => {
    if (!address || !selectedOption || !selectedEvent) return [];
    
    const USDC_CONTRACT = CONTRACT_CONFIG.baseSepolia.usdcAddress as `0x${string}`;
    const PREDICT_CONTRACT = CONTRACT_CONFIG.baseSepolia.contractAddress as `0x${string}`;
    
    // Amount in USDC (6 decimals)
    const amountInWei = BigInt(Math.floor(betAmount * 1e6));
    
    // Use the selected event's ID
    const eventId = BigInt(selectedEvent.id);
    
    // Outcome: true for "yes", false for "no"
    const outcome = selectedOption === "yes";
    
    // Create transaction calls:
    // 1. Approve USDC spending
    // 2. Make prediction on contract
    return [
      {
        to: USDC_CONTRACT,
        // approve(address spender, uint256 amount)
        data: `0x095ea7b3${PREDICT_CONTRACT.slice(2).padStart(64, '0')}${amountInWei.toString(16).padStart(64, '0')}` as `0x${string}`,
        value: BigInt(0),
      },
      {
        to: PREDICT_CONTRACT,
        // makePrediction(uint256 eventId, bool outcome, uint256 amount)
        data: `0x${
          // Function selector for makePrediction(uint256,bool,uint256)
          'cf1fbac8' +
          eventId.toString(16).padStart(64, '0') +
          (outcome ? '0000000000000000000000000000000000000000000000000000000000000001' : '0000000000000000000000000000000000000000000000000000000000000000') +
          amountInWei.toString(16).padStart(64, '0')
        }` as `0x${string}`,
        value: BigInt(0),
      },
    ];
  }, [address, selectedOption, betAmount, selectedEvent]);

  const sendNotification = useNotification();

  const handleSuccess = useCallback(async (response: TransactionResponse) => {
    const transactionHash = response.transactionReceipts[0].transactionHash;

    console.log(`Bet placed successfully: ${transactionHash}`);

    // Refresh events to show updated pool
    await refetch();

    await sendNotification({
      title: "Bet Placed! 🎯",
      body: `Your prediction has been recorded on blockchain. TX: ${transactionHash.slice(0, 10)}...`,
    });
  }, [sendNotification, refetch]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  // Handle bet amount changes with min/max constraints
  const handleBetAmountChange = (amount: number) => {
    const clampedAmount = Math.max(MIN_BET, Math.min(MAX_BET, amount));
    setBetAmount(parseFloat(clampedAmount.toFixed(2)));
  };

  const increaseBetAmount = () => {
    const increment = betAmount < 1 ? 0.1 : 1;
    handleBetAmountChange(betAmount + increment);
  };

  const decreaseBetAmount = () => {
    const decrement = betAmount <= 1 ? 0.1 : 1;
    handleBetAmountChange(betAmount - decrement);
  };

  // Format USDC amounts from wei (6 decimals)
  const formatUSDC = (amount: string) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  // Calculate odds based on pool sizes
  const calculateOdds = (yesPool: string, noPool: string, isYes: boolean) => {
    const yes = Number(yesPool) / 1e6;
    const no = Number(noPool) / 1e6;
    const total = yes + no;
    
    if (total === 0) return 2.0; // Default odds if no bets yet
    
    if (isYes) {
      return no === 0 ? 2.0 : (total / yes).toFixed(2);
    } else {
      return yes === 0 ? 2.0 : (total / no).toFixed(2);
    }
  };

  // Loading state
  if (eventsLoading && events.length === 0) {
    return (
      <div className="space-y-6">
        <Card title="🎯 Predict-a-Frame Market" className="cyber-hologram cyber-scan-line">
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="w-16 h-4 bg-cyber-purple/30 rounded mx-auto mb-4 shadow-cyber"></div>
              <div className="w-full h-6 bg-cyber-purple/30 rounded mb-4 shadow-cyber"></div>
              <div className="w-3/4 h-4 bg-cyber-purple/30 rounded mx-auto shadow-cyber"></div>
            </div>
            <p className="text-cyber-teal/70 mt-4 font-medium">
              Loading blockchain market events...
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  // No events found
  if (!selectedEvent) {
    return (
      <div className="space-y-6">
        <Card title="🎯 Predict-a-Frame Market">
          <div className="text-center py-8">
            <p className="text-cyber-teal/70 font-medium">
              No active market events found on the blockchain.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <Card title="🎯 Predict-a-Frame Market">
        <div className="space-y-6">
          {/* Event Selector - show if multiple events */}
          {events.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Select Market Event:
              </label>
              <select
                value={selectedEventId || ''}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-cyber-darker border border-cyber-purple/30 text-white focus:border-cyber-purple focus:outline-none focus:ring-2 focus:ring-cyber-purple/20 transition-all"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id} className="bg-cyber-darker text-white">
                    Event #{event.id}: {event.description.slice(0, 60)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Event Info */}
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-cyber-purple/20 text-cyber-purple text-xs font-medium rounded-full mb-3 border border-cyber-purple/30 cyber-glow">
              {selectedEvent.resolved ? "Resolved" : "Active"} • Event #{selectedEvent.id}
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {selectedEvent.description}
            </h2>
            <p className="text-cyber-teal/70 text-sm mb-4 font-medium">
              Ends: {new Date(selectedEvent.endTime * 1000).toLocaleString()}
            </p>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-cyber-darker/50 rounded-lg border border-cyber-purple/20 shadow-cyber-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-cyber-purple">
                {formatUSDC(selectedEvent.totalPool)}
              </div>
              <div className="text-xs text-cyber-teal/70 font-medium">Total Pool</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-400">
                {formatUSDC(selectedEvent.yesPool)}
              </div>
              <div className="text-xs text-cyber-teal/70 font-medium">YES Pool</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-400">
                {formatUSDC(selectedEvent.noPool)}
              </div>
              <div className="text-xs text-cyber-teal/70 font-medium">NO Pool</div>
            </div>
          </div>

          {/* Betting Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Choose Your Prediction:</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleOptionSelect("yes")}
                disabled={selectedEvent.resolved}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOption === "yes"
                    ? "border-green-400 bg-green-400/10 shadow-cyber cyber-glow"
                    : "border-cyber-purple/30 hover:border-green-400 bg-cyber-darker/30"
                } ${selectedEvent.resolved ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">
                    YES (Outcome: True)
                  </span>
                  <span className="text-sm text-green-400 font-semibold">
                    {calculateOdds(selectedEvent.yesPool, selectedEvent.noPool, true)}x
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => handleOptionSelect("no")}
                disabled={selectedEvent.resolved}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOption === "no"
                    ? "border-red-400 bg-red-400/10 shadow-cyber cyber-glow"
                    : "border-cyber-purple/30 hover:border-red-400 bg-cyber-darker/30"
                } ${selectedEvent.resolved ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">
                    NO (Outcome: False)
                  </span>
                  <span className="text-sm text-red-400 font-semibold">
                    {calculateOdds(selectedEvent.yesPool, selectedEvent.noPool, false)}x
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Bet Amount Selection */}
          {selectedOption && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">
                Bet Amount (USDC):
              </label>
              
              {/* Manual Controls */}
              <div className="flex items-center justify-center space-x-3 mb-3">
                <button
                  onClick={decreaseBetAmount}
                  disabled={betAmount <= MIN_BET}
                  className="px-4 py-2 rounded-lg bg-cyber-darker border border-cyber-purple/30 text-white hover:border-cyber-purple disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all"
                >
                  -
                </button>
                
                <div className="px-6 py-2 rounded-lg bg-cyber-purple/20 border-2 border-cyber-purple text-white font-semibold text-lg min-w-[100px] text-center cyber-glow">
                  {betAmount.toFixed(2)}
                </div>
                
                <button
                  onClick={increaseBetAmount}
                  disabled={betAmount >= MAX_BET}
                  className="px-4 py-2 rounded-lg bg-cyber-darker border border-cyber-purple/30 text-white hover:border-cyber-purple disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all"
                >
                  +
                </button>
              </div>
              
              {/* Preset Amounts */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[0.01, 0.1, 1, 5, 10].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleBetAmountChange(amount)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      betAmount === amount
                        ? "bg-cyber-purple text-white cyber-glow"
                        : "bg-cyber-darker border border-cyber-purple/30 text-white hover:border-cyber-purple"
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
              
              {/* Min/Max Info */}
              <p className="text-xs text-cyber-teal/70 text-center font-medium">
                Min: {MIN_BET} USDC | Max: {MAX_BET} USDC
              </p>
            </div>
          )}

          {/* Resolved Event Warning */}
          {selectedEvent.resolved && (
            <div className="text-center py-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg shadow-cyber">
              <p className="text-yellow-400 text-sm font-medium">
                ⚠️ This event has been resolved. You cannot place new bets.
              </p>
              <p className="text-yellow-300 text-xs mt-1 font-medium">
                Outcome: {selectedEvent.outcome ? "YES" : "NO"}
              </p>
            </div>
          )}

          {/* Transaction Component */}
          {selectedOption && address && !selectedEvent.resolved && (
            <div className="flex flex-col items-center space-y-4">
            <Transaction
              calls={calls}
              onSuccess={handleSuccess}
              onError={(error: TransactionError) =>
                  console.error("Betting transaction failed:", error)
              }
            >
                <div className="w-full">
                  <TransactionButton className="w-full cyber-button-primary py-3 px-6 font-semibold" />
                </div>
              <TransactionStatus>
                <TransactionStatusAction />
                <TransactionStatusLabel />
              </TransactionStatus>
              <TransactionToast className="mb-4">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </Transaction>
            </div>
          )}

          {!address && (
            <div className="text-center py-4">
              <p className="text-cyber-teal text-sm mb-2 font-medium">
                Connect your wallet to place a USDC bet
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Info Area */}
      <div className="mt-6 pt-4 border-t border-cyber-purple/20 text-center">
        <p className="text-xs text-cyber-teal/70 font-medium">
          💡 All predictions are recorded on Base Sepolia blockchain with USDC tokens
        </p>
        <p className="text-xs text-cyber-purple mt-2 font-medium">
          🎯 Winning predictions earn proportional rewards from the total pool
        </p>
        </div>
      </div>
  );
}

