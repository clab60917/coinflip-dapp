const { ethers, run } = require('hardhat');

async function main() {
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Deploy MockUSDC and MockUSDT for testing
  const MockERC20 = await ethers.getContractFactory('MockERC20');
  const mockUSDC = await MockERC20.deploy('Mock USDC', 'USDC', 6);
  const mockUSDT = await MockERC20.deploy('Mock USDT', 'USDT', 6);

  await mockUSDC.waitForDeployment();
  await mockUSDT.waitForDeployment();

  console.log('MockUSDC deployed to:', await mockUSDC.getAddress());
  console.log('MockUSDT deployed to:', await mockUSDT.getAddress());

  // Deploy CoinFlip contract
  const CoinFlip = await ethers.getContractFactory('CoinFlip');
  const coinFlip = await CoinFlip.deploy(
    process.env.CHAINLINK_SUBSCRIPTION_ID,
    [await mockUSDC.getAddress(), await mockUSDT.getAddress()]
  );

  await coinFlip.waitForDeployment();
  console.log('CoinFlip deployed to:', await coinFlip.getAddress());

  // Wait for a few block confirmations
  console.log('Waiting for block confirmations...');
  await ethers.provider.waitForTransaction(
    coinFlip.deploymentTransaction().hash,
    5
  );

  // Verify contracts on Polygonscan
  console.log('Verifying contracts...');
  try {
    await run('verify:verify', {
      address: await coinFlip.getAddress(),
      constructorArguments: [
        process.env.CHAINLINK_SUBSCRIPTION_ID,
        [await mockUSDC.getAddress(), await mockUSDT.getAddress()],
      ],
    });

    await run('verify:verify', {
      address: await mockUSDC.getAddress(),
      constructorArguments: ['Mock USDC', 'USDC', 6],
    });

    await run('verify:verify', {
      address: await mockUSDT.getAddress(),
      constructorArguments: ['Mock USDT', 'USDT', 6],
    });
  } catch (error) {
    console.error('Error verifying contract:', error);
  }

  // Setup initial token balances for testing
  const mintAmount = ethers.parseUnits('1000000', 6); // 1M tokens
  await mockUSDC.mint(deployer.address, mintAmount);
  await mockUSDT.mint(deployer.address, mintAmount);

  console.log('Deployment completed successfully!');
  console.log('-----------------------------------');
  console.log('Contract Addresses:');
  console.log('CoinFlip:', await coinFlip.getAddress());
  console.log('MockUSDC:', await mockUSDC.getAddress());
  console.log('MockUSDT:', await mockUSDT.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
