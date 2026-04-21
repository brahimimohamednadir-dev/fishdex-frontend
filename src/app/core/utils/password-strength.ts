export interface PasswordStrength {
  score: number;        // 0–4
  label: string;
  barColor: string;
  rules: { label: string; ok: boolean }[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const rules = [
    { label: '8 caractères minimum',      ok: password.length >= 8 },
    { label: '1 majuscule',               ok: /[A-Z]/.test(password) },
    { label: '1 chiffre',                 ok: /[0-9]/.test(password) },
    { label: '1 caractère spécial (!@#…)', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = rules.filter(r => r.ok).length;
  const labels    = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const barColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-forest-400', 'bg-forest-600'];
  return { score, label: labels[score] || '', barColor: barColors[score] || '', rules };
}
