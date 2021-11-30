export default (int: string | number) => {
  int = typeof int === 'number' ? int : parseInt(int)
  return `0x${int.toString(16)}`
}
