"use client";

import { InlineNotice, PageHeader } from "@powerchain/ui";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="pc-page"><PageHeader eyebrow="PowerChain" title="Workspace unavailable" description="The application hit an unexpected boundary. No fallback telemetry or financial state has been fabricated."/><InlineNotice title="Unexpected application error" tone="danger" icon="warning">{error.message || "An unexpected error occurred."}</InlineNotice><div style={{ marginTop: 16 }}><button type="button" className="pc-button" onClick={reset}>Try again</button></div></main>;
}
