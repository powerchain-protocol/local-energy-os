import "server-only";
import type { PoolClient, QueryResultRow } from "pg";
import { getPostgresPool } from "../clients/postgres";
import {
  assertGridConstrainedCommitment,
  assertLocalEnergyOrderTransition,
  assertMeterEvidence,
  calculateLocalEnergyPricing,
  reconcileLocalEnergyDelivery,
  type LocalEnergyListingMode,
  type LocalEnergyListingRecord,
  type LocalEnergyOrderAction,
  type LocalEnergyOrderRecord,
  type LocalEnergyOrderState,
  type LocalEnergySettlementAsset,
  type LocalEnergySource,
} from "@powerchain/local-energy";

interface ListingRow extends QueryResultRow {
  id:string;
  organization_id:string;
  seller_organization_id:string;
  seller_name:string;
  title:string;
  mode:LocalEnergyListingMode;
  source:LocalEnergySource;
  grid_area_id:string;
  location:string;
  latitude:string|null;
  longitude:string|null;
  quantity_wh:string;
  available_wh:string;
  minimum_wh:string;
  export_limit_wh:string|null;
  price_micros_per_kwh:string;
  currency:"EUR"|"USD";
  settlement_asset:LocalEnergySettlementAsset;
  renewable_percent:number;
  verified:boolean;
  meter_verified:boolean;
  delivery_start:Date;
  delivery_end:Date;
  state:"ACTIVE"|"PAUSED"|"COMPLETED"|"CANCELLED";
  metadata:Record<string,unknown>;
  created_at:Date;
  updated_at:Date;
}

interface OrderRow extends QueryResultRow {
  id:string;
  organization_id:string;
  listing_id:string;
  buyer_id:string;
  quantity_wh:string;
  expected_wh:string;
  delivered_wh:string;
  variance_wh:string;
  subtotal_micros:string;
  network_fee_micros:string;
  reserve_micros:string;
  total_micros:string;
  currency:"EUR"|"USD";
  settlement_asset:LocalEnergySettlementAsset;
  state:LocalEnergyOrderState;
  idempotency_key:string;
  reservation_reference:string|null;
  meter_evidence_root:string|null;
  settlement_reference:string|null;
  tolerance_wh:string;
  created_at:Date;
  updated_at:Date;
}

interface FlexRow extends QueryResultRow {
  id:string;
  organization_id:string;
  grid_area_id:string;
  direction:"INCREASE_EXPORT"|"REDUCE_EXPORT"|"INCREASE_IMPORT"|"REDUCE_IMPORT";
  requested_wh:string;
  available_wh:string;
  state:"OPEN"|"RESERVED"|"DELIVERING"|"COMPLETED"|"CANCELLED";
  idempotency_key:string;
  starts_at:Date;
  ends_at:Date;
  created_at:Date;
  updated_at:Date;
}

function listing(row:ListingRow):LocalEnergyListingRecord&{latitude?:number;longitude?:number;metadata:Record<string,unknown>;createdAt:Date;updatedAt:Date}{
  return{
    id:row.id,
    organizationId:row.organization_id,
    sellerOrganizationId:row.seller_organization_id,
    sellerName:row.seller_name,
    title:row.title,
    mode:row.mode,
    source:row.source,
    gridAreaId:row.grid_area_id,
    location:row.location,
    quantityWh:BigInt(row.quantity_wh),
    availableWh:BigInt(row.available_wh),
    minimumWh:BigInt(row.minimum_wh),
    ...(row.export_limit_wh!==null?{exportLimitWh:BigInt(row.export_limit_wh)}:{}),
    priceMicrosPerKwh:BigInt(row.price_micros_per_kwh),
    currency:row.currency,
    settlementAsset:row.settlement_asset,
    renewablePercent:Number(row.renewable_percent),
    verified:Boolean(row.verified),
    meterVerified:Boolean(row.meter_verified),
    deliveryStart:new Date(row.delivery_start),
    deliveryEnd:new Date(row.delivery_end),
    state:row.state,
    ...(row.latitude!==null?{latitude:Number(row.latitude)}:{}),
    ...(row.longitude!==null?{longitude:Number(row.longitude)}:{}),
    metadata:row.metadata??{},
    createdAt:new Date(row.created_at),
    updatedAt:new Date(row.updated_at),
  };
}

