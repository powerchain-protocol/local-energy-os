import "server-only";
import type { PoolClient, QueryResultRow } from "pg";
import { getPostgresPool } from "../clients/postgres";
import { buildEnergyAssetGraph } from "@powerchain/asset-graph";
import { calculateDigitalEnergySummary, calculatePositionBacking, serializeDigitalEnergy, systemState, type DigitalEnergyPositionBacking, type DigitalEnergySnapshot } from "@powerchain/digital-energy";
import { createPet20Metadata, type ChainRepresentation, type EnergyRwaRecord, type EnergyRepresentationNetwork } from "@powerchain/energy-rwa";
import { EnergyInvariantError, type EnergyBatch, type EnergyPosition, type EnergyProof, type EnergyReservation, type EnergyRetirement, type EnergyRetirementReason } from "@powerchain/energy-core";

type ProofRow = QueryResultRow & { id:string; organization_id:string; site_id:string; meter_id:string; metering_point_id:string|null; source:EnergyProof["source"]; measured_wh:string; verified_wh:string; interval_start:Date; interval_end:Date; quality_score_ppm:string; evidence_root:string; verifier:string; verification_version:string; state:EnergyProof["state"] };
type BatchRow = QueryResultRow & { id:string; organization_id:string; site_id:string; grid_area_id:string|null; source:EnergyBatch["source"]; interval_start:Date; interval_end:Date; measured_wh:string; verified_wh:string; invalidated_wh:string; retired_wh:string; state:EnergyBatch["state"]; evidence_root:string; proof_ids:string[]|null };
type PositionRow = QueryResultRow & { id:string; organization_id:string; energy_batch_id:string; owner_id:string; company_id:string|null; source:EnergyPosition["source"]; amount_wh:string; state:EnergyPosition["state"]; grid_area_id:string|null; interval_start:Date; interval_end:Date; evidence_root:string; created_at:Date; updated_at:Date };
type ReservationRow = QueryResultRow & { id:string; organization_id:string; energy_position_id:string; amount_wh:string; purpose:string; state:EnergyReservation["state"]; created_at:Date; updated_at:Date };
type RepresentationRow = QueryResultRow & { id:string; organization_id:string; energy_position_id:string; network:EnergyRepresentationNetwork; reference:string; amount_wh:string; state:ChainRepresentation["state"]; metadata_standard:"1.0.0"; created_at:Date; updated_at:Date };
type RetirementRow = QueryResultRow & { id:string; organization_id:string; energy_position_id:string; amount_wh:string; reason:EnergyRetirementReason; settlement_id:string|null; trade_id:string|null; receipt_reference:string|null; retired_at:Date };

export interface DigitalEnergyAuditInput { organizationId:string;actorId:string;action:string;resource:string;resourceId?:string;requestId:string;correlationId:string;dataMode:string;metadata?:Record<string,unknown> }
export interface DigitalEnergyAuditRecord extends DigitalEnergyAuditInput { id:string;createdAt:Date }

