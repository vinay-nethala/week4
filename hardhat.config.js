require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",

  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  networks: {
    hardhat: {},

    sepolia: {
      url: "https://sepolia.infura.io/v3/f5b035d56b17402b8820bb9a2829aaf5",
      accounts: [
        "0x392a15012ea20554821d37d37e49bc148c00f6fabf1f082b4f8df3426ae66876",
      ],
    },
  },

  etherscan: {
    apiKey: "MAPI89UIZGJ2V3XT33RKHJWA7RPYGSU5YQ",
  },
};
