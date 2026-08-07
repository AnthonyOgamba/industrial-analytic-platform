"use client";
import { createContext,useCallback,useContext,useEffect,useMemo,useRef,useState } from "react";
import { pageRequest } from "@/lib/page-request";
import type { AuditPageContract } from "@/lib/page-contracts";
type Value={data:AuditPageContract|null;loading:boolean;error:string;refresh:(query?:URLSearchParams)=>Promise<void>};
const Context=createContext<Value|null>(null);
export function AuditPageDataProvider({children}:{children:React.ReactNode}){
  const[data,setData]=useState<AuditPageContract|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState("");const hasData=useRef(false);
  const refresh=useCallback(async(query?:URLSearchParams)=>{if(!hasData.current)setLoading(true);try{setData(await pageRequest<AuditPageContract>("audit",{query}));hasData.current=true;setError("")}catch(cause){setError(cause instanceof Error?cause.message:"Audit data could not be loaded.")}finally{setLoading(false)}},[]);
  useEffect(()=>{// eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
  },[refresh]);
  const value=useMemo(()=>({data,loading,error,refresh}),[data,error,loading,refresh]);return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useAuditPageData(){const value=useContext(Context);if(!value)throw new Error("useAuditPageData requires AuditPageDataProvider");return value}
