export const PASSWORD_MAX_LENGTH = 72;
export const passwordRequirements = [
  "At least 8 characters",
  "One uppercase letter",
  "One lowercase letter",
  "One number",
  "One special character",
];

export function validatePassword(value: string) {
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (value.length > PASSWORD_MAX_LENGTH) return `Password must not exceed ${PASSWORD_MAX_LENGTH} characters.`;
  if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password must include a lowercase letter.";
  if (!/\d/.test(value)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must include a special character.";
  return null;
}
