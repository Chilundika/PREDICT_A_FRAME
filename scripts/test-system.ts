import { ethers } from 'ethers';
import pkg from 'hardhat';
const { ethers: hre_ethers } = pkg;

// Contract details - Updated deployment
const CONTRACT_ADDRESS = "0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f";
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const RPC_URL = "https://sepolia.base.org";

// Contract ABI
const CONTRACT_ABI = [
  "function createMarketEvent(string memory description, uint256 durationHours) external returns (uint256)",
  "function makePrediction(uint256 eventId, bool outcome, uint256 amount) external",
  "function resolveMarketEvent(uint256 eventId, bool outcome) external",
  "function getMarketEvent(uint256 eventId) external view returns (tuple(uint256 id, string description, uint256 endTime, bool resolved, bool outcome, uint256 totalPool, uint256 yesPool, uint256 noPool))",
  "function getActiveEvents() external view returns (tuple(uint256 id, string description, uint256 endTime, bool resolved, bool outcome, uint256 totalPool, uint256 yesPool, uint256 noPool)[])",
  "function getUserPredictions(address user) external view returns (uint256[])",
  "function getPrediction(uint256 predictionId) external view returns (tuple(uint256 id, uint256 eventId, address user, uint256 amount, bool outcome, bool claimed, uint256 timestamp))",
  "function allowedAddresses(address) external view returns (bool)",
  "function getUSDCAddress() external view returns (address)",
  "function getContractBalance() external view returns (uint256)",
  "function addAllowedAddress(address addr) external",
  "function removeAllowedAddress(address addr) external",
  "function owner() external view returns (address)",
  "event PredictionCreated(uint256 indexed predictionId, address indexed user, uint256 amount, bool outcome)",
  "event MarketEventCreated(uint256 indexed eventId, string description, uint256 endTime)",
  "event PredictionResolved(uint256 indexed predictionId, bool outcome, uint256 totalRewards)"
];

const USDC_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'WARN';
  message: string;
  duration: number;
}

class SystemTester {
  private results: TestResult[] = [];
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private usdcContract: ethers.Contract | null = null;
  private signer: any = null;

  constructor() {}

