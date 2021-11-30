import WebSocket from 'ws'
import BlocknativeSdk from 'bnc-sdk'
import { Injectable } from '@nestjs/common'
import getChainId from 'src/utils/getChainId'
import { Transaction } from 'src/types/Transaction'
import { Config, Emitter } from 'bnc-sdk/dist/types/src/interfaces'
import { ExecutorService } from 'src/modules/executor/executor.service'

@Injectable()
export class MonitorService {
  client!: BlocknativeSdk

  constructor(private readonly executorService: ExecutorService) {}

  async start(config: Config) {
    this.init()
    await this.startMonitor(config)
    console.log('🔎 Monitor: Ready')
  }

  init() {
    this.client = new BlocknativeSdk({
      ws: WebSocket,
      networkId: getChainId(),
      ondown: (event) => console.log('🔴 Monitor: Websocket dropped', event),
      onerror: (error) => console.log('🔴 Monitor: Websocket error', error),
      onreopen: () => console.log('🔎 Monitor: Websocket reconnected'),
      dappId: process.env.BLOCKNATIVE_DAPP_ID as string,
    })
  }

  async startMonitor(config: Config) {
    const { emitter } = (await this.client.configuration(config)) as { emitter: Emitter }
    emitter.on('txPool', (event: unknown) => {
      const tx = event as Transaction
      console.log('🔎 Monitor: Tx detected')
      this.executorService.execute(tx)
    })
  }
}
