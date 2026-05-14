/**
 * Shared, strict email-address validation.
 *
 * The previous pattern — /^[^\s@]+@[^\s@]+\.[^\s@]+$/ — only excluded
 * whitespace and `@`, so it happily accepted attribute-breakout /
 * injection payloads such as:
 *
 *   test@test.com"tabindex=1+autofocus+onfocus/'alert'(location/'
 *
 * This pattern is intentionally conservative: only the characters that
 * legitimately appear in an address are allowed, so quotes, slashes,
 * parentheses, `=`, `<`, `>` and similar are rejected outright.
 *
 *   local:  letters, digits, and . _ % + -
 *   domain: letters, digits, . and -
 *   TLD:    at least two letters
 */
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** RFC 5321 caps a full address at 254 characters. */
const MAX_EMAIL_LENGTH = 254;

/**
 * Returns true only for a well-formed email address. Trims surrounding
 * whitespace first; rejects empty, over-length, and malformed input.
 */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) return false;
  return EMAIL_PATTERN.test(trimmed);
}
