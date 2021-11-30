import { BlockService } from 'src/modules/block/block.service'
import { WalletService } from 'src/modules/wallet/wallet.service'
import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { MonitorService } from 'src/modules/monitor/monitor.service'
import { ExecutorService } from 'src/modules/executor/executor.service'
import { TARGET_ADDRESS, TARGET_START_PUBLIC_SALE_SIGNATURE } from 'src/constants'

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly blockService: BlockService,
    private readonly walletService: WalletService,
    private readonly monitorService: MonitorService,
    private readonly executorService: ExecutorService,
  ) {}

  onApplicationBootstrap() {
    setTimeout(async () => {
      await this.walletService.fetchBalances()
      await this.executorService.start()
      await this.blockService.start()
      await this.monitorService.start({
        watchAddress: true,
        scope: TARGET_ADDRESS,
        filters: [{ input: [TARGET_START_PUBLIC_SALE_SIGNATURE] }],
      })
      console.log('🟢 App: Ready')
    }, 1000)
  }
}
