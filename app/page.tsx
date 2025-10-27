"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { Home } from "./components/DemoComponents";
import { Features } from "./components/DemoComponents";
import { PredictionMarket } from "./components/DemoComponents";
import { LiveMarketFeed } from "./components/LiveMarketFeed";
import { AllMarketsPage } from "./components/AllMarketsPage";
import { UssdModal } from "./components/UssdModal";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isUssdModalOpen, setIsUssdModalOpen] = useState(false);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="cyber-button-secondary p-4 font-medium"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-cyber-teal animate-fade-out">
          <Icon name="check" size="sm" className="text-cyber-teal" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-inter text-foreground bg-cyber-bg max-w-sm mx-auto relative overflow-hidden">
      {/* Cyberpunk background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/10 via-transparent to-cyber-teal/10 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-cyber-gradient"></div>
      
      <div className="w-full px-4 py-3 relative z-10">
        <header className="flex justify-between items-center mb-4 h-12">
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Predict A Frame Logo" 
                className="w-8 h-8"
              />
            </div>
            <div className="flex items-center">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit text-sm font-medium text-cyber-purple" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2 bg-cyber-darker/90 backdrop-blur-sm border border-cyber-purple/30 rounded-lg" hasCopyAddressOnClick>
                    <Avatar />
                    <Name className="text-cyber-purple" />
                    <Address className="text-cyber-teal" />
                    <EthBalance className="text-foreground" />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {saveFrameButton}
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsUssdModalOpen(true)}
              className="cyber-button h-12 px-4 font-medium"
            >
              USSD
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <div className="flex flex-col gap-4">
            {/* Main Prediction Card Section */}
            <div className="w-full">
              {activeTab === "home" && <Home setActiveTab={setActiveTab} />}
              {activeTab === "features" && <Features setActiveTab={setActiveTab} />}
              {activeTab === "prediction" && <PredictionMarket setActiveTab={setActiveTab} />}
              {activeTab === "allmarkets" && <AllMarketsPage setActiveTab={setActiveTab} />}
            </div>

            {/* Live Feed Section */}
            {activeTab !== "allmarkets" && (
              <aside className="w-full">
                <LiveMarketFeed setActiveTab={setActiveTab} />
              </aside>
            )}
          </div>
        </main>

        <footer className="mt-2 pt-3 flex justify-center border-t border-cyber-purple/20">
          <Button
            variant="ghost"
            size="sm"
            className="text-cyber-teal/70 hover:text-cyber-teal text-xs font-medium transition-colors"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>
      
      {/* USSD Modal */}
      <UssdModal 
        isOpen={isUssdModalOpen} 
        onClose={() => setIsUssdModalOpen(false)} 
      />
    </div>
  );
}
