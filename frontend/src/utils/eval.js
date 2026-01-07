import {
  connectWallet as connect,
} from "./wallet";

import {
  requestTokens,
  getBalance,
  canClaim,
  getRemainingAllowance,
} from "./contracts";

import deployment from "../deployment.json";

window.__EVAL__ = {
  connectWallet: async () => {
    return await connect();
  },

  requestTokens: async () => {
    return await requestTokens();
  },

  getBalance: async (address) => {
    return await getBalance(address);
  },

  canClaim: async (address) => {
    return await canClaim(address);
  },

  getRemainingAllowance: async (address) => {
    return await getRemainingAllowance(address);
  },

  getContractAddresses: async () => {
    return {
      token: deployment.token,
      faucet: deployment.faucet,
    };
  },
};
