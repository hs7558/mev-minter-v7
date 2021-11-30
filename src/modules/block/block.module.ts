import { Module } from '@nestjs/common'
import { BlockService } from './block.service'
import { GasModule } from 'src/modules/gas/gas.module'
import { ProviderModule } from 'src/modules/provider/provider.module'

@Module({
  imports: [ProviderModule, GasModule],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}
