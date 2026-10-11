import { test } from "node:test";
import assert from "node:assert/strict";

import { isSafeTargetUrl, normalizeTarget } from "../src/lib/urls.ts";
import { parseUserAgent } from "../src/lib/ua.ts";
import { newCode, isValidCode } from "../src/lib/codes.ts";
import { sanitizeStyle, DEFAULT_QR_STYLE } from "../src/lib/qr.ts";
import { getAppUrl } from "../src/lib/app-url.ts";

/* ------------------------------ urls ------------------------------ */

test("isSafeTargetUrl allows http/https with a dotted host", () => {
  assert.equal(isSafeTargetUrl("https://example.com/menu"), true);
  assert.equal(isSafeTargetUrl("http://example.com"), true);
  assert.equal(isSafeTargetUrl("mailto:hi@example.com"), true);
  assert.equal(isSafeTargetUrl("tel:+15551234"), true);
});

test("isSafeTargetUrl rejects dangerous and malformed schemes", () => {
  for (const bad of [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "ftp://example.com",
    "https://localhost",
    "example.com",
    "",
    "   ",
  ]) {
    assert.equal(isSafeTargetUrl(bad), false, `expected reject: ${bad}`);
  }
});

test("normalizeTarget resolves scheme-less hosts to https", () => {
  assert.equal(normalizeTarget("example.com/path"), "https://example.com/path");
  assert.equal(normalizeTarget("https://example.com/x"), "https://example.com/x");
});

test("normalizeTarget never emits executable schemes", () => {
  assert.equal(normalizeTarget("javascript:alert(1)"), null);
  assert.equal(normalizeTarget("data:text/html,x"), null);
  assert.equal(normalizeTarget(""), null);
});

/* ------------------------------- ua ------------------------------- */

test("parseUserAgent classifies common devices", () => {
  assert.equal(
    parseUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1",
    ).device,
    "mobile",
  );
  assert.equal(
    parseUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    ).browser,
    "Edge",
  );
  assert.equal(
    parseUserAgent(
      "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Safari/604.1",
    ).device,
    "tablet",
  );
});

test("parseUserAgent flags bots and empty UAs", () => {
  assert.equal(parseUserAgent("Googlebot/2.1 (+http://www.google.com/bot.html)").device, "bot");
  assert.equal(parseUserAgent("").device, "bot");
});

/* ------------------------------ codes ----------------------------- */

test("newCode produces URL-safe codes of the requested length", () => {
  const c = newCode(7);
  assert.equal(c.length, 7);
  assert.equal(isValidCode(c), true);
});

test("isValidCode rejects ambiguous or out-of-range codes", () => {
  assert.equal(isValidCode("abc234"), true);
  assert.equal(isValidCode("has space"), false);
  assert.equal(isValidCode("ab"), false);
  // Ambiguous characters (0, 1, l, o) are excluded from the alphabet.
  assert.equal(isValidCode("abc120"), false);
});

test("every generated code passes isValidCode", () => {
  // Regression: the validator once used a hand-written regex that rejected `i`,
  // which newCode emits — a fresh code could fail its own validator.
  assert.equal(isValidCode("iiii2222"), true);
  for (let i = 0; i < 5000; i++) {
    const c = newCode();
    assert.equal(isValidCode(c), true, `generated code rejected: ${c}`);
  }
});

/* -------------------------------- qr ------------------------------ */

test("sanitizeStyle clamps size/margin and validates colors + ECC", () => {
  const s = sanitizeStyle({
    fgColor: "not-a-color",
    bgColor: "#ABCDEF",
    size: 99999,
    margin: 99,
    ecc: "Z" as never,
  });
  assert.equal(s.fgColor, DEFAULT_QR_STYLE.fgColor);
  assert.equal(s.bgColor, "#ABCDEF");
  assert.equal(s.size, 2048);
  assert.equal(s.margin, 10);
  assert.equal(s.ecc, DEFAULT_QR_STYLE.ecc);
});

/* ----------------------------- app-url ---------------------------- */

test("getAppUrl prefers APP_URL and trims a trailing slash", () => {
  const prev = process.env.APP_URL;
  process.env.APP_URL = "https://qr.example.com/";
  assert.equal(getAppUrl(), "https://qr.example.com");
  if (prev === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = prev;
});
