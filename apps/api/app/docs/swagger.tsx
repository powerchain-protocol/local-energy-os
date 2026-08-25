"use client";

import { useEffect } from "react";
import { SwaggerUIBundle } from "swagger-ui-dist";

export function PowerChainSwagger() {
  useEffect(() => {
    SwaggerUIBundle({
      url: "/openapi.yaml",
      dom_id: "#powerchain-swagger",
      deepLinking: true,
      displayRequestDuration: true,
      persistAuthorization: false,
      tryItOutEnabled: true,
    });
  }, []);
  return <div id="powerchain-swagger" />;
}
