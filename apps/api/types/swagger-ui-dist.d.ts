declare module "swagger-ui-dist" {
  export type SwaggerUIConfig = {
    url?: string;
    dom_id?: string;
    deepLinking?: boolean;
    displayRequestDuration?: boolean;
    persistAuthorization?: boolean;
    tryItOutEnabled?: boolean;
    [key: string]: unknown;
  };
  export function SwaggerUIBundle(config: SwaggerUIConfig): unknown;
}

declare module "swagger-ui-dist/swagger-ui.css";
