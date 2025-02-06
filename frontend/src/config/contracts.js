export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Mumbai testnet addresses for mock tokens
export const SUPPORTED_TOKENS = {
  USDC: {
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    decimals: 6,
    symbol: 'USDC',
  },
  USDT: {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
    symbol: 'USDT',
  },
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
