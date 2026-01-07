const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const {
  anyValue,
} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Token Faucet – Comprehensive Test Suite", function () {
  let token, faucet;
  let admin, user1, user2;

  const FAUCET_AMOUNT = ethers.parseEther("100");
  const MAX_CLAIM_AMOUNT = ethers.parseEther("1000");
  const COOLDOWN_TIME = 24 * 60 * 60; // 24 hours

  async function increaseTime(seconds) {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
  }

  beforeEach(async function () {
    [admin, user1, user2] = await ethers.getSigners();

    // 1️⃣ Deploy Faucet FIRST (token not set yet)
    const Faucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await Faucet.deploy(ethers.ZeroAddress);
    await faucet.waitForDeployment();

    // 2️⃣ Deploy Token with faucet as minter
    const Token = await ethers.getContractFactory("YourToken");
    token = await Token.deploy(
      "Faucet Token",
      "FTK",
      await faucet.getAddress()
    );
    await token.waitForDeployment();

    // 3️⃣ Set token address in faucet
    await faucet.setToken(await token.getAddress());
  });

  /* -------------------------------------------------------------
     1. Token deployment and initial state
  ------------------------------------------------------------- */
  it("should deploy token with zero initial supply", async function () {
    expect(await token.totalSupply()).to.equal(0n);
  });

  /* -------------------------------------------------------------
     2. Faucet deployment and configuration
  ------------------------------------------------------------- */
  it("should set deployer as admin", async function () {
    expect(await faucet.admin()).to.equal(admin.address);
  });

  it("should start unpaused", async function () {
    expect(await faucet.isPaused()).to.equal(false);
  });

  /* -------------------------------------------------------------
     3. Successful token claim
  ------------------------------------------------------------- */
  it("should allow a user to claim tokens successfully", async function () {
    await expect(faucet.connect(user1).requestTokens())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(user1.address, FAUCET_AMOUNT, anyValue);

    expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
  });

  /* -------------------------------------------------------------
     4. Cooldown enforcement
  ------------------------------------------------------------- */
  it("should revert if claiming during cooldown period", async function () {
    await faucet.connect(user1).requestTokens();

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Cooldown period not elapsed");
  });

  /* -------------------------------------------------------------
     5. Lifetime limit enforcement
  ------------------------------------------------------------- */
  it("should revert when lifetime claim limit is exceeded", async function () {
    for (let i = 0; i < 10; i++) {
      await faucet.connect(user1).requestTokens();
      await increaseTime(COOLDOWN_TIME);
    }

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Lifetime claim limit reached");
  });

  /* -------------------------------------------------------------
     6. Pause mechanism
  ------------------------------------------------------------- */
  it("should block claims when faucet is paused", async function () {
    await faucet.connect(admin).setPaused(true);

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Faucet is paused");
  });

  /* -------------------------------------------------------------
     7. Admin-only pause function
  ------------------------------------------------------------- */
  it("should prevent non-admin from pausing faucet", async function () {
    await expect(
      faucet.connect(user1).setPaused(true)
    ).to.be.revertedWith("Caller is not admin");
  });

  /* -------------------------------------------------------------
     8. Event emissions
  ------------------------------------------------------------- */
  it("should emit FaucetPaused event", async function () {
    await expect(faucet.connect(admin).setPaused(true))
      .to.emit(faucet, "FaucetPaused")
      .withArgs(true);
  });

  /* -------------------------------------------------------------
     9. Edge cases
  ------------------------------------------------------------- */
  it("remainingAllowance should return 0 after max claim", async function () {
    for (let i = 0; i < 10; i++) {
      await faucet.connect(user1).requestTokens();
      await increaseTime(COOLDOWN_TIME);
    }

    expect(await faucet.remainingAllowance(user1.address)).to.equal(0n);
  });

  /* -------------------------------------------------------------
     10. Multiple users claiming independently
  ------------------------------------------------------------- */
  it("should track claims separately for multiple users", async function () {
    await faucet.connect(user1).requestTokens();
    await faucet.connect(user2).requestTokens();

    expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
    expect(await token.balanceOf(user2.address)).to.equal(FAUCET_AMOUNT);
  });

  /* -------------------------------------------------------------
     canClaim() behavior
  ------------------------------------------------------------- */
  it("canClaim should reflect eligibility correctly", async function () {
    expect(await faucet.canClaim(user1.address)).to.equal(true);

    await faucet.connect(user1).requestTokens();
    expect(await faucet.canClaim(user1.address)).to.equal(false);

    await increaseTime(COOLDOWN_TIME);
    expect(await faucet.canClaim(user1.address)).to.equal(true);
  });
});
