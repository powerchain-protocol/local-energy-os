import { EmptyState, PageHeader } from "@powerchain/ui";

export default function NotFound() {
  return <main className="pc-page"><PageHeader eyebrow="PowerChain" title="Page not found" description="The requested workspace route is not part of this application."/><EmptyState icon="status" title="Unknown route" description="Return to the workspace overview or use the PowerChain command palette." action={<a className="pc-button" href="/">Return to overview</a>}/></main>;
}
