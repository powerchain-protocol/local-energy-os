"use client";

import { WalletCards } from "lucide-react";
import { useWallet } from "@/components/provider/wallet-provider";

export function Web3SignInButton() {
  const { wallet, open, disconnect } = useWallet();
  if (wallet) {
    return (
      <div className="auth-web3-connected">
        <div><span>{wallet.network.toUpperCase()} wallet connected</span><strong>{wallet.address.slice(0, 7)}…{wallet.address.slice(-5)}</strong></div>
        <button type="button" onClick={() => void disconnect()}>Disconnect</button>
      </div>
    );
  }
  return <button type="button" className="auth-web3" onClick={open}><WalletCards aria-hidden /><span>Continue with Web3 wallet</span></button>;
}