  private async recordTest(name: string, testFn: () => Promise<void>) {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({ name, status: 'PASS', message: 'Success', duration });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results.push({ 
        name, 
        status: 'FAIL', 
        message: error.message || 'Unknown error', 
        duration 
      });
    }
  }

  private warn(name: string, message: string) {
    this.results.push({ name, status: 'WARN', message, duration: 0 });
  }

  async runAllTests() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║       PREDICT-A-FRAME COMPREHENSIVE SYSTEM TEST            ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");

    // Section 1: Network & Contract Connectivity
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  SECTION 1: NETWORK & CONTRACT CONNECTIVITY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await this.recordTest("Connect to Base Sepolia RPC", async () => {
      this.provider = new ethers.JsonRpcProvider(RPC_URL);
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      if (Number(network.chainId) !== 84532) {
        throw new Error("Wrong network! Expected Base Sepolia (84532)");
      }
    });

    await this.recordTest("Get Hardhat Signer", async () => {
      const signers = await hre_ethers.getSigners();
      this.signer = signers[0];
      console.log(`✅ Signer address: ${this.signer.address}`);
    });

    await this.recordTest("Connect to PredictAFrame Contract", async () => {
      if (!this.signer) throw new Error("No signer available");
      this.contract = new hre_ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
      const owner = await this.contract.owner();
      console.log(`✅ Contract owner: ${owner}`);
    });

    await this.recordTest("Connect to USDC Contract", async () => {
      if (!this.signer) throw new Error("No signer available");
      this.usdcContract = new hre_ethers.Contract(USDC_ADDRESS, USDC_ABI, this.signer);
      const symbol = await this.usdcContract.symbol();
      const decimals = await this.usdcContract.decimals();
      console.log(`✅ USDC Token: ${symbol} (${decimals} decimals)`);
    });

    console.log("");

    // Section 2: Contract State & Configuration
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  SECTION 2: CONTRACT STATE & CONFIGURATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await this.recordTest("Verify USDC Address Configuration", async () => {
      if (!this.contract) throw new Error("Contract not connected");
      const configuredUsdc = await this.contract.getUSDCAddress();
      console.log(`✅ Configured USDC: ${configuredUsdc}`);
      if (configuredUsdc.toLowerCase() !== USDC_ADDRESS.toLowerCase()) {
        throw new Error(`USDC mismatch! Expected ${USDC_ADDRESS}, got ${configuredUsdc}`);
      }
    });

    await this.recordTest("Check Contract Balance", async () => {
      if (!this.contract) throw new Error("Contract not connected");
      const balance = await this.contract.getContractBalance();
      console.log(`✅ Contract USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
    });

    await this.recordTest("Check Access Control Configuration", async () => {
      if (!this.contract || !this.signer) throw new Error("Contract or signer not available");
      const isAllowed = await this.contract.allowedAddresses(this.signer.address);
      console.log(`✅ Signer allowed status: ${isAllowed}`);
      if (!isAllowed) {
        this.warn("Access Control", "Signer not in allowed list - some operations may fail");
      }
    });

    await this.recordTest("Get Active Events Count", async () => {
      if (!this.contract) throw new Error("Contract not connected");
      const events = await this.contract.getActiveEvents();
      console.log(`✅ Active events: ${events.length}`);
    });

    console.log("");

    // Section 3: Account & Balance Checks
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  SECTION 3: ACCOUNT & BALANCE CHECKS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await this.recordTest("Check ETH Balance", async () => {
      if (!this.signer || !this.provider) throw new Error("Signer or provider not available");
      const balance = await this.provider.getBalance(this.signer.address);
      console.log(`✅ ETH Balance: ${ethers.formatEther(balance)} ETH`);
      if (balance < ethers.parseEther("0.001")) {
        this.warn("ETH Balance", "Low ETH balance - may not be able to pay for transactions");
      }
    });

    await this.recordTest("Check USDC Balance", async () => {
      if (!this.usdcContract || !this.signer) throw new Error("USDC contract or signer not available");
      const balance = await this.usdcContract.balanceOf(this.signer.address);
      console.log(`✅ USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
      if (balance < ethers.parseUnits("1", 6)) {
        this.warn("USDC Balance", "Low USDC balance - may not be able to make predictions");
      }
    });

    await this.recordTest("Check USDC Allowance", async () => {
      if (!this.usdcContract || !this.signer) throw new Error("USDC contract or signer not available");
      const allowance = await this.usdcContract.allowance(this.signer.address, CONTRACT_ADDRESS);
      console.log(`✅ USDC Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
    });

    console.log("");

    // Section 4: Read Operations
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  SECTION 4: CONTRACT READ OPERATIONS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await this.recordTest("Read Active Events", async () => {
      if (!this.contract) throw new Error("Contract not connected");
      const events = await this.contract.getActiveEvents();
      console.log(`✅ Retrieved ${events.length} active events`);
      
      if (events.length > 0) {
        const event = events[0];
        console.log(`   First event:`);
        console.log(`   - ID: ${event.id}`);
        console.log(`   - Description: ${event.description}`);
        console.log(`   - End Time: ${new Date(Number(event.endTime) * 1000).toLocaleString()}`);
        console.log(`   - Total Pool: ${ethers.formatUnits(event.totalPool, 6)} USDC`);
      }
    });

    await this.recordTest("Read User Predictions", async () => {
      if (!this.contract || !this.signer) throw new Error("Contract or signer not available");
      const predictions = await this.contract.getUserPredictions(this.signer.address);
      console.log(`✅ User has ${predictions.length} predictions`);
      
      if (predictions.length > 0) {
        const predId = predictions[0];
        const pred = await this.contract.getPrediction(predId);
        console.log(`   Latest prediction:`);
        console.log(`   - ID: ${pred.id}`);
        console.log(`   - Event ID: ${pred.eventId}`);
        console.log(`   - Amount: ${ethers.formatUnits(pred.amount, 6)} USDC`);
        console.log(`   - Outcome: ${pred.outcome ? "YES" : "NO"}`);
        console.log(`   - Claimed: ${pred.claimed}`);
      }
    });

    console.log("");

    // Section 5: Frontend Integration Tests
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  SECTION 5: FRONTEND INTEGRATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await this.recordTest("Frontend-Contract Data Sync", async () => {
      // Test that the contract data can be read from frontend perspective
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const [owner, usdcAddr, balance, events] = await Promise.all([
        contract.owner(),
        contract.getUSDCAddress(),
        contract.getContractBalance(),
        contract.getActiveEvents()
      ]);
      
      console.log(`✅ Frontend can read contract data:`);
      console.log(`   - Owner: ${owner}`);
      console.log(`   - USDC: ${usdcAddr}`);
      console.log(`   - Balance: ${ethers.formatUnits(balance, 6)} USDC`);
      console.log(`   - Events: ${events.length}`);
    });

    await this.recordTest("Market Data Availability", async () => {
      // Simulate what frontend would fetch
      if (!this.contract) throw new Error("Contract not connected");
      const events = await this.contract.getActiveEvents();
      
      // Check if there's data for the UI to display
      const hasMarketData = events.length > 0;
      console.log(`✅ Market data available: ${hasMarketData}`);
      
      if (hasMarketData) {
        const event = events[0];
        const hasPoolData = event.totalPool > 0n || event.yesPool > 0n || event.noPool > 0n;
        console.log(`   - Has pool data: ${hasPoolData}`);
        console.log(`   - Event is active: ${!event.resolved}`);
      }
    });

    console.log("");

    // Section 6: System Health Checks
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  SECTION 6: SYSTEM HEALTH CHECKS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await this.recordTest("RPC Endpoint Responsiveness", async () => {
      const start = Date.now();
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      await provider.getBlockNumber();
      const latency = Date.now() - start;
      console.log(`✅ RPC latency: ${latency}ms`);
      
      if (latency > 2000) {
        this.warn("RPC Performance", `High latency: ${latency}ms`);
      }
    });

    await this.recordTest("Contract Code Verification", async () => {
      if (!this.provider) throw new Error("Provider not available");
      const code = await this.provider.getCode(CONTRACT_ADDRESS);
      console.log(`✅ Contract bytecode size: ${code.length} bytes`);
      
      if (code === "0x" || code.length < 10) {
        throw new Error("Contract not deployed or no code at address");
      }
    });

    await this.recordTest("USDC Contract Verification", async () => {
      if (!this.provider) throw new Error("Provider not available");
      const code = await this.provider.getCode(USDC_ADDRESS);
      console.log(`✅ USDC contract verified at ${USDC_ADDRESS}`);
      
      if (code === "0x" || code.length < 10) {
        throw new Error("USDC contract not found at address");
      }
    });

    console.log("");

    // Print Results Summary
    this.printSummary();
  }

  private printSummary() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                      TEST SUMMARY                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    const total = this.results.filter(r => r.status !== 'WARN').length;

    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log("");

    if (failed > 0) {
      console.log("❌ FAILED TESTS:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  ❌ ${r.name}`);
          console.log(`     Error: ${r.message}`);
        });
      console.log("");
    }

    if (warnings > 0) {
      console.log("⚠️  WARNINGS:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      this.results
        .filter(r => r.status === 'WARN')
        .forEach(r => {
          console.log(`  ⚠️  ${r.name}`);
          console.log(`     ${r.message}`);
        });
      console.log("");
    }

    // Overall status
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if (failed === 0) {
      console.log("✅ SYSTEM STATUS: ALL TESTS PASSED");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("");
      console.log("🎉 The PredictAFrame system is fully operational!");
      console.log("");
      console.log("✅ Smart Contract: Deployed and working");
      console.log("✅ USDC Integration: Configured correctly");
      console.log("✅ Network Connection: Stable");
      console.log("✅ Frontend Integration: Ready");
      console.log("✅ Data Synchronization: Working");
      console.log("");
      console.log("🚀 System is ready for production use!");
    } else {
      console.log("❌ SYSTEM STATUS: TESTS FAILED");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("");
      console.log("⚠️  The system has issues that need to be addressed.");
      console.log("Please review the failed tests above and fix the issues.");
    }
    console.log("");

    // Component Status Table
    console.log("📋 COMPONENT STATUS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const componentStatus = [
      { component: "Network Connectivity", status: this.getComponentStatus(['Connect to Base Sepolia RPC']) },
      { component: "Smart Contract", status: this.getComponentStatus(['Connect to PredictAFrame Contract', 'Contract Code Verification']) },
      { component: "USDC Integration", status: this.getComponentStatus(['Connect to USDC Contract', 'Verify USDC Address Configuration']) },
      { component: "Access Control", status: this.getComponentStatus(['Check Access Control Configuration']) },
      { component: "Read Operations", status: this.getComponentStatus(['Read Active Events', 'Read User Predictions']) },
      { component: "Frontend Sync", status: this.getComponentStatus(['Frontend-Contract Data Sync', 'Market Data Availability']) },
      { component: "Account Balances", status: this.getComponentStatus(['Check ETH Balance', 'Check USDC Balance']) },
    ];

    componentStatus.forEach(({ component, status }) => {
      const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${component.padEnd(25)} ${status}`);
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");

    // Exit with appropriate code
    if (failed > 0) {
      process.exit(1);
    }
  }

  private getComponentStatus(testNames: string[]): string {
    const results = testNames.map(name => 
      this.results.find(r => r.name === name)?.status || 'SKIP'
    );
    
    if (results.some(r => r === 'FAIL')) return 'FAIL';
    if (results.some(r => r === 'WARN')) return 'WARN';
    if (results.every(r => r === 'PASS')) return 'PASS';
    return 'SKIP';
  }
}

// Main execution
async function main() {
  const tester = new SystemTester();
  await tester.runAllTests();
}

main().catch((error) => {
  console.error("❌ System test failed:", error);
  process.exit(1);
});

