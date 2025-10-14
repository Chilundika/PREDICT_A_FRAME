#!/bin/bash

# Script to verify PredictAFrame contract on BaseScan
# Make sure to set your ETHERSCAN_API_KEY in .env

echo "Verifying PredictAFrame contract on Base Sepolia..."
echo "=================================================="
echo ""
echo "Please enter your deployed contract address:"
read CONTRACT_ADDRESS

echo ""
echo "Verifying with constructor argument: 0x036CbD53842c5426634e7929541eC2318f3dCF7e (USDC)"
echo ""

npx hardhat verify --network baseSepolia \
  --contract contracts/PredictAFrame.sol:PredictAFrame \
  $CONTRACT_ADDRESS \
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

echo ""
echo "Verification complete!"
echo "Check your contract at: https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#code"

