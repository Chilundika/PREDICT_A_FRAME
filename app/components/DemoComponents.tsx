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
import useMarketEvent from "../hooks/useMarketEvent";

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
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-[var(--app-background)]",
    secondary:
      "bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]",
    outline:
      "border border-[var(--app-accent)] hover:bg-[var(--app-accent-light)] text-[var(--app-accent)]",
    ghost:
      "hover:bg-[var(--app-accent-light)] text-[var(--app-foreground-muted)]",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-lg",
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
}

export function Card({
  title,
  children,
  className = "",
  onClick,
}: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden transition-all hover:shadow-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <div className="px-5 py-3 border-b border-[var(--app-card-border)]">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
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
      <Card title="Predict-a-Frame Market">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          Welcome to the decentralized prediction market! Make accurate predictions and earn rewards on Base network.
        </p>
        <Button
          onClick={() => setActiveTab("features")}
          icon={<Icon name="arrow-right" size="sm" />}
        >
          Learn More
        </Button>
      </Card>

      <PredictionMarket />
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




// Prediction Market Types
type PredictionOption = {
  id: string;
  label: string;
  odds: number;
  betAmount: number;
};

type PredictionEvent = {
  id: string;
  question: string;
  description: string;
  options: PredictionOption[];
  totalPot: number;
  totalBets: number;
  endTime: string;
  category: string;
};

export function PredictionMarket() {
  const { address } = useAccount();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(1); // Default 1 USDC
  
  // Dynamic market event data from CoinGecko API
  const event = useMarketEvent();

  // Convert dynamic event to prediction format
  const predictionEvent: PredictionEvent | null = event ? {
    id: "dynamic-event",
    question: event.question,
    description: event.description,
    options: [
      { id: "yes", label: "Yes (Higher)", odds: 1.8, betAmount: 0 },
      { id: "no", label: "No (Lower)", odds: 2.1, betAmount: 0 }
    ],
    totalPot: parseFloat(event.totalPot),
    totalBets: event.totalBets,
    endTime: "2024-01-26T17:00:00Z",
    category: event.category
  } : null;

  // Transaction calls for betting with USDC
  const calls = useMemo(() => {
    if (!address || !selectedOption) return [];
    
    // USDC contract address on Base Sepolia (testnet)
    const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`;
    
    // Simulate betting by transferring USDC to self (representing pool deposit)
    return [
      {
        to: USDC_CONTRACT,
        data: `0xa9059cbb${address.slice(2).padStart(64, '0')}${BigInt(Math.floor(betAmount * 1e6)).toString(16).padStart(64, '0')}` as `0x${string}`, // transfer(address,uint256)
        value: BigInt(0), // No ETH value for ERC20 transfer
      },
    ];
  }, [address, selectedOption, betAmount]);

  const sendNotification = useNotification();

  const handleSuccess = useCallback(async (response: TransactionResponse) => {
    const transactionHash = response.transactionReceipts[0].transactionHash;

    console.log(`Bet placed successfully: ${transactionHash}`);

    await sendNotification({
      title: "Bet Placed! 🎯",
      body: `Your prediction has been recorded. Transaction: ${transactionHash.slice(0, 10)}...`,
    });
  }, [sendNotification]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  // Loading state
  if (!predictionEvent) {
    return (
      <div className="space-y-6">
        <Card title="🎯 Predict-a-Frame Market">
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="w-16 h-4 bg-gray-600 rounded mx-auto mb-4"></div>
              <div className="w-full h-6 bg-gray-600 rounded mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-600 rounded mx-auto"></div>
            </div>
            <p className="text-[var(--app-foreground-muted)] mt-4">
              Loading the next market event...
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
          {/* Event Info */}
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-[var(--app-accent-light)] text-[var(--app-accent)] text-xs font-medium rounded-full mb-3">
              {predictionEvent.category}
            </div>
            <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-2">
              {predictionEvent.question}
            </h2>
            <p className="text-[var(--app-foreground-muted)] text-sm mb-4">
              {predictionEvent.description}
            </p>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--app-card-bg)] rounded-lg border border-[var(--app-card-border)]">
            <div className="text-center">
              <div className="text-lg font-semibold text-[var(--app-accent)]">
                {predictionEvent.totalPot} USDC
              </div>
              <div className="text-xs text-[var(--app-foreground-muted)]">Total Pot</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-[var(--app-accent)]">
                {predictionEvent.totalBets}
              </div>
              <div className="text-xs text-[var(--app-foreground-muted)]">Total Bets</div>
            </div>
          </div>

          {/* Betting Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--app-foreground)]">Choose Your Prediction:</h3>
            <div className="grid grid-cols-1 gap-3">
              {predictionEvent.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedOption === option.id
                      ? "border-[var(--app-accent)] bg-[var(--app-accent-light)]"
                      : "border-[var(--app-card-border)] hover:border-[var(--app-accent)]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[var(--app-foreground)]">
                      {option.label}
                    </span>
                    <span className="text-sm text-[var(--app-accent)] font-semibold">
                      {option.odds}x
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bet Amount Selection */}
          {selectedOption && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--app-foreground)]">
                Bet Amount (USDC):
              </label>
              <div className="flex space-x-2">
                {[1, 5, 10, 25].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      betAmount === amount
                        ? "bg-[var(--app-accent)] text-[var(--app-background)]"
                        : "bg-[var(--app-card-bg)] border border-[var(--app-card-border)] text-[var(--app-foreground)] hover:border-[var(--app-accent)]"
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Component */}
          {selectedOption && address && (
            <div className="flex flex-col items-center space-y-4">
            <Transaction
              calls={calls}
              onSuccess={handleSuccess}
              onError={(error: TransactionError) =>
                  console.error("Betting transaction failed:", error)
              }
            >
                <div className="w-full grid grid-cols-2 gap-3">
                  <TransactionButton className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-lg" />
                  <TransactionButton className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-lg" />
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
              <p className="text-yellow-400 text-sm mb-2">
                Connect your wallet to place a USDC bet
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Mock NFT Reward Area */}
      <div className="mt-6 pt-4 border-t border-[var(--app-card-border)] text-center">
        <p className="text-xs text-yellow-500 font-medium">
          ✅ Winning this bet mints a **Proof-of-Foresight NFT** for your profile.
        </p>
        </div>
      </div>
  );
}

