"use client";
import {SettingsLayout} from "@/components/profile/settings-layout";
import {ProfileOverview} from "@/components/profile/profile-overview";
export default function Settings(){return <SettingsLayout title="Profile overview" subtitle="Manage your identity, company membership, plan and access from one organized workspace."><div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/[.07] p-4 text-sm text-amber-900 dark:text-amber-200"><strong className="font-semibold">MVP status.</strong> Profile, notification and integration settings are available for evaluation; production identity and billing changes require configured backend services.</div><ProfileOverview/></SettingsLayout>}
