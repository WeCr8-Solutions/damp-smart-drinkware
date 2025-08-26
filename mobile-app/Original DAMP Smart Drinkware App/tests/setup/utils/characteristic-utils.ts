// Small helper used by tests to safely convert characteristic.value to a Buffer
// Accepts string | null and returns Buffer so call sites don't need to assert.
export function characteristicValueToBuffer(value: string | null | undefined, encoding: BufferEncoding = 'base64') {
  const normalized = value == null ? '' : value;
  return Buffer.from(normalized, encoding);
}
