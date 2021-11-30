import { Module } from '@nestjs/common'
import { GasService } from './gas.service'
import { ProviderModule } from 'src/modules/provider/provider.module'

@Module({
  imports: [ProviderModule],
  providers: [GasService],
  exports: [GasService],
})
export class GasModule {}
