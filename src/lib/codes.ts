import crypto from "node:crypto";

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no ambiguous chars (l, o, 0, 1)

export function newCode(len = 7): string {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function isValidCode(code: string): boolean {
  return /^[a-hj-km-np-z2-9]{4,32}$/.test(code);
}
