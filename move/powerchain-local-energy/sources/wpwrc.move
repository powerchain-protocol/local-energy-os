module powerchain::wpwrc {
    use std::option;
    use sui::coin::{Self, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// Wrapped PWRC representation on Sui. Minting authority MUST be controlled
    /// by the canonical bridge and may only mint against allocated/locked PWRC.
    public struct WPWRC has drop {}

    fun init(witness: WPWRC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,
            b"wPWRC",
            b"Wrapped PowerChain",
            b"1:1 bridged representation of PWRC native on Solana",
            option::none(),
            ctx,
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }

    public fun mint(
        cap: &mut TreasuryCap<WPWRC>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let coin = coin::mint(cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }
}
