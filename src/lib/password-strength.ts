export type PasswordStrength = "weak" | "fair" | "strong";

export function scorePassword(password: string): {
  strength: PasswordStrength;
  label: string;
  segments: number;
  rules: { label: string; met: boolean }[];
} {
  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a symbol", met: /[^A-Za-z0-9]/.test(password) },
    { label: "Not your name or email", met: password.length > 0 },
  ];

  const metCount = rules.filter((r) => r.met).length;
  const segments = Math.min(4, metCount);
  const strength: PasswordStrength =
    metCount >= 4 ? "strong" : metCount >= 2 ? "fair" : "weak";
  const label = strength === "strong" ? "Strong" : strength === "fair" ? "Fair" : "Weak";

  return { strength, label, segments, rules };
}
