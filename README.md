# 🪙 Token Faucet DApp

A decentralized **Token Faucet DApp** that allows users to claim a fixed amount of ERC-20 tokens with enforced cooldowns, lifetime limits, and admin controls.  
The project includes **smart contracts**, **frontend**, **Docker support**, and **health monitoring**, deployed and verified on **Sepolia testnet**.

---

## 📌 Project Overview

This project implements a secure ERC-20 token faucet where:
- Users can request free test tokens
- Claims are limited by **cooldown time** and **lifetime allowance**
- The faucet can be **paused by an admin**
- The frontend connects via MetaMask
- Everything runs locally using **Docker**

The DApp is designed for **learning, testing, and development environments**.

---

## 🏗 Architecture

### Smart Contracts
- **YourToken.sol**
  - ERC-20 compliant token
  - Zero initial supply
  - Tokens minted only by the faucet contract
- **TokenFaucet.sol**
  - Controls token distribution
  - Enforces cooldown and lifetime limits
  - Admin pause/unpause functionality
  - Emits events for transparency

### Frontend
- Built with **Node.js + Express**
- Uses **ethers.js** for blockchain interaction
- Connects to MetaMask via `window.ethereum`
- Reads deployment addresses from `deployment.json`
- Exposes `/health` endpoint for Docker health checks

### Docker
- Frontend containerized using Node.js LTS
- Health checks ensure app readiness
- `docker-compose` orchestrates services

---

## 🌍 Deployed Contracts (Sepolia)

| Contract | Address |
|--------|--------|
| **YourToken** | `0xA7568A942Cef9841ABeAFAcDB955874487d143c3` |
| **TokenFaucet** | `0x010d0a0fF7E985781A27D9ed7E971F54B76E08A0` |

🔗 **Etherscan Links**
- Token: https://sepolia.etherscan.io/address/0xA7568A942Cef9841ABeAFAcDB955874487d143c3
- Faucet: https://sepolia.etherscan.io/address/0x010d0a0fF7E985781A27D9ed7E971F54B76E08A0

---

## ⚡ Quick Start

### 1️⃣ Clone repository
```bash
git clone https://github.com/marlabharghavsai/token-faucet-dapp
cd submission
```

### Configure environment
- cp .env.example .env
- Edit .env with your values:
   - VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   - VITE_TOKEN_ADDRESS=0xYourDeployedTokenAddress
   - VITE_FAUCET_ADDRESS=0xYourDeployedFaucetAddress

### Run with Docker
- docker compose up --build

### Access application
- Frontend:curl http://localhost:3000
- Health check: curl http://localhost:3000/health

### Design Decisions

- Faucet Amount
   - Fixed token amount per request
   - Prevents abuse while allowing useful testing

- Cooldown Period
   - Ensures fair distribution
   - Prevents rapid repeated claims

- Lifetime Claim Limit
   - Caps total tokens per wallet
   - Avoids draining total supply

- Token Supply
   -No initial supply
   -Tokens minted only when needed
   -Prevents unnecessary inflation


### Testing Approach

- Smart Contracts
   - Tested using Hardhat
   - Coverage includes:
     - Deployment correctness
     - Successful claims
     - Cooldown enforcement
     - Lifetime limit enforcement
     - Pause/unpause behavior
     - Admin-only controls
     - Multiple users claiming independently

- Frontend
   - Manual testing with MetaMask
   - Verified:
     - Wallet connection
     - Claim flow
     - Balance updates
     - Error handling
     - Health endpoint

### Security Considerations
- Faucet is the only minter
- Admin-only sensitive actions
- Revert messages for all failure cases
- Cooldown and lifetime limits enforced on-chain
- No private keys stored in frontend
- .env excluded from version control

### Known Limitations & Future Improvements
- UI is minimal (focus on functionality)
- No rate limiting at frontend level
- Could add:
   - Better UI/UX
   - Claim history view
   - Support for multiple networks
   - Gasless claims (meta-transactions)

### Health Check
- The application exposes: GET /health → 200 OK




