module powerchain::energy_position {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    const E_OVER_ISSUANCE: u64 = 1;
    const E_INVALID_AMOUNT: u64 = 2;
    const E_NOT_FINALIZED: u64 = 3;
    const E_INVALID_UNIT: u64 = 4;
    const E_UNIT_ALIGNMENT: u64 = 5;
    const UNIT_KWH: u8 = 0;
    const UNIT_MWH: u8 = 1;
    const WH_PER_KWH: u64 = 1000;
    const WH_PER_MWH: u64 = 1000000;

    public struct VerifierCap has key, store { id: UID }
    public struct EnergyBatch has key, store {
        id: UID,
        verifier: address,
        verified_wh: u64,
        invalidated_wh: u64,
        positioned_wh: u64,
        retired_wh: u64,
        source: u8,
        evidence_root: vector<u8>,
        finalized: bool,
    }
    public struct EnergyPosition has key, store {
        id: UID,
        batch_id: address,
        amount_wh: u64,
        reserved_wh: u64,
        retired_wh: u64,
        unit: u8,
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(VerifierCap { id: object::new(ctx) }, tx_context::sender(ctx));
    }

    public fun create_batch(
        _cap: &VerifierCap,
        verified_wh: u64,
        source: u8,
        evidence_root: vector<u8>,
        ctx: &mut TxContext,
    ): EnergyBatch {
        assert!(verified_wh > 0, E_INVALID_AMOUNT);
        EnergyBatch {
            id: object::new(ctx),
            verifier: tx_context::sender(ctx),
            verified_wh,
            invalidated_wh: 0,
            positioned_wh: 0,
            retired_wh: 0,
            source,
            evidence_root,
            finalized: false,
        }
    }

    public fun finalize_batch(_cap: &VerifierCap, batch: &mut EnergyBatch) {
        batch.finalized = true;
    }

    public fun issue(batch: &mut EnergyBatch, amount_wh: u64, unit: u8, ctx: &mut TxContext): EnergyPosition {
        assert!(batch.finalized, E_NOT_FINALIZED);
        validate_unit_amount(amount_wh, unit);
        assert!(batch.invalidated_wh <= batch.verified_wh, E_OVER_ISSUANCE);
        let available = batch.verified_wh - batch.invalidated_wh;
        assert!(batch.positioned_wh <= available && amount_wh <= available - batch.positioned_wh, E_OVER_ISSUANCE);
        batch.positioned_wh = batch.positioned_wh + amount_wh;
        EnergyPosition {
            id: object::new(ctx),
            batch_id: object::uid_to_address(&batch.id),
            amount_wh,
            reserved_wh: 0,
            retired_wh: 0,
            unit,
        }
    }

    public fun reserve(position: &mut EnergyPosition, amount_wh: u64) {
        assert!(amount_wh > 0, E_INVALID_AMOUNT);
        assert!(position.retired_wh <= position.amount_wh, E_INVALID_AMOUNT);
        assert!(position.reserved_wh <= position.amount_wh - position.retired_wh, E_INVALID_AMOUNT);
        assert!(amount_wh <= position.amount_wh - position.retired_wh - position.reserved_wh, E_INVALID_AMOUNT);
        position.reserved_wh = position.reserved_wh + amount_wh;
    }

    public fun release(position: &mut EnergyPosition, amount_wh: u64) {
        assert!(amount_wh > 0 && amount_wh <= position.reserved_wh, E_INVALID_AMOUNT);
        position.reserved_wh = position.reserved_wh - amount_wh;
    }

    public fun retire(batch: &mut EnergyBatch, position: &mut EnergyPosition, amount_wh: u64) {
        assert!(object::uid_to_address(&batch.id) == position.batch_id, E_INVALID_AMOUNT);
        assert!(amount_wh > 0 && position.retired_wh <= position.amount_wh, E_INVALID_AMOUNT);
        assert!(amount_wh <= position.amount_wh - position.retired_wh, E_INVALID_AMOUNT);
        position.retired_wh = position.retired_wh + amount_wh;
        position.reserved_wh = if (position.reserved_wh > amount_wh) { position.reserved_wh - amount_wh } else { 0 };
        batch.retired_wh = batch.retired_wh + amount_wh;
        assert!(batch.retired_wh <= batch.positioned_wh, E_OVER_ISSUANCE);
    }

    public fun transfer_position(position: EnergyPosition, recipient: address) {
        transfer::public_transfer(position, recipient);
    }

    fun validate_unit_amount(amount_wh: u64, unit: u8) {
        assert!(amount_wh > 0, E_INVALID_AMOUNT);
        if (unit == UNIT_KWH) {
            assert!(amount_wh % WH_PER_KWH == 0, E_UNIT_ALIGNMENT);
        } else if (unit == UNIT_MWH) {
            assert!(amount_wh % WH_PER_MWH == 0, E_UNIT_ALIGNMENT);
        } else {
            abort E_INVALID_UNIT
        }
    }
}
