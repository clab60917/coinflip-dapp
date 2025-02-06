const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoinFlip", function () {
  let coinFlip;
  let mockERC20;
  let owner;
  let player1;
  let player2;
  let mockVRFCoordinator;

  const TIMEOUT_DURATION = 30;
  const FEE_PERCENTAGE = 500; // 5%

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Mock Token", "MTK");
    await mockERC20.waitForDeployment();

    // Deploy mock VRF Coordinator
    const MockVRFCoordinator = await ethers.getContractFactory("MockVRFCoordinator");
    mockVRFCoordinator = await MockVRFCoordinator.deploy();
    await mockVRFCoordinator.waitForDeployment();

    // Deploy CoinFlip
    const CoinFlip = await ethers.getContractFactory("CoinFlip");
    coinFlip = await CoinFlip.deploy(
      await mockVRFCoordinator.getAddress(),
      ethers.encodeBytes32String("keyhash"),
      1 // subscriptionId
    );
    await coinFlip.waitForDeployment();

    // Mint tokens to players
    await mockERC20.mint(player1.address, ethers.parseEther("100"));
    await mockERC20.mint(player2.address, ethers.parseEther("100"));

    // Approve CoinFlip contract
    await mockERC20.connect(player1).approve(await coinFlip.getAddress(), ethers.parseEther("100"));
    await mockERC20.connect(player2).approve(await coinFlip.getAddress(), ethers.parseEther("100"));
  });

  describe("Game Creation", function () {
    it("Should create a public game successfully", async function () {
      const amount = ethers.parseEther("1");
      
      await expect(
        coinFlip.connect(player1).createGame(
          await mockERC20.getAddress(),
          amount,
          false,
          ethers.ZeroHash
        )
      )
        .to.emit(coinFlip, "GameCreated")
        .withArgs(0, player1.address, await mockERC20.getAddress(), amount, false);

      const game = await coinFlip.getGame(0);
      expect(game.token).to.equal(await mockERC20.getAddress());
      expect(game.amount).to.equal(amount);
      expect(game.player1).to.equal(player1.address);
      expect(game.isPrivate).to.be.false;
    });

    it("Should create a private game successfully", async function () {
      const amount = ethers.parseEther("1");
      const privateKey = ethers.keccak256(ethers.toUtf8Bytes("secret"));
      
      await expect(
        coinFlip.connect(player1).createGame(
          await mockERC20.getAddress(),
          amount,
          true,
          privateKey
        )
      )
        .to.emit(coinFlip, "GameCreated")
        .withArgs(0, player1.address, await mockERC20.getAddress(), amount, true);

      const game = await coinFlip.getGame(0);
      expect(game.isPrivate).to.be.true;
    });
  });

  describe("Game Joining", function () {
    beforeEach(async function () {
      await coinFlip.connect(player1).createGame(
        await mockERC20.getAddress(),
        ethers.parseEther("1"),
        false,
        ethers.ZeroHash
      );
    });

    it("Should join a public game successfully", async function () {
      await expect(
        coinFlip.connect(player2).joinGame(0, ethers.ZeroHash)
      )
        .to.emit(coinFlip, "GameJoined")
        .withArgs(0, player2.address);

      const game = await coinFlip.getGame(0);
      expect(game.player2).to.equal(player2.address);
    });

    it("Should not allow joining after timeout", async function () {
      await ethers.provider.send("evm_increaseTime", [TIMEOUT_DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await expect(
        coinFlip.connect(player2).joinGame(0, ethers.ZeroHash)
      ).to.be.revertedWith("Game has timed out");
    });
  });

  describe("Game Resolution", function () {
    beforeEach(async function () {
      await coinFlip.connect(player1).createGame(
        await mockERC20.getAddress(),
        ethers.parseEther("1"),
        false,
        ethers.ZeroHash
      );
      await coinFlip.connect(player2).joinGame(0, ethers.ZeroHash);
    });

    it("Should resolve game correctly when player1 wins", async function () {
      // Simulate VRF response with even number (player1 wins)
      await mockVRFCoordinator.fulfillRandomWords(1, [2]);

      const game = await coinFlip.getGame(0);
      expect(game.isComplete).to.be.true;
      expect(game.winner).to.equal(player1.address);

      // Check balances
      const fee = ethers.parseEther("0.1"); // 5% of 2 ETH
      const winnings = ethers.parseEther("1.9"); // 2 ETH - fee
      expect(await mockERC20.balanceOf(player1.address)).to.equal(
        ethers.parseEther("100").add(winnings).sub(ethers.parseEther("1"))
      );
      expect(await mockERC20.balanceOf(owner.address)).to.equal(fee);
    });
  });

  describe("Timeout Claims", function () {
    it("Should allow timeout claim after duration", async function () {
      await coinFlip.connect(player1).createGame(
        await mockERC20.getAddress(),
        ethers.parseEther("1"),
        false,
        ethers.ZeroHash
      );

      await ethers.provider.send("evm_increaseTime", [TIMEOUT_DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await expect(coinFlip.connect(player1).claimTimeout(0))
        .to.emit(coinFlip, "GameTimeout")
        .withArgs(0);

      const game = await coinFlip.getGame(0);
      expect(game.isComplete).to.be.true;
    });
  });
});