function order(row:OrderRow):LocalEnergyOrderRecord&{idempotencyKey:string;toleranceWh:bigint}{
  return{
    id:row.id,
    organizationId:row.organization_id,
    listingId:row.listing_id,
    buyerId:row.buyer_id,
    quantityWh:BigInt(row.quantity_wh),
    expectedWh:BigInt(row.expected_wh),
    deliveredWh:BigInt(row.delivered_wh),
    varianceWh:BigInt(row.variance_wh),
    subtotalMicros:BigInt(row.subtotal_micros),
    networkFeeMicros:BigInt(row.network_fee_micros),
    reserveMicros:BigInt(row.reserve_micros),
    totalMicros:BigInt(row.total_micros),
    currency:row.currency,
    settlementAsset:row.settlement_asset,
    state:row.state,
    ...(row.reservation_reference?{reservationReference:row.reservation_reference}:{}),
    ...(row.meter_evidence_root?{meterEvidenceRoot:row.meter_evidence_root}:{}),
    ...(row.settlement_reference?{settlementReference:row.settlement_reference}:{}),
    idempotencyKey:row.idempotency_key,
    toleranceWh:BigInt(row.tolerance_wh),
    createdAt:new Date(row.created_at),
    updatedAt:new Date(row.updated_at),
  };
}

async function advisoryLock(client:PoolClient,organizationId:string,scope:string){
  await client.query("select pg_advisory_xact_lock(hashtext($1),hashtext($2))",[organizationId,scope]);
}

async function findOrder(client:PoolClient,organizationId:string,id:string,forUpdate=false){
  const result=await client.query<OrderRow>(
    `select * from local_energy_orders where organization_id=$1 and id=$2${forUpdate?" for update":""}`,
    [organizationId,id],
  );
  return result.rows[0]??null;
}

