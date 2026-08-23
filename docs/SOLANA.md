# Solana / SVM

Solana is the primary PowerChain blockchain execution environment. `packages/svm/` isolates RPC, transactions, account resolution, simulation, instructions, confirmation, indexing, and program events from energy-domain code.

Infrastructure may route through Helius, PowerChain Agave RPC, Solana RPC, and fallback providers. No critical settlement path depends on one RPC provider.

PWRC is native to Solana.
