import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { backendError, gatewayFailure, requestBackend } from "@/lib/backend-api";
import { AUTH_COOKIE } from "@/lib/auth/constants";

const schema=z.object({token:z.string().trim().min(1).max(512),newPassword:z.string().min(12).max(72)});

export async function GET(request:NextRequest) {
  return request.nextUrl.searchParams.get("token")
    ? NextResponse.json({valid:true})
    : NextResponse.json({error:"A password reset token is required."},{status:400});
}

export async function POST(request:NextRequest) {
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"A valid token and password of at least 12 characters are required."},{status:400});
  try{
    const{response,body}=await requestBackend<{message?:string;error?:string}>("/api/auth/reset-password",{method:"POST",body:JSON.stringify(parsed.data)});
    if(!response.ok)return NextResponse.json({error:backendError(body,"The password reset token is invalid or expired.")},{status:response.status});
    const result=NextResponse.json({message:body?.message??"Password updated successfully."});
    result.cookies.delete(AUTH_COOKIE);
    return result;
  }catch(error){return gatewayFailure(error)}
}
