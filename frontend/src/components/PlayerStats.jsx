import { Box, Stat, StatLabel, StatNumber, StatGroup, useColorModeValue } from '@chakra-ui/react';
import { useContractRead } from 'wagmi';
import PropTypes from 'prop-types';
import { CoinFlipABI } from '../contracts/CoinFlipABI';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const PlayerStats = ({ address }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { data: stats } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CoinFlipABI,
    functionName: 'getPlayerStats',
    args: [address],
    watch: true,
  });

  const totalGames = stats ? stats.wins + stats.losses : 0;
  const winRate = totalGames > 0 ? (stats?.wins / totalGames) * 100 : 0;

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
      width="full"
    >
      <StatGroup>
        <Stat>
          <StatLabel>Total Games</StatLabel>
          <StatNumber>{totalGames}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Wins</StatLabel>
          <StatNumber>{stats?.wins || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Win Rate</StatLabel>
          <StatNumber>{winRate.toFixed(1)}%</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Total Won</StatLabel>
          <StatNumber>{stats?.totalAmountWon || 0} USD</StatNumber>
        </Stat>
      </StatGroup>
    </Box>
  );
};

PlayerStats.propTypes = {
  address: PropTypes.string.isRequired,
};

export default PlayerStats;
