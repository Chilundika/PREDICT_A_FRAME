# PredictAFrame Quick Reference

## 🎯 Contract Information

```
Contract Address: 0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f
USDC Address:     0x036CbD53842c5426634e7929541eC2318f3dCF7e
Network:          Base Sepolia (84532)
Explorer:         https://sepolia.basescan.org
```

## 📝 Common Tasks

### Make a Prediction

```typescript
// 1. Approve USDC first
await usdc.approve(contractAddress, amount);

// 2. Make prediction
await contract.makePrediction(
  eventId,      // uint256: Event ID to predict on
  true,         // bool: true = YES, false = NO
  10000         // uint256: Amount (0.01 USDC = 10000 with 6 decimals)
);
```

### Create Market Event (Authorized Only)

```typescript
await contract.createMarketEvent(
  "Will ETH reach $5000?",  // string: Description
  168                         // uint256: Duration in hours (7 days)
);
```

### Claim Rewards

```typescript
await contract.claimRewards(predictionId);
```

### Get Active Events

```typescript
const events = await contract.getActiveEvents();
```

## 💰 Amounts (USDC has 6 decimals)

| Display | Raw Value | Code |
|---------|-----------|------|
| 0.01 USDC | 10,000 | `10000` (minimum) |
| 1 USDC | 1,000,000 | `1000000` |
| 10 USDC | 10,000,000 | `10000000` |
| 100 USDC | 100,000,000 | `100000000` |
| 10,000 USDC | 10,000,000,000 | `10000000000` (maximum) |

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Contract** | https://sepolia.basescan.org/address/0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f |
| **Write Contract** | https://sepolia.basescan.org/address/0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f#writeContract |
| **Read Contract** | https://sepolia.basescan.org/address/0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f#readContract |
| **USDC Contract** | https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e |
| **Get Testnet USDC** | https://faucet.circle.com/ |

## ⚠️ Common Issues

### Transaction Reverts

**Error: "Address not authorized"**
- Only allowed addresses can create/resolve events
- Default allowed: `0xA67323BE0685019F6B7D2dF308E17e3C00958b05`

**Error: "Amount too low"**
- Minimum: 0.01 USDC = 10,000 (raw value)

**Error: "ERC20: insufficient allowance"**
- Must approve USDC spending first
- Call: `usdc.approve(contractAddress, amount)`

**Error: "Event does not exist"**
- eventId must be ≥ 1 and < nextEventId
- Check with `getActiveEvents()`

**Error: "Event already resolved"**
- Cannot predict on resolved events

**Error: "Event has ended"**
- Event endTime has passed

## 🧪 Testing Commands

```bash
# Compile contract
npx hardhat compile

# Run tests
npm run test:contract

# Diagnose issues
npx hardhat run scripts/diagnose-revert.ts --network baseSepolia

# Verify contract
npx hardhat verify --network baseSepolia CONTRACT_ADDRESS "USDC_ADDRESS"
```

## 📦 Import in Your Code

```typescript
// Import ABI and addresses
import { 
  PREDICT_A_FRAME_ABI, 
  CONTRACT_ADDRESS, 
  USDC_ADDRESS 
} from '@/lib/contract-abi';

// Import configuration
import { CONTRACT_CONFIG } from '@/lib/contract';

// Use in ethers.js
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  PREDICT_A_FRAME_ABI,
  signer
);

// Use hooks in React
import { usePredictAFrameContract } from '@/app/hooks/useContract';

function MyComponent() {
  const { contract, makePrediction, getActiveEvents } = usePredictAFrameContract();
  // ...
}
```

## 🔐 Security Constants

```
MIN_PREDICTION_AMOUNT = 10,000 (0.01 USDC)
MAX_PREDICTION_AMOUNT = 10,000,000,000 (10,000 USDC)
PLATFORM_FEE_PERCENTAGE = 5 (5%)
```

---

**Last Updated:** October 14, 2025