function proof(row:ProofRow):EnergyProof{return{id:row.id,organizationId:row.organization_id,siteId:row.site_id,meterId:row.meter_id,...(row.metering_point_id?{meteringPointId:row.metering_point_id}:{}),source:row.source,measuredWh:BigInt(row.measured_wh),verifiedWh:BigInt(row.verified_wh),intervalStart:new Date(row.interval_start),intervalEnd:new Date(row.interval_end),qualityScorePpm:BigInt(row.quality_score_ppm),evidenceRoot:row.evidence_root,verifier:row.verifier,verificationVersion:row.verification_version,state:row.state}}
function batch(row:BatchRow):EnergyBatch{return{id:row.id,organizationId:row.organization_id,siteId:row.site_id,...(row.grid_area_id?{gridAreaId:row.grid_area_id}:{}),source:row.source,intervalStart:new Date(row.interval_start),intervalEnd:new Date(row.interval_end),measuredWh:BigInt(row.measured_wh),verifiedWh:BigInt(row.verified_wh),invalidatedWh:BigInt(row.invalidated_wh),retiredWh:BigInt(row.retired_wh),state:row.state,evidenceRoot:row.evidence_root,proofIds:row.proof_ids??[]}}
function position(row:PositionRow):EnergyPosition{return{id:row.id,organizationId:row.organization_id,energyBatchId:row.energy_batch_id,ownerId:row.owner_id,...(row.company_id?{companyId:row.company_id}:{}),source:row.source,amountWh:BigInt(row.amount_wh),state:row.state,...(row.grid_area_id?{gridAreaId:row.grid_area_id}:{}),intervalStart:new Date(row.interval_start),intervalEnd:new Date(row.interval_end),evidenceRoot:row.evidence_root,createdAt:new Date(row.created_at),updatedAt:new Date(row.updated_at)}}
function reservation(row:ReservationRow):EnergyReservation{return{id:row.id,organizationId:row.organization_id,energyPositionId:row.energy_position_id,amountWh:BigInt(row.amount_wh),purpose:row.purpose,state:row.state,createdAt:new Date(row.created_at),updatedAt:new Date(row.updated_at)}}
function representation(row:RepresentationRow):ChainRepresentation{return{id:row.id,organizationId:row.organization_id,energyPositionId:row.energy_position_id,network:row.network,reference:row.reference,amountWh:BigInt(row.amount_wh),state:row.state,metadataStandard:"1.0.0",createdAt:new Date(row.created_at),updatedAt:new Date(row.updated_at)}}
function retirement(row:RetirementRow):EnergyRetirement{return{id:row.id,organizationId:row.organization_id,energyPositionId:row.energy_position_id,amountWh:BigInt(row.amount_wh),reason:row.reason,...(row.settlement_id?{settlementId:row.settlement_id}:{}),...(row.trade_id?{tradeId:row.trade_id}:{}),...(row.receipt_reference?{receiptReference:row.receipt_reference}:{}),retiredAt:new Date(row.retired_at)}}

async function idempotent<T>(client:PoolClient,organizationId:string,scope:string,key:string,action:()=>Promise<T>):Promise<T|unknown>{
  // Serialize concurrent retries for the same organization/scope/key before the
  // side effect runs. The durable unique key alone is insufficient because two
  // transactions could otherwise both execute `action()` before either insert.
  await client.query(`select pg_advisory_xact_lock(hashtext($1), hashtext($2))`,[organizationId,`${scope}:${key}`]);
  await client.query(`delete from digital_energy_idempotency where expires_at <= now()`);
  const cached=await client.query<{response:unknown}>(`select response from digital_energy_idempotency where organization_id=$1 and scope=$2 and key=$3`,[organizationId,scope,key]);
  if(cached.rows[0])return cached.rows[0].response;
  const value=await action();
  const serialized=serializeDigitalEnergy(value);
  await client.query(`insert into digital_energy_idempotency (organization_id,scope,key,response,expires_at) values ($1,$2,$3,$4::jsonb,now()+interval '24 hours') on conflict (organization_id,scope,key) do nothing`,[organizationId,scope,key,JSON.stringify(serialized)]);
  return value;
}

export class PostgresDigitalEnergyRepository{
  async snapshot(organizationId:string):Promise<DigitalEnergySnapshot>{
    const pool=getPostgresPool();
    const [proofRows,batchRows,positionRows,reservationRows,representationRows,retirementRows]=await Promise.all([
      pool.query<ProofRow>(`select * from digital_energy_proofs where organization_id=$1 order by interval_start desc`,[organizationId]),
      pool.query<BatchRow>(`select b.*,coalesce(array_agg(bp.proof_id) filter (where bp.proof_id is not null),'{}') as proof_ids from digital_energy_batches b left join digital_energy_batch_proofs bp on bp.batch_id=b.id where b.organization_id=$1 group by b.id order by b.interval_start desc`,[organizationId]),
      pool.query<PositionRow>(`select * from digital_energy_positions where organization_id=$1 order by created_at desc`,[organizationId]),
      pool.query<ReservationRow>(`select * from digital_energy_reservations where organization_id=$1 order by created_at`,[organizationId]),
      pool.query<RepresentationRow>(`select * from digital_energy_representations where organization_id=$1 order by created_at`,[organizationId]),
      pool.query<RetirementRow>(`select * from digital_energy_retirements where organization_id=$1 order by retired_at`,[organizationId]),
    ]);
    const proofs=proofRows.rows.map(proof);const batches=batchRows.rows.map(batch);const positions=positionRows.rows.map(position);const reservations=reservationRows.rows.map(reservation);const representations=representationRows.rows.map(representation);const retirements=retirementRows.rows.map(retirement);
    const rwas:EnergyRwaRecord[]=positions.map(pos=>({id:`rwa_${pos.id}`,organizationId,position:pos,metadata:createPet20Metadata(pos),reservations:reservations.filter(item=>item.energyPositionId===pos.id),representations:representations.filter(item=>item.energyPositionId===pos.id),retirements:retirements.filter(item=>item.energyPositionId===pos.id),createdAt:pos.createdAt,updatedAt:pos.updatedAt}));
    const summary=calculateDigitalEnergySummary({organizationId,batches,positions,rwas,dataMode:"LIVE"});
    return{summary,proofs,batches,positions,rwas,assetGraph:buildEnergyAssetGraph({organizationId,batches,positions,rwas}),system:systemState()};
  }

