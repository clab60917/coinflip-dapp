import { Box, Flex, Heading, Spacer } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <Box py={4} px={8} bg="gray.800" color="white" borderRadius="lg">
      <Flex alignItems="center">
        <Heading size="lg">🎲 CoinFlip DApp</Heading>
        <Spacer />
        <ConnectButton />
      </Flex>
    </Box>
  );
};

export default Header;
