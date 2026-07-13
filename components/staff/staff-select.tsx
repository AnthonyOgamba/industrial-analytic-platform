"use client";

import type { StaffMember } from "./staff-data";

type StaffSelectProps = {
  id: string;
  label: string;
  staff: StaffMember[];
  value: string;
  onChange: (member: StaffMember) => void;
  eligibleRoles?: string[];
  required?: boolean;
  className?: string;
};

export function StaffSelect({ id, label, staff, value, onChange, eligibleRoles, required = false, className = "" }: StaffSelectProps) {
  const options = staff.filter(
    (member) => member.status === "Active" && (!eligibleRoles || eligibleRoles.includes(member.role)),
  );

  return (
    <label className={`space-y-1.5 text-xs font-medium ${className}`} htmlFor={id}>
      {label}
      <select
        id={id}
        required={required}
        value={value}
        onChange={(event) => {
          const member = options.find((option) => option.id === event.target.value);
          if (member) onChange(member);
        }}
        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30"
      >
        <option value="">Select existing staff</option>
        {options.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name} — {member.role} · {member.department}
          </option>
        ))}
      </select>
    </label>
  );
}