export class PostgresLocalEnergyRepository{
  async listListings(input:{
    organizationId:string;
    mode?:LocalEnergyListingMode;
    source?:LocalEnergySource;
    gridAreaId?:string;
    limit?:number;
  }){
    const values:unknown[]=[input.organizationId];
    const clauses=["organization_id=$1","state='ACTIVE'","available_wh>0","delivery_end>now()"];
    if(input.mode){values.push(input.mode);clauses.push(`mode=$${values.length}`)}
    if(input.source){values.push(input.source);clauses.push(`source=$${values.length}`)}
    if(input.gridAreaId){values.push(input.gridAreaId);clauses.push(`grid_area_id=$${values.length}`)}
    values.push(Math.max(1,Math.min(input.limit??100,250)));
    const result=await getPostgresPool().query<ListingRow>(`
      select * from local_energy_listings
      where ${clauses.join(" and ")}
      order by delivery_start asc, price_micros_per_kwh asc
      limit $${values.length}
    `,values);
    return result.rows.map(listing);
  }


async createListing(input:{
  id:string;
  organizationId:string;
  sellerOrganizationId:string;
  sellerName:string;
  title:string;
  mode:LocalEnergyListingMode;
  source:LocalEnergySource;
  gridAreaId:string;
  location:string;
  latitude?:number;
  longitude?:number;
  quantityWh:bigint;
  minimumWh:bigint;
  exportLimitWh?:bigint;
  priceMicrosPerKwh:bigint;
  currency:"EUR"|"USD";
  settlementAsset:LocalEnergySettlementAsset;
  renewablePercent:number;
  verified:boolean;
  meterVerified:boolean;
  deliveryStart:Date;
  deliveryEnd:Date;
  metadata?:Record<string,unknown>;
}){
  if(input.quantityWh<=0n||input.minimumWh<=0n||input.minimumWh>input.quantityWh)throw Object.assign(new Error("Invalid Local Energy listing quantity"),{code:"LOCAL_ENERGY_LISTING_QUANTITY_INVALID"});
  if(input.priceMicrosPerKwh<0n)throw Object.assign(new Error("Local Energy listing price must be non-negative"),{code:"LOCAL_ENERGY_LISTING_PRICE_INVALID"});
  if(input.renewablePercent<0||input.renewablePercent>100)throw Object.assign(new Error("renewablePercent must be 0–100"),{code:"LOCAL_ENERGY_RENEWABLE_PERCENT_INVALID"});
  if(input.deliveryEnd<=input.deliveryStart)throw Object.assign(new Error("Local Energy delivery window is invalid"),{code:"LOCAL_ENERGY_DELIVERY_WINDOW_INVALID"});

  const client=await getPostgresPool().connect();
  try{
    await client.query("begin");
    await advisoryLock(client,input.organizationId,`local-energy-listing:${input.id}`);
    const existing=await client.query<ListingRow>(`select * from local_energy_listings where id=$1 for update`,[input.id]);
    if(existing.rows[0]){
      const row=existing.rows[0];
      const same=
        row.organization_id===input.organizationId&&
        row.seller_organization_id===input.sellerOrganizationId&&
        row.title===input.title&&row.mode===input.mode&&row.source===input.source&&
        row.grid_area_id===input.gridAreaId&&row.location===input.location&&
        BigInt(row.quantity_wh)===input.quantityWh&&BigInt(row.minimum_wh)===input.minimumWh&&
        BigInt(row.price_micros_per_kwh)===input.priceMicrosPerKwh&&
        row.currency===input.currency&&row.settlement_asset===input.settlementAsset&&
        Number(row.renewable_percent)===input.renewablePercent&&
        new Date(row.delivery_start).getTime()===input.deliveryStart.getTime()&&
        new Date(row.delivery_end).getTime()===input.deliveryEnd.getTime();
      if(!same)throw Object.assign(new Error("Idempotency key was reused with a different Local Energy listing payload"),{code:"LOCAL_ENERGY_IDEMPOTENCY_CONFLICT"});
      await client.query("commit");
      return listing(row);
    }

    const result=await client.query<ListingRow>(`
      insert into local_energy_listings
      (id,organization_id,seller_organization_id,seller_name,title,mode,source,grid_area_id,location,latitude,longitude,quantity_wh,available_wh,minimum_wh,export_limit_wh,price_micros_per_kwh,currency,settlement_asset,renewable_percent,verified,meter_verified,delivery_start,delivery_end,metadata)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23::jsonb)
      returning *
    `,[
      input.id,input.organizationId,input.sellerOrganizationId,input.sellerName,input.title,input.mode,input.source,input.gridAreaId,input.location,
      input.latitude??null,input.longitude??null,input.quantityWh.toString(),input.minimumWh.toString(),input.exportLimitWh?.toString()??null,
      input.priceMicrosPerKwh.toString(),input.currency,input.settlementAsset,input.renewablePercent,input.verified,input.meterVerified,
      input.deliveryStart,input.deliveryEnd,JSON.stringify(input.metadata??{}),
    ]);
    await client.query("commit");
    return listing(result.rows[0]!);
  }catch(error){
    await client.query("rollback");
    throw error;
  }finally{
    client.release();
  }
}
  async createOrder(input:{
    id:string;
    organizationId:string;
    listingId:string;
    buyerId:string;
    quantityWh:bigint;
    idempotencyKey:string;
    toleranceWh?:bigint;
  }){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      await advisoryLock(client,input.organizationId,`local-energy-order:${input.listingId}`);

      const existing=await client.query<OrderRow>(
        `select * from local_energy_orders where organization_id=$1 and idempotency_key=$2`,
        [input.organizationId,input.idempotencyKey],
      );
      if(existing.rows[0]){
        const replay=existing.rows[0];
        if(replay.listing_id!==input.listingId||BigInt(replay.quantity_wh)!==input.quantityWh||replay.buyer_id!==input.buyerId){
          throw Object.assign(new Error("Idempotency key was reused with a different Local Energy order payload"),{code:"LOCAL_ENERGY_IDEMPOTENCY_CONFLICT"});
        }
        await client.query("commit");
        return order(replay);
      }

      const listingResult=await client.query<ListingRow>(
        `select * from local_energy_listings where organization_id=$1 and id=$2 for update`,
        [input.organizationId,input.listingId],
      );
      const source=listingResult.rows[0];
      if(!source)throw Object.assign(new Error("Local Energy listing not found"),{code:"LOCAL_ENERGY_LISTING_NOT_FOUND"});
      if(source.state!=="ACTIVE")throw Object.assign(new Error("Local Energy listing is not active"),{code:"LOCAL_ENERGY_LISTING_NOT_ACTIVE"});
      if(new Date(source.delivery_end).getTime()<=Date.now())throw Object.assign(new Error("Local Energy listing delivery window has ended"),{code:"LOCAL_ENERGY_LISTING_EXPIRED"});

      const availableWh=BigInt(source.available_wh);
      const minimumWh=BigInt(source.minimum_wh);
      if(input.quantityWh<minimumWh)throw Object.assign(new Error("Requested quantity is below the listing minimum"),{code:"LOCAL_ENERGY_BELOW_MINIMUM"});
      try{
        assertGridConstrainedCommitment({
          requestedWh:input.quantityWh,
          availableWh,
          ...(source.export_limit_wh!==null?{exportLimitWh:BigInt(source.export_limit_wh)}:{}),
          direction:source.mode==="BUY"?"IMPORT":"EXPORT",
        });
      }catch(error){
        throw Object.assign(error instanceof Error?error:new Error("Local Energy commitment rejected"),{code:error instanceof Error?error.message:"LOCAL_ENERGY_COMMITMENT_REJECTED"});
      }

      const pricing=calculateLocalEnergyPricing({
        quantityWh:input.quantityWh,
        priceMicrosPerKwh:BigInt(source.price_micros_per_kwh),
      });

      const created=await client.query<OrderRow>(`
        insert into local_energy_orders
        (id,organization_id,listing_id,buyer_id,quantity_wh,expected_wh,subtotal_micros,network_fee_micros,reserve_micros,total_micros,currency,settlement_asset,state,idempotency_key,tolerance_wh)
        values ($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,'REVIEW_REQUIRED',$12,$13)
        returning *
      `,[
        input.id,input.organizationId,input.listingId,input.buyerId,input.quantityWh.toString(),
        pricing.subtotalMicros.toString(),pricing.networkFeeMicros.toString(),pricing.reserveMicros.toString(),pricing.totalMicros.toString(),
        source.currency,source.settlement_asset,input.idempotencyKey,(input.toleranceWh??0n).toString(),
      ]);

      await client.query(
        `update local_energy_listings set available_wh=available_wh-$3,updated_at=now() where organization_id=$1 and id=$2`,
        [input.organizationId,input.listingId,input.quantityWh.toString()],
      );

      await client.query("commit");
      return order(created.rows[0]!);
    }catch(error){
      await client.query("rollback");
      throw error;
    }finally{
      client.release();
    }
  }

  async listOrders(organizationId:string,limit=100){
    const result=await getPostgresPool().query<OrderRow>(`
      select * from local_energy_orders where organization_id=$1 order by updated_at desc limit $2
    `,[organizationId,Math.max(1,Math.min(limit,500))]);
    return result.rows.map(order);
  }

  async getOrder(organizationId:string,id:string){
    const result=await getPostgresPool().query<OrderRow>(
      `select * from local_energy_orders where organization_id=$1 and id=$2`,
      [organizationId,id],
    );
    return result.rows[0]?order(result.rows[0]):null;
  }

  async applyOrderAction(input:{
    organizationId:string;
    id:string;
    action:LocalEnergyOrderAction;
    reservationReference?:string;
    deliveredWh?:bigint;
    meterEvidenceRoot?:string;
    toleranceWh?:bigint;
    settlementReference?:string;
    idempotencyKey:string;
  }){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      await advisoryLock(client,input.organizationId,`local-energy-order:${input.id}`);
      const row=await findOrder(client,input.organizationId,input.id,true);
      if(!row)throw Object.assign(new Error("Local Energy order not found"),{code:"LOCAL_ENERGY_ORDER_NOT_FOUND"});
      const current=order(row);
      const scope=`order-action:${input.id}`;
      const prior=await client.query<{resource_id:string|null}>(
        `select resource_id from local_energy_idempotency where organization_id=$1 and scope=$2 and key=$3`,
        [input.organizationId,scope,input.idempotencyKey],
      );
      if(prior.rows[0]){
        await client.query("commit");
        return current;
      }
      let next:LocalEnergyOrderState=current.state;
      let deliveredWh=current.deliveredWh;
      let varianceWh=current.varianceWh;
      let meterEvidenceRoot=current.meterEvidenceRoot??null;
      let reservationReference=current.reservationReference??null;
      let settlementReference=current.settlementReference??null;
      let toleranceWh=input.toleranceWh??current.toleranceWh;

      switch(input.action){
        case "CONFIRM_RESERVATION":
          next="RESERVED";
          if(!input.reservationReference?.trim())throw Object.assign(new Error("External reservation or wallet reference is required"),{code:"LOCAL_ENERGY_RESERVATION_REFERENCE_REQUIRED"});
          reservationReference=input.reservationReference.trim();
          break;
        case "START_DELIVERY":
          next="DELIVERING";
          break;
        case "RECORD_DELIVERY":
          next="DELIVERED";
          deliveredWh=input.deliveredWh??0n;
          meterEvidenceRoot=input.meterEvidenceRoot?.trim()??"";
          try{assertMeterEvidence({deliveredWh,meterEvidenceRoot})}catch(error){throw Object.assign(error instanceof Error?error:new Error("Meter evidence required"),{code:error instanceof Error?error.message:"LOCAL_ENERGY_METER_EVIDENCE_REQUIRED"})}
          break;
        case "RECONCILE":{
          next="RECONCILED";
          if(!current.meterEvidenceRoot)throw Object.assign(new Error("Meter evidence is required before reconciliation"),{code:"LOCAL_ENERGY_METER_EVIDENCE_REQUIRED"});
          const result=reconcileLocalEnergyDelivery({expectedWh:current.expectedWh,deliveredWh:current.deliveredWh,toleranceWh});
          varianceWh=result.varianceWh;
          break;
        }
        case "MARK_SETTLEMENT_READY":
          next="SETTLEMENT_READY";
          if(!current.meterEvidenceRoot||current.deliveredWh<=0n)throw Object.assign(new Error("Meter-evidenced delivery is required before financial settlement"),{code:"LOCAL_ENERGY_METER_EVIDENCE_REQUIRED"});
          break;
        case "MARK_SETTLED":
          next="SETTLED";
          if(!input.settlementReference?.trim())throw Object.assign(new Error("External settlement reference is required"),{code:"LOCAL_ENERGY_SETTLEMENT_REFERENCE_REQUIRED"});
          settlementReference=input.settlementReference.trim();
          break;
        case "CANCEL":
          next="CANCELLED";
          break;
        case "DISPUTE":
          next="DISPUTED";
          break;
      }

      try{assertLocalEnergyOrderTransition(current.state,next)}catch(error){throw Object.assign(error instanceof Error?error:new Error("Invalid order transition"),{code:"LOCAL_ENERGY_ORDER_TRANSITION_INVALID"})}

      const updated=await client.query<OrderRow>(`
        update local_energy_orders
        set state=$3,reservation_reference=$4,delivered_wh=$5,variance_wh=$6,meter_evidence_root=$7,tolerance_wh=$8,settlement_reference=$9,updated_at=now()
        where organization_id=$1 and id=$2 and state=$10
        returning *
      `,[
        input.organizationId,input.id,next,reservationReference,deliveredWh.toString(),varianceWh.toString(),meterEvidenceRoot,
        toleranceWh.toString(),settlementReference,current.state,
      ]);
      if(!updated.rows[0])throw Object.assign(new Error("Concurrent Local Energy order update detected"),{code:"LOCAL_ENERGY_ORDER_CONFLICT"});

      if(next==="CANCELLED"&&(current.state==="REVIEW_REQUIRED"||current.state==="RESERVED")){
        await client.query(
          `update local_energy_listings set available_wh=least(quantity_wh,available_wh+$3),updated_at=now() where organization_id=$1 and id=$2`,
          [input.organizationId,current.listingId,current.quantityWh.toString()],
        );
      }

      await client.query(
        `insert into local_energy_idempotency (organization_id,scope,key,resource_id) values ($1,$2,$3,$4)`,
        [input.organizationId,scope,input.idempotencyKey,input.id],
      );

      await client.query("commit");
      return order(updated.rows[0]);
    }catch(error){
      await client.query("rollback");
      throw error;
    }finally{
      client.release();
    }
  }

  async listFlexibility(organizationId:string,limit=100){
    const result=await getPostgresPool().query<FlexRow>(`
      select * from local_energy_flexibility_signals
      where organization_id=$1
      order by starts_at asc
      limit $2
    `,[organizationId,Math.max(1,Math.min(limit,250))]);
    return result.rows.map(row=>({
      id:row.id,organizationId:row.organization_id,gridAreaId:row.grid_area_id,direction:row.direction,
      requestedWh:BigInt(row.requested_wh),availableWh:BigInt(row.available_wh),state:row.state,
      startsAt:new Date(row.starts_at),endsAt:new Date(row.ends_at),createdAt:new Date(row.created_at),updatedAt:new Date(row.updated_at),
    }));
  }


