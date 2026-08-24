"use client";
import React from "react";
type Props={children:React.ReactNode; fallback?:React.ReactNode}; type State={error:Error|null};
export class ErrorBoundary extends React.Component<Props,State>{
  state:State={error:null};
  static getDerivedStateFromError(error:Error):State{return{error}};
  componentDidCatch(error:Error,info:React.ErrorInfo){console.error("PowerChain UI boundary",{error,componentStack:info.componentStack});}
  render(){if(!this.state.error)return this.props.children;return this.props.fallback??<main className="grid min-h-[50vh] place-items-center p-6"><div className="max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm dark:bg-slate-950"><h1 className="text-xl font-bold">This workspace could not be loaded</h1><p className="mt-2 text-sm text-slate-500">Your session is safe. Reload the page or return to the overview.</p><div className="mt-5 flex justify-center gap-3"><button onClick={()=>location.reload()} className="rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white">Reload</button><a href="/" className="rounded-xl border px-4 py-2 font-semibold">Overview</a></div></div></main>}
}
