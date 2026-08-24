"use client";
import { BackpackIcon } from "@radix-ui/react-icons";
import { useWallet } from "@/components/provider/wallet-provider";
export function WalletButton(){
  const {address,open,disconnect}=useWallet();
  return <button type="button" onClick={address?disconnect:open} className="inline-flex min-h-10 items-center gap-2 rounded-[14px] border border-emerald-900 bg-emerald-900 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(6,78,59,.16)] transition hover:-translate-y-px hover:bg-emerald-800 hover:shadow-[0_12px_26px_rgba(6,78,59,.22)]" aria-label={address?"Disconnect wallet":"Connect wallet"}><BackpackIcon className="h-4 w-4"/><span className="hidden sm:inline">{address?`${address.slice(0,4)}…${address.slice(-4)}`:"Connect wallet"}</span></button>
}
