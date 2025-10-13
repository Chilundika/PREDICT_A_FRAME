# PredictAFrame Testing Guide

This guide provides instructions for running all available tests in the PredictAFrame system.

## Quick Start

Run all tests with a single command:

```bash
npm run test:all
```

Or run individual test suites as needed.

---

## Available Test Suites

### 1. Comprehensive System Test (Recommended)

**File:** `scripts/test-system.ts`  
**Purpose:** Tests all system components in one comprehensive suite  
**Coverage:** 18 tests across 6 categories

```bash
npx hardhat run scripts/test-system.ts --network baseSepolia
```

**Tests Include:**
- Network & contract connectivity (4 tests)
- Contract state & configuration (4 tests)
- Account & balance checks (3 tests)
- Contract read operations (2 tests)
- Frontend integration (2 tests)
- System health checks (3 tests)

**Expected Duration:** ~30 seconds  
**Prerequisites:** 
- Configured PRIVATE_KEY in environment
- Base Sepolia RPC access
- Minimal ETH for gas (not required for read-only tests)

---

### 2. API Endpoints Structure Test

**File:** `scripts/test-api-endpoints.ts`  
**Purpose:** Validates API endpoint file structure and HTTP methods

```bash
npx tsx scripts/test-api-endpoints.ts
```

**Tests Include:**
- Notify API endpoint validation
- Validate Address API endpoint validation
- Webhook API endpoint validation
- Protected Example API endpoint validation

**Expected Duration:** <1 second  
**Prerequisites:** None (offline test)

---

### 3. Smart Contract Functionality Test

**File:** `scripts/test-contract.ts`  
**Purpose:** Deep testing of smart contract functions

```bash
npx hardhat run scripts/test-contract.ts --network baseSepolia
```

**Tests Include:**
- Basic contract information
- Access control testing
- USDC token integration
- Market event creation
- Active events retrieval
- USDC balances checking
- Prediction creation
- User prediction retrieval
- Contract constants verification
- Event resolution and reward claiming

**Expected Duration:** 1-2 minutes (includes write operations)  
**Prerequisites:**
- Configured PRIVATE_KEY
- Sufficient ETH for gas
- USDC tokens for predictions

---

### 4. Frontend-Contract Sync Test

**File:** `scripts/test-frontend-sync.ts`  
**Purpose:** Verifies frontend can read contract data

```bash
npx tsx scripts/test-frontend-sync.ts
```

**Tests Include:**
- Contract owner reading
- USDC address verification
- Contract balance reading
- Active events retrieval
- Access control verification

**Expected Duration:** ~10 seconds  
**Prerequisites:** Base Sepolia RPC access

---

### 5. Real Blockchain End-to-End Test

**File:** `scripts/test-real-blockchain.ts`  
**Purpose:** Complete end-to-end testing on live blockchain

```bash
npx hardhat run scripts/test-real-blockchain.ts --network baseSepolia
```

**Tests Include:**
- Account balance checks
- Adding allowed addresses
- Creating market events
- Event verification
- USDC approval
- Making predictions (YES/NO)
- Pool updates verification
- User predictions verification
- Active events listing
- Contract balance verification

**Expected Duration:** 2-3 minutes (multiple transactions)  
**Prerequisites:**
- Configured PRIVATE_KEY
- Sufficient ETH for gas (~0.01 ETH recommended)
- USDC tokens (~5 USDC recommended)

---

### 6. Build Test

**Purpose:** Verifies Next.js application builds successfully

```bash
npm run build
```

**Tests Include:**
- TypeScript compilation
- Linting
- Static page generation
- Bundle optimization
- Route generation

**Expected Duration:** 20-30 seconds  
**Prerequisites:** Node.js dependencies installed

---

### 7. Development Server Test

**Purpose:** Starts the development server to test frontend

```bash
npm run dev
```

**Access:** http://localhost:3000  
**Prerequisites:** Node.js dependencies installed

---

## Test Results Interpretation

### ✅ Success Indicators

- All tests pass with green checkmarks
- No error messages in output
- Exit code 0
- "SYSTEM STATUS: ALL TESTS PASSED" message

### ❌ Failure Indicators

- Red X marks in output
- Error messages or stack traces
- Exit code 1
- "SYSTEM STATUS: TESTS FAILED" message

### ⚠️ Warning Indicators

- Yellow warning icons
- "Warning:" messages
- Tests pass but with notes
- Non-blocking issues

---

## Common Issues & Solutions

### Issue: "Low ETH Balance" Warning

**Cause:** Insufficient ETH for transaction gas fees  
**Solution:** 
```bash
# Get testnet ETH from Base Sepolia faucet
# Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
```

### Issue: "Low USDC Balance" Warning

**Cause:** Insufficient USDC for making predictions  
**Solution:**
```bash
# Get testnet USDC from Circle faucet
# Visit: https://faucet.circle.com/
```

### Issue: "Provider connection failed"

**Cause:** Network connectivity or RPC issues  
**Solution:**
- Check internet connection
- Verify RPC URL is correct: https://sepolia.base.org
- Try again in a few moments

### Issue: "Contract not found"

