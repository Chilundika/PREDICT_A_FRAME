"use client";

import { useState, useEffect } from "react";
import { Card } from "./DemoComponents";

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

interface PredictionEvent {
  id: string;
  question: string;
  category: string;
  totalBets: number;
  totalPot: number;
  endTime: string;
  status: "active" | "resolved" | "upcoming";
}

export function LiveMarketFeed() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [predictionEvents, setPredictionEvents] = useState<PredictionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"market" | "predictions">("market");

  // Mock market data - in production, this would fetch from CoinGecko API
  useEffect(() => {
    const fetchMarketData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual CoinGecko API call
      const mockMarketData: MarketData[] = [
        {
          symbol: "BTC",
          price: 69850.42,
          change24h: 2.34,
          volume24h: 28500000000,
          marketCap: 1375000000000,
        },
        {
          symbol: "ETH",
          price: 3456.78,
          change24h: -1.23,
          volume24h: 15200000000,
          marketCap: 415000000000,
        },
        {
          symbol: "SOL",
          price: 98.45,
          change24h: 5.67,
          volume24h: 3200000000,
          marketCap: 42000000000,
        },
        {
          symbol: "BASE",
          price: 0.00001234,
          change24h: 8.91,
          volume24h: 450000000,
          marketCap: 1200000000,
        },
      ];

      const mockPredictionEvents: PredictionEvent[] = [
        {
          id: "btc-weekly-1",
          question: "Will Bitcoin close above $70,000 this week?",
          category: "Crypto",
          totalBets: 127,
          totalPot: 2.45,
          endTime: "2024-01-26T17:00:00Z",
          status: "active",
        },
        {
          id: "eth-monthly-1",
          question: "Will Ethereum reach $4,000 by month end?",
          category: "Crypto",
          totalBets: 89,
          totalPot: 1.87,
          endTime: "2024-01-31T23:59:59Z",
          status: "active",
        },
        {
          id: "sol-weekly-1",
          question: "Will Solana break $100 this week?",
          category: "Crypto",
          totalBets: 156,
          totalPot: 3.12,
          endTime: "2024-01-28T17:00:00Z",
          status: "active",
        },
        {
          id: "base-daily-1",
          question: "Will Base TVL exceed $1B today?",
          category: "DeFi",
          totalBets: 67,
          totalPot: 0.89,
          endTime: "2024-01-25T23:59:59Z",
          status: "resolved",
        },
      ];

      setMarketData(mockMarketData);
      setPredictionEvents(mockPredictionEvents);
      setIsLoading(false);
    };

    fetchMarketData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toExponential(4)}`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400";
      case "resolved":
        return "text-gray-400";
      case "upcoming":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[var(--app-card-bg)] rounded-lg p-1">
        <button
          onClick={() => setActiveTab("market")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            activeTab === "market"
              ? "bg-[var(--app-accent)] text-[var(--app-background)]"
              : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
          }`}
        >
          Live Market
        </button>
        <button
          onClick={() => setActiveTab("predictions")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            activeTab === "predictions"
              ? "bg-[var(--app-accent)] text-[var(--app-background)]"
              : "text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
          }`}
        >
          Predictions
        </button>
      </div>

      {/* Market Data Tab */}
      {activeTab === "market" && (
        <Card title="📈 Live Market Data">
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between items-center p-3 bg-[var(--app-card-bg)] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                        <div className="w-16 h-4 bg-gray-600 rounded"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              marketData.map((coin) => (
                <div
                  key={coin.symbol}
                  className="flex justify-between items-center p-3 bg-[var(--app-card-bg)] rounded-lg hover:bg-[var(--app-gray)] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--app-accent)] to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {coin.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--app-foreground)]">
                        {coin.symbol}
                      </div>
                      <div className="text-xs text-[var(--app-foreground-muted)]">
                        {formatMarketCap(coin.marketCap)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[var(--app-foreground)]">
                      {formatPrice(coin.price)}
                    </div>
                    <div
                      className={`text-xs ${
                        coin.change24h >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {coin.change24h >= 0 ? "+" : ""}
                      {coin.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-[var(--app-card-border)]">
            <p className="text-xs text-[var(--app-foreground-muted)] text-center">
              Data updates every 30 seconds
            </p>
          </div>
        </Card>
      )}

      {/* Predictions Tab */}
      {activeTab === "predictions" && (
        <Card title="🎯 Active Predictions">
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="p-3 bg-[var(--app-card-bg)] rounded-lg">
                      <div className="w-full h-4 bg-gray-600 rounded mb-2"></div>
                      <div className="w-3/4 h-3 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              predictionEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-[var(--app-card-bg)] rounded-lg hover:bg-[var(--app-gray)] transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--app-foreground)] text-sm mb-1">
                        {event.question}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-[var(--app-foreground-muted)]">
                        <span className="px-2 py-1 bg-[var(--app-accent-light)] text-[var(--app-accent)] rounded-full">
                          {event.category}
                        </span>
                        <span className={getStatusColor(event.status)}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex space-x-4">
                      <span className="text-[var(--app-foreground-muted)]">
                        {event.totalBets} bets
                      </span>
                      <span className="text-[var(--app-accent)] font-medium">
                        {event.totalPot} USDC
                      </span>
                    </div>
                    <span className="text-[var(--app-foreground-muted)]">
                      {getTimeRemaining(event.endTime)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-[var(--app-card-border)]">
            <p className="text-xs text-[var(--app-foreground-muted)] text-center">
              Showing active prediction markets
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
