import { registerLocalEnergyRoutes } from "../apps/api/src/modules/local-energy-os/index.js";

// Register next to the existing /api/v1 module registration.
registerLocalEnergyRoutes(app);