**Cause:** Wrong network or contract not deployed  
**Solution:**
- Verify you're on Base Sepolia (Chain ID: 84532)
- Check contract address is correct
- Ensure contract is deployed

### Issue: "Signer not allowed"

**Cause:** Address not in allowed addresses list  
**Solution:**
```bash
# Run the test that adds your address to allowed list
npx hardhat run scripts/test-contract.ts --network baseSepolia
```

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the `projectb` directory:

```bash
# Required for contract interaction
PRIVATE_KEY=your_private_key_here

# Optional for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional for notifications
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token

# Frontend environment variables
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=PredictAFrame
NEXT_PUBLIC_URL=http://localhost:3000
```

### Network Configuration

The system is configured for **Base Sepolia Testnet**:
- **Network Name:** Base Sepolia
- **Chain ID:** 84532
- **RPC URL:** https://sepolia.base.org
- **Block Explorer:** https://sepolia.basescan.org

---

## Test Coverage Summary

| Component | Test Coverage | Test Files |
|-----------|---------------|------------|
| Smart Contract | ✅ Complete | test-system.ts, test-contract.ts, test-real-blockchain.ts |
| USDC Integration | ✅ Complete | test-system.ts, test-contract.ts |
| Network Connectivity | ✅ Complete | test-system.ts, test-frontend-sync.ts |
| Frontend Integration | ✅ Complete | test-system.ts, test-frontend-sync.ts |
| API Endpoints | ✅ Complete | test-api-endpoints.ts |
| Build Process | ✅ Complete | npm run build |
| Access Control | ✅ Complete | test-system.ts, test-contract.ts |
| Event Management | ✅ Complete | test-contract.ts, test-real-blockchain.ts |
| Prediction System | ✅ Complete | test-contract.ts, test-real-blockchain.ts |

---

## Continuous Testing Strategy

### Before Deployment
1. Run comprehensive system test
2. Run build test
3. Review warnings and resolve critical issues

### During Development
1. Run API endpoint tests after API changes
2. Run contract tests after contract modifications
3. Run build frequently to catch compilation errors

### After Major Changes
1. Run full end-to-end blockchain test
2. Verify frontend-contract sync
3. Test complete user flow

---

## Adding New Tests

### Creating a New Test File

1. Create file in `scripts/` directory
2. Import required dependencies:
   ```typescript
   import { ethers } from 'ethers';
   import pkg from 'hardhat';
   const { ethers: hre_ethers } = pkg;
   ```

3. Follow the pattern from existing tests
4. Add proper error handling
5. Include descriptive console output
6. Document in this guide

### Test File Template

```typescript
import { ethers } from 'ethers';

async function testMyFeature() {
  console.log("🧪 Testing My Feature...\n");
  
  try {
    // Your test code here
    console.log("✅ Test passed");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testMyFeature().catch((error) => {
  console.error("❌ Test suite failed:", error);
  process.exit(1);
});
```

---

## Test Data

### Current Contract State (as of last test)
- **Active Events:** 4
- **Contract Balance:** 4.0 USDC
- **User Predictions:** 4
- **Sample Event:** "Will Bitcoin reach $100k by end of 2024?"

### Test Accounts
- **Deployer/Owner:** `0xe785cfAc1bF5428FA52867a0D9Ed5962Bbc1537D`
- **Contract Address:** `0xca29F50d9b54C8bf52c636861F77f6a595860Ffe`
- **USDC Address:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

---

## Performance Benchmarks

Based on recent test runs:

- **RPC Latency:** ~374ms (Good)
- **Contract Read:** <500ms
- **Contract Write:** 2-5 seconds (includes confirmation)
- **Build Time:** ~26 seconds
- **Full System Test:** ~30 seconds
- **End-to-End Test:** 2-3 minutes

---

## Troubleshooting Commands

### Check Network Connection
```bash
curl -X POST https://sepolia.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Verify Contract Exists
```bash
npx hardhat run --network baseSepolia -c "
const contract = await ethers.getContractAt('PredictAFrame', '0xca29F50d9b54C8bf52c636861F77f6a595860Ffe');
console.log('Owner:', await contract.owner());
"
```

### Check Account Balance
```bash
npx hardhat run --network baseSepolia -c "
const [signer] = await ethers.getSigners();
const balance = await ethers.provider.getBalance(signer.address);
console.log('Balance:', ethers.formatEther(balance), 'ETH');
"
```

---

## Support & Resources

- **Test Report:** See `TEST-REPORT.md` for latest test results
- **Contract Guide:** See `SMART-CONTRACT-GUIDE.md`
- **Project Documentation:** See `PREDICT-A-FRAME-DOCUMENTATION.md`
- **Base Documentation:** https://docs.base.org
- **Hardhat Documentation:** https://hardhat.org/docs

---

## Maintenance Schedule

### Daily (During Active Development)
- Run comprehensive system test
- Check build passes

### Weekly
- Run full end-to-end blockchain test
- Review and update test data
- Check for deprecated dependencies

### Before Each Release
- Run all test suites
- Review all warnings
- Update test documentation
- Generate new test report

---

**Last Updated:** October 13, 2025  
**Test Suite Version:** 1.0  
**Maintained By:** PredictAFrame Development Team

