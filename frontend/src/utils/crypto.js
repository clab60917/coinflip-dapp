export const generatePrivateKey = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return '0x' + Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatAmount = (amount, decimals = 18) => {
  if (!amount) return '0';
  const divisor = BigInt(10 ** decimals);
  const value = BigInt(amount);
  const integer = value / divisor;
  const decimal = value % divisor;
  return `${integer}.${decimal.toString().padStart(decimals, '0')}`;
};
