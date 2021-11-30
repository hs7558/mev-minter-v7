import { Module } from '@nestjs/common'
import { AppService } from 'src/app.service'
import { GasModule } from './modules/gas/gas.module'
import { BlockModule } from './modules/block/block.module'
import { StatusMonitorModule } from 'nestjs-status-monitor'
import { WalletModule } from './modules/wallet/wallet.module'
import { MonitorModule } from './modules/monitor/monitor.module'
import { ExecutorModule } from './modules/executor/executor.module'
import { ProviderModule } from './modules/provider/provider.module'

@Module({
  imports: [StatusMonitorModule.forRoot(), ExecutorModule, ProviderModule, MonitorModule, BlockModule, GasModule, WalletModule],
  providers: [AppService],
})
export class AppModule {}
