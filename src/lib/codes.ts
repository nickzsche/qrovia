import crypto from "node:crypto";

// 32 chars, no ambiguous glyphs (l, o, 0, 1) → modulo is unbiased (256 % 32 === 0).
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

// Derived from ALPHABET so the validator can never drift from the generator again.
const CODE_RE = new RegExp(`^[${ALPHABET}]{4,32}$`);

export function newCode(len = 7): string {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function isValidCode(code: string): boolean {
  return CODE_RE.test(code);
}
