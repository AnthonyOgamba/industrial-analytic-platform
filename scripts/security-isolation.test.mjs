import assert from "node:assert/strict";
import test from "node:test";

import { apiRequest, ApiError } from "../lib/api-client.ts";
import { dashboardNotificationKey, mergeNotificationsForUser, notificationsForUser } from "../lib/platform-notifications.ts";

const notification=(id,user,correlationId=null)=>({notificationId:id,notificationType:"warning",title:"Notice",message:"Message",recipientUserId:user,actorUserId:null,actorUsername:null,targetType:null,targetId:null,facilityId:null,action:null,severity:"warning",route:"/",correlationId,createdAtUtc:"2026-01-01T00:00:00Z",readAtUtc:null});

function browser(fetchImpl){const events=[];const redirects=[];globalThis.fetch=fetchImpl;globalThis.window={dispatchEvent:event=>events.push(event.type),location:{assign:value=>redirects.push(value)}};return{events,redirects}}

test("403 reset error does not clear or redirect the administrator",async()=>{const state=browser(async()=>new Response(JSON.stringify({error:"Forbidden"}),{status:403,headers:{"content-type":"application/json"}}));await assert.rejects(()=>apiRequest("/api/backend/users/2/temporary-passcode/regenerate",{method:"POST",body:"{}"}),error=>error instanceof ApiError&&error.status===403);assert.deepEqual(state.events,[]);assert.deepEqual(state.redirects,[])});

test("500 reset error does not clear or redirect the administrator",async()=>{const state=browser(async()=>new Response(JSON.stringify({error:"Failed"}),{status:500,headers:{"content-type":"application/json"}}));await assert.rejects(()=>apiRequest("/api/backend/users/2/temporary-passcode/regenerate",{method:"POST",body:"{}"}),error=>error instanceof ApiError&&error.status===500);assert.deepEqual(state.events,[]);assert.deepEqual(state.redirects,[])});

test("operation 401 with a valid admin session does not log out",async()=>{let call=0;const state=browser(async()=>++call===1?new Response(JSON.stringify({error:"Denied"}),{status:401,headers:{"content-type":"application/json"}}):new Response(JSON.stringify({user:{uid:1}}),{status:200,headers:{"content-type":"application/json"}}));await assert.rejects(()=>apiRequest("/api/backend/users/2/temporary-passcode/regenerate",{method:"POST",body:"{}"}),error=>error instanceof ApiError&&error.status===401);assert.deepEqual(state.events,[]);assert.deepEqual(state.redirects,[])});

test("confirmed invalid admin session emits expiry and redirects",async()=>{let call=0;const state=browser(async()=>++call===1?new Response(JSON.stringify({error:"Expired"}),{status:401,headers:{"content-type":"application/json"}}):new Response(JSON.stringify({error:"Unauthenticated"}),{status:401,headers:{"content-type":"application/json"}}));await assert.rejects(()=>apiRequest("/api/backend/users/2/temporary-passcode/regenerate",{method:"POST",body:"{}"}),error=>error instanceof ApiError&&error.status===401);assert.deepEqual(state.events,["divu-session-expired","divu-authorization-stale"]);assert.deepEqual(state.redirects,["/login?reason=authorization-changed"])});

test("notification ownership is isolated for users with the same role",()=>{const all=[notification(1,10),notification(2,11)];assert.deepEqual(notificationsForUser(all,10).map(item=>item.notificationId),[1]);assert.deepEqual(notificationsForUser(all,11).map(item=>item.notificationId),[2])});

test("canonical merge cannot inherit another user's transient notification",()=>{const current=[notification(-1,10,"a"),notification(-2,11,"b")];const canonical=[notification(3,10,"c"),notification(4,11,"d")];assert.deepEqual(mergeNotificationsForUser(current,canonical,11).map(item=>item.notificationId),[-2,4])});

test("dashboard deduplication keys are user scoped and metric-order stable",()=>{const a=dashboardNotificationKey(10,"all","30",["qualityScore","oee"]);const reordered=dashboardNotificationKey(10,"all","30",["oee","qualityScore"]);const b=dashboardNotificationKey(11,"all","30",["qualityScore","oee"]);assert.equal(a,reordered);assert.notEqual(a,b)});
