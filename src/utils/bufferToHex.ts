export default (buffer: Buffer) => {
  return `0x${buffer.toString('hex')}`
}
