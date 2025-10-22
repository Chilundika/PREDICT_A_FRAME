"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "./DemoComponents";
import { useMarketEvents } from "../hooks/useContract";

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

type LiveMarketFeedProps = {
  setActiveTab: (tab: string) => void;
};

export function LiveMarketFeed({ setActiveTab }: LiveMarketFeedProps) {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState(true);
  const [localActiveTab, setLocalActiveTab] = useState<"market" | "predictions">("predictions");

  // Fetch real blockchain events using the hook
  const { events: blockchainEvents, isLoading: eventsLoading } = useMarketEvents();

  // Fetch live crypto market data from CoinGecko
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc"
        );
        
        if (response.ok) {
          const data = await response.json() as Array<{
            symbol: string;
            current_price: number;
            price_change_percentage_24h?: number;
            total_volume?: number;
            market_cap?: number;
          }>;
          const formattedData: MarketData[] = data.map((coin) => ({
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            change24h: coin.price_change_percentage_24h || 0,
            volume24h: coin.total_volume || 0,
            marketCap: coin.market_cap || 0,
          }));
          setMarketData(formattedData);
        } else {
          // Fallback to mock data if API fails
          setMarketData(getFallbackMarketData());
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
        setMarketData(getFallbackMarketData());
      } finally {
        setIsLoadingMarket(false);
      }
    };

    fetchMarketData();
    
    // Refresh market data every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getFallbackMarketData = (): MarketData[] => [
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
  ];

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

  const formatUSDC = (amount: string) => {
    return `${Number(amount).toFixed(2)} USDC`;
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = endTime - now;
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (60 * 60 * 24));
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getEventStatus = (event: { resolved: boolean; endTime: number }): "active" | "resolved" | "upcoming" => {
    if (event.resolved) return "resolved";
    const now = Math.floor(Date.now() / 1000);
    if (event.endTime > now) return "active";
    return "resolved";
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

  const getCategoryFromDescription = (description: string): string => {
    if (description.toLowerCase().includes("bitcoin") || 
        description.toLowerCase().includes("ethereum") || 
        description.toLowerCase().includes("crypto")) {
      return "Crypto";
    }
    if (description.toLowerCase().includes("base") || 
        description.toLowerCase().includes("tvl") || 
        description.toLowerCase().includes("defi")) {
      return "DeFi";
    }
    return "Prediction";
  };

  // Calculate approximate number of predictions from pool amounts
  const estimateTotalBets = (totalPool: string): number => {
    const poolInUSDC = Number(totalPool);
    // Assuming average bet of 0.5 USDC
    return Math.max(1, Math.floor(poolInUSDC / 0.5));
  };

  return (
    <div className="space-y-4 cyber-grid-bg">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-cyber-darker/50 backdrop-blur-sm rounded-lg p-1 border border-cyber-purple/20 cyber-scan-line">
        <button
          onClick={() => setLocalActiveTab("market")}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            localActiveTab === "market"
              ? "bg-cyber-gradient text-white shadow-cyber"
              : "text-cyber-teal/70 hover:text-cyber-teal hover:bg-cyber-purple/10"
          }`}
        >
          Live Market
        </button>
        <button
          onClick={() => setLocalActiveTab("predictions")}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            localActiveTab === "predictions"
              ? "bg-cyber-gradient text-white shadow-cyber"
              : "text-cyber-teal/70 hover:text-cyber-teal hover:bg-cyber-purple/10"
          }`}
        >
          On-Chain Events
        </button>
      </div>

      {/* Market Data Tab */}
      {localActiveTab === "market" && (
        <Card title="📈 Live Market Data">
          <div className="space-y-3">
            {isLoadingMarket ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
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
                  className="flex justify-between items-center p-4 bg-cyber-darker/30 backdrop-blur-sm rounded-lg hover:bg-cyber-darker/50 transition-all duration-200 border border-cyber-purple/10 hover:border-cyber-purple/30 cyber-pulse"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyber-gradient rounded-full flex items-center justify-center shadow-cyber">
                      <span className="text-white text-sm font-bold">
                        {coin.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {coin.symbol}
                      </div>
                      <div className="text-xs text-cyber-teal/70">
                        {formatMarketCap(coin.marketCap)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {formatPrice(coin.price)}
                    </div>
                    <div
                      className={`text-xs font-medium ${
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
          
          <div className="mt-4 pt-3 border-t border-cyber-purple/20">
            <p className="text-xs text-cyber-teal/70 text-center font-medium">
              Live data from CoinGecko • Updates every 60s
            </p>
          </div>
        </Card>
      )}

      {/* Blockchain Predictions Tab */}
      {localActiveTab === "predictions" && (
        <Card 
          title="🔗 Blockchain Events"
          headerAction={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("allmarkets")}
              className="text-xs"
            >
              VIEW ALL
            </Button>
          }
        >
          <div className="space-y-3">
            {eventsLoading && blockchainEvents.length === 0 ? (
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
            ) : blockchainEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[var(--app-foreground-muted)] text-sm">
                  No active events on the blockchain yet.
                </p>
              </div>
            ) : (
              blockchainEvents.map((event) => {
                const status = getEventStatus(event);
                const category = getCategoryFromDescription(event.description);
                const estimatedBets = estimateTotalBets(event.totalPool);
                
                return (
                  <div
                    key={event.id}
                    className="p-4 bg-cyber-darker/30 backdrop-blur-sm rounded-lg hover:bg-cyber-darker/50 transition-all duration-200 border border-cyber-purple/10 hover:border-cyber-purple/30 cyber-hologram"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-cyber-teal/70 font-medium">
                            #{event.id}
                          </span>
                          <span className="text-xs px-2 py-1 bg-cyber-teal/20 text-cyber-teal rounded-lg font-medium">
                            On-Chain
                          </span>
                        </div>
                        <h4 className="font-semibold text-white text-sm mb-2 leading-relaxed">
                          {event.description}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="px-3 py-1 bg-cyber-purple/20 text-cyber-purple rounded-full font-medium">
                            {category}
                          </span>
                          <span className={getStatusColor(status) + " font-medium"}>
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3 mt-3">
                      <div className="text-xs">
                        <div className="text-cyber-teal/70 mb-1 font-medium">Total Pool</div>
                        <div className="text-cyber-purple font-bold text-sm">
                          {formatUSDC(event.totalPool)}
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="text-cyber-teal/70 mb-1 font-medium">Est. Bets</div>
                        <div className="text-white font-bold text-sm">
                          ~{estimatedBets}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-cyber-purple/20">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-green-400 font-medium">YES: </span>
                          <span className="text-white font-semibold">
                            {formatUSDC(event.yesPool)}
                          </span>
                        </div>
                        <div>
                          <span className="text-red-400 font-medium">NO: </span>
                          <span className="text-white font-semibold">
                            {formatUSDC(event.noPool)}
                          </span>
                        </div>
                      </div>
                      <span className="text-cyber-teal/70 font-medium">
                        {getTimeRemaining(event.endTime)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-cyber-purple/20">
            <div className="flex items-center justify-center gap-2 text-xs text-cyber-teal/70 font-medium">
              <div className="w-2 h-2 bg-cyber-teal rounded-full animate-pulse shadow-cyber"></div>
              <p>
                Live from Base Sepolia • {blockchainEvents.length} active event{blockchainEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
