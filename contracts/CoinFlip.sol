// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CoinFlip is ReentrancyGuard, VRFConsumerBaseV2 {
    using SafeERC20 for IERC20;

    VRFCoordinatorV2Interface private immutable vrfCoordinator;
    bytes32 private immutable keyHash;
    uint64 private immutable subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    uint256 private constant TIMEOUT_DURATION = 30 seconds;
    uint256 private constant FEE_PERCENTAGE = 500; // 5% = 500 basis points
    address public owner;

    struct Game {
        address token;
        uint256 amount;
        address player1;
        address player2;
        uint256 startTime;
        bool isPrivate;
        bytes32 privateKey;
        bool isComplete;
        address winner;
    }

    mapping(uint256 => Game) public games;
    mapping(uint256 => uint256) public gameIdToRequestId;
    mapping(uint256 => uint256) public requestIdToGameId;
    uint256 public currentGameId;

    event GameCreated(
        uint256 indexed gameId,
        address indexed player1,
        address token,
        uint256 amount,
        bool isPrivate
    );
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event GameResult(
        uint256 indexed gameId,
        address indexed winner,
        address indexed loser,
        uint256 amount
    );
    event GameCancelled(uint256 indexed gameId);
    event GameTimeout(uint256 indexed gameId);

    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        owner = msg.sender;
    }

    function createGame(
        address _token,
        uint256 _amount,
        bool _isPrivate,
        bytes32 _privateKey
    ) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        
        uint256 gameId = currentGameId++;
        games[gameId] = Game({
            token: _token,
            amount: _amount,
            player1: msg.sender,
            player2: address(0),
            startTime: block.timestamp,
            isPrivate: _isPrivate,
            privateKey: _privateKey,
            isComplete: false,
            winner: address(0)
        });

        emit GameCreated(gameId, msg.sender, _token, _amount, _isPrivate);
    }

    function joinGame(uint256 _gameId, bytes32 _privateKey) external nonReentrant {
        Game storage game = games[_gameId];
        require(!game.isComplete, "Game is complete");
        require(game.player2 == address(0), "Game already has player 2");
        require(msg.sender != game.player1, "Cannot join your own game");
        require(
            !game.isPrivate || game.privateKey == _privateKey,
            "Invalid private key"
        );
        require(
            block.timestamp <= game.startTime + TIMEOUT_DURATION,
            "Game has timed out"
        );

        IERC20(game.token).safeTransferFrom(msg.sender, address(this), game.amount);
        
        game.player2 = msg.sender;
        
        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            100000,
            NUM_WORDS
        );
        
        gameIdToRequestId[_gameId] = requestId;
        requestIdToGameId[requestId] = _gameId;

        emit GameJoined(_gameId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 gameId = requestIdToGameId[requestId];
        Game storage game = games[gameId];
        require(!game.isComplete, "Game is already complete");

        bool player1Wins = randomWords[0] % 2 == 0;
        address winner = player1Wins ? game.player1 : game.player2;
        address loser = player1Wins ? game.player2 : game.player1;

        game.isComplete = true;
        game.winner = winner;

        uint256 fee = (game.amount * 2 * FEE_PERCENTAGE) / 10000;
        uint256 winnings = (game.amount * 2) - fee;

        // Transfer winnings to winner
        IERC20(game.token).safeTransfer(winner, winnings);
        // Transfer fee to owner
        IERC20(game.token).safeTransfer(owner, fee);

        emit GameResult(gameId, winner, loser, winnings);
    }

    function claimTimeout(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];
        require(!game.isComplete, "Game is complete");
        require(
            game.player2 == address(0),
            "Game has already been joined"
        );
        require(
            block.timestamp > game.startTime + TIMEOUT_DURATION,
            "Timeout duration not reached"
        );

        game.isComplete = true;
        IERC20(game.token).safeTransfer(game.player1, game.amount);

        emit GameTimeout(_gameId);
    }

    function getGame(uint256 _gameId) external view returns (
        address token,
        uint256 amount,
        address player1,
        address player2,
        uint256 startTime,
        bool isPrivate,
        bool isComplete,
        address winner
    ) {
        Game memory game = games[_gameId];
        return (
            game.token,
            game.amount,
            game.player1,
            game.player2,
            game.startTime,
            game.isPrivate,
            game.isComplete,
            game.winner
        );
    }

    function withdrawFees(address _token) external {
        require(msg.sender == owner, "Only owner");
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(owner, balance);
    }
}
