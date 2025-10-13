import pkg from 'hardhat';
const { ethers } = pkg;

// Base Sepolia USDC address
const USDC_ADDRESS_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

async function main() {
  console.log("Deploying PredictAFrame contract to Base Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get the contract factory
  const PredictAFrame = await ethers.getContractFactory("PredictAFrame");

  // Deploy the contract with USDC address
  const predictAFrame = await PredictAFrame.deploy(USDC_ADDRESS_BASE_SEPOLIA);

  // Wait for deployment to complete
  await predictAFrame.waitForDeployment();

  const contractAddress = await predictAFrame.getAddress();
  console.log("PredictAFrame deployed to:", contractAddress);
  console.log("USDC Token address:", USDC_ADDRESS_BASE_SEPOLIA);

  // Verify the contract
  console.log("Waiting for block confirmations...");
  await predictAFrame.deploymentTransaction()?.wait(6);

  console.log("Contract deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("USDC Token:", USDC_ADDRESS_BASE_SEPOLIA);
  console.log("Network: Base Sepolia");
  console.log("Explorer: https://sepolia.basescan.org/address/" + contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    usdcAddress: USDC_ADDRESS_BASE_SEPOLIA,
    network: "baseSepolia",
    chainId: 84532,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
