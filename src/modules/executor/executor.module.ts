import { Module } from '@nestjs/common'
import { ExecutorService } from './executor.service'
import { BlockModule } from 'src/modules/block/block.module'
import { WalletModule } from 'src/modules/wallet/wallet.module'
import { ProviderModule } from 'src/modules/provider/provider.module'

@Module({
  imports: [ProviderModule, BlockModule, WalletModule],
  providers: [ExecutorService],
  exports: [ExecutorService],
})
export class ExecutorModule {}
