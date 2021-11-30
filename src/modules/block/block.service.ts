import WebSocket from 'ws'
import EventEmitter from 'events'
import { GWEI } from 'src/constants'
import { Block } from '@ethereumjs/block'
import { Injectable } from '@nestjs/common'
import { BigNumber } from '@ethersproject/bignumber'
import Common, { Chain, Hardfork } from '@ethereumjs/common'
import { ProviderService } from 'src/modules/provider/provider.service'
const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.London })

@Injectable()
export class BlockService {
  private newBlockEvent = 'newBlockEvent'
  private currentBlock!: number
  private eventEmitter: EventEmitter
  private nextBlockBaseFee!: BigNumber

  constructor(private readonly providerService: ProviderService) {
    this.eventEmitter = new EventEmitter()
  }

  async start() {
    if (process.env.BLOXROUTE_ENABLED === 'true') await this.startMonitorBloxroute()
    else await this.startMonitorProvider()
    console.log('🧱 Block: Ready')
  }

  startMonitorProvider() {
    return new Promise((resolve) => {
      const provider = this.providerService.getProvider()
      provider.on('block', async (currentBlock) => {
        const { number, gasUsed, gasLimit, baseFeePerGas } = await provider.getBlock(currentBlock)
        const block = Block.fromBlockData({ header: { number, gasUsed: gasUsed.toHexString(), gasLimit: gasLimit.toHexString(), baseFeePerGas: (baseFeePerGas as BigNumber).toHexString() } }, { common }) // prettier-ignore
        if (this.currentBlock === currentBlock) return
        this.currentBlock = currentBlock
        this.nextBlockBaseFee = BigNumber.from(block.header.calcNextBaseFee().toString())
        console.log(`🧱 Current block: ${currentBlock}`)
        console.log(`🧱 Next block base fee: ${(this.nextBlockBaseFee.toNumber() / GWEI.toNumber()).toFixed(2)}`)
        this.eventEmitter.emit(this.newBlockEvent, this.currentBlock, this.nextBlockBaseFee)
        resolve(null)
      })
    })
  }

  startMonitorBloxroute() {
    console.log('halovdfvss')
    return new Promise((resolve) => {
      const ws = new WebSocket('wss://api.blxrbdn.com/ws', {
        headers: { Authorization: process.env.BLOXROUTE_AUTHORIZATION_HEADER },
        rejectUnauthorized: false,
      })
      ws.on('open', () => ws.send(`{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["newBlocks", {"include": ["hash"]}]}`))
      ws.on('message', (buffer: Buffer) => {
        const data = JSON.parse(buffer.toString())
        if (data.method !== 'subscribe') return
        const { number, gasLimit, gasUsed, baseFeePerGas } = data.params.result.header
        const block = Block.fromBlockData({ header: { number, gasUsed, gasLimit, baseFeePerGas } }, { common })
        const currentBlock = block.header.number.toNumber()
        if (this.currentBlock === currentBlock) return
        this.currentBlock = currentBlock
        this.nextBlockBaseFee = BigNumber.from(block.header.calcNextBaseFee().toString())
        console.log(`🧱 Current block: ${currentBlock}`)
        console.log(`🧱 Next block base fee: ${(this.nextBlockBaseFee.toNumber() / GWEI.toNumber()).toFixed(2)}`)
        this.eventEmitter.emit(this.newBlockEvent, this.currentBlock, this.nextBlockBaseFee)
        resolve(null)
      })
    })
  }

  onNewBlock(callback: (...args: any) => void) {
    callback(this.currentBlock, this.nextBlockBaseFee) // trigger callback immediately on block listener creation
    this.eventEmitter.on(this.newBlockEvent, callback)
    return () => {
      this.eventEmitter.off(this.newBlockEvent, callback)
      console.log('🧱 Block: Listener cancelled')
    }
  }

  getBlockDetails() {
    return {
      currentBlock: this.currentBlock,
      nextBlockBaseFee: this.nextBlockBaseFee,
    }
  }
}
