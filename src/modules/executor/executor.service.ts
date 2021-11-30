import { Injectable } from '@nestjs/common'
import { Wallet } from '@ethersproject/wallet'
import { Transaction } from 'src/types/Transaction'
import { MAX_BUNDLE_ATTEMPTS } from 'src/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { BaseProvider } from '@ethersproject/providers'
import { Executor } from 'src/modules/executor/executor'
import { BlockService } from 'src/modules/block/block.service'
import { WalletService } from 'src/modules/wallet/wallet.service'
import getFlashbotsEndpoint from 'src/utils/getFlashbotsEndpoint'
import { ProviderService } from 'src/modules/provider/provider.service'
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle'

@Injectable()
export class ExecutorService {
  bundleId = 0
  provider: BaseProvider
  wallets: Wallet[]
  flashbots!: FlashbotsBundleProvider
  success = false

  constructor(
    private readonly blockService: BlockService,
    private readonly walletService: WalletService,
    private readonly providerService: ProviderService,
  ) {
    this.wallets = this.walletService.getWallets()
    this.provider = this.providerService.getProvider()
  }

  async start() {
    this.flashbots = await FlashbotsBundleProvider.create(this.provider, Wallet.createRandom(), getFlashbotsEndpoint())
    console.log(`🔫 Executor: Ready`)
  }

  async execute(triggerTx: Transaction) {
    let attempts = 0
    const bundleId = (this.bundleId += 1)
    const cancelNewBlockListener = this.blockService.onNewBlock(async (currentBlock: number, nextBlockBaseFee: BigNumber) => {
      attempts++
      const maxAttemptsReached = attempts > MAX_BUNDLE_ATTEMPTS
      if (this.success) {
        cancelNewBlockListener()
        console.log('🔴 Executor: Cancelled: Strategy already successful.')
      }
      const bundleSuccess = await new Executor({
        bundleId,
        bundleAttempt: attempts,
        triggerTx,
        wallets: this.wallets,
        flashbots: this.flashbots,
        targetBlockNumber: currentBlock + 1,
        targetBlockBaseFee: nextBlockBaseFee,
      }).execute()
      if (bundleSuccess) {
        this.success = true
        cancelNewBlockListener()
        console.log('🟢 Executor: Cancelled: Bundle success.')
      }
      if (maxAttemptsReached) {
        cancelNewBlockListener()
        console.log('🔴 Executor: Cancelled: Max attempts reached.')
      }
    })
  }
}