  async writeAudit(input:DigitalEnergyAuditInput):Promise<DigitalEnergyAuditRecord>{
    const result=await getPostgresPool().query<{id:string;created_at:Date}>(`insert into digital_energy_audit_events (organization_id,actor_id,action,resource,resource_id,request_id,correlation_id,data_mode,metadata) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) returning id,created_at`,[input.organizationId,input.actorId,input.action,input.resource,input.resourceId??null,input.requestId,input.correlationId,input.dataMode,JSON.stringify(input.metadata??{})]);
    const row=result.rows[0]!;
    return{...input,id:row.id,createdAt:new Date(row.created_at)};
  }

  async listAudit(organizationId:string,limit=100):Promise<DigitalEnergyAuditRecord[]>{
    const safeLimit=Math.max(1,Math.min(250,limit));
    const result=await getPostgresPool().query<{id:string;organization_id:string;actor_id:string;action:string;resource:string;resource_id:string|null;request_id:string;correlation_id:string;data_mode:string;metadata:Record<string,unknown>|null;created_at:Date}>(`select * from digital_energy_audit_events where organization_id=$1 order by created_at desc limit $2`,[organizationId,safeLimit]);
    return result.rows.map(row=>({id:row.id,organizationId:row.organization_id,actorId:row.actor_id,action:row.action,resource:row.resource,...(row.resource_id?{resourceId:row.resource_id}:{}),requestId:row.request_id,correlationId:row.correlation_id,dataMode:row.data_mode,...(row.metadata?{metadata:row.metadata}:{}),createdAt:new Date(row.created_at)}));
  }

  async getPositionBacking(organizationId:string,positionId:string):Promise<DigitalEnergyPositionBacking>{
    const snapshot=await this.snapshot(organizationId);
    const rwa=snapshot.rwas.find((record)=>record.position.id===positionId);
    if(!rwa)throw new EnergyInvariantError("ENERGY_RWA_NOT_FOUND","Energy RWA not found");
    return calculatePositionBacking(rwa);
  }

  async createPosition(input:{organizationId:string;id:string;batchId:string;ownerId:string;amountWh:string;idempotencyKey:string}){
    const client=await getPostgresPool().connect();try{await client.query("begin");const value=await idempotent(client,input.organizationId,"position:create",input.idempotencyKey,async()=>{const batchResult=await client.query<BatchRow>(`select *, '{}'::text[] as proof_ids from digital_energy_batches where id=$1 and organization_id=$2 for update`,[input.batchId,input.organizationId]);const b=batchResult.rows[0];if(!b)throw new EnergyInvariantError("ENERGY_BATCH_NOT_FOUND","Energy Batch not found");const active=await client.query<{amount_wh:string}>(`select coalesce(sum(amount_wh),0)::text as amount_wh from digital_energy_positions where energy_batch_id=$1 and organization_id=$2 and state<>'RETIRED'`,[input.batchId,input.organizationId]);const amount=BigInt(input.amountWh);const backed=BigInt(b.verified_wh)-BigInt(b.invalidated_wh)-BigInt(b.retired_wh);if(BigInt(active.rows[0]?.amount_wh??"0")+amount>backed)throw new EnergyInvariantError("ENERGY_POSITION_OVERISSUANCE","Energy Position issuance would exceed verified backing");const result=await client.query<PositionRow>(`insert into digital_energy_positions (id,organization_id,energy_batch_id,owner_id,source,amount_wh,state,grid_area_id,interval_start,interval_end,evidence_root) values ($1,$2,$3,$4,$5,$6,'AVAILABLE',$7,$8,$9,$10) returning *`,[input.id,input.organizationId,input.batchId,input.ownerId,b.source,input.amountWh,b.grid_area_id,b.interval_start,b.interval_end,b.evidence_root]);return position(result.rows[0]!) });await client.query("commit");return value}catch(error){await client.query("rollback");throw error}finally{client.release()}}

