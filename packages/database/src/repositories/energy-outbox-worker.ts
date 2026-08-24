import { Pool, type PoolConfig, type QueryResultRow } from "pg";
import type { EnergyOutboxEvent, OutboxEventState } from "@powerchain/energy-controls";

interface OutboxRow extends QueryResultRow {
  id:string;
  organization_id:string;
  topic:string;
  aggregate_type:string;
  aggregate_id:string;
  payload:Record<string,unknown>;
  state:OutboxEventState;
  attempts:number;
  last_error:string|null;
  next_attempt_at:Date;
  processing_started_at:Date|null;
  created_at:Date;
  published_at:Date|null;
}

const globalForOutbox=globalThis as unknown as {powerChainOutboxPg?:Pool};

function config():PoolConfig{
  const connectionString=process.env.DATABASE_URL;
  if(!connectionString)throw new Error("DATABASE_URL is required for the Digital Energy outbox worker");
  return{
    connectionString,
    max:Number(process.env.DIGITAL_ENERGY_OUTBOX_POOL_MAX??3),
    idleTimeoutMillis:30_000,
    connectionTimeoutMillis:10_000,
    ssl:process.env.POSTGRES_SSL==="true"?{rejectUnauthorized:true}:undefined,
  };
}
function pool(){
  globalForOutbox.powerChainOutboxPg??=new Pool(config());
  return globalForOutbox.powerChainOutboxPg;
}

export interface ClaimedEnergyOutboxEvent extends EnergyOutboxEvent{
  nextAttemptAt:Date;
  processingStartedAt?:Date;
}

function record(row:OutboxRow):ClaimedEnergyOutboxEvent{
  return{
    id:row.id,
    organizationId:row.organization_id,
    topic:row.topic,
    aggregateType:row.aggregate_type,
    aggregateId:row.aggregate_id,
    payload:row.payload,
    state:row.state,
    attempts:Number(row.attempts),
    createdAt:new Date(row.created_at),
    nextAttemptAt:new Date(row.next_attempt_at),
    ...(row.processing_started_at?{processingStartedAt:new Date(row.processing_started_at)}:{}),
    ...(row.published_at?{publishedAt:new Date(row.published_at)}:{}),
    ...(row.last_error?{lastError:row.last_error}:{}),
  };
}

export class PostgresEnergyOutboxWorkerRepository{
  async claimBatch(input:{limit?:number;maxAttempts?:number;leaseSeconds?:number}={}){
    const limit=Math.max(1,Math.min(input.limit??25,100));
    const maxAttempts=Math.max(1,Math.min(input.maxAttempts??10,100));
    const leaseSeconds=Math.max(30,Math.min(input.leaseSeconds??300,3600));
    const client=await pool().connect();
    try{
      await client.query("begin");
      const result=await client.query<OutboxRow>(`
        with picked as (
          select id
          from digital_energy_outbox_events
          where attempts < $2
            and (
              (state in ('PENDING','FAILED') and next_attempt_at <= now())
              or
              (state='PROCESSING' and processing_started_at < now() - ($3::text || ' seconds')::interval)
            )
          order by created_at asc
          for update skip locked
          limit $1
        )
        update digital_energy_outbox_events event
        set state='PROCESSING',
            attempts=event.attempts+1,
            last_error=null,
            processing_started_at=now()
        from picked
        where event.id=picked.id
        returning event.*
      `,[limit,maxAttempts,leaseSeconds]);
      await client.query("commit");
      return result.rows.map(record);
    }catch(error){
      await client.query("rollback");
      throw error;
    }finally{
      client.release();
    }
  }

  async markPublished(id:string){
    await pool().query(`
      update digital_energy_outbox_events
      set state='PUBLISHED',
          published_at=now(),
          processing_started_at=null,
          last_error=null
      where id=$1 and state='PROCESSING'
    `,[id]);
  }

  async markFailed(input:{id:string;error:string;attempts:number}){
    const exponent=Math.max(0,Math.min(input.attempts-1,10));
    const backoffSeconds=Math.min(3600,15*(2**exponent));
    await pool().query(`
      update digital_energy_outbox_events
      set state='FAILED',
          processing_started_at=null,
          last_error=$2,
          next_attempt_at=now()+($3::text || ' seconds')::interval
      where id=$1 and state='PROCESSING'
    `,[input.id,input.error.slice(0,2000),backoffSeconds]);
  }

  async counts(){
    const result=await pool().query<{state:OutboxEventState;count:string}>(
      `select state,count(*)::text as count from digital_energy_outbox_events group by state`,
    );
    return Object.fromEntries(result.rows.map(row=>[row.state,Number(row.count)])) as Partial<Record<OutboxEventState,number>>;
  }

  async close(){
    if(!globalForOutbox.powerChainOutboxPg)return;
    await globalForOutbox.powerChainOutboxPg.end();
    globalForOutbox.powerChainOutboxPg=undefined;
  }
}
