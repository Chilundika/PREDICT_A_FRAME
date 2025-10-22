"use client";

import { useState } from "react";
import { Button } from "./DemoComponents";

type UssdModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type UssdSession = {
  sessionId: string;
  phoneNumber: string;
  currentMenu: string;
  menuHistory: string[];
  userInput: string;
};

// type UssdMenu = {
//   id: string;
//   title: string;
//   options: { key: string; label: string; action?: string }[];
//   isInput?: boolean;
//   inputPrompt?: string;
// };

export function UssdModal({ isOpen, onClose }: UssdModalProps) {
  const [session, setSession] = useState<UssdSession>({
    sessionId: "",
    phoneNumber: "",
    currentMenu: "main",
    menuHistory: [],
    userInput: "",
  });
  
  const [phoneInput, setPhoneInput] = useState("");
  const [ussdInput, setUssdInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // const ussdMenus: Record<string, UssdMenu> = {
  //   main: {
  //     id: "main",
  //     title: "🔮 PredictAFrame USSD",
  //     options: [
  //       { key: "1", label: "View Markets", action: "markets" },
  //       { key: "2", label: "My Predictions", action: "my_predictions" },
  //       { key: "3", label: "Account Balance", action: "balance" },
  //       { key: "4", label: "Place Prediction", action: "place_prediction" },
  //       { key: "5", label: "Transaction History", action: "history" },
  //       { key: "6", label: "Help & Support", action: "help" },
  //       { key: "0", label: "Exit", action: "exit" },
  //     ],
  //   },
  //   markets: {
  //     id: "markets",
  //     title: "📊 Active Markets",
  //     options: [
  //       { key: "1", label: "BTC Price > $100k by Dec 2024", action: "market_1" },
  //       { key: "2", label: "ETH Price > $5k by Jan 2025", action: "market_2" },
  //       { key: "3", label: "AI Token Launch Success", action: "market_3" },
  //       { key: "4", label: "DeFi TVL > $200B", action: "market_4" },
  //       { key: "#", label: "Back to Main Menu", action: "main" },
  //       { key: "0", label: "Exit", action: "exit" },
  //     ],
  //   },
  //   market_1: {
  //     id: "market_1",
  //     title: "🪙 BTC > $100k by Dec 2024",
  //     options: [
  //       { key: "1", label: "Predict YES (0.01 ETH)", action: "predict_yes_1" },
  //       { key: "2", label: "Predict NO (0.01 ETH)", action: "predict_no_1" },
  //       { key: "3", label: "View Details", action: "market_1_details" },
  //       { key: "#", label: "Back to Markets", action: "markets" },
  //       { key: "0", label: "Exit", action: "exit" },
  //     ],
  //   },
  //   market_1_details: {
  //     id: "market_1_details",
  //     title: "📈 Market Details",
  //     options: [
  //       { key: "1", label: "Current Odds: YES 65% | NO 35%", action: "market_1" },
  //       { key: "2", label: "Total Pool: 12.5 ETH", action: "market_1" },
  //       { key: "3", label: "Participants: 247", action: "market_1" },
  //       { key: "4", label: "Ends: Dec 31, 2024", action: "market_1" },
  //       { key: "#", label: "Back to Market", action: "market_1" },
  //       { key: "0", label: "Exit", action: "exit" },
  //     ],
  //   },
  //   my_predictions: {
  //     id: "my_predictions",
  //     title: "🎯 My Predictions",
  //     options: [
  //       { key: "1", label: "BTC>$100k: YES (0.01 ETH)", action: "prediction_1" },
  //       { key: "2", label: "ETH>$5k: NO (0.005 ETH)", action: "prediction_2" },
  //       { key: "3", label: "View All (5 total)", action: "all_predictions" },
  //       { key: "#", label: "Back to Main Menu", action: "main" },
  //       { key: "0", label: "Exit", action: "exit" },
  //     ],
  //   },
  //   balance: {
  //     id: "balance",
  //     title: "💰 Account Balance",
  //     options: [
  //       { key: "1", label: "Available: 0.15 ETH", action: "balance" },
  //       { key: "2", label: "In Predictions: 0.025 ETH", action: "balance" },
  //       { key: "3", label: "Total Value: 0.175 ETH", action: "balance" },
  //       { key: "4", label: "Add Funds via M-Pesa", action: "add_funds" },
  //       { key: "#", label: "Back to Main Menu", action: "main" },
  //       { key: "0", label: "Exit", action: "exit" },
  //     ],
  //   },
  //   place_prediction: {
  //     id: "place_prediction",
  //     title: "🎲 Place New Prediction",
  //     options: [
  //       { key: "1", label: "Quick Predict (0.01 ETH)", action: "quick_predict" },
  //       { key: "2", label: "Custom Amount", action: "custom_amount" },
  //       { key: "3", label: "Browse Markets", action: "markets" },
  //       { key: "#", label: "Back to Main Menu", action: "main" },
  //       { key: "0", label: "Exit", action: "exit" },
  //     ],
  //   },
  //   custom_amount: {
  //     id: "custom_amount",
  //     title: "💵 Enter Amount (ETH)",
  //     options: [],
  //     isInput: true,
  //     inputPrompt: "Enter amount (e.g., 0.05):",
  //   },
  //   help: {
  //     id: "help",
  //     title: "❓ Help & Support",
  //     options: [
  //       { key: "1", label: "How to Predict", action: "help_predict" },
  //       { key: "2", label: "Payment Methods", action: "help_payment" },
  //       { key: "3", label: "Contact Support", action: "help_contact" },
  //       { key: "4", label: "USSD Codes List", action: "help_codes" },
  //       { key: "#", label: "Back to Main Menu", action: "main" },
  //       { key: "0", label: "Exit", action: "exit" },
  //     ],
  //   },
  //   help_codes: {
  //     id: "help_codes",
  //     title: "📱 USSD Codes",
  //     options: [
  //       { key: "1", label: "*123*1# - Quick Markets", action: "help" },
  //       { key: "2", label: "*123*2# - My Account", action: "help" },
  //       { key: "3", label: "*123*3# - Place Bet", action: "help" },
  //       { key: "4", label: "*123*0# - Main Menu", action: "help" },
  //       { key: "#", label: "Back to Help", action: "help" },
  //       { key: "0", label: "Exit", action: "exit" },
  //     ],
  //   },
  // };

  // const getCurrentMenu = () => ussdMenus[session.currentMenu] || ussdMenus.main;

  // const formatMenuDisplay = (menu: UssdMenu) => {
  //   let display = `${menu.title}\n\n`;
  //   
  //   if (menu.isInput) {
  //     display += `${menu.inputPrompt}\n\n`;
  //     display += "# Back  0 Exit";
  //   } else {
  //     menu.options.forEach((option) => {
  //       display += `${option.key}. ${option.label}\n`;
  //     });
  //   }
  //   
  //   return display;
  // };

  const handleUssdInput = async (input: string) => {
    await callUssdApi('navigate', {
      input,
      currentMenu: session.currentMenu,
      menuHistory: session.menuHistory
    });
  };

  // const processInputSubmission = (input: string) => {
  //   const currentMenu = getCurrentMenu();
  //   
  //   if (currentMenu.id === "custom_amount") {
  //     // Validate amount and proceed to market selection
  //     const amount = parseFloat(input);
  //     if (amount > 0 && amount <= 0.15) {
  //       setDisplayText(`Amount: ${amount} ETH confirmed.\nSelect market to predict on.`);
  //       setTimeout(() => navigateToMenu("markets"), 2000);
  //     } else {
  //       setDisplayText("Invalid amount. Must be between 0.001 and 0.15 ETH.");
  //       setTimeout(() => setDisplayText(formatMenuDisplay(currentMenu)), 2000);
  //     }
  //   }
  // };

  // const navigateToMenu = (menuId: string) => {
  //   if (menuId === "exit") {
  //     exitSession();
  //     return;
  //   }

  //   setIsLoading(true);
    
  //   // Simulate network delay
  //   setTimeout(() => {
  //     setSession(prev => ({
  //       ...prev,
  //       menuHistory: [...prev.menuHistory, prev.currentMenu],
  //       currentMenu: menuId,
  //     }));
      
  //     const newMenu = ussdMenus[menuId];
  //     if (newMenu) {
  //       setDisplayText(formatMenuDisplay(newMenu));
  //     }
      
  //     setIsLoading(false);
  //   }, 500);
  // };

  // const navigateBack = () => {
  //   if (session.menuHistory.length > 0) {
  //     const previousMenu = session.menuHistory[session.menuHistory.length - 1];
  //     setSession(prev => ({
  //       ...prev,
  //       currentMenu: previousMenu,
  //       menuHistory: prev.menuHistory.slice(0, -1),
  //     }));
  //     
  //     const menu = ussdMenus[previousMenu];
  //     if (menu) {
  //       setDisplayText(formatMenuDisplay(menu));
  //     }
  //   }
  // };

  const exitSession = () => {
    setDisplayText("Thank you for using PredictAFrame USSD!\nSession ended.");
    setTimeout(() => {
      setIsConnected(false);
      setDisplayText("");
      setSession({
        sessionId: "",
        phoneNumber: "",
        currentMenu: "main",
        menuHistory: [],
        userInput: "",
      });
    }, 2000);
  };

  // USSD API Integration
  const callUssdApi = async (action: string, data: Record<string, unknown> = {}) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/ussd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          sessionId: session.sessionId,
          phoneNumber: session.phoneNumber,
          ...data
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        switch (action) {
          case 'initiate':
            setSession(prev => ({
              ...prev,
              sessionId: result.sessionId,
              phoneNumber: phoneInput,
              currentMenu: 'main'
            }));
            setIsConnected(true);
            setDisplayText(result.menu);
            break;
          case 'navigate':
            setDisplayText(result.menu);
            setSession(prev => ({
              ...prev,
              currentMenu: result.currentMenu || prev.currentMenu
            }));
            if (result.error) {
              setDisplayText(prev => prev + '\n\nError: ' + result.error);
            }
            break;
          default:
            console.log('USSD API response:', result);
        }
      } else {
        setDisplayText('Error: ' + (result.error || 'Unknown error occurred'));
      }
    } catch (error) {
      console.error('USSD API Error:', error);
      setDisplayText('Error: Unable to connect to USSD service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initiateUssdSession = async () => {
    if (!phoneInput.trim()) return;
    
    await callUssdApi('initiate', { phoneNumber: phoneInput });
  };

  const handleKeypadPress = (key: string) => {
    if (!isConnected) return;
    
    setUssdInput(prev => prev + key);
  };

  const handleSendUssd = async () => {
    if (!ussdInput.trim() || !isConnected) return;
    
    await handleUssdInput(ussdInput);
    setUssdInput("");
  };

  const handleClearInput = () => {
    setUssdInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--app-background)] rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--app-gray-dark)]">
          <h2 className="text-lg font-semibold text-[var(--app-foreground)]">
            📱 USSD Access Portal
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[var(--app-foreground-muted)]"
          >
            ✕
          </Button>
        </div>

        {/* Phone Interface */}
        <div className="p-4">
          {!isConnected ? (
            /* Connection Setup */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-md font-medium text-[var(--app-foreground)] mb-2">
                  Connect Your Phone
                </h3>
                <p className="text-sm text-[var(--app-foreground-muted)] mb-4">
                  Enter your phone number to access prediction markets via USSD
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+254712345678"
                  className="w-full px-3 py-2 border border-[var(--app-gray-dark)] rounded-md bg-[var(--app-background)] text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                />
              </div>

              <div className="bg-[var(--app-gray)] p-3 rounded-md">
                <h4 className="font-medium text-[var(--app-foreground)] mb-2">Quick USSD Codes:</h4>
                <div className="text-sm text-[var(--app-foreground-muted)] space-y-1">
                  <div>*123# - Main Menu</div>
                  <div>*123*1# - View Markets</div>
                  <div>*123*2# - My Account</div>
                  <div>*123*3# - Place Prediction</div>
                </div>
              </div>

              <Button
                onClick={initiateUssdSession}
                disabled={!phoneInput.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? "Connecting..." : "Connect to USSD"}
              </Button>
            </div>
          ) : (
            /* USSD Interface */
            <div className="space-y-4">
              {/* Phone Screen */}
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm min-h-[200px] relative">
                <div className="flex justify-between items-center mb-2 text-xs">
                  <span>📶 Network</span>
                  <span>{session.phoneNumber}</span>
                  <span>🔋 100%</span>
                </div>
                <hr className="border-green-600 mb-3" />
                
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin text-2xl mb-2">⏳</div>
                      <div>Loading...</div>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line">
                    {displayText}
                  </div>
                )}
              </div>

              {/* USSD Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={ussdInput}
                  onChange={(e) => setUssdInput(e.target.value)}
                  placeholder="Enter option..."
                  className="flex-1 px-3 py-2 border border-[var(--app-gray-dark)] rounded-md bg-[var(--app-background)] text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                  maxLength={10}
                />
                <Button
                  onClick={handleSendUssd}
                  disabled={!ussdInput.trim()}
                  size="sm"
                  className="px-4"
                >
                  Send
                </Button>
              </div>

              {/* Virtual Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => handleKeypadPress(key)}
                    className="aspect-square text-lg font-mono"
                  >
                    {key}
                  </Button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearInput}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exitSession}
                  className="flex-1"
                >
                  End Session
                </Button>
              </div>

              {/* Session Info */}
              <div className="text-xs text-[var(--app-foreground-muted)] text-center">
                Session ID: {session.sessionId.slice(-8)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}