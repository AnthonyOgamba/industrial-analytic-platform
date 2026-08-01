import { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { backendUrl, expireAuthentication, gatewayFailure, isAuthenticationInvalid, publicBackendResponse, readBackendBody } from "@/lib/backend-api";

/**
 * BFF: Manufacturing data import
 * ENDPOINT: Forwards multipart form data without converting it to JSON.
 * SECURITY: Authentication and import permission remain enforced by the gateway service.
 */

export async function POST(request:NextRequest){
  const token=request.cookies.get(AUTH_COOKIE)?.value;
  if(!token)return Response.json({error:"Authentication required."},{status:401});
  try{
    const form=await request.formData();
    const response=await fetch(backendUrl("/api/data-input/import"),{method:"POST",headers:{Authorization:`Bearer ${token}`},body:form,cache:"no-store",signal:AbortSignal.timeout(45_000)});
    const body=await readBackendBody(response);
    const result=publicBackendResponse(body,response.status);
    if(response.status!==401)return result;
    return await isAuthenticationInvalid(token)?expireAuthentication(result):result;
  }catch(error){return gatewayFailure(error)}
}
