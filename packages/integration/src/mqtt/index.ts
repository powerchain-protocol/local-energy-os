import { z } from "zod";

import type {
  IntegrationAdapter,
  IntegrationContext,
  IntegrationHealth,
  IntegrationResult,
} from "../core";
import { success, unavailable } from "../core";

export interface TelemetryEnvelope<T> {
  eventId: string;
  deviceId: string;
  topic: string;
  capturedAt: string;
  receivedAt: string;
  sequence?: number;
  quality: "good" | "uncertain" | "bad";
  payload: T;
}

const schema = z.object({
  deviceId: z.string().min(1),
  topic: z.string().min(1),
  capturedAt: z.string().datetime(),
  payload: z.unknown(),
});

export class MqttAdapter implements IntegrationAdapter<
  unknown,
  TelemetryEnvelope<unknown>
> {
  readonly provider = "mqtt";

  constructor(private readonly allowedTopics: RegExp[] = []) {}

  async execute(
    request: unknown,
    _context: IntegrationContext,
  ): Promise<IntegrationResult<TelemetryEnvelope<unknown>>> {
    const parsed = schema.safeParse(request);
    if (!parsed.success) {
      return unavailable(
        this.provider,
        "VALIDATION_FAILED",
        "MQTT payload failed canonical schema validation",
      );
    }
    if (
      this.allowedTopics.length &&
      !this.allowedTopics.some((rule) => rule.test(parsed.data.topic))
    ) {
      return unavailable(
        this.provider,
        "AUTHORIZATION_FAILED",
        "MQTT topic is not allowlisted",
      );
    }

    const envelope: TelemetryEnvelope<unknown> = {
      eventId: crypto.randomUUID(),
      deviceId: parsed.data.deviceId,
      topic: parsed.data.topic,
      capturedAt: parsed.data.capturedAt,
      receivedAt: new Date().toISOString(),
      quality: "good",
      payload: parsed.data.payload,
    };
    return success(this.provider, envelope);
  }

  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: "available",
      checkedAt: new Date().toISOString(),
      circuitState: "closed",
    };
  }
}
