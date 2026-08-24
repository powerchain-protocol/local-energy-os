export const locales=["en","es","de","fr"] as const; export type Locale=(typeof locales)[number];
const messages={en:{overview:"Overview",assets:"Assets",alerts:"Alerts"},es:{overview:"Resumen",assets:"Activos",alerts:"Alertas"},de:{overview:"Übersicht",assets:"Anlagen",alerts:"Warnungen"},fr:{overview:"Vue d’ensemble",assets:"Actifs",alerts:"Alertes"}} as const;
export function t(locale:Locale,key:keyof typeof messages.en){return messages[locale][key] ?? messages.en[key];}
