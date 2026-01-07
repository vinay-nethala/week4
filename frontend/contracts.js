import { ethers } from "ethers";
import tokenAbi from "../abis/YourToken.json";
import faucetAbi from "../abis/TokenFaucet.json";
import deployment from "../deployment.json";
import { getProvider, getSigner } from "./wallet";

export function getTokenContract(readOnly = false) {
  const provider = getProvider();
  return new ethers.Contract(
    deployment.token,
    tokenAbi,
    readOnly ? provider : provider.getSigner()
  );
}

export function getFaucetContract(readOnly = false) {
  const provider = getProvider();
  return new ethers.Contract(
    deployment.faucet,
    faucetAbi,
    readOnly ? provider : provider.getSigner()
  );
}

export async function getBalance(address) {
  const token = getTokenContract(true);
  const balance = await token.balanceOf(address);
  return balance.toString();
}

export async function requestTokens() {
  const faucet = getFaucetContract();
  const tx = await faucet.requestTokens();
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function canClaim(address) {
  const faucet = getFaucetContract(true);
  return await faucet.canClaim(address);
}

export async function getRemainingAllowance(address) {
  const faucet = getFaucetContract(true);
  const allowance = await faucet.remainingAllowance(address);
  return allowance.toString();
}
