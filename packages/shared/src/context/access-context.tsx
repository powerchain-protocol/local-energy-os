"use client";
import{createContext,useContext,useMemo,type ReactNode}from"react";import{useAuth}from"./auth-context";import{can,type Permission}from"@/lib/access";import type{AppRole}from"@/types/auth";
type AccessValue={role:AppRole;can:(permission:Permission)=>boolean};const AccessContext=createContext<AccessValue|null>(null);
export function AccessProvider({children}:{children:ReactNode}){const{session}=useAuth();const role=session?.user.role??"consumer";const value=useMemo(()=>({role,can:(permission:Permission)=>can(role,permission)}),[role]);return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>}
export function useAccess(){const value=useContext(AccessContext);if(!value)throw new Error("useAccess must be used inside AccessProvider");return value}
