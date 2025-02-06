// UI Components and Styles
import { Container, VStack, Box } from '@chakra-ui/react';
import './App.css';

// Web3 Imports
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { polygonMumbai } from 'wagmi/chains';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Local Components
import Header from './components/Header';
import GameBoard from './components/GameBoard';

const { provider } = configureChains([polygonMumbai], [publicProvider()]);

const chains = [polygonMumbai];

const { connectors } = getDefaultWallets({
  appName: 'CoinFlip DApp',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} initialChain={polygonMumbai}>
        <Box minH="100vh" bg="gray.50">
          <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
              <Header />
              <GameBoard />
            </VStack>
          </Container>
        </Box>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
