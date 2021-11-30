import { BigNumber } from '@ethersproject/bignumber'

export default (number: BigNumber | number | string) => {
  const float = parseFloat(typeof number === 'string' ? number : number.toString())
  return Math.round(float) === float ? float : float.toFixed(2)
}
