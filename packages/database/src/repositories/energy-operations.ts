import "server-only";
import type { PoolClient, QueryResultRow } from "pg";
import { getPostgresPool } from "../clients/postgres";
import {
  approveReconciliation,
  createDelivery,
  createDigitalTwinAsset,
  createOperationsSnapshot,
  createSettlement,
  reconcileDelivery,
  recordDelivery,
  transitionSettlement,
  type DigitalTwinAsset,
  type EnergyDelivery,
  type EnergyOperationsSnapshot,
  type EnergyReconciliation,
  type EnergySettlement,
  type EnergySettlementNetwork,
  type EnergySettlementState,
  type SettlementAsset,
} from "@powerchain/energy-operations";
import { EnergyInvariantError } from "@powerchain/energy-core";
import {
  assertSettlementCanSubmit,
  defaultSettlementApprovalPolicy,
  evaluateSettlementControls,
  settlementReviewHash,
  type SettlementApproval,
  type SettlementApprovalDecision,
} from "@powerchain/energy-controls";

interface TwinRow extends QueryResultRow {
  id:string; organization_id:string; site_id:string; asset_type:DigitalTwinAsset["assetType"]; label:string;
  grid_area_id:string|null; observed_at:Date; telemetry_age_seconds:number; freshness:DigitalTwinAsset["freshness"];
  state:DigitalTwinAsset["state"]; power_w:string|null; availability_ppm:string|null; state_of_charge_ppm:string|null;
  export_limit_w:string|null; evidence_root:string|null;
}
interface DeliveryRow extends QueryResultRow {
  id:string; organization_id:string; energy_position_id:string; reservation_id:string|null; committed_wh:string;
  delivered_wh:string; state:EnergyDelivery["state"]; interval_start:Date; interval_end:Date;
  meter_evidence_root:string|null; created_at:Date; updated_at:Date;
}
interface ReconciliationRow extends QueryResultRow {
  id:string; organization_id:string; delivery_id:string; expected_wh:string; delivered_wh:string; variance_wh:string;
  tolerance_wh:string; state:EnergyReconciliation["state"]; reconciled_at:Date|null; created_at:Date;
}
interface SettlementRow extends QueryResultRow {
  id:string; organization_id:string; delivery_id:string; reconciliation_id:string; asset:SettlementAsset;
  network:EnergySettlementNetwork; amount_minor:string; state:EnergySettlementState; reference:string|null;
  review_hash:string; created_by:string; approvals_required:number; created_at:Date; updated_at:Date;
}
interface ApprovalRow extends QueryResultRow {
  id:string; organization_id:string; settlement_id:string; actor_id:string; decision:SettlementApprovalDecision;
  review_hash:string; note:string|null; created_at:Date;
}
interface OutboxCountRow extends QueryResultRow { pending:string }
interface OutboxRow extends QueryResultRow {
  id:string; organization_id:string; topic:string; aggregate_type:string; aggregate_id:string;
  payload:Record<string,unknown>; state:"PENDING"|"PROCESSING"|"PUBLISHED"|"FAILED"; attempts:number;
  last_error:string|null; next_attempt_at:Date; processing_started_at:Date|null; created_at:Date; published_at:Date|null;
}

