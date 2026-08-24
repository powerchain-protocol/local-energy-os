export type DigitalEnergyOverviewPayload = {
  summary: {
    organizationId:string; canonicalUnit:"Wh"; dataMode:"DEMO"|"LIVE"|"DEGRADED";
    verifiedWh:string; availableWh:string; activePositionWh:string; reservedWh:string; representedWh:string;
    representedSolanaWh:string; representedSuiWh:string; retiredWh:string;
    representationCoveragePpm:string; verifiedToPositionCoveragePpm:string; batches:number; positions:number; rwaAssets:number;
  };
  batches: Array<{id:string;organizationId:string;siteId:string;source:string;verifiedWh:string;invalidatedWh:string;retiredWh:string;state:string;evidenceRoot:string}>;
  positions: Array<{id:string;organizationId:string;energyBatchId:string;ownerId:string;source:string;amountWh:string;state:string;gridAreaId?:string;intervalStart:string;intervalEnd:string;evidenceRoot:string}>;
  rwas: Array<{
    id:string; organizationId:string;
    position:{id:string;amountWh:string;state:string;source:string;energyBatchId:string;evidenceRoot:string};
    metadata:{standard:string;version:string;assetClass:string;backingLedger:string;canonicalUnit:string};
    reservations:Array<{id:string;amountWh:string;purpose:string;state:string}>;
    representations:Array<{id:string;network:"SOLANA"|"SUI";reference:string;amountWh:string;state:string}>;
    retirements:Array<{id:string;amountWh:string;reason:string}>;
  }>;
  assetGraph:{version:string;organizationId:string;nodes:Array<{id:string;type:string;label:string;metadata?:Record<string,string|number|boolean|null>}>;edges:Array<{id:string;type:string;from:string;to:string}>};
  system:{version:string;physicalEnergyAuthoritative:true;canonicalUnit:"Wh";energyRwaStandard:string;networks:{solana:{role:string;asset:string;explorer:string};sui:{role:string;asset:string;explorer:string}};runtimeSafety:{unsafeMainnetMockWritesRejected:true;offlineEconomicWrites:string}};
  rewardEpoch?:{state:string;epochId:string|null;startAt:string|null;endAt:string|null;eligibleVerifiedWh:string;rewardAsset:"PWRC";settlementNetwork:"SOLANA";conversionPolicy:string;rewardAmount:null};

  operations?: {
    version:string; organizationId:string; dataMode?:"DEMO"|"LIVE"|"DEGRADED";
    summary:{organizationId:string;twinAssets:number;staleTwinAssets:number;offlineTwinAssets:number;activeDeliveries:number;committedWh:string;deliveredWh:string;reviewRequiredReconciliations:number;pendingSettlements:number;pendingSettlementApprovals:number;rejectedSettlements:number;confirmedSettlements:number};
    twins:Array<{id:string;organizationId:string;siteId:string;assetType:string;label:string;gridAreaId?:string;observedAt:string;telemetryAgeSeconds:number;freshness:string;state:string;powerW?:string;availabilityPpm?:string;stateOfChargePpm?:string;exportLimitW?:string;evidenceRoot?:string}>;
    deliveries:Array<{id:string;organizationId:string;energyPositionId:string;reservationId?:string;committedWh:string;deliveredWh:string;state:string;intervalStart:string;intervalEnd:string;meterEvidenceRoot?:string;createdAt:string;updatedAt:string}>;
    reconciliations:Array<{id:string;organizationId:string;deliveryId:string;expectedWh:string;deliveredWh:string;varianceWh:string;toleranceWh:string;state:string;reconciledAt?:string;createdAt:string}>;
    settlements:Array<{id:string;organizationId:string;deliveryId:string;reconciliationId:string;asset:"USDC"|"EURC"|"FIAT_EUR";network:"SOLANA"|"OFFCHAIN";amountMinor:string;state:string;reference?:string;reviewHash:string;createdBy:string;approvalsRequired:number;control:{settlementId:string;reviewHash:string;createdBy:string;requiredApprovals:number;approvedBy:string[];rejectedBy:string[];state:"PENDING"|"APPROVED"|"REJECTED";makerCheckerSatisfied:boolean};createdAt:string;updatedAt:string}>;
    controls:{settlementApprovalsRequired:number;makerCheckerRequired:boolean;pendingSettlementApprovals:number;rejectedSettlements:number;pendingOutboxEvents:number};
    principles:{physicalDeliveryRequiresMeterEvidence:true;financialSettlementDoesNotProveDelivery:true;blockchainConfirmationDoesNotCreateEnergy:true};
  };
  providers?:{
    marketData:{
      pyth:{provider:string;state:string;observedAt:string};
      birdeye:{provider:string;state:string;observedAt:string;data?:unknown};
      coinmarketcap:{provider:string;state:string;observedAt:string;data?:unknown};
      fx:{provider:string;state:string;observedAt:string;base:string;rates?:Record<string,number>|null};
    };
    explorers:{solscan:{state:string;baseUrl:string};suiscan:{state:string;baseUrl:string}};
  };
};

export type DigitalEnergyApiEnvelope<T> = { data:T; meta:{requestId:string;correlationId:string;organizationId:string;dataMode:string;observedAt:string} };

export type DigitalEnergyPositionBackingPayload = {
  positionId:string; canonicalPositionWh:string; activeReservedWh:string; activeRepresentedWh:string; representedSolanaWh:string; representedSuiWh:string; retiredWh:string; availableWh:string; representationCoveragePpm:string; invariantState:"BACKED";
};


export type DigitalEnergyControlsPayload = {
  controls: {
    settlementApprovalsRequired: number;
    makerCheckerRequired: boolean;
    pendingSettlementApprovals: number;
    rejectedSettlements: number;
    pendingOutboxEvents: number;
  } | null;
  publisher: {
    state: "UNCONFIGURED" | "UNAVAILABLE" | "DISABLED" | "DEGRADED" | "OPERATIONAL";
    configured: boolean;
    enabled?: boolean;
    running?: boolean;
    sinkConfigured?: boolean;
    databaseConfigured?: boolean;
    claimed?: number;
    published?: number;
    failed?: number;
    lastRunAt?: string;
    lastPublishedAt?: string;
    lastError?: string;
    reason?: string;
    httpStatus?: number;
  };
  settlements: Array<{
    id: string;
    state: string;
    asset: "USDC" | "EURC" | "FIAT_EUR";
    network: "SOLANA" | "OFFCHAIN";
    amountMinor: string;
    reviewHash: string;
    createdBy: string;
    approvalsRequired: number;
    control: {
      settlementId: string;
      reviewHash: string;
      createdBy: string;
      requiredApprovals: number;
      approvedBy: string[];
      rejectedBy: string[];
      state: "PENDING" | "APPROVED" | "REJECTED";
      makerCheckerSatisfied: boolean;
    };
  }>;
  outbox: Array<{
    id: string;
    organizationId: string;
    topic: string;
    aggregateType: string;
    aggregateId: string;
    state: "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";
    attempts: number;
    lastError?: string;
    nextAttemptAt?: string;
    processingStartedAt?: string;
    createdAt: string;
    publishedAt?: string;
  }>;
};
