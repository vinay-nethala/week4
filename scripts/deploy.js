const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();

  console.log("👤 Deployer address:", deployer.address);
  console.log(
    "💰 Deployer balance:",
    hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
    "ETH\n"
  );

  /* -------------------------------------------------------------
     1. Deploy TokenFaucet FIRST (token not set yet)
  ------------------------------------------------------------- */
  console.log("📦 Deploying TokenFaucet...");

  const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(hre.ethers.ZeroAddress);
  await faucet.waitForDeployment();

  const faucetAddress = await faucet.getAddress();
  console.log("✅ TokenFaucet deployed at:", faucetAddress, "\n");

  /* -------------------------------------------------------------
     2. Deploy Token with faucet as minter
  ------------------------------------------------------------- */
  console.log("📦 Deploying YourToken...");

  const Token = await hre.ethers.getContractFactory("YourToken");
  const token = await Token.deploy(
    "Faucet Token",
    "FTK",
    faucetAddress
  );
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("✅ YourToken deployed at:", tokenAddress, "\n");

  /* -------------------------------------------------------------
     3. Set token address in faucet
  ------------------------------------------------------------- */
  console.log("🔗 Linking token to faucet...");
  const tx = await faucet.setToken(tokenAddress);
  await tx.wait();

  console.log("✅ Token linked to faucet\n");

  /* -------------------------------------------------------------
     4. Save addresses for frontend
  ------------------------------------------------------------- */
  const deploymentData = {
    network: hre.network.name,
    token: tokenAddress,
    faucet: faucetAddress,
    deployer: deployer.address,
  };

  const outputDir = path.join(__dirname, "..", "frontend", "src");
  const outputPath = path.join(outputDir, "deployment.json");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));

  console.log("💾 Deployment data saved to:");
  console.log(outputPath, "\n");

  /* -------------------------------------------------------------
     5. Verify contracts on Etherscan
  ------------------------------------------------------------- */
  if (hre.network.name !== "hardhat") {
    console.log("🔍 Waiting for block confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30_000));

    console.log("🔎 Verifying TokenFaucet...");
    await hre.run("verify:verify", {
      address: faucetAddress,
      constructorArguments: [hre.ethers.ZeroAddress],
    });

    console.log("🔎 Verifying YourToken...");
    await hre.run("verify:verify", {
      address: tokenAddress,
      constructorArguments: [
        "Faucet Token",
        "FTK",
        faucetAddress,
      ],
    });

    console.log("✅ Contracts verified on Etherscan\n");
  }

  console.log("🎉 Deployment completed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});