function twin(row:TwinRow):DigitalTwinAsset {
  return {
    id:row.id, organizationId:row.organization_id, siteId:row.site_id, assetType:row.asset_type, label:row.label,
    ...(row.grid_area_id?{gridAreaId:row.grid_area_id}:{}), observedAt:new Date(row.observed_at),
    telemetryAgeSeconds:Number(row.telemetry_age_seconds), freshness:row.freshness, state:row.state,
    ...(row.power_w!==null?{powerW:BigInt(row.power_w)}:{}),
    ...(row.availability_ppm!==null?{availabilityPpm:BigInt(row.availability_ppm)}:{}),
    ...(row.state_of_charge_ppm!==null?{stateOfChargePpm:BigInt(row.state_of_charge_ppm)}:{}),
    ...(row.export_limit_w!==null?{exportLimitW:BigInt(row.export_limit_w)}:{}),
    ...(row.evidence_root?{evidenceRoot:row.evidence_root}:{}),
  };
}
function delivery(row:DeliveryRow):EnergyDelivery {
  return {
    id:row.id, organizationId:row.organization_id, energyPositionId:row.energy_position_id,
    ...(row.reservation_id?{reservationId:row.reservation_id}:{}), committedWh:BigInt(row.committed_wh),
    deliveredWh:BigInt(row.delivered_wh), state:row.state, intervalStart:new Date(row.interval_start),
    intervalEnd:new Date(row.interval_end), ...(row.meter_evidence_root?{meterEvidenceRoot:row.meter_evidence_root}:{}),
    createdAt:new Date(row.created_at), updatedAt:new Date(row.updated_at),
  };
}
function reconciliation(row:ReconciliationRow):EnergyReconciliation {
  return {
    id:row.id, organizationId:row.organization_id, deliveryId:row.delivery_id, expectedWh:BigInt(row.expected_wh),
    deliveredWh:BigInt(row.delivered_wh), varianceWh:BigInt(row.variance_wh), toleranceWh:BigInt(row.tolerance_wh),
    state:row.state, ...(row.reconciled_at?{reconciledAt:new Date(row.reconciled_at)}:{}), createdAt:new Date(row.created_at),
  };
}
function approval(row:ApprovalRow):SettlementApproval {
  return {
    id:row.id, organizationId:row.organization_id, settlementId:row.settlement_id, actorId:row.actor_id,
    decision:row.decision, reviewHash:row.review_hash, ...(row.note?{note:row.note}:{}), createdAt:new Date(row.created_at),
  };
}
function settlementBase(row:SettlementRow) {
  return {
    id:row.id, organizationId:row.organization_id, deliveryId:row.delivery_id, reconciliationId:row.reconciliation_id,
    asset:row.asset, network:row.network, amountMinor:BigInt(row.amount_minor), state:row.state,
    ...(row.reference?{reference:row.reference}:{}), reviewHash:row.review_hash, createdBy:row.created_by,
    approvalsRequired:Number(row.approvals_required), createdAt:new Date(row.created_at), updatedAt:new Date(row.updated_at),
  };
}
function settlementWithControls(row:SettlementRow, approvals:readonly SettlementApproval[]):EnergySettlement {
  const base=settlementBase(row);
  const policy=defaultSettlementApprovalPolicy({
    ...process.env,
    DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED:String(base.approvalsRequired),
  });
  const control=evaluateSettlementControls({
    settlement:{
      settlementId:base.id, organizationId:base.organizationId, deliveryId:base.deliveryId,
      reconciliationId:base.reconciliationId, asset:base.asset, network:base.network, amountMinor:base.amountMinor,
    },
    createdBy:base.createdBy,
    approvals,
    policy,
  });
  return {...base,control};
}

async function idempotent<T>(
  client:PoolClient,
  organizationId:string,
  scope:string,
  key:string,
  action:()=>Promise<T>,
):Promise<T|unknown>{
  await client.query(`select pg_advisory_xact_lock(hashtext($1), hashtext($2))`,[organizationId,`${scope}:${key}`]);
  await client.query(`delete from digital_energy_idempotency where expires_at <= now()`);
  const cached=await client.query<{response:unknown}>(
    `select response from digital_energy_idempotency where organization_id=$1 and scope=$2 and key=$3`,
    [organizationId,scope,key],
  );
  if(cached.rows[0])return cached.rows[0].response;
  const value=await action();
  await client.query(
    `insert into digital_energy_idempotency (organization_id,scope,key,response,expires_at)
     values ($1,$2,$3,$4::jsonb,now()+interval '24 hours')
     on conflict (organization_id,scope,key) do nothing`,
    [organizationId,scope,key,JSON.stringify(value,(_,item)=>typeof item==="bigint"?item.toString():item)],
  );
  return value;
}

