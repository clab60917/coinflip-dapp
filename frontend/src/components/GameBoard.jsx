import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CoinFlipABI } from '../contracts/CoinFlipABI';
import CoinAnimation from './CoinAnimation';
import { generatePrivateKey, shortenAddress, formatAmount } from '../utils/crypto';
import PrivateGameModal from './PrivateGameModal';
import JoinPrivateGameModal from './JoinPrivateGameModal';
import PlayerStats from './PlayerStats';
import { CONTRACT_ADDRESS, SUPPORTED_TOKENS, ZERO_BYTES32 } from '../config/contracts';

const GameBoard = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [currentGameKey, setCurrentGameKey] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // Get active games
  const { data: games = [] } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CoinFlipABI,
    functionName: 'getActiveGames',
    watch: true,
  });

  // Create game
  const { write: createGame, data: createGameData } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CoinFlipABI,
    functionName: 'createGame',
  });

  // Join game
  const { write: joinGame } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CoinFlipABI,
    functionName: 'joinGame',
  });

  // Wait for transaction
  const { isLoading: isCreatingGame } = useWaitForTransaction({
    hash: createGameData?.hash,
  });

  // Listen for GameResult events using wagmi hooks
  const { data: gameResultEvents } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CoinFlipABI,
    functionName: 'getGameResult',
    args: [address],
    watch: true,
  });

  useEffect(() => {
    if (!gameResultEvents) return;
    const { winner, loser, amount } = gameResultEvents;

    if (winner === address) {
      setGameResult(true);
      setShowAnimation(true);
      toast({
        title: "You won!",
        description: `You've won ${formatEther(amount)} tokens!`,
        status: "success",
        duration: 5000,
      });
    } else if (loser === address) {
      setGameResult(false);
      setShowAnimation(true);
      toast({
        title: "You lost!",
        description: `Better luck next time!`,
        status: "error",
        duration: 5000,
      });
    }
  }, [gameResultEvents, address, toast]);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setGameResult(null);
  };

  const handleCreateGame = async () => {
    if (!isConnected) {
      toast({
        title: 'Please connect your wallet',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      const amountInWei = parseEther(amount);
      const gamePrivateKey = isPrivate ? generatePrivateKey() : ZERO_BYTES32;
      
      if (isPrivate) {
        setCurrentGameKey(gamePrivateKey);
        setShowPrivateKeyModal(true);
      }

      createGame({
        args: [
          SUPPORTED_TOKENS[selectedToken].address,
          amountInWei,
          isPrivate,
          gamePrivateKey,
        ],
      });
    } catch (error) {
      toast({
        title: 'Error creating game',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleJoinGame = (gameId, isPrivateGame) => {
    if (!isConnected) {
      toast({
        title: 'Please connect your wallet',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      if (isPrivateGame) {
        setSelectedGame(gameId);
        setShowJoinModal(true);
      } else {
        joinGame({
          args: [gameId, ZERO_BYTES32],
        });
      }
    } catch (error) {
      toast({
        title: 'Error joining game',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <VStack spacing={8}>
      {isConnected && <PlayerStats address={address} />}
      <JoinPrivateGameModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setSelectedGame(null);
        }}
        onSubmit={(key) => {
          if (selectedGame) {
            joinGame({
              args: [selectedGame, key],
            });
          }
        }}
      />
      <PrivateGameModal 
        isOpen={showPrivateKeyModal}
        onClose={() => setShowPrivateKeyModal(false)}
        gameKey={currentGameKey}
      />
      {showAnimation && (
        <CoinAnimation
          result={gameResult}
          onComplete={handleAnimationComplete}
        />
      )}
      {/* Create Game Section */}
      <Box w="full" p={6} borderWidth={1} borderRadius="lg">
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="bold">
            Create New Game
          </Text>
          <HStack w="full" spacing={4}>
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Select 
              value={selectedToken} 
              onChange={(e) => setSelectedToken(e.target.value)}
              flex={1}
            >
              {Object.keys(SUPPORTED_TOKENS).map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack w="full">
            <Button
              flex={1}
              variant="outline"
              onClick={() => setIsPrivate(!isPrivate)}
              colorScheme={isPrivate ? "purple" : "gray"}
            >
              {isPrivate ? "Private Game" : "Public Game"}
            </Button>
          </HStack>
          <Button
            colorScheme="blue"
            isLoading={isCreatingGame}
            onClick={handleCreateGame}
            w="full"
          >
            Create Game
          </Button>
        </VStack>
      </Box>

      {/* Active Games Section */}
      <Box w="full" p={6} borderWidth={1} borderRadius="lg">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Active Games
        </Text>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Creator</Th>
              <Th>Token</Th>
              <Th>Amount</Th>
              <Th>Type</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {games.map((game) => (
              <Tr key={game.id}>
                <Td>{game.id}</Td>
                <Td>{shortenAddress(game.player1)}</Td>
                <Td>
                  {Object.entries(SUPPORTED_TOKENS).find(
                    ([, addr]) => addr.toLowerCase() === game.token.toLowerCase()
                  )?.[0] || 'Unknown'}
                </Td>
                <Td>
                  {formatAmount(game.amount, SUPPORTED_TOKENS[game.token === SUPPORTED_TOKENS.USDC.address ? 'USDC' : 'USDT'].decimals)} {' '}
                  {game.token === SUPPORTED_TOKENS.USDC.address ? 'USDC' : 'USDT'}
                </Td>
                <Td>
                  <Badge colorScheme={game.isPrivate ? 'red' : 'green'}>
                    {game.isPrivate ? 'Private' : 'Public'}
                  </Badge>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => handleJoinGame(game.id, game.isPrivate)}
                    isDisabled={game.player1.toLowerCase() === address?.toLowerCase()}
                  >
                    Join
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
};

export default GameBoard;
