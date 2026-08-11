const explicitLabels: Record<string, string> = {
  user_delete: "User Deletion",
  generated_data_delete: "Generated Data Deletion",
  role_assign: "Role Assignment",
  super_admin_override: "Super Admin Override",
};

export function userFacingLabel(value: string | null | undefined) {
  if (!value) return "Unavailable";
  const normalized = value.trim().toLowerCase();
  if (explicitLabels[normalized]) return explicitLabels[normalized];
  return normalized
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function safeOperationalError(page: string, hasUsableData: boolean) {
  return hasUsableData
    ? `${page} could not be refreshed. Your previously loaded data is still available.`
    : `${page} is temporarily unavailable. Please try again.`;
}

