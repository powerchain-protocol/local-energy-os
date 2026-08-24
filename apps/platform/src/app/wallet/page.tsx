"use client";
import { Shell } from "@/components/shell";
import { AssetList } from "@/components/web3/asset-list";
import { TokenCard } from "@/components/portfolio/token-card";
import { Web3NetworkIcon } from "@/components/web3/network-icon";
import { useWallet } from "@/components/provider/wallet-provider";
import { useWalletData } from "@/hooks/use-wallet-data";
import { Button } from "@/components/ui/button";
export default function WalletPage() {
  const { address, open, disconnect } = useWallet();
  const { data, loading, error, refresh } = useWalletData(address);
  return (
    <Shell>
      <main className="content-container">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
              Multi-chain treasury
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Wallet</h1>
            <p className="mt-1 muted">
            PWRC, Sui wPWRC, CRT and Solana account data with Sui interoperability.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            <Web3NetworkIcon network="solana" size={24} />
            <span>Solana</span>
            <span className="muted">+</span>
            <Web3NetworkIcon network="sui" size={24} />
            <span>Sui</span>
          </div>
        </header>
        <section className="panel mb-4 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide muted">
                Connected account
              </p>
              <p className="mt-1 break-all font-mono text-sm">
                {address ?? "No Solana wallet connected"}
              </p>
            </div>
            <div className="flex gap-2">
              {address ? (
                <>
                  <Button onClick={() => void refresh()} disabled={loading}>
                    {loading ? "Refreshing…" : "Refresh data"}
                  </Button>
                  <Button variant="framed" onClick={disconnect}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button onClick={open}>Connect wallet</Button>
              )}
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
          {data && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-3">
                <p className="muted text-xs">SOL</p>
                <p className="text-xl font-bold">
                  {data.sol.toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}
                </p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="muted text-xs">SPL assets</p>
                <p className="text-xl font-bold">{data.assets.length}</p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="muted text-xs">Signatures</p>
                <p className="text-xl font-bold">{data.signatures.length}</p>
              </div>
            </div>
          )}
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <TokenCard kind="pwrc" />
          <TokenCard kind="wpwrc" />
          <TokenCard kind="crt" />
        </section>
        <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
          <AssetList />
          <div className="panel p-5">
            <h2 className="font-bold">Transaction safeguards</h2>
            <p className="mt-2 text-sm muted">
              Purchases reject zero or insufficient balances. Submission
              requires a valid Solana base58 address, wallet signature, tenant
              permission and server-side amount validation.
            </p>
          </div>
        </section>
      </main>
    </Shell>
  );
}
