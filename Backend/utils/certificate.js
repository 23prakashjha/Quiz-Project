export const PASS_THRESHOLD = 60;

export function makeCertificateId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `QV-${stamp}-${rand}`;
}

export function evaluateAttempt(score, total) {
  const percentage = total ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= PASS_THRESHOLD;
  return { percentage, passed, certificateId: passed ? makeCertificateId() : null };
}