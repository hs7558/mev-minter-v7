export default (hexString: string) => {
  if (typeof hexString !== 'string' || !hexString.startsWith('0x')) throw new Error('Invalid input for removeHexPrefix. Not a valid hex string.')
  return hexString.slice(2)
}
