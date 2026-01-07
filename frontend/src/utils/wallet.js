import { ethers } from "ethers";

let provider = null;
let signer = null;
let currentAccount = null;

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);

  signer = await provider.getSigner();
  currentAccount = accounts[0];

  return currentAccount;
}

export function getProvider() {
  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  return provider;
}

export async function getSigner() {
  if (!signer) {
    const provider = getProvider();
    signer = await provider.getSigner();
  }
  return signer;
}

export function getCurrentAccount() {
  return currentAccount;
}

export function listenWalletEvents(onChange) {
  if (!window.ethereum) return;

  window.ethereum.on("accountsChanged", (accounts) => {
    currentAccount = accounts[0] || null;
    onChange(currentAccount);
  });

  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}
