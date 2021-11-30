import { Module } from '@nestjs/common'
import { WalletService } from './wallet.service'
import { ProviderModule } from 'src/modules/provider/provider.module'

@Module({
  imports: [ProviderModule],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
