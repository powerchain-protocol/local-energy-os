import { DEFAULT_USER_SETTINGS, type UserIntegrationSettings } from "@/types/settings";
const KEY="powerchain:user-integration-settings:v1";
export function loadUserIntegrationSettings():UserIntegrationSettings { if(typeof window==="undefined")return DEFAULT_USER_SETTINGS; try{return {...DEFAULT_USER_SETTINGS,...JSON.parse(localStorage.getItem(KEY)||"{}")};}catch{return DEFAULT_USER_SETTINGS;} }
export function saveUserIntegrationSettings(settings:UserIntegrationSettings){ if(typeof window==="undefined")return; localStorage.setItem(KEY,JSON.stringify({...settings,updatedAt:new Date().toISOString()})); }
export function clearUserIntegrationSecrets(){const current=loadUserIntegrationSettings();saveUserIntegrationSettings({...current,heliusApiKey:"",aiApiKey:""});}
