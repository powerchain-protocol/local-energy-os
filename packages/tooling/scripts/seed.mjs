import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const organization = await prisma.organization.upsert({ where: { slug: "powerchain-demo" }, update: {}, create: { name: "PowerChain Demo", slug: "powerchain-demo" } });
await prisma.energyAsset.createMany({ skipDuplicates: true, data: [
  { organizationId: organization.id, name: "Solar Farm SF-001", type: "SOLAR", status: "ACTIVE", capacityMw: 84.5 },
  { organizationId: organization.id, name: "Wind Farm WF-2003", type: "WIND", status: "ACTIVE", capacityMw: 120.2 },
  { organizationId: organization.id, name: "Battery System BS-500", type: "BATTERY", status: "MAINTENANCE", capacityMw: 62.4 }
]});
console.log("PowerChain seed complete.");
await prisma.$disconnect();