  async reserve(input:{organizationId:string;positionId:string;reservationId:string;amountWh:string;purpose:string;idempotencyKey:string}){
    const client=await getPostgresPool().connect();try{await client.query("begin");const value=await idempotent(client,input.organizationId,`position:${input.positionId}:reserve`,input.idempotencyKey,async()=>{const p=await this.lockPosition(client,input.organizationId,input.positionId);const used=await this.activeAllocationWh(client,input.organizationId,input.positionId);const amount=BigInt(input.amountWh);if(used+amount>BigInt(p.amount_wh))throw new EnergyInvariantError("ENERGY_POSITION_BACKING_EXCEEDED","Reservation exceeds remaining canonical backing");const result=await client.query<ReservationRow>(`insert into digital_energy_reservations (id,organization_id,energy_position_id,amount_wh,purpose,state) values ($1,$2,$3,$4,$5,'ACTIVE') returning *`,[input.reservationId,input.organizationId,input.positionId,input.amountWh,input.purpose]);await client.query(`update digital_energy_positions set state='RESERVED',updated_at=now() where id=$1 and state='AVAILABLE'`,[input.positionId]);return reservation(result.rows[0]!) });await client.query("commit");return value}catch(error){await client.query("rollback");throw error}finally{client.release()}}

  async releaseReservation(input:{organizationId:string;reservationId:string;idempotencyKey:string}){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      const value=await idempotent(client,input.organizationId,`reservation:${input.reservationId}:release`,input.idempotencyKey,async()=>{
        const locked=await client.query<ReservationRow>(`select * from digital_energy_reservations where id=$1 and organization_id=$2 for update`,[input.reservationId,input.organizationId]);
        const current=locked.rows[0];
        if(!current)throw new EnergyInvariantError("ENERGY_RESERVATION_NOT_FOUND","Energy reservation not found");
        if(current.state==="RELEASED")return reservation(current);
        if(current.state!=="ACTIVE")throw new EnergyInvariantError("RESERVATION_NOT_ACTIVE","Only active reservations can be released");
        const updated=await client.query<ReservationRow>(`update digital_energy_reservations set state='RELEASED',updated_at=now() where id=$1 and organization_id=$2 returning *`,[input.reservationId,input.organizationId]);
        const remaining=await client.query<{count:string}>(`select count(*)::text as count from digital_energy_reservations where organization_id=$1 and energy_position_id=$2 and state='ACTIVE'`,[input.organizationId,current.energy_position_id]);
        if(BigInt(remaining.rows[0]?.count??"0")===0n){
          await client.query(`update digital_energy_positions set state='AVAILABLE',updated_at=now() where id=$1 and organization_id=$2 and state='RESERVED'`,[current.energy_position_id,input.organizationId]);
        }
        return reservation(updated.rows[0]!);
      });
      await client.query("commit");
      return value;
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async represent(input:{organizationId:string;positionId:string;representationId:string;network:EnergyRepresentationNetwork;reference:string;amountWh:string;idempotencyKey:string}){
    const client=await getPostgresPool().connect();try{await client.query("begin");const value=await idempotent(client,input.organizationId,`position:${input.positionId}:represent`,input.idempotencyKey,async()=>{const p=await this.lockPosition(client,input.organizationId,input.positionId);const used=await this.activeAllocationWh(client,input.organizationId,input.positionId);const amount=BigInt(input.amountWh);if(used+amount>BigInt(p.amount_wh))throw new EnergyInvariantError("CROSS_CHAIN_OVERISSUANCE","Solana + Sui representation would exceed canonical backing");const result=await client.query<RepresentationRow>(`insert into digital_energy_representations (id,organization_id,energy_position_id,network,reference,amount_wh,state,metadata_standard) values ($1,$2,$3,$4,$5,$6,'ACTIVE','1.0.0') returning *`,[input.representationId,input.organizationId,input.positionId,input.network,input.reference,input.amountWh]);return representation(result.rows[0]!) });await client.query("commit");return value}catch(error){await client.query("rollback");throw error}finally{client.release()}}

  async retireRepresentation(input:{organizationId:string;representationId:string;idempotencyKey:string}){
    const client=await getPostgresPool().connect();try{await client.query("begin");const value=await idempotent(client,input.organizationId,`representation:${input.representationId}:retire`,input.idempotencyKey,async()=>{const result=await client.query<RepresentationRow>(`update digital_energy_representations set state='RETIRED',updated_at=now() where id=$1 and organization_id=$2 returning *`,[input.representationId,input.organizationId]);if(!result.rows[0])throw new EnergyInvariantError("CHAIN_REPRESENTATION_NOT_FOUND","Chain representation not found");return representation(result.rows[0])});await client.query("commit");return value}catch(error){await client.query("rollback");throw error}finally{client.release()}}

  async retirePosition(input:{organizationId:string;positionId:string;retirementId:string;reason:EnergyRetirementReason;idempotencyKey:string}){
    const client=await getPostgresPool().connect();try{await client.query("begin");const value=await idempotent(client,input.organizationId,`position:${input.positionId}:retire`,input.idempotencyKey,async()=>{const p=await this.lockPosition(client,input.organizationId,input.positionId);const activeReservations=await client.query<{count:string}>(`select count(*)::text as count from digital_energy_reservations where organization_id=$1 and energy_position_id=$2 and state='ACTIVE'`,[input.organizationId,input.positionId]);if(BigInt(activeReservations.rows[0]?.count??"0")>0n)throw new EnergyInvariantError("ACTIVE_RESERVATIONS_MUST_RELEASE_FIRST","Active reservations must be released before retirement");const activeRepresentations=await client.query<{count:string}>(`select count(*)::text as count from digital_energy_representations where organization_id=$1 and energy_position_id=$2 and state<>'RETIRED'`,[input.organizationId,input.positionId]);if(BigInt(activeRepresentations.rows[0]?.count??"0")>0n)throw new EnergyInvariantError("ACTIVE_CHAIN_REPRESENTATIONS_MUST_RETIRE_FIRST","Active Solana/Sui representations must retire first");const retired=await client.query<{amount_wh:string}>(`select coalesce(sum(amount_wh),0)::text as amount_wh from digital_energy_retirements where organization_id=$1 and energy_position_id=$2`,[input.organizationId,input.positionId]);const remaining=BigInt(p.amount_wh)-BigInt(retired.rows[0]?.amount_wh??"0");if(remaining<=0n)throw new EnergyInvariantError("ENERGY_POSITION_ALREADY_RETIRED","Energy Position is already retired");const result=await client.query<RetirementRow>(`insert into digital_energy_retirements (id,organization_id,energy_position_id,amount_wh,reason) values ($1,$2,$3,$4,$5) returning *`,[input.retirementId,input.organizationId,input.positionId,remaining.toString(),input.reason]);await client.query(`update digital_energy_positions set state='RETIRED',updated_at=now() where id=$1`,[input.positionId]);await client.query(`update digital_energy_batches set retired_wh=retired_wh+$1,updated_at=now() where id=$2`,[remaining.toString(),p.energy_batch_id]);return retirement(result.rows[0]!) });await client.query("commit");return value}catch(error){await client.query("rollback");throw error}finally{client.release()}}

  private async lockPosition(client:PoolClient,organizationId:string,positionId:string){const result=await client.query<PositionRow>(`select * from digital_energy_positions where id=$1 and organization_id=$2 for update`,[positionId,organizationId]);const row=result.rows[0];if(!row)throw new EnergyInvariantError("ENERGY_POSITION_NOT_FOUND","Energy Position not found");if(row.state==='RETIRED')throw new EnergyInvariantError("ENERGY_POSITION_ALREADY_RETIRED","Energy Position is retired");return row}
  private async activeAllocationWh(client:PoolClient,organizationId:string,positionId:string){const result=await client.query<{used:string}>(`select ((select coalesce(sum(amount_wh),0) from digital_energy_reservations where organization_id=$1 and energy_position_id=$2 and state='ACTIVE')+(select coalesce(sum(amount_wh),0) from digital_energy_representations where organization_id=$1 and energy_position_id=$2 and state<>'RETIRED')+(select coalesce(sum(amount_wh),0) from digital_energy_retirements where organization_id=$1 and energy_position_id=$2))::text as used`,[organizationId,positionId]);return BigInt(result.rows[0]?.used??"0")}
}
