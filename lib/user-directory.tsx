"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { normalizeArrayResponse, normalizeUsers } from "@/lib/api-normalizers";
import type { BackendRoleDto, BackendUserDto } from "@/lib/backend-dtos";
import { timedRequest } from "@/lib/request-timing";

type Directory = {users:BackendUserDto[];roles:BackendRoleDto[];loading:boolean;refresh:()=>Promise<void>;error:string};
const Context=createContext<Directory|null>(null);

export function UserDirectoryProvider({children}:{children:React.ReactNode}){
  const[users,setUsers]=useState<BackendUserDto[]>([]);const[roles,setRoles]=useState<BackendRoleDto[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState("");
  const hasUsers=useRef(false);
  const refresh=useCallback(async()=>{if(!hasUsers.current)setLoading(true);try{const payload=await timedRequest("users",()=>apiRequest<unknown>("/api/backend/users"));setUsers(normalizeUsers(payload));hasUsers.current=true;setError("");setLoading(false);void timedRequest("roles enrichment",()=>apiRequest<unknown>("/api/backend/roles")).then(value=>setRoles(normalizeArrayResponse<BackendRoleDto>(value,["roles"],"roles"))).catch(()=>undefined)}catch(cause){setError(cause instanceof Error?cause.message:"Users could not be loaded.");setLoading(false)}},[]);
  useEffect(()=>{// eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
  },[refresh]);
  const value=useMemo(()=>({users,roles,loading,refresh,error}),[error,loading,refresh,roles,users]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useUserDirectory(){const value=useContext(Context);if(!value)throw new Error("useUserDirectory must be used inside UserDirectoryProvider");return value}
