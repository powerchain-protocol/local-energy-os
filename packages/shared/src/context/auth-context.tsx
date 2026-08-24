"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@/types/auth";

type AuthContextValue={session:Session|null;loading:boolean;refresh:()=>Promise<void>;signOut:()=>Promise<void>};
const AuthContext=createContext<AuthContextValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){const[session,setSession]=useState<Session|null>(null);const[loading,setLoading]=useState(true);const refresh=useCallback(async()=>{setLoading(true);try{const response=await fetch("/api/v1/sessions",{cache:"no-store"});const payload=await response.json();setSession(response.ok?payload.data:null)}finally{setLoading(false)}},[]);useEffect(()=>{void refresh()},[refresh]);async function signOut(){await fetch("/api/v1/auth/signout",{method:"POST"});setSession(null)}const value=useMemo(()=>({session,loading,refresh,signOut}),[session,loading,refresh]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used inside AuthProvider");return value}
