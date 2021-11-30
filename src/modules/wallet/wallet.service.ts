import { WALLETS } from 'src/constants'
import { Injectable } from '@nestjs/common'
import { Wallet } from '@ethersproject/wallet'
import { formatEther } from '@ethersproject/units'
import prettifyNumber from 'src/utils/prettifyNumber'
import { ProviderService } from 'src/modules/provider/provider.service'

@Injectable()
export class WalletService {
  wallets: Record<string, Wallet> = {}

  constructor(private readonly providerService: ProviderService) {
    for (const [walletName, walletKey] of Object.entries(WALLETS)) {
      this.wallets[walletName] = new Wallet(walletKey, this.providerService.getProvider())
    }
  }

  async fetchBalances() {
    for (const [walletName, wallet] of Object.entries(this.wallets)) {
      const walletBalance = await wallet.getBalance()
      console.log(`👛 ${walletName}: Balance ${prettifyNumber(formatEther(walletBalance))}`)
    }
  }

  getWallets() {
    return Object.values(this.wallets)
  }
}
