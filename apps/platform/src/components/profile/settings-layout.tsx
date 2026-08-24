"use client";
import type {ReactNode} from "react";
import {Shell} from "@/components/shell";
import {Tabs} from "@/components/ui/tabs";
const items=[{label:"Profile overview",href:"/settings"},{label:"Company",href:"/settings/company"},{label:"Users & roles",href:"/settings/users"},{label:"Organization",href:"/settings/organization"},{label:"Themes",href:"/settings/themes"}];
export function SettingsLayout({title,subtitle,children}:{title:string;subtitle:string;children:ReactNode}){return <Shell><div className="content-container space-y-6"><header><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Account & administration</p><h1 className="mt-1 text-3xl font-black tracking-tight">{title}</h1><p className="mt-2 max-w-3xl muted">{subtitle}</p></header><Tabs items={items}/>{children}</div></Shell>}
