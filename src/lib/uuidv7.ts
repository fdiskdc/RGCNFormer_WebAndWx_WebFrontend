/**
 * Zero-dependency UUID v7 generator (RFC 9562)
 * Format: 48-bit Unix ms timestamp + version bits + random bits
 * Result is time-sortable with cryptographically random uniqueness
 */

export function uuidv7(): string {
  const timestamp = Date.now();
  const random = crypto.getRandomValues(new Uint8Array(10));

  // Build hex string: 12 hex chars (48-bit timestamp) + 4 hex chars (version + rand) + ...
  const hex = [
    // Bytes 0-5: 48-bit big-endian timestamp
    (timestamp >> 40) & 0xff,
    (timestamp >> 32) & 0xff,
    (timestamp >> 24) & 0xff,
    (timestamp >> 16) & 0xff,
    (timestamp >> 8) & 0xff,
    timestamp & 0xff,
    // Byte 6: version 7 in top 4 bits, rand in lower
    (0x7 << 4) | (random[0] & 0x0f),
    // Byte 7: variant 0b10 in top 2 bits, rand in lower
    0x80 | (random[1] & 0x3f),
    // Bytes 8-15: remaining random
    ...Array.from(random.slice(2)),
  ]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
