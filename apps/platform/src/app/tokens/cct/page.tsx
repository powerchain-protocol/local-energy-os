import { permanentRedirect } from "next/navigation";

export default function LegacyCarbonCreditTokenPage() {
  permanentRedirect("/tokens/crt");
}
