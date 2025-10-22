import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// USSD Session Management
interface UssdSession {
  sessionId: string;
  phoneNumber: string;
  currentMenu: string;
  menuHistory: string[];
  userWallet?: string;
  balance?: string;
  predictions?: any[];
  lastActivity: number;
}

// In-memory session storage (in production, use Redis or database)
const sessions = new Map<string, UssdSession>();

// Mock market data
const mockMarkets = [
  {
    id: 1,
    question: "BTC Price > $100k by Dec 2024",
    yesOdds: 65,
    noOdds: 35,
    totalPool: "12.5",
    participants: 247,
    endDate: "2024-12-31",
    minBet: "0.001"
  },
  {
    id: 2,
    question: "ETH Price > $5k by Jan 2025",
    yesOdds: 45,
    noOdds: 55,
    totalPool: "8.3",
    participants: 189,
    endDate: "2025-01-31",
    minBet: "0.001"
  },
  {
    id: 3,
    question: "AI Token Launch Success",
    yesOdds: 72,
    noOdds: 28,
    totalPool: "15.7",
    participants: 312,
    endDate: "2024-12-15",
    minBet: "0.005"
  }
];

// Mock user data
const mockUserData = {
  balance: "0.15",
  inPredictions: "0.025",
  predictions: [
    { marketId: 1, prediction: "YES", amount: "0.01", date: "2024-11-01" },
    { marketId: 2, prediction: "NO", amount: "0.005", date: "2024-11-02" }
  ]
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, phoneNumber, input, marketId, prediction, amount } = body;

    switch (action) {
      case 'initiate':
        return handleInitiateSession(phoneNumber);
      
      case 'navigate':
        return handleNavigation(sessionId, input);
      
      case 'get_markets':
        return handleGetMarkets(sessionId);
      
      case 'get_market_details':
        return handleGetMarketDetails(sessionId, marketId);
      
      case 'place_prediction':
        return handlePlacePrediction(sessionId, marketId, prediction, amount);
      
      case 'get_balance':
        return handleGetBalance(sessionId);
      
      case 'get_predictions':
        return handleGetPredictions(sessionId);
      
      case 'end_session':
        return handleEndSession(sessionId);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('USSD API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function handleInitiateSession(phoneNumber: string) {
  const sessionId = `USSD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: UssdSession = {
    sessionId,
    phoneNumber,
    currentMenu: 'main',
    menuHistory: [],
    lastActivity: Date.now()
  };
  
  sessions.set(sessionId, session);
  
  // Generate a simple wallet for demo purposes
  const wallet = ethers.Wallet.createRandom();
  session.userWallet = wallet.address;
  session.balance = mockUserData.balance;
  session.predictions = mockUserData.predictions;
  
  return NextResponse.json({
    success: true,
    sessionId,
    message: 'USSD session initiated successfully',
    walletAddress: wallet.address.slice(0, 10) + '...',
    menu: getMainMenu()
  });
}

function handleNavigation(sessionId: string, input: string) {
  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  session.lastActivity = Date.now();
  
  // Handle navigation based on current menu and input
  let response;
  
  switch (session.currentMenu) {
    case 'main':
      response = handleMainMenuInput(session, input);
      break;
    case 'markets':
      response = handleMarketsMenuInput(session, input);
      break;
    case 'market_details':
      response = handleMarketDetailsInput(session, input);
      break;
    default:
      response = { menu: getMainMenu(), currentMenu: 'main' };
  }
  
  session.currentMenu = response.currentMenu;
  sessions.set(sessionId, session);
  
  return NextResponse.json({
    success: true,
    ...response
  });
}

function handleMainMenuInput(session: UssdSession, input: string) {
  switch (input) {
    case '1':
      return { menu: getMarketsMenu(), currentMenu: 'markets' };
    case '2':
      return { menu: getPredictionsMenu(session), currentMenu: 'my_predictions' };
    case '3':
      return { menu: getBalanceMenu(session), currentMenu: 'balance' };
    case '4':
      return { menu: getPlacePredictionMenu(), currentMenu: 'place_prediction' };
    case '5':
      return { menu: getHistoryMenu(session), currentMenu: 'history' };
    case '6':
      return { menu: getHelpMenu(), currentMenu: 'help' };
    case '0':
      sessions.delete(session.sessionId);
      return { menu: 'Thank you for using PredictAFrame USSD!', currentMenu: 'exit' };
    default:
      return { menu: getMainMenu(), currentMenu: 'main', error: 'Invalid option' };
  }
}

function handleMarketsMenuInput(session: UssdSession, input: string) {
  const marketIndex = parseInt(input) - 1;
  
  if (input === '#') {
    return { menu: getMainMenu(), currentMenu: 'main' };
  } else if (input === '0') {
    sessions.delete(session.sessionId);
    return { menu: 'Thank you for using PredictAFrame USSD!', currentMenu: 'exit' };
  } else if (marketIndex >= 0 && marketIndex < mockMarkets.length) {
    const market = mockMarkets[marketIndex];
    return { 
      menu: getMarketDetailsMenu(market), 
      currentMenu: 'market_details',
      selectedMarket: market.id
    };
  } else {
    return { menu: getMarketsMenu(), currentMenu: 'markets', error: 'Invalid market selection' };
  }
}

function handleMarketDetailsInput(session: UssdSession, input: string) {
  if (input === '#') {
    return { menu: getMarketsMenu(), currentMenu: 'markets' };
  } else if (input === '0') {
    sessions.delete(session.sessionId);
    return { menu: 'Thank you for using PredictAFrame USSD!', currentMenu: 'exit' };
  } else if (input === '1' || input === '2') {
    // Handle prediction placement
    const prediction = input === '1' ? 'YES' : 'NO';
    return handlePredictionPlacement(session, prediction);
  } else {
    return { menu: getMarketDetailsMenu(mockMarkets[0]), currentMenu: 'market_details', error: 'Invalid option' };
  }
}

function handlePredictionPlacement(session: UssdSession, prediction: string) {
  // Simulate prediction placement
  const amount = "0.01"; // Default amount
  const market = mockMarkets[0]; // For demo
  
  // Add to user's predictions
  session.predictions = session.predictions || [];
  session.predictions.push({
    marketId: market.id,
    prediction,
    amount,
    date: new Date().toISOString().split('T')[0]
  });
  
  // Update balance
  const currentBalance = parseFloat(session.balance || "0");
  const betAmount = parseFloat(amount);
  session.balance = (currentBalance - betAmount).toFixed(3);
  
  const confirmationMenu = `
🎯 Prediction Placed!

Market: ${market.question}
Prediction: ${prediction}
Amount: ${amount} ETH
New Balance: ${session.balance} ETH

Transaction will be processed shortly.
You will receive SMS confirmation.

# Back to Markets
0 Exit
  `.trim();
  
  return { menu: confirmationMenu, currentMenu: 'confirmation' };
}

function handleGetMarkets(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  return NextResponse.json({
    success: true,
    markets: mockMarkets
  });
}

function handleGetMarketDetails(sessionId: string, marketId: number) {
  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  const market = mockMarkets.find(m => m.id === marketId);
  if (!market) {
    return NextResponse.json({ error: 'Market not found' }, { status: 404 });
  }
  
  return NextResponse.json({
    success: true,
    market
  });
}

function handlePlacePrediction(sessionId: string, marketId: number, prediction: string, amount: string) {
  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  const market = mockMarkets.find(m => m.id === marketId);
  if (!market) {
    return NextResponse.json({ error: 'Market not found' }, { status: 404 });
  }
  
  const betAmount = parseFloat(amount);
  const currentBalance = parseFloat(session.balance || "0");
  
  if (betAmount > currentBalance) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }
  
  // Process prediction
  session.predictions = session.predictions || [];
  session.predictions.push({
    marketId,
    prediction,
    amount,
    date: new Date().toISOString().split('T')[0],
    txHash: `0x${Math.random().toString(16).substr(2, 64)}`
  });
  
  session.balance = (currentBalance - betAmount).toFixed(3);
  
  return NextResponse.json({
    success: true,
    message: 'Prediction placed successfully',
    txHash: session.predictions[session.predictions.length - 1].txHash,
    newBalance: session.balance
  });
}

function handleGetBalance(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  const inPredictions = session.predictions?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  
  return NextResponse.json({
    success: true,
    balance: {
      available: session.balance || "0",
      inPredictions: inPredictions.toFixed(3),
      total: (parseFloat(session.balance || "0") + inPredictions).toFixed(3)
    }
  });
}

function handleGetPredictions(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  return NextResponse.json({
    success: true,
    predictions: session.predictions || []
  });
}

function handleEndSession(sessionId: string) {
  sessions.delete(sessionId);
  return NextResponse.json({
    success: true,
    message: 'Session ended successfully'
  });
}

// Menu Generation Functions
function getMainMenu() {
  return `
🔮 PredictAFrame USSD

1. View Markets
2. My Predictions  
3. Account Balance
4. Place Prediction
5. Transaction History
6. Help & Support
0. Exit
  `.trim();
}

function getMarketsMenu() {
  let menu = "📊 Active Markets\n\n";
  mockMarkets.forEach((market, index) => {
    menu += `${index + 1}. ${market.question}\n`;
  });
  menu += "\n# Back to Main Menu\n0. Exit";
  return menu;
}

function getMarketDetailsMenu(market: any) {
  return `
🪙 ${market.question}

Current Odds:
YES: ${market.yesOdds}% | NO: ${market.noOdds}%

Total Pool: ${market.totalPool} ETH
Participants: ${market.participants}
Ends: ${market.endDate}
Min Bet: ${market.minBet} ETH

1. Predict YES (0.01 ETH)
2. Predict NO (0.01 ETH)
# Back to Markets
0. Exit
  `.trim();
}

function getPredictionsMenu(session: UssdSession) {
  let menu = "🎯 My Predictions\n\n";
  
  if (!session.predictions || session.predictions.length === 0) {
    menu += "No predictions yet.\n\n";
  } else {
    session.predictions.forEach((pred, index) => {
      const market = mockMarkets.find(m => m.id === pred.marketId);
      menu += `${index + 1}. ${market?.question.slice(0, 20)}...\n`;
      menu += `   ${pred.prediction} (${pred.amount} ETH)\n\n`;
    });
  }
  
  menu += "# Back to Main Menu\n0. Exit";
  return menu;
}

function getBalanceMenu(session: UssdSession) {
  const inPredictions = session.predictions?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const total = parseFloat(session.balance || "0") + inPredictions;
  
  return `
💰 Account Balance

Available: ${session.balance || "0"} ETH
In Predictions: ${inPredictions.toFixed(3)} ETH
Total Value: ${total.toFixed(3)} ETH

Wallet: ${session.userWallet?.slice(0, 10)}...

# Back to Main Menu
0. Exit
  `.trim();
}

function getPlacePredictionMenu() {
  return `
🎲 Place New Prediction

1. Quick Predict (0.01 ETH)
2. Browse Markets
3. Custom Amount

# Back to Main Menu
0. Exit
  `.trim();
}

function getHistoryMenu(session: UssdSession) {
  let menu = "📜 Transaction History\n\n";
  
  if (!session.predictions || session.predictions.length === 0) {
    menu += "No transactions yet.\n\n";
  } else {
    session.predictions.slice(-3).forEach((pred, index) => {
      menu += `${pred.date}: ${pred.prediction} ${pred.amount} ETH\n`;
    });
    menu += "\n";
  }
  
  menu += "# Back to Main Menu\n0. Exit";
  return menu;
}

function getHelpMenu() {
  return `
❓ Help & Support

1. How to Predict
2. Payment Methods  
3. USSD Codes List
4. Contact Support

# Back to Main Menu
0. Exit
  `.trim();
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  if (action === 'health') {
    return NextResponse.json({ status: 'USSD API is running', timestamp: new Date().toISOString() });
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}