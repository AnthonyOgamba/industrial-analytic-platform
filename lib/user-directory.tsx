"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { normalizeUsers } from "@/lib/api-normalizers";
import type { BackendRoleDto, BackendUserDto, FacilityWorkspace } from "@/lib/backend-dtos";
import { pageRequest } from "@/lib/page-request";
import type { UsersPageContract } from "@/lib/page-contracts";
import { toBackendRole } from "@/lib/page-contracts";

type Directory = {users:BackendUserDto[];roles:BackendRoleDto[];facilityOptions:FacilityWorkspace|null;loading:boolean;refresh:()=>Promise<void>;error:string};
const Context=createContext<Directory|null>(null);

export function UserDirectoryProvider({children}:{children:React.ReactNode}){
  const[users,setUsers]=useState<BackendUserDto[]>([]);const[roles,setRoles]=useState<BackendRoleDto[]>([]);const[facilityOptions,setFacilityOptions]=useState<FacilityWorkspace|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState("");
  const hasUsers=useRef(false);
  const refresh=useCallback(async()=>{if(!hasUsers.current)setLoading(true);try{const payload=await pageRequest<UsersPageContract>("users");setUsers(normalizeUsers(payload.users));setRoles(payload.roleOptions.map(toBackendRole));setFacilityOptions(payload.facilityOptions);hasUsers.current=true;setError("")}catch(cause){setError(cause instanceof Error?cause.message:"Users could not be loaded.")}finally{setLoading(false)}},[]);
  useEffect(()=>{// eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
  },[refresh]);
  const value=useMemo(()=>({users,roles,facilityOptions,loading,refresh,error}),[error,facilityOptions,loading,refresh,roles,users]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useUserDirectory(){const value=useContext(Context);if(!value)throw new Error("useUserDirectory must be used inside UserDirectoryProvider");return value}
