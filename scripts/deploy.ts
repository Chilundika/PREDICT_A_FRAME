import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PredictAFrame contract to Base Sepolia...");

  // Get the contract factory
  const PredictAFrame = await ethers.getContractFactory("PredictAFrame");

  // Deploy the contract
  const predictAFrame = await PredictAFrame.deploy();

  // Wait for deployment to complete
  await predictAFrame.waitForDeployment();

  const contractAddress = await predictAFrame.getAddress();
  console.log("PredictAFrame deployed to:", contractAddress);

  // Verify the contract
  console.log("Waiting for block confirmations...");
  await predictAFrame.deploymentTransaction()?.wait(6);

  console.log("Contract deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Base Sepolia");
  console.log("Explorer: https://sepolia.basescan.org/address/" + contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: "baseSepolia",
    chainId: 84532,
    deployer: await predictAFrame.runner?.getAddress(),
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
