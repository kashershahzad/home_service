/** Strip spaces / non-digits from national number and drop leading 0 (03xx → 3xx). */
export function buildE164Phone(countryCode, nationalNumber) {
  const code = String(countryCode || "").replace(/\s/g, "");
  let digits = String(nationalNumber || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `${code}${digits}`;
}

/**
 * Normalize stored/typed phones.
 * Fixes the common PK bug: +9203xxxxxxxx → +923xxxxxxxx
 */
export function normalizePhone(phone) {
  let p = String(phone || "").replace(/\s/g, "");
  if (p.startsWith("+920")) {
    p = `+92${p.slice(4)}`;
  }
  return p;
}

/** Old accounts may still be saved as +920... — try that if normal login 404s. */
export function legacyBuggyPkPhone(phone) {
  const p = normalizePhone(phone);
  if (p.startsWith("+92") && !p.startsWith("+920")) {
    return `+920${p.slice(3)}`;
  }
  return null;
}
