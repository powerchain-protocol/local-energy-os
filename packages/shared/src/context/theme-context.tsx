"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import type {DashboardTheme} from "@/themes";
type ThemeContextValue={theme:DashboardTheme;setTheme:(theme:DashboardTheme)=>void;toggle:()=>void};
const ThemeContext=createContext<ThemeContextValue>({theme:"white",setTheme:()=>{},toggle:()=>{}});
const darkThemes=new Set<DashboardTheme>(["dark-green","onyx","black","red"]);
export function ThemeProvider({children}:{children:ReactNode}){const[theme,setThemeState]=useState<DashboardTheme>("white");
 const apply=(next:DashboardTheme)=>{setThemeState(next);if(typeof window!=="undefined")localStorage.setItem("pc-theme",next);document.documentElement.dataset.theme=next;document.documentElement.classList.toggle("dark",darkThemes.has(next));};
 useEffect(()=>{const saved=(localStorage.getItem("pc-theme") as DashboardTheme|null)||"white";apply(saved)},[]);
 const toggle=()=>apply(darkThemes.has(theme)?"white":"dark-green");
 return <ThemeContext.Provider value={{theme,setTheme:apply,toggle}}>{children}</ThemeContext.Provider>}
export const useTheme=()=>useContext(ThemeContext);
