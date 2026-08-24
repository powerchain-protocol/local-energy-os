import { useCallback,useEffect,useState } from "react";
import { DEFAULT_USER_SETTINGS,type UserIntegrationSettings } from "@/types/settings";
import { loadUserIntegrationSettings,saveUserIntegrationSettings } from "@/lib/settings/user-settings";
export function useIntegrationSettings(){const [settings,setSettings]=useState<UserIntegrationSettings>(DEFAULT_USER_SETTINGS);const [ready,setReady]=useState(false);useEffect(()=>{setSettings(loadUserIntegrationSettings());setReady(true)},[]);const update=useCallback((patch:Partial<UserIntegrationSettings>)=>setSettings(v=>({...v,...patch})),[]);const save=useCallback(()=>saveUserIntegrationSettings(settings),[settings]);return{settings,update,save,ready};}
