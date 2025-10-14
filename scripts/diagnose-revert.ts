import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0x4A0C3Ab95be5e95f1bdCde88D5A15D87C366258f";
const USER_ADDRESS = "0xe785cfac1bf5428fa52867a0d9ed5962bbc1537d"; // From your transaction

async function diagnose() {
  console.log("🔍 PredictAFrame Transaction Revert Diagnosis");
  console.log("=".repeat(60));
  console.log();

  const [signer] = await ethers.getSigners();
  const PredictAFrame = await ethers.getContractAt("PredictAFrame", CONTRACT_ADDRESS);

  try {
    // Check contract details
    console.log("📋 Contract Info:");
    console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`User Address: ${USER_ADDRESS}`);
    console.log();

    // Get USDC address
    const usdcAddress = await PredictAFrame.getUSDCAddress();
    console.log(`USDC Token Address: ${usdcAddress}`);
    
    const USDC = await ethers.getContractAt("IERC20", usdcAddress);

    // Check USDC balance
    const balance = await USDC.balanceOf(USER_ADDRESS);
    console.log(`USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);

    // Check USDC allowance
    const allowance = await USDC.allowance(USER_ADDRESS, CONTRACT_ADDRESS);
    console.log(`USDC Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
    console.log();

    // Check minimum and maximum amounts
    const minAmount = await PredictAFrame.MIN_PREDICTION_AMOUNT();
    const maxAmount = await PredictAFrame.MAX_PREDICTION_AMOUNT();
    console.log("💰 Prediction Limits:");
    console.log(`Min Amount: ${ethers.formatUnits(minAmount, 6)} USDC (${minAmount.toString()} raw)`);
    console.log(`Max Amount: ${ethers.formatUnits(maxAmount, 6)} USDC (${maxAmount.toString()} raw)`);
    console.log();

    // Check active events
    console.log("📅 Active Events:");
    const nextEventId = await PredictAFrame.nextEventId();
    console.log(`Next Event ID: ${nextEventId}`);
    
    if (Number(nextEventId) > 1) {
      console.log("\nChecking events...");
      for (let i = 1; i < Number(nextEventId); i++) {
        try {
          const event = await PredictAFrame.marketEvents(i);
          const currentTime = Math.floor(Date.now() / 1000);
          const isActive = !event.resolved && Number(event.endTime) > currentTime;
          
          console.log(`\nEvent ${i}:`);
          console.log(`  Description: ${event.description}`);
          console.log(`  End Time: ${new Date(Number(event.endTime) * 1000).toLocaleString()}`);
          console.log(`  Resolved: ${event.resolved}`);
          console.log(`  Active: ${isActive ? "✅ YES" : "❌ NO"}`);
          console.log(`  Total Pool: ${ethers.formatUnits(event.totalPool, 6)} USDC`);
        } catch (e) {
          console.log(`Event ${i}: Not found or inaccessible`);
        }
      }
    } else {
      console.log("⚠️  NO EVENTS CREATED YET!");
    }
    console.log();

    // Check if user is allowed address
    const isAllowed = await PredictAFrame.allowedAddresses(USER_ADDRESS);
    console.log("🔐 Authorization:");
    console.log(`Is Allowed Address: ${isAllowed ? "✅ YES" : "❌ NO"}`);
    console.log();

    // Provide recommendations
    console.log("💡 Recommendations:");
    console.log("=".repeat(60));
    
    if (balance < minAmount) {
      console.log("❌ ISSUE: Insufficient USDC balance");
      console.log(`   You need at least ${ethers.formatUnits(minAmount, 6)} USDC`);
      console.log(`   Get testnet USDC from: https://faucet.circle.com/`);
    }
    
    if (allowance < minAmount) {
      console.log("❌ ISSUE: Insufficient USDC allowance");
      console.log(`   You need to approve the contract to spend USDC`);
      console.log(`   Run: USDC.approve("${CONTRACT_ADDRESS}", amount)`);
    }
    
    if (Number(nextEventId) <= 1) {
      console.log("❌ ISSUE: No events exist");
      console.log(`   An authorized address must create an event first`);
    }

    if (balance >= minAmount && allowance >= minAmount && Number(nextEventId) > 1) {
      console.log("✅ Everything looks good! The revert might be due to:");
      console.log("   - Trying to predict on an ended/resolved event");
      console.log("   - Amount below minimum (0.01 USDC = 10000 raw)");
      console.log("   - Network/gas issues");
    }

  } catch (error: any) {
    console.error("❌ Error running diagnostics:", error.message);
  }
}

diagnose()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

