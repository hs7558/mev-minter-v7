import getChainId from 'src/utils/getChainId'
import { Wallet } from '@ethersproject/wallet'
import serializeTx from 'src/utils/serializeTx'
import isProduction from 'src/utils/isProduction'
import { Transaction } from 'src/types/Transaction'
import { BigNumber } from '@ethersproject/bignumber'
import prettifyNumber from 'src/utils/prettifyNumber'
import { formatEther, formatUnits } from '@ethersproject/units'
import { TransactionRequest } from '@ethersproject/abstract-provider'
import { TARGET_ADDRESS, TARGET_AMOUNT_TO_MINT_PER_WALLET, TARGET_MINT_PRICE, GWEI, TARGET_MINT_DATA } from 'src/constants'
import { FlashbotsBundleProvider, FlashbotsBundleRawTransaction, FlashbotsBundleTransaction } from '@flashbots/ethers-provider-bundle'

const PRIORITY_FEE = GWEI.mul(300)
const BASE_FEE_MULTIPLIER = BigNumber.from(2)
const ESTIMATED_GAS_PER_MINT = BigNumber.from(1000000)

export interface ExecutorArgs {
  bundleId: number
  bundleAttempt: number
  triggerTx: Transaction
  wallets: Wallet[]
  targetBlockNumber: number
  targetBlockBaseFee: BigNumber
  flashbots: FlashbotsBundleProvider
}

export class Executor {
  private bundleId: number
  private bundleAttempt: number
  private triggerTx: Transaction
  private targetBlockNumber: number
  private targetBlockBaseFee: BigNumber
  private priorityFeeOptimal!: BigNumber
  private maxFeeOptimal!: BigNumber
  private wallets: Wallet[]
  private isProduction: boolean
  private gasRequired!: BigNumber
  private nftCost!: BigNumber
  private gasCost!: BigNumber
  private totalCost!: BigNumber
  private flashbots: FlashbotsBundleProvider

  constructor({ bundleId, bundleAttempt, triggerTx, wallets, targetBlockNumber, targetBlockBaseFee, flashbots }: ExecutorArgs) {
    this.bundleId = bundleId
    this.bundleAttempt = bundleAttempt
    this.triggerTx = triggerTx
    this.wallets = wallets
    this.targetBlockNumber = targetBlockNumber
    this.targetBlockBaseFee = targetBlockBaseFee
    this.isProduction = isProduction()
    this.flashbots = flashbots
  }

  private setOptimalGas() {
    this.maxFeeOptimal = this.targetBlockBaseFee.mul(BASE_FEE_MULTIPLIER).add(PRIORITY_FEE)
    this.priorityFeeOptimal = PRIORITY_FEE
  }

  private evaluateStrategy() {
    this.gasRequired = TARGET_AMOUNT_TO_MINT_PER_WALLET.mul(ESTIMATED_GAS_PER_MINT)
    this.nftCost = TARGET_AMOUNT_TO_MINT_PER_WALLET.mul(TARGET_MINT_PRICE)
    this.gasCost = this.targetBlockBaseFee.add(this.priorityFeeOptimal).mul(this.gasRequired)
    this.totalCost = this.nftCost.add(this.gasCost)
  }

  private scaffoldTx(tx: TransactionRequest) {
    return {
      type: 2,
      chainId: getChainId(),
      ...tx,
    }
  }

  private buildMintTx(): TransactionRequest {
    return this.scaffoldTx({
      to: TARGET_ADDRESS,
      data: TARGET_MINT_DATA,
      maxFeePerGas: this.maxFeeOptimal,
      gasLimit: ESTIMATED_GAS_PER_MINT.mul(2),
      maxPriorityFeePerGas: this.priorityFeeOptimal,
      value: TARGET_AMOUNT_TO_MINT_PER_WALLET.mul(TARGET_MINT_PRICE),
    })
  }

  private buildBundle(): (FlashbotsBundleTransaction | FlashbotsBundleRawTransaction)[] {
    const signedBundleTx = { signedTransaction: serializeTx(this.triggerTx) }
    const rawBundleTxs = []
    for (const wallet of this.wallets) {
      rawBundleTxs.push({
        transaction: this.buildMintTx(),
        signer: wallet,
      })
    }
    return [signedBundleTx, ...rawBundleTxs]
  }

  private async simulateBundle(bundle: (FlashbotsBundleTransaction | FlashbotsBundleRawTransaction)[]) {
    const signedBundle = await this.flashbots.signBundle(bundle)
    const simulation = await this.flashbots.simulate(signedBundle, this.targetBlockNumber)
    if ('error' in simulation) {
      console.log('🔴 Bundle error: ', simulation)
      return false
    } else {
      console.log('🟢 Bundle success: ', simulation)
      return true
    }
  }

  private async sendBundle(bundle: (FlashbotsBundleTransaction | FlashbotsBundleRawTransaction)[]) {
    const response = await this.flashbots.sendBundle(bundle, this.targetBlockNumber)
    if ('error' in response) return console.log('🔴 Bundle error: ', response)
    const status = await response.wait()
    if (status === 1) return console.log('🔴 Bundle failed: Block passed')
    if (status === 2) return console.log('🔴 Bundle failed: Nonce too high')
    console.log('🟢 Bundle success: ', response)
    return true
  }

  async execute() {
    try {
      this.setOptimalGas()
      this.evaluateStrategy()
      console.log(`bundleId: ${this.bundleId}`)
      console.log(`bundleAttempt: ${this.bundleAttempt}`)
      console.log(`targetBlockNumber: ${this.targetBlockNumber}`)
      console.log(`targetBlockBaseFee: ${prettifyNumber(formatUnits(this.targetBlockBaseFee, 'gwei'))}`)
      console.log(`priorityFeeOptimal: ${prettifyNumber(formatUnits(this.priorityFeeOptimal, 'gwei'))}`)
      console.log(`maxFeeOptimal: ${prettifyNumber(formatUnits(this.maxFeeOptimal, 'gwei'))}`)
      console.log(`gasRequired: ${this.gasRequired.toNumber()}`)
      console.log(`nftCost: ${prettifyNumber(formatEther(this.nftCost))}`)
      console.log(`gasCost: ${prettifyNumber(formatEther(this.gasCost))}`)
      console.log(`totalCost: ${prettifyNumber(formatEther(this.totalCost))}`)
      console.log(`hash: ${this.triggerTx.hash}`)
      const bundle = this.buildBundle()
      return this.isProduction ? this.sendBundle(bundle) : this.simulateBundle(bundle)
    } catch (err) {
      console.log('🔴 Execution error: ', err)
      return false
    }
  }
}
