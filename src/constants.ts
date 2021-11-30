import { parseEther } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'

export const GWEI = BigNumber.from(10).pow(9)
export const ETHER = BigNumber.from(10).pow(18)
export const MAX_BUNDLE_ATTEMPTS = 20
export const TXS_PER_WALLET = 5
export const TARGET_MINT_PRICE = parseEther('0.069')
export const TARGET_AMOUNT_TO_MINT_PER_WALLET = BigNumber.from(10)
export const TARGET_ADDRESS = '0x79fcdef22feed20eddacbb2587640e45491b757f'
export const TARGET_START_PUBLIC_SALE_SIGNATURE = '0xc4e370950000000000000000000000000000000000000000000000000000000000000001'
export const TARGET_MINT_DATA = '0xa0712d68000000000000000000000000000000000000000000000000000000000000000a'
export const PRIORITY_FEE = GWEI.mul(802)
export const BASE_FEE_MULTIPLIER = BigNumber.from(2)
export const ESTIMATED_GAS_PER_TX = BigNumber.from(1188345)
export const WALLETS = <Record<string, string>>{
  'Wallet 2': process.env.WALLET_2,
}
