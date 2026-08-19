type GovernancePolicyRecord={governanceId?:unknown;name?:unknown;status?:unknown};

export function activeGovernancePolicyNames(payload:unknown){
  const outer=payload&&typeof payload==="object"?payload as Record<string,unknown>:{};
  const nested=outer.data&&typeof outer.data==="object"?outer.data as Record<string,unknown>:{};
  const records=Array.isArray(payload)?payload:Array.isArray(outer.items)?outer.items:Array.isArray(nested.items)?nested.items:[];
  return [...new Set((records as GovernancePolicyRecord[])
    .filter(policy=>typeof policy.status==="string"&&policy.status.toLowerCase()==="active")
    .map(policy=>typeof policy.name==="string"?policy.name.trim():"")
    .filter(Boolean))].sort((left,right)=>left.localeCompare(right));
}
