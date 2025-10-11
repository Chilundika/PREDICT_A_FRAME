"use client";

import { useEffect, useState } from "react";

interface MarketEvent {
  category: string;
  question: string;
  description: string;
  totalPot: string;
  totalBets: number;
}

export default function useMarketEvent() {
  const [event, setEvent] = useState<MarketEvent | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana"
        );
        const data = await res.json();
        const random = data[Math.floor(Math.random() * data.length)];

        // Dynamic prediction logic: round price up to the nearest $1000
        const priceLevel = Math.ceil(random.current_price / 1000) * 1000;
        const question = `Will ${random.name} close above $${priceLevel.toLocaleString()} this week?`;

        setEvent({
          category: "Crypto",
          question,
          description: `Predict ${random.name}'s weekly closing price for the current trading week ending Friday 5 PM EST.`,
          totalPot: `${(Math.random() * 5000).toFixed(2)} USDC`, // Mock dynamic pot
          totalBets: Math.floor(Math.random() * 300), // Mock dynamic bets
        });
      } catch (error) {
        console.error("Error loading market event:", error);
      }
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return event;
}