async function enqueueOutbox(
  client:PoolClient,
  input:{organizationId:string;topic:string;aggregateType:string;aggregateId:string;payload:Record<string,unknown>},
){
  await client.query(
    `insert into digital_energy_outbox_events
     (id,organization_id,topic,aggregate_type,aggregate_id,payload,state,attempts,next_attempt_at,created_at)
     values ($1,$2,$3,$4,$5,$6::jsonb,'PENDING',0,now(),now())`,
    [
      `outbox_${crypto.randomUUID().replaceAll("-","")}`,
      input.organizationId,
      input.topic,
      input.aggregateType,
      input.aggregateId,
      JSON.stringify(input.payload,(_,value)=>typeof value==="bigint"?value.toString():value),
    ],
  );
}

export class PostgresEnergyOperationsRepository {
  async upsertTwin(input:{
    organizationId:string; id:string; siteId:string; assetType:DigitalTwinAsset["assetType"]; label:string;
    gridAreaId?:string; observedAt:Date; powerW?:string; availabilityPpm?:string; stateOfChargePpm?:string;
    exportLimitW?:string; evidenceRoot?:string; maintenance?:boolean; idempotencyKey:string;
  }){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      const value=await idempotent(client,input.organizationId,`twin:${input.id}:upsert:${input.observedAt.toISOString()}`,input.idempotencyKey,async()=>{
        const item=createDigitalTwinAsset(input);
        const result=await client.query<TwinRow>(
          `insert into digital_energy_twin_assets
           (id,organization_id,site_id,asset_type,label,grid_area_id,observed_at,telemetry_age_seconds,freshness,state,power_w,availability_ppm,state_of_charge_ppm,export_limit_w,evidence_root)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
           on conflict (id) do update set
             site_id=excluded.site_id,asset_type=excluded.asset_type,label=excluded.label,grid_area_id=excluded.grid_area_id,
             observed_at=excluded.observed_at,telemetry_age_seconds=excluded.telemetry_age_seconds,freshness=excluded.freshness,
             state=excluded.state,power_w=excluded.power_w,availability_ppm=excluded.availability_ppm,
             state_of_charge_ppm=excluded.state_of_charge_ppm,export_limit_w=excluded.export_limit_w,
             evidence_root=excluded.evidence_root,updated_at=now()
           where digital_energy_twin_assets.organization_id=excluded.organization_id returning *`,
          [
            item.id,item.organizationId,item.siteId,item.assetType,item.label,item.gridAreaId??null,item.observedAt,
            item.telemetryAgeSeconds,item.freshness,item.state,item.powerW?.toString()??null,item.availabilityPpm?.toString()??null,
            item.stateOfChargePpm?.toString()??null,item.exportLimitW?.toString()??null,item.evidenceRoot??null,
          ],
        );
        if(!result.rows[0])throw new EnergyInvariantError("TWIN_ORGANIZATION_MISMATCH","Digital Twin asset belongs to another organization");
        return twin(result.rows[0]);
      });
      await client.query("commit");
      return value;
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async snapshot(organizationId:string):Promise<EnergyOperationsSnapshot>{
    const pool=getPostgresPool();
    const [twins,deliveries,reconciliations,settlements,approvals,outbox]=await Promise.all([
      pool.query<TwinRow>(`select * from digital_energy_twin_assets where organization_id=$1 order by state,label`,[organizationId]),
      pool.query<DeliveryRow>(`select * from digital_energy_deliveries where organization_id=$1 order by updated_at desc`,[organizationId]),
      pool.query<ReconciliationRow>(`select * from digital_energy_reconciliations where organization_id=$1 order by created_at desc`,[organizationId]),
      pool.query<SettlementRow>(`select * from digital_energy_settlements where organization_id=$1 order by updated_at desc`,[organizationId]),
      pool.query<ApprovalRow>(`select * from digital_energy_settlement_approvals where organization_id=$1 order by created_at`,[organizationId]),
      pool.query<OutboxCountRow>(
        `select count(*)::text as pending from digital_energy_outbox_events where organization_id=$1 and state<>'PUBLISHED'`,
        [organizationId],
      ),
    ]);
    const approvalItems=approvals.rows.map(approval);
    const settlementItems=settlements.rows.map(row=>
      settlementWithControls(row,approvalItems.filter(item=>item.settlementId===row.id)),
    );
    return createOperationsSnapshot({
      organizationId,
      twins:twins.rows.map(twin),
      deliveries:deliveries.rows.map(delivery),
      reconciliations:reconciliations.rows.map(reconciliation),
      settlements:settlementItems,
      pendingOutboxEvents:Number(outbox.rows[0]?.pending??0),
    });
  }

  async createDelivery(input:{
    organizationId:string; id:string; positionId:string; reservationId?:string; committedWh:string;
    intervalStart:Date; intervalEnd:Date; idempotencyKey:string;
  }){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      const value=await idempotent(client,input.organizationId,`delivery:${input.id}:create`,input.idempotencyKey,async()=>{
        const positionRow=await client.query<{id:string;state:string;amount_wh:string}>(
          `select id,state,amount_wh::text from digital_energy_positions where id=$1 and organization_id=$2 for update`,
          [input.positionId,input.organizationId],
        );
        if(!positionRow.rows[0])throw new EnergyInvariantError("ENERGY_POSITION_NOT_FOUND","Energy Position not found");
        if(!input.reservationId)throw new EnergyInvariantError("DELIVERY_RESERVATION_REQUIRED","A live delivery commitment must reference an active Energy Reservation");

        const reservationRow=await client.query<{energy_position_id:string;amount_wh:string;state:string}>(
          `select energy_position_id,amount_wh::text,state from digital_energy_reservations where id=$1 and organization_id=$2 for update`,
          [input.reservationId,input.organizationId],
        );
        const reserved=reservationRow.rows[0];
        if(!reserved||reserved.energy_position_id!==input.positionId)throw new EnergyInvariantError("DELIVERY_RESERVATION_NOT_FOUND","Delivery reservation does not belong to the Energy Position");
        if(reserved.state!=="ACTIVE")throw new EnergyInvariantError("DELIVERY_RESERVATION_NOT_ACTIVE","Delivery requires an active reservation");

        const existing=await client.query<{committed:string}>(
          `select coalesce(sum(committed_wh),0)::text as committed
           from digital_energy_deliveries
           where organization_id=$1 and reservation_id=$2 and state not in ('CANCELLED')`,
          [input.organizationId,input.reservationId],
        );
        if(BigInt(existing.rows[0]?.committed??"0")+BigInt(input.committedWh)>BigInt(reserved.amount_wh)){
          throw new EnergyInvariantError("DELIVERY_EXCEEDS_RESERVATION","Delivery commitments exceed reserved canonical energy");
        }

        const created=createDelivery({
          id:input.id,organizationId:input.organizationId,energyPositionId:input.positionId,
          reservationId:input.reservationId,committedWh:input.committedWh,
          intervalStart:input.intervalStart,intervalEnd:input.intervalEnd,
        });
        const result=await client.query<DeliveryRow>(
          `insert into digital_energy_deliveries
           (id,organization_id,energy_position_id,reservation_id,committed_wh,delivered_wh,state,interval_start,interval_end,created_at,updated_at)
           values ($1,$2,$3,$4,$5,0,'COMMITTED',$6,$7,$8,$8) returning *`,
          [created.id,created.organizationId,created.energyPositionId,created.reservationId??null,created.committedWh.toString(),created.intervalStart,created.intervalEnd,created.createdAt],
        );
        await client.query(
          `update digital_energy_positions set state='COMMITTED',updated_at=now()
           where id=$1 and organization_id=$2 and state in ('AVAILABLE','RESERVED','TRANSFERRED')`,
          [input.positionId,input.organizationId],
        );
        return delivery(result.rows[0]!);
      });
      await client.query("commit");
      return value;
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async recordDelivery(input:{organizationId:string;deliveryId:string;deliveredWh:string;meterEvidenceRoot:string;idempotencyKey:string}){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      const value=await idempotent(client,input.organizationId,`delivery:${input.deliveryId}:record`,input.idempotencyKey,async()=>{
        const locked=await client.query<DeliveryRow>(
          `select * from digital_energy_deliveries where id=$1 and organization_id=$2 for update`,
          [input.deliveryId,input.organizationId],
        );
        if(!locked.rows[0])throw new EnergyInvariantError("DELIVERY_NOT_FOUND","Delivery not found");
        const next=recordDelivery({delivery:delivery(locked.rows[0]),deliveredWh:input.deliveredWh,meterEvidenceRoot:input.meterEvidenceRoot});
        const result=await client.query<DeliveryRow>(
          `update digital_energy_deliveries
           set delivered_wh=$1,state=$2,meter_evidence_root=$3,updated_at=now()
           where id=$4 and organization_id=$5 returning *`,
          [next.deliveredWh.toString(),next.state,next.meterEvidenceRoot,input.deliveryId,input.organizationId],
        );
        await client.query(
          `update digital_energy_positions set state='DELIVERED',updated_at=now()
           where id=$1 and organization_id=$2 and state in ('COMMITTED','DELIVERING')`,
          [next.energyPositionId,input.organizationId],
        );
        return delivery(result.rows[0]!);
      });
      await client.query("commit");
      return value;
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async reconcile(input:{
    organizationId:string; deliveryId:string; reconciliationId:string; toleranceWh:string; approve:boolean; idempotencyKey:string;
  }){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      const value=await idempotent(client,input.organizationId,`delivery:${input.deliveryId}:reconcile`,input.idempotencyKey,async()=>{
        const locked=await client.query<DeliveryRow>(
          `select * from digital_energy_deliveries where id=$1 and organization_id=$2 for update`,
          [input.deliveryId,input.organizationId],
        );
        if(!locked.rows[0])throw new EnergyInvariantError("DELIVERY_NOT_FOUND","Delivery not found");
        const currentDelivery=delivery(locked.rows[0]);
        let recon=reconcileDelivery({id:input.reconciliationId,delivery:currentDelivery,toleranceWh:input.toleranceWh});
        if(input.approve)recon=approveReconciliation(recon);

        const result=await client.query<ReconciliationRow>(
          `insert into digital_energy_reconciliations
           (id,organization_id,delivery_id,expected_wh,delivered_wh,variance_wh,tolerance_wh,state,reconciled_at,created_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *`,
          [recon.id,recon.organizationId,recon.deliveryId,recon.expectedWh.toString(),recon.deliveredWh.toString(),recon.varianceWh.toString(),recon.toleranceWh.toString(),recon.state,recon.reconciledAt??null,recon.createdAt],
        );
        if(recon.state==="RECONCILED"){
          await client.query(`update digital_energy_deliveries set state='RECONCILED',updated_at=now() where id=$1`,[input.deliveryId]);
          await client.query(
            `update digital_energy_positions set state='RECONCILED',updated_at=now()
             where id=$1 and organization_id=$2 and state='DISPUTED'`,
            [currentDelivery.energyPositionId,input.organizationId],
          );
        }else if(recon.state==="REVIEW_REQUIRED"){
          await client.query(`update digital_energy_deliveries set state='DISPUTED',updated_at=now() where id=$1`,[input.deliveryId]);
          await client.query(
            `update digital_energy_positions set state='DISPUTED',updated_at=now()
             where id=$1 and organization_id=$2 and state='DELIVERED'`,
            [currentDelivery.energyPositionId,input.organizationId],
          );
        }
        return reconciliation(result.rows[0]!);
      });
      await client.query("commit");
      return value;
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async createSettlement(input:{
    organizationId:string; settlementId:string; deliveryId:string; reconciliationId:string;
    asset:SettlementAsset; network:EnergySettlementNetwork; amountMinor:string; createdBy:string;
    approvalsRequired?:number; idempotencyKey:string;
  }){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      const value=await idempotent(client,input.organizationId,`settlement:${input.settlementId}:create`,input.idempotencyKey,async()=>{
        const deliveryRow=await client.query<DeliveryRow>(
          `select * from digital_energy_deliveries where id=$1 and organization_id=$2 for update`,
          [input.deliveryId,input.organizationId],
        );
        const reconRow=await client.query<ReconciliationRow>(
          `select * from digital_energy_reconciliations where id=$1 and organization_id=$2`,
          [input.reconciliationId,input.organizationId],
        );
        if(!deliveryRow.rows[0])throw new EnergyInvariantError("DELIVERY_NOT_FOUND","Delivery not found");
        if(!reconRow.rows[0])throw new EnergyInvariantError("RECONCILIATION_NOT_FOUND","Reconciliation not found");

        const policy=defaultSettlementApprovalPolicy({
          ...process.env,
          ...(input.approvalsRequired?{DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED:String(input.approvalsRequired)}:{}),
        });
        const created=createSettlement({
          id:input.settlementId,organizationId:input.organizationId,delivery:delivery(deliveryRow.rows[0]),
          reconciliation:reconciliation(reconRow.rows[0]),asset:input.asset,network:input.network,
          amountMinor:input.amountMinor,createdBy:input.createdBy,approvalsRequired:policy.requiredApprovals,
        });
        const reviewHash=created.reviewHash||settlementReviewHash({
          settlementId:created.id,organizationId:created.organizationId,deliveryId:created.deliveryId,
          reconciliationId:created.reconciliationId,asset:created.asset,network:created.network,amountMinor:created.amountMinor,
        });

        const result=await client.query<SettlementRow>(
          `insert into digital_energy_settlements
           (id,organization_id,delivery_id,reconciliation_id,asset,network,amount_minor,state,review_hash,created_by,approvals_required,created_at,updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,'READY',$8,$9,$10,$11,$11) returning *`,
          [created.id,created.organizationId,created.deliveryId,created.reconciliationId,created.asset,created.network,created.amountMinor.toString(),reviewHash,input.createdBy,policy.requiredApprovals,created.createdAt],
        );

        await client.query(
          `update digital_energy_positions p set state='SETTLING',updated_at=now()
           from digital_energy_deliveries d
           where d.id=$1 and p.id=d.energy_position_id and p.organization_id=$2 and p.state in ('RECONCILED','DELIVERED')`,
          [input.deliveryId,input.organizationId],
        );

        await enqueueOutbox(client,{
          organizationId:input.organizationId,
          topic:"digital-energy.settlement.prepared",
          aggregateType:"ENERGY_SETTLEMENT",
          aggregateId:created.id,
          payload:{
            settlementId:created.id,deliveryId:created.deliveryId,reconciliationId:created.reconciliationId,
            asset:created.asset,network:created.network,amountMinor:created.amountMinor.toString(),
            reviewHash,createdBy:input.createdBy,approvalsRequired:policy.requiredApprovals,
          },
        });
        return settlementWithControls(result.rows[0]!,[]);
      });
      await client.query("commit");
      return value;
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async approveSettlement(input:{
    organizationId:string; settlementId:string; approvalId:string; actorId:string; decision:SettlementApprovalDecision;
    reviewHash:string; note?:string; idempotencyKey:string;
  }){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      const value=await idempotent(client,input.organizationId,`settlement:${input.settlementId}:approval:${input.actorId}`,input.idempotencyKey,async()=>{
        const locked=await client.query<SettlementRow>(
          `select * from digital_energy_settlements where id=$1 and organization_id=$2 for update`,
          [input.settlementId,input.organizationId],
        );
        if(!locked.rows[0])throw new EnergyInvariantError("SETTLEMENT_NOT_FOUND","Settlement not found");
        const current=settlementBase(locked.rows[0]);
        if(current.state!=="READY")throw new EnergyInvariantError("SETTLEMENT_APPROVAL_STATE_INVALID","Only READY settlements accept control approvals");
        if(current.reviewHash!==input.reviewHash)throw new EnergyInvariantError("SETTLEMENT_REVIEW_HASH_MISMATCH","Approval review hash does not match the settlement proposal");

        const policy=defaultSettlementApprovalPolicy({
          ...process.env,
          DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED:String(current.approvalsRequired),
        });
        if(input.decision==="APPROVED"&&policy.makerCheckerRequired&&current.createdBy===input.actorId){
          throw new EnergyInvariantError("SETTLEMENT_MAKER_CHECKER_REQUIRED","Settlement maker cannot approve their own settlement");
        }

        let inserted:ApprovalRow;
        try{
          const result=await client.query<ApprovalRow>(
            `insert into digital_energy_settlement_approvals
             (id,organization_id,settlement_id,actor_id,decision,review_hash,note,created_at)
             values ($1,$2,$3,$4,$5,$6,$7,now()) returning *`,
            [input.approvalId,input.organizationId,input.settlementId,input.actorId,input.decision,input.reviewHash,input.note??null],
          );
          inserted=result.rows[0]!;
        }catch(error){
          if(error&&typeof error==="object"&&"code" in error&&String((error as {code?:unknown}).code)==="23505"){
            throw new EnergyInvariantError("SETTLEMENT_APPROVER_ALREADY_ACTED","Approver has already acted on this settlement");
          }
          throw error;
        }

        const approvals=await client.query<ApprovalRow>(
          `select * from digital_energy_settlement_approvals
           where settlement_id=$1 and organization_id=$2 order by created_at`,
          [input.settlementId,input.organizationId],
        );
        await enqueueOutbox(client,{
          organizationId:input.organizationId,
          topic:"digital-energy.settlement.approval",
          aggregateType:"ENERGY_SETTLEMENT",
          aggregateId:current.id,
          payload:{
            settlementId:current.id,approvalId:inserted.id,actorId:input.actorId,
            decision:input.decision,reviewHash:input.reviewHash,
          },
        });
        return settlementWithControls(locked.rows[0],approvals.rows.map(approval));
      });
      await client.query("commit");
      return value;
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async transitionSettlement(input:{
    organizationId:string; settlementId:string; state:EnergySettlementState; reference?:string; idempotencyKey:string;
  }){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      const value=await idempotent(client,input.organizationId,`settlement:${input.settlementId}:transition:${input.state}`,input.idempotencyKey,async()=>{
        const locked=await client.query<SettlementRow>(
          `select * from digital_energy_settlements where id=$1 and organization_id=$2 for update`,
          [input.settlementId,input.organizationId],
        );
        if(!locked.rows[0])throw new EnergyInvariantError("SETTLEMENT_NOT_FOUND","Settlement not found");
        const current=settlementBase(locked.rows[0]);
        const state=transitionSettlement(current.state,input.state);
        const approvals=await client.query<ApprovalRow>(
          `select * from digital_energy_settlement_approvals
           where settlement_id=$1 and organization_id=$2 order by created_at`,
          [input.settlementId,input.organizationId],
        );

        if(state==="SUBMITTED"){
          const policy=defaultSettlementApprovalPolicy({
            ...process.env,
            DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED:String(current.approvalsRequired),
          });
          const control=evaluateSettlementControls({
            settlement:{
              settlementId:current.id,organizationId:current.organizationId,deliveryId:current.deliveryId,
              reconciliationId:current.reconciliationId,asset:current.asset,network:current.network,amountMinor:current.amountMinor,
            },
            createdBy:current.createdBy,
            approvals:approvals.rows.map(approval),
            policy,
          });
          assertSettlementCanSubmit(control);
        }

        if((state==="CONFIRMED"||state==="RECONCILED")&&!String(input.reference??current.reference??"").trim()){
          throw new EnergyInvariantError("SETTLEMENT_REFERENCE_REQUIRED","Confirmed settlement requires an external network or ledger reference");
        }

        const result=await client.query<SettlementRow>(
          `update digital_energy_settlements
           set state=$1,reference=coalesce($2,reference),updated_at=now()
           where id=$3 and organization_id=$4 returning *`,
          [state,input.reference??null,input.settlementId,input.organizationId],
        );

        await enqueueOutbox(client,{
          organizationId:input.organizationId,
          topic:"digital-energy.settlement.transitioned",
          aggregateType:"ENERGY_SETTLEMENT",
          aggregateId:current.id,
          payload:{settlementId:current.id,from:current.state,to:state,reference:input.reference??current.reference??null},
        });

        if(state==="RECONCILED"){
          await client.query(
            `update digital_energy_positions p set state='SETTLED',updated_at=now()
             from digital_energy_deliveries d
             where d.id=$1 and p.id=d.energy_position_id and p.organization_id=$2 and p.state='SETTLING'`,
            [current.deliveryId,input.organizationId],
          );
          await client.query(
            `update digital_energy_reservations r set state='CONSUMED',updated_at=now()
             from digital_energy_deliveries d
             where d.id=$1 and r.id=d.reservation_id and r.organization_id=$2 and r.state='ACTIVE'`,
            [current.deliveryId,input.organizationId],
          );
        }
        return settlementWithControls(result.rows[0]!,approvals.rows.map(approval));
      });
      await client.query("commit");
      return value;
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  private outboxRecord(row:OutboxRow){
    return {
      id:row.id,organizationId:row.organization_id,topic:row.topic,aggregateType:row.aggregate_type,
      aggregateId:row.aggregate_id,payload:row.payload,state:row.state,attempts:Number(row.attempts),
      nextAttemptAt:new Date(row.next_attempt_at),createdAt:new Date(row.created_at),
      ...(row.processing_started_at?{processingStartedAt:new Date(row.processing_started_at)}:{}),
      ...(row.published_at?{publishedAt:new Date(row.published_at)}:{}),
      ...(row.last_error?{lastError:row.last_error}:{}),
    };
  }

  async listPendingOutbox(organizationId:string,limit=100){
    const result=await getPostgresPool().query<OutboxRow>(
      `select id,organization_id,topic,aggregate_type,aggregate_id,payload,state,attempts,last_error,
              next_attempt_at,processing_started_at,created_at,published_at
       from digital_energy_outbox_events
       where organization_id=$1 and state<>'PUBLISHED'
       order by created_at asc limit $2`,
      [organizationId,Math.max(1,Math.min(limit,500))],
    );
    return result.rows.map(row=>this.outboxRecord(row));
  }

  async claimOutboxBatch(limit=25,maxAttempts=10,leaseSeconds=300){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      const result=await client.query<OutboxRow>(
        `with picked as (
           select id from digital_energy_outbox_events
           where attempts < $2 and (
             (state in ('PENDING','FAILED') and next_attempt_at <= now())
             or (state='PROCESSING' and processing_started_at < now() - ($3::text || ' seconds')::interval)
           )
           order by created_at asc
           for update skip locked
           limit $1
         )
         update digital_energy_outbox_events event
         set state='PROCESSING',attempts=event.attempts+1,last_error=null,processing_started_at=now()
         from picked where event.id=picked.id
         returning event.*`,
        [Math.max(1,Math.min(limit,100)),Math.max(1,maxAttempts),Math.max(30,Math.min(leaseSeconds,3600))],
      );
      await client.query("commit");
      return result.rows.map(row=>this.outboxRecord(row));
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async markOutboxPublished(id:string){
    await getPostgresPool().query(
      `update digital_energy_outbox_events
       set state='PUBLISHED',published_at=now(),processing_started_at=null,last_error=null
       where id=$1 and state='PROCESSING'`,
      [id],
    );
  }

  async markOutboxFailed(id:string,error:string,attempts=1){
    const exponent=Math.max(0,Math.min(attempts-1,10));
    const backoffSeconds=Math.min(3600,15*(2**exponent));
    await getPostgresPool().query(
      `update digital_energy_outbox_events
       set state='FAILED',processing_started_at=null,last_error=$2,
           next_attempt_at=now()+($3::text || ' seconds')::interval
       where id=$1 and state='PROCESSING'`,
      [id,error.slice(0,2000),backoffSeconds],
    );
  }
}
