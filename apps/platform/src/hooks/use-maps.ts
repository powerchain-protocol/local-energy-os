import { useMemo, useState } from "react";
import { searchMapAssets } from "@/maps/maps";
export function useMaps(){
  const [query,setQuery]=useState("");
  const [kind,setKind]=useState("all");
  const assets=useMemo(()=>searchMapAssets(query,kind),[query,kind]);
  return {query,setQuery,kind,setKind,assets,total:assets.length};
}
