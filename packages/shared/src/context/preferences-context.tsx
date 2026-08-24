"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
export type Currency = "USD" | "EUR";
export type DistanceUnit = "km" | "mi";
type PreferencesValue = { currency: Currency; setCurrency:(v:Currency)=>void; distanceUnit:DistanceUnit; setDistanceUnit:(v:DistanceUnit)=>void; formatMoney:(usd:number)=>string; formatDistance:(km:number)=>string };
const PreferencesContext=createContext<PreferencesValue|null>(null);
export function PreferencesProvider({children}:{children:ReactNode}){
  const [currency,setCurrencyState]=useState<Currency>("USD");
  const [distanceUnit,setDistanceUnitState]=useState<DistanceUnit>("km");
  useEffect(()=>{ const c=localStorage.getItem("pc.currency") as Currency|null; const d=localStorage.getItem("pc.distance") as DistanceUnit|null; if(c==="USD"||c==="EUR")setCurrencyState(c); if(d==="km"||d==="mi")setDistanceUnitState(d); },[]);
  const setCurrency=(v:Currency)=>{setCurrencyState(v);localStorage.setItem("pc.currency",v)};
  const setDistanceUnit=(v:DistanceUnit)=>{setDistanceUnitState(v);localStorage.setItem("pc.distance",v)};
  const value=useMemo<PreferencesValue>(()=>({currency,setCurrency,distanceUnit,setDistanceUnit,formatMoney:(usd)=>new Intl.NumberFormat(undefined,{style:"currency",currency,maximumFractionDigits:2}).format(currency==="EUR"?usd*.92:usd),formatDistance:(km)=>distanceUnit==="km"?`${km.toFixed(1)} km`:`${(km*.621371).toFixed(1)} mi`}),[currency,distanceUnit]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
export function usePreferences(){const value=useContext(PreferencesContext);if(!value)throw new Error("usePreferences must be used inside PreferencesProvider");return value;}
