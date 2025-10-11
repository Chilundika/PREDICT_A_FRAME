// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PredictAFrame
 * @dev A decentralized prediction market contract for Base Sepolia
 * @notice Allows users to make predictions on market events and earn rewards
 */
contract PredictAFrame is ReentrancyGuard, Ownable {
    // Events
    event PredictionCreated(uint256 indexed predictionId, address indexed user, uint256 amount, bool outcome);
    event PredictionResolved(uint256 indexed predictionId, bool outcome, uint256 totalRewards);
    event MarketEventCreated(uint256 indexed eventId, string description, uint256 endTime);
    event RewardsDistributed(uint256 indexed predictionId, address indexed user, uint256 amount);

    // Structs
    struct MarketEvent {
        uint256 id;
        string description;
        uint256 endTime;
        bool resolved;
        bool outcome;
        uint256 totalPool;
        uint256 yesPool;
        uint256 noPool;
    }

    struct Prediction {
        uint256 id;
        uint256 eventId;
        address user;
        uint256 amount;
        bool outcome; // true for YES, false for NO
        bool claimed;
        uint256 timestamp;
    }

    // State variables
    mapping(uint256 => MarketEvent) public marketEvents;
    mapping(uint256 => Prediction) public predictions;
    mapping(address => uint256[]) public userPredictions;
    mapping(uint256 => uint256[]) public eventPredictions;
    
    uint256 public nextEventId = 1;
    uint256 public nextPredictionId = 1;
    
    // BaseBuilder access control
    mapping(address => bool) public allowedAddresses;
    
    // Constants
    uint256 public constant MIN_PREDICTION_AMOUNT = 0.001 ether;
    uint256 public constant MAX_PREDICTION_AMOUNT = 10 ether;
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 5; // 5%
    
    constructor() {
        // Add the BaseBuilder allowed address
        allowedAddresses[0xA67323BE0685019F6B7D2dF308E17e3C00958b05] = true;
    }

    // Modifiers
    modifier onlyAllowedAddress() {
        require(allowedAddresses[msg.sender], "Address not authorized");
        _;
    }

    modifier validPredictionAmount(uint256 amount) {
        require(amount >= MIN_PREDICTION_AMOUNT, "Amount too low");
        require(amount <= MAX_PREDICTION_AMOUNT, "Amount too high");
        _;
    }

    modifier eventExists(uint256 eventId) {
        require(eventId > 0 && eventId < nextEventId, "Event does not exist");
        _;
    }

    modifier eventNotResolved(uint256 eventId) {
        require(!marketEvents[eventId].resolved, "Event already resolved");
        require(block.timestamp < marketEvents[eventId].endTime, "Event has ended");
        _;
    }

    // Owner functions
    function addAllowedAddress(address addr) external onlyOwner {
        allowedAddresses[addr] = true;
    }

    function removeAllowedAddress(address addr) external onlyOwner {
        allowedAddresses[addr] = false;
    }

    function createMarketEvent(
        string memory description,
        uint256 durationHours
    ) external onlyAllowedAddress returns (uint256) {
        uint256 eventId = nextEventId++;
        uint256 endTime = block.timestamp + (durationHours * 1 hours);
        
        marketEvents[eventId] = MarketEvent({
            id: eventId,
            description: description,
            endTime: endTime,
            resolved: false,
            outcome: false,
            totalPool: 0,
            yesPool: 0,
            noPool: 0
        });

        emit MarketEventCreated(eventId, description, endTime);
        return eventId;
    }

    function resolveMarketEvent(uint256 eventId, bool outcome) external onlyAllowedAddress eventExists(eventId) {
        MarketEvent storage event_ = marketEvents[eventId];
        require(!event_.resolved, "Event already resolved");
        require(block.timestamp >= event_.endTime, "Event not yet ended");
        
        event_.resolved = true;
        event_.outcome = outcome;

        // Distribute rewards
        _distributeRewards(eventId, outcome);
        
        emit PredictionResolved(eventId, outcome, event_.totalPool);
    }

    // Public functions
    function makePrediction(
        uint256 eventId,
        bool outcome
    ) external payable nonReentrant eventExists(eventId) eventNotResolved(eventId) validPredictionAmount(msg.value) {
        require(msg.value > 0, "Must send ETH");
        
        uint256 predictionId = nextPredictionId++;
        
        predictions[predictionId] = Prediction({
            id: predictionId,
            eventId: eventId,
            user: msg.sender,
            amount: msg.value,
            outcome: outcome,
            claimed: false,
            timestamp: block.timestamp
        });

        userPredictions[msg.sender].push(predictionId);
        eventPredictions[eventId].push(predictionId);

        // Update pools
        MarketEvent storage event_ = marketEvents[eventId];
        event_.totalPool += msg.value;
        if (outcome) {
            event_.yesPool += msg.value;
        } else {
            event_.noPool += msg.value;
        }

        emit PredictionCreated(predictionId, msg.sender, msg.value, outcome);
    }

    function claimRewards(uint256 predictionId) external nonReentrant {
        Prediction storage prediction = predictions[predictionId];
        require(prediction.user == msg.sender, "Not your prediction");
        require(!prediction.claimed, "Already claimed");
        
        MarketEvent storage event_ = marketEvents[prediction.eventId];
        require(event_.resolved, "Event not resolved");
        require(event_.outcome == prediction.outcome, "Prediction was wrong");

        prediction.claimed = true;
        
        // Calculate reward based on pool ratios
        uint256 reward = _calculateReward(prediction.eventId, prediction.amount, prediction.outcome);
        
        // Transfer reward
        payable(msg.sender).transfer(reward);
        
        emit RewardsDistributed(predictionId, msg.sender, reward);
    }

    // View functions
    function getMarketEvent(uint256 eventId) external view eventExists(eventId) returns (MarketEvent memory) {
        return marketEvents[eventId];
    }

    function getPrediction(uint256 predictionId) external view returns (Prediction memory) {
        require(predictionId > 0 && predictionId < nextPredictionId, "Prediction does not exist");
        return predictions[predictionId];
    }

    function getUserPredictions(address user) external view returns (uint256[] memory) {
        return userPredictions[user];
    }

    function getEventPredictions(uint256 eventId) external view eventExists(eventId) returns (uint256[] memory) {
        return eventPredictions[eventId];
    }

    function getActiveEvents() external view returns (MarketEvent[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextEventId; i++) {
            if (!marketEvents[i].resolved && block.timestamp < marketEvents[i].endTime) {
                activeCount++;
            }
        }

        MarketEvent[] memory activeEvents = new MarketEvent[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i < nextEventId; i++) {
            if (!marketEvents[i].resolved && block.timestamp < marketEvents[i].endTime) {
                activeEvents[index] = marketEvents[i];
                index++;
            }
        }

        return activeEvents;
    }

    // Internal functions
    function _distributeRewards(uint256 eventId, bool outcome) internal {
        MarketEvent storage event_ = marketEvents[eventId];
        uint256[] memory eventPreds = eventPredictions[eventId];
        
        for (uint256 i = 0; i < eventPreds.length; i++) {
            Prediction storage prediction = predictions[eventPreds[i]];
            if (prediction.outcome == outcome) {
                uint256 reward = _calculateReward(eventId, prediction.amount, outcome);
                // Rewards will be claimed individually by users
            }
        }
    }

    function _calculateReward(uint256 eventId, uint256 amount, bool outcome) internal view returns (uint256) {
        MarketEvent memory event_ = marketEvents[eventId];
        uint256 winningPool = outcome ? event_.yesPool : event_.noPool;
        uint256 totalWinningPool = outcome ? event_.yesPool : event_.noPool;
        
        if (totalWinningPool == 0) return 0;
        
        // Calculate proportional reward
        uint256 proportionalReward = (amount * event_.totalPool) / totalWinningPool;
        
        // Apply platform fee
        uint256 platformFee = (proportionalReward * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 netReward = proportionalReward - platformFee;
        
        return netReward;
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
