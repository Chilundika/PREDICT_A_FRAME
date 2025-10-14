# PredictAFrame Deployment Information

## Current Deployment (Active)

**Deployment Date:** October 14, 2025  
**Network:** Base Sepolia Testnet  
**Chain ID:** 84532

### Contract Addresses

| Contract | Address | Explorer Link |
|----------|---------|---------------|
| **PredictAFrame** | `0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f` | [View on BaseScan](https://sepolia.basescan.org/address/0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f) |
| **USDC (Base Sepolia)** | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | [View on BaseScan](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e) |

### Network Information

- **RPC URL:** `https://sepolia.base.org`
- **Explorer URL:** `https://sepolia.basescan.org`
- **Chain ID:** `84532`

### Contract Configuration

```typescript
{
  contractAddress: "0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f",
  usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  network: "baseSepolia",
  chainId: 84532
}
```

### Contract Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **MIN_PREDICTION_AMOUNT** | 10,000 | 0.01 USDC (6 decimals) |
| **MAX_PREDICTION_AMOUNT** | 10,000,000,000 | 10,000 USDC (6 decimals) |
| **PLATFORM_FEE_PERCENTAGE** | 5 | 5% platform fee on winnings |

### Compiler Settings

- **Solidity Version:** `0.8.20`
- **Optimizer:** Enabled
- **Runs:** 200
- **License:** MIT

### Contract Features

✅ **Security:**
- ReentrancyGuard protection
- Ownable access control
- SafeERC20 for token transfers

✅ **Core Functions:**
- `makePrediction()` - Place predictions with USDC
- `claimRewards()` - Claim winning rewards
- `createMarketEvent()` - Create new markets (authorized only)
- `resolveMarketEvent()` - Resolve market outcomes (authorized only)

✅ **View Functions:**
- `getActiveEvents()` - Get all active markets
- `getMarketEvent()` - Get specific market details
- `getUserPredictions()` - Get user's prediction history
- `getPrediction()` - Get specific prediction details

### Authorized Addresses

**BaseBuilder Allowed Address:**
- `0xA67323BE0685019F6B7D2dF308E17e3C00958b05`

### How to Interact

#### Via BaseScan

1. **Go to Contract:** https://sepolia.basescan.org/address/0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f#writeContract
2. **Connect Wallet:** Click "Connect to Web3"
3. **Approve USDC First:**
   - Go to USDC contract: https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e#writeContract
   - Call `approve(0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f, 1000000000000)`
4. **Make Prediction:**
   - Call `makePrediction(eventId, outcome, amount)`
   - Minimum amount: 10000 (0.01 USDC)

#### Via Frontend

- **Live URL:** https://projectb-bbz9hemfc-mrincognitox1990-7888s-projects.vercel.app
- **Connect Wallet:** Connect with Coinbase Wallet or MetaMask
- **Switch Network:** Ensure you're on Base Sepolia
- **Get Testnet USDC:** https://faucet.circle.com/

### Testing Utilities

```bash
# Run contract tests
npm run test:contract

# Diagnose transaction issues
npx hardhat run scripts/diagnose-revert.ts --network baseSepolia

# Test blockchain integration
npm run test:blockchain
```

### Previous Deployments (Historical)

| Version | Contract Address | Date | Notes |
|---------|-----------------|------|-------|
| v1.0 | `0x8cc6E8E99B85a9CEd5EBF8F7A13dEd3a597A7710` | Oct 2025 | Initial deployment, 1 USDC minimum |
| v2.0 | `0xca29F50d9b54C8bf52c636861F77f6a595860Ffe` | Oct 2025 | Updated to 0.01 USDC minimum |
| **v3.0 (Current)** | **`0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f`** | **Oct 14, 2025** | **Full ABI verification, production-ready** |

---

## Verification Status

✅ **Contract Verified on BaseScan**  
✅ **Source Code Public**  
✅ **Full ABI Available**  
✅ **All Functions Visible**

---

## Support

For issues or questions:
- Check [TESTING-GUIDE.md](./TESTING-GUIDE.md)
- Review [SMART-CONTRACT-GUIDE.md](./SMART-CONTRACT-GUIDE.md)
- See [PROJECT-BUILD-STORY.md](./PROJECT-BUILD-STORY.md)

---

**Last Updated:** October 14, 2025

