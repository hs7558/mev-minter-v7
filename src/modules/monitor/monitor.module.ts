import { Module } from '@nestjs/common'
import { MonitorService } from './monitor.service'
import { ExecutorModule } from 'src/modules/executor/executor.module'

@Module({
  imports: [ExecutorModule],
  providers: [MonitorService],
  exports: [MonitorService],
})
export class MonitorModule {}
