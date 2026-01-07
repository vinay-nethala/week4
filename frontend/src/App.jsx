import { useEffect, useState } from "react";
import { connectWallet } from "./utils/wallet";
import {
  getBalance,
  requestTokens,
  canClaim,
  getRemainingAllowance,
} from "./utils/contracts";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [eligible, setEligible] = useState(false);
  const [remaining, setRemaining] = useState("0");
  const [loading, setLoading] = useState(false);

  async function connect() {
    const addr = await connectWallet();
    setAccount(addr);
  }

  async function refresh(addr) {
    setBalance(await getBalance(addr));
    setEligible(await canClaim(addr));
    setRemaining(await getRemainingAllowance(addr));
  }

  async function claim() {
    setLoading(true);
    try {
      await requestTokens();
      await refresh(account);
    } catch (e) {
      alert(e.reason || e.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (account) refresh(account);
  }, [account]);

  return (
    <div style={{ padding: 30 }}>
      <h2>Token Faucet</h2>

      {!account ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p><b>Address:</b> {account}</p>
          <p><b>Balance:</b> {balance}</p>
          <p><b>Remaining Allowance:</b> {remaining}</p>

          <button disabled={!eligible || loading} onClick={claim}>
            {loading ? "Claiming..." : "Request Tokens"}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