async createFlexibility(input:{
  id:string;
  organizationId:string;
  gridAreaId:string;
  direction:"INCREASE_EXPORT"|"REDUCE_EXPORT"|"INCREASE_IMPORT"|"REDUCE_IMPORT";
  requestedWh:bigint;
  availableWh:bigint;
  startsAt:Date;
  endsAt:Date;
  idempotencyKey:string;
}){
  if(input.requestedWh<=0n||input.availableWh<0n||input.requestedWh>input.availableWh)throw Object.assign(new Error("Flexibility quantity exceeds available physical capacity"),{code:"LOCAL_ENERGY_FLEXIBILITY_NOT_BACKED"});
  if(input.endsAt<=input.startsAt)throw Object.assign(new Error("Flexibility time window is invalid"),{code:"LOCAL_ENERGY_FLEXIBILITY_WINDOW_INVALID"});

  const client=await getPostgresPool().connect();
  try{
    await client.query("begin");
    await advisoryLock(client,input.organizationId,`local-energy-flex:${input.idempotencyKey}`);
    const existing=await client.query<FlexRow>(
      `select * from local_energy_flexibility_signals where organization_id=$1 and idempotency_key=$2 for update`,
      [input.organizationId,input.idempotencyKey],
    );
    if(existing.rows[0]){
      const row=existing.rows[0];
      const same=row.grid_area_id===input.gridAreaId&&row.direction===input.direction&&
        BigInt(row.requested_wh)===input.requestedWh&&BigInt(row.available_wh)===input.availableWh&&
        new Date(row.starts_at).getTime()===input.startsAt.getTime()&&new Date(row.ends_at).getTime()===input.endsAt.getTime();
      if(!same)throw Object.assign(new Error("Idempotency key was reused with a different flexibility payload"),{code:"LOCAL_ENERGY_IDEMPOTENCY_CONFLICT"});
      await client.query("commit");
      return{
        id:row.id,organizationId:row.organization_id,gridAreaId:row.grid_area_id,direction:row.direction,
        requestedWh:BigInt(row.requested_wh),availableWh:BigInt(row.available_wh),state:row.state,
        startsAt:new Date(row.starts_at),endsAt:new Date(row.ends_at),createdAt:new Date(row.created_at),updatedAt:new Date(row.updated_at),
      };
    }

    const result=await client.query<FlexRow>(`
      insert into local_energy_flexibility_signals
      (id,organization_id,grid_area_id,direction,requested_wh,available_wh,state,idempotency_key,starts_at,ends_at)
      values ($1,$2,$3,$4,$5,$6,'OPEN',$7,$8,$9)
      returning *
    `,[input.id,input.organizationId,input.gridAreaId,input.direction,input.requestedWh.toString(),input.availableWh.toString(),input.idempotencyKey,input.startsAt,input.endsAt]);
    await client.query("commit");
    const row=result.rows[0]!;
    return{
      id:row.id,organizationId:row.organization_id,gridAreaId:row.grid_area_id,direction:row.direction,
      requestedWh:BigInt(row.requested_wh),availableWh:BigInt(row.available_wh),state:row.state,
      startsAt:new Date(row.starts_at),endsAt:new Date(row.ends_at),createdAt:new Date(row.created_at),updatedAt:new Date(row.updated_at),
    };
  }catch(error){
    await client.query("rollback");
    throw error;
  }finally{
    client.release();
  }
}
  async writeAudit(input:{
    organizationId:string;actorId:string;action:string;resource:string;resourceId?:string;
    requestId:string;correlationId:string;dataMode:string;metadata?:Record<string,unknown>;
  }){
    await getPostgresPool().query(`
      insert into local_energy_audit_events
      (organization_id,actor_id,action,resource,resource_id,request_id,correlation_id,data_mode,metadata)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
    `,[input.organizationId,input.actorId,input.action,input.resource,input.resourceId??null,input.requestId,input.correlationId,input.dataMode,JSON.stringify(input.metadata??{})]);
  }
}
