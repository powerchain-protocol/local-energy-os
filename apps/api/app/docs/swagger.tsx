"use client";

import SwaggerUI from "swagger-ui-react";

export function PowerChainSwagger() {
  return <SwaggerUI url="/openapi.yaml" deepLinking displayRequestDuration />;
}
