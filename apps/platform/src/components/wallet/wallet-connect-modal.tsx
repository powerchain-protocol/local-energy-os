"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { walletProviderAdapters } from "@/lib/wallet/providers";
import type { WalletNetwork } from "@/types/wallet/provider";
import { Web3WalletIcon } from "@/components/web3/wallet-icon";
import { Web3NetworkIcon } from "@/components/web3/network-icon";
import { useWallet } from "@/components/provider/wallet-provider";

export function WalletConnectModal() {
  const { isOpen, close, connectProvider, connectAddress, isLoading } = useWallet();
  const [manual, setManual] = useState("");
  const [network, setNetwork] = useState<WalletNetwork>("solana");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  async function run(id: string, action: () => Promise<void>) {
    setError("");
    setPending(id);
    try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to connect wallet"); }
    finally { setPending(null); }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-950 sm:p-8">
          <Dialog.Close className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close wallet dialog"><Cross2Icon /></Dialog.Close>
          <div className="flex items-center gap-2"><Web3NetworkIcon network="solana" size={32} /><Web3NetworkIcon network="sui" size={32} /><span className="grid h-8 w-8 place-items-center rounded-full border text-[10px] font-black">EVM</span></div>
          <Dialog.Title className="mt-5 text-2xl font-extrabold tracking-tight">Connect a wallet</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-slate-500">Connect Phantom, Solflare, Backpack, WalletConnect, Sui, or another supported wallet. Addresses are validated before a session is created, and PowerChain never requests private keys.</Dialog.Description>

          <div className="mt-6 grid gap-3">
            {walletProviderAdapters.map((adapter) => (
              <button key={adapter.id} type="button" disabled={pending !== null || isLoading} onClick={() => void run(adapter.id, () => connectProvider(adapter.id))} className="flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left font-semibold transition hover:-translate-y-px hover:bg-slate-50 hover:shadow-sm disabled:opacity-60 dark:border-slate-800 dark:hover:bg-slate-900">
                <Web3WalletIcon name={adapter.name} size={30} />
                <span className="min-w-0 flex-1"><span className="block truncate">{adapter.name}</span><small className="font-normal capitalize text-slate-500">{adapter.network} network</small></span>
                <span className="text-xs text-slate-400">{pending === adapter.id ? "Connecting…" : adapter.detect() ? "Detected" : "Connect"}</span>
              </button>
            ))}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-400"><i className="h-px flex-1 bg-slate-200 dark:bg-slate-800"/><span>Watch-only</span><i className="h-px flex-1 bg-slate-200 dark:bg-slate-800"/></div>
          <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
            <select value={network} onChange={(event) => setNetwork(event.target.value as WalletNetwork)} className="rounded-xl border bg-transparent px-3 py-3 dark:border-slate-800" aria-label="Wallet network"><option value="solana">Solana</option><option value="sui">Sui</option><option value="evm">EVM</option></select>
            <input value={manual} onChange={(event) => setManual(event.target.value)} placeholder="Public wallet address" className="min-w-0 rounded-xl border bg-transparent px-4 py-3 font-mono text-sm dark:border-slate-800" />
          </div>
          <button type="button" disabled={pending !== null || isLoading} onClick={() => void run("manual", () => connectAddress(manual, network))} className="mt-3 w-full rounded-xl bg-[#0F5A46] px-4 py-3.5 font-bold text-white shadow-lg shadow-emerald-950/10 hover:bg-[#146B54]">Continue with address</button>
          {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
