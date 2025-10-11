# Smart Contract Integration Guide

This guide explains how to deploy and integrate the PredictAFrame smart contract with your MiniKit application on Base Sepolia.

## 🚀 **Smart Contract Features**

### **Core Functionality:**
- **Prediction Market**: Users can make YES/NO predictions on market events
- **Reward Distribution**: Automatic reward calculation and distribution
- **Access Control**: BaseBuilder integration with allowed addresses
- **Event Management**: Create and resolve market events
- **Pool Management**: Track YES/NO pools and total rewards

### **Security Features:**
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Owner-only functions for contract management
- **Access Control**: Only allowed addresses can create/resolve events
- **Amount Limits**: Min 0.001 ETH, Max 10 ETH per prediction
- **Platform Fee**: 5% platform fee on rewards

## 📋 **Deployment Steps**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Set Up Environment Variables**
Create a `.env.local` file:
```bash
# Contract deployment
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key

# Contract address (set after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
```

### **3. Compile Contract**
```bash
npm run compile
```

### **4. Deploy to Base Sepolia**
```bash
npm run deploy
```

### **5. Verify Contract**
```bash
npm run verify
```

### **6. Update Configuration**
After deployment, update your environment variables with the contract address.

## 🔧 **Contract Integration**

### **Frontend Components:**
- **ContractDashboard**: Main interface for viewing events and making predictions
- **PredictionForm**: Form for making predictions
- **MarketEventCard**: Display individual market events

### **React Hooks:**
- **usePredictAFrameContract**: Main contract interaction hook
- **useMarketEvents**: Fetch and manage market events
- **useUserPredictions**: Manage user predictions

### **Contract Functions:**

#### **Read Functions:**
```typescript
// Get active market events
const events = await contract.getActiveEvents();

// Get user predictions
const predictions = await contract.getUserPredictions(userAddress);

// Get market event details
const event = await contract.getMarketEvent(eventId);

// Check if address is allowed
const isAllowed = await contract.isAddressAllowed(address);
```

#### **Write Functions:**
```typescript
// Make a prediction
await contract.makePrediction(eventId, outcome, amount);

// Claim rewards
await contract.claimRewards(predictionId);

// Create market event (allowed addresses only)
await contract.createMarketEvent(description, durationHours);

// Resolve market event (allowed addresses only)
await contract.resolveMarketEvent(eventId, outcome);
```

## 🎯 **Usage Examples**

### **Making a Prediction:**
```typescript
import { usePredictAFrameContract } from '@/app/hooks/useContract';

function PredictionComponent() {
  const { makePrediction, isLoading } = usePredictAFrameContract();

  const handlePrediction = async () => {
    try {
      await makePrediction(1, true, "0.01"); // Event ID 1, YES, 0.01 ETH
      console.log('Prediction made successfully!');
    } catch (error) {
      console.error('Prediction failed:', error);
    }
  };

  return (
    <button onClick={handlePrediction} disabled={isLoading}>
      Make Prediction
    </button>
  );
}
```

### **Viewing Market Events:**
```typescript
import { useMarketEvents } from '@/app/hooks/useContract';

function MarketEventsList() {
  const { events, isLoading } = useMarketEvents();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.description}</h3>
          <p>Pool: {event.totalPool} ETH</p>
          <p>Ends: {new Date(event.endTime * 1000).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔒 **Access Control Integration**

The smart contract integrates with your BaseBuilder access control:

### **Allowed Addresses:**
- Only addresses in the `allowedAddresses` mapping can:
  - Create market events
  - Resolve market events
  - Access admin functions

### **Default Configuration:**
```typescript
allowedAddresses["0xA67323BE0685019F6B7D2dF308E17e3C00958b05"] = true;
```

### **Adding New Addresses:**
```typescript
// Only contract owner can add new allowed addresses
await contract.addAllowedAddress(newAddress);
```

## 📊 **Contract Events**

### **Event Monitoring:**
```typescript
// Listen to prediction events
contract.on('PredictionCreated', (predictionId, user, amount, outcome) => {
  console.log(`New prediction: ${predictionId} by ${user}`);
});

// Listen to resolution events
contract.on('PredictionResolved', (eventId, outcome, totalRewards) => {
  console.log(`Event ${eventId} resolved: ${outcome}`);
});
```

## 🛠 **Development Commands**

```bash
# Compile contracts
npm run compile

# Deploy to Base Sepolia
npm run deploy

# Verify contract on Basescan
npm run verify

# Run tests (if implemented)
npm test

# Start development server
npm run dev
```

## 🔍 **Contract Verification**

After deployment, verify your contract on Basescan:
1. Get the contract address from deployment output
2. Run `npm run verify` with the contract address
3. View your contract on [Base Sepolia Explorer](https://sepolia.basescan.org)

## 📈 **Next Steps**

1. **Deploy the contract** to Base Sepolia
2. **Update environment variables** with contract address
3. **Test the integration** with your frontend
4. **Create market events** using allowed addresses
5. **Monitor contract activity** and user interactions

Your Predict-a-Frame platform now has full smart contract integration with BaseBuilder access control! 🚀
