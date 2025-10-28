// Lightweight JSON sanitizer to accept JSON with comments and trailing commas
// Note: This is intended for admin-only uploads. We still validate structure after parsing.
export function sanitizeJsonString(input: string): string {
  if (!input) return input;
  let s = input;

  // Remove BOM if present
  s = s.replace(/^\uFEFF/, "");

  // Remove block comments: /* ... */
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove line comments //... but try not to break URLs like http://
  // Keep '//' when it's part of a URL (preceeded by ':')
  s = s.replace(/(^|[^:])\/\/.*$/gm, (m, p1) => (p1 ? p1 : ""));

  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");

  // Trim extraneous whitespace
  return s.trim();
}
