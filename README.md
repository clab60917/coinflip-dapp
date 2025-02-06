# CoinFlip DApp 🎲

A decentralized coin flip game where players can bet tokens against each other.

## Features

- Connect with MetaMask or WalletConnect
- Create public or private games
- Support for USDC and USDT tokens
- Secure randomness using Chainlink VRF
- Real-time game updates
- Player statistics tracking
- Responsive UI with dark mode support

## Prerequisites

- Node.js >= 18
- MetaMask or compatible Web3 wallet
- Mumbai testnet MATIC for gas fees
- Test USDC/USDT tokens

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/coinflip-dapp.git
cd coinflip-dapp
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
```

3. Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_wallet_private_key
MUMBAI_RPC_URL=your_mumbai_rpc_url
POLYGONSCAN_API_KEY=your_polygonscan_api_key
CHAINLINK_SUBSCRIPTION_ID=your_chainlink_subscription_id
```

4. Update the contract address in `frontend/src/components/GameBoard.jsx`:
```javascript
const CONTRACT_ADDRESS = 'your_deployed_contract_address';
```

5. Update your WalletConnect project ID in `frontend/src/App.jsx`:
```javascript
const config = createConfig(
  getDefaultConfig({
    projectId: 'your_walletconnect_project_id',
    ...
  })
);
```

## Development

1. Start the local Hardhat node:
```bash
npx hardhat node
```

2. Deploy the contracts:
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

3. Start the frontend development server:
```bash
cd frontend
npm run dev
```

4. Open `http://localhost:5173` in your browser

## Testing

Run the test suite:
```bash
npx hardhat test
```

## Smart Contract Architecture

- `CoinFlip.sol`: Main game contract
  - Uses OpenZeppelin for secure token handling and reentrancy protection
  - Integrates Chainlink VRF for verifiable randomness
  - Implements game creation, joining, and result resolution
  - Tracks player statistics

## Security Considerations

- Reentrancy protection on all state-changing functions
- Chainlink VRF for secure randomness
- Input validation and access control
- Token approval checks
- Gas optimization

## Network Support

Currently supports:
- Polygon Mumbai Testnet
- Polygon Mainnet

## License

MIT
