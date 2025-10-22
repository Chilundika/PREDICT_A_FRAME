"use client";

import { useState } from "react";
import { Card, Button } from "./DemoComponents";

type AllMarketsPageProps = {
  setActiveTab: (tab: string) => void;
};



const marketCategories = {
  crypto: {
    name: "🪙 Cryptocurrency",
    markets: [
      {
        id: "btc-100k",
        title: "Bitcoin to reach $100,000 by end of 2024?",
        description: "Will Bitcoin (BTC) reach or exceed $100,000 USD by December 31, 2024?",
        odds: { yes: 65, no: 35 },
        volume: "$2.4M",
        endDate: "Dec 31, 2024",
        category: "crypto"
      },
      {
        id: "eth-5k",
        title: "Ethereum to hit $5,000 in 2024?",
        description: "Will Ethereum (ETH) reach $5,000 USD at any point in 2024?",
        odds: { yes: 45, no: 55 },
        volume: "$1.8M",
        endDate: "Dec 31, 2024",
        category: "crypto"
      },
      {
        id: "base-adoption",
        title: "Base network TVL to exceed $10B?",
        description: "Will Base network Total Value Locked exceed $10 billion by Q2 2024?",
        odds: { yes: 72, no: 28 },
        volume: "$890K",
        endDate: "Jun 30, 2024",
        category: "crypto"
      }
    ]
  },
  forex: {
    name: "💱 Forex & Economics",
    markets: [
      {
        id: "usd-ngn",
        title: "USD/NGN to exceed ₦2000 by mid-2024?",
        description: "Will the USD to Nigerian Naira exchange rate exceed ₦2000 by June 2024?",
        odds: { yes: 38, no: 62 },
        volume: "$1.2M",
        endDate: "Jun 30, 2024",
        category: "forex"
      },
      {
        id: "zar-strength",
        title: "South African Rand to strengthen vs USD?",
        description: "Will USD/ZAR fall below 15.00 by end of 2024?",
        odds: { yes: 42, no: 58 },
        volume: "$750K",
        endDate: "Dec 31, 2024",
        category: "forex"
      },
      {
        id: "ghana-cedi",
        title: "Ghana Cedi stabilization success?",
        description: "Will USD/GHS remain below 15.00 for 3 consecutive months in 2024?",
        odds: { yes: 35, no: 65 },
        volume: "$420K",
        endDate: "Dec 31, 2024",
        category: "forex"
      }
    ]
  },
  sports: {
    name: "⚽ Sports",
    markets: [
      {
        id: "afcon-2025",
        title: "Nigeria to win AFCON 2025?",
        description: "Will Nigeria's Super Eagles win the Africa Cup of Nations 2025?",
        odds: { yes: 18, no: 82 },
        volume: "$3.1M",
        endDate: "Feb 28, 2025",
        category: "sports"
      },
      {
        id: "premier-league",
        title: "African player to win Premier League Golden Boot?",
        description: "Will an African player win the Premier League top scorer award 2023-24?",
        odds: { yes: 25, no: 75 },
        volume: "$1.9M",
        endDate: "May 19, 2024",
        category: "sports"
      },
      {
        id: "world-cup-africa",
        title: "African team to reach World Cup 2026 semifinals?",
        description: "Will any African national team reach the semifinals of FIFA World Cup 2026?",
        odds: { yes: 22, no: 78 },
        volume: "$2.7M",
        endDate: "Jul 19, 2026",
        category: "sports"
      }
    ]
  },
  african: {
    name: "🌍 African Markets",
    markets: [
      {
        id: "african-union-cbdc",
        title: "African Union to launch continental CBDC?",
        description: "Will the African Union announce a continental Central Bank Digital Currency by 2025?",
        odds: { yes: 28, no: 72 },
        volume: "$680K",
        endDate: "Dec 31, 2025",
        category: "african"
      },
      {
        id: "lagos-tech-hub",
        title: "Lagos to become top 3 global tech hub?",
        description: "Will Lagos rank in top 3 global tech hubs by startup funding in 2024?",
        odds: { yes: 15, no: 85 },
        volume: "$540K",
        endDate: "Dec 31, 2024",
        category: "african"
      },
      {
        id: "renewable-energy-africa",
        title: "Africa to reach 50% renewable energy?",
        description: "Will Africa achieve 50% renewable energy capacity by 2030?",
        odds: { yes: 45, no: 55 },
        volume: "$1.1M",
        endDate: "Dec 31, 2030",
        category: "african"
      },
      {
        id: "mobile-money-adoption",
        title: "Mobile money users to exceed 500M in Africa?",
        description: "Will mobile money users in Africa exceed 500 million by end of 2024?",
        odds: { yes: 78, no: 22 },
        volume: "$920K",
        endDate: "Dec 31, 2024",
        category: "african"
      }
    ]
  }
};

export function AllMarketsPage({ setActiveTab }: AllMarketsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("crypto");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMarkets = marketCategories[selectedCategory as keyof typeof marketCategories]?.markets.filter(
    market => 
      market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleMarketClick = (_marketId: string) => {
    // Navigate to prediction page for this specific market
    setActiveTab("prediction");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text cyber-glow">All Prediction Markets</h1>
          <p className="text-[var(--app-foreground-muted)] text-sm mt-1">
            Explore prediction markets across crypto, forex, sports, and African markets
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab("home")}
        >
          ← Back to Home
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--app-card-bg)] border border-cyber-purple/20 rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:border-cyber-teal/50 focus:ring-1 focus:ring-cyber-teal/20"
          />
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(marketCategories).map(([key, category]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(key)}
            className="flex-shrink-0"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Markets Grid */}
      <div className="grid gap-4">
        {filteredMarkets.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-[var(--app-foreground-muted)]">
                {searchTerm ? "No markets found matching your search." : "No markets available in this category."}
              </p>
            </div>
          </Card>
        ) : (
          filteredMarkets.map((market) => (
            <Card
              key={market.id}
              className="hover:scale-[1.01] transition-transform cursor-pointer"
              onClick={() => handleMarketClick(market.id)}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    {market.title}
                  </h3>
                  <p className="text-sm text-white leading-relaxed">
                    {market.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 font-medium">YES {market.odds.yes}%</span>
                      <span className="text-red-400 font-medium">NO {market.odds.no}%</span>
                    </div>
                    <div className="text-white">
                      Volume: {market.volume}
                    </div>
                  </div>
                  <div className="text-white">
                    Ends: {market.endDate}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleMarketClick(market.id)}
                  >
                    Bet YES ({market.odds.yes}%)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => handleMarketClick(market.id)}
                  >
                    Bet NO ({market.odds.no}%)
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <Card>
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-8 text-sm">
            <div>
              <span className="text-[var(--app-foreground-muted)]">Total Markets: </span>
              <span className="text-cyber-teal font-medium">
                {Object.values(marketCategories).reduce((acc, cat) => acc + cat.markets.length, 0)}
              </span>
            </div>
            <div>
              <span className="text-[var(--app-foreground-muted)]">Active Categories: </span>
              <span className="text-cyber-teal font-medium">{Object.keys(marketCategories).length}</span>
            </div>
            <div>
              <span className="text-[var(--app-foreground-muted)]">Total Volume: </span>
              <span className="text-cyber-teal font-medium">$18.2M</span>
            </div>
          </div>
          <p className="text-xs text-[var(--app-foreground-muted)]">
            Powered by Base Network • Real-time odds • Decentralized predictions
          </p>
        </div>
      </Card>
    </div>
  );
}