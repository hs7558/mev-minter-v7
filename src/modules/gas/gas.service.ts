import axios from 'axios'
import { GWEI } from 'src/constants'
import isMainnet from 'src/utils/isMainnet'
import { Injectable } from '@nestjs/common'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import prettifyNumber from 'src/utils/prettifyNumber'
import { ProviderService } from 'src/modules/provider/provider.service'

@Injectable()
export class GasService {
  private maxFeeRecommended!: BigNumber
  private priorityFeeRecommended!: BigNumber
  private client = axios.create({
    baseURL: 'https://api.blocknative.com/gasprices/blockprices',
    headers: { Authorization: process.env.BLOCKNATIVE_DAPP_ID as string },
  })

  constructor(private readonly providerService: ProviderService) {}

  async start() {
    if (isMainnet()) await this.updateRecommendedGasMainnet()
    else await this.updateRecommendedGasTestnet()
    console.log(`⛽️ Gas: Ready`)
  }

  private async updateRecommendedGasMainnet() {
    try {
      const { maxPriorityFeePerGas, maxFeePerGas } = ((await this.client({ method: 'get' })) as any).data.blockPrices[0].estimatedPrices[0]
      this.priorityFeeRecommended = parseUnits(maxPriorityFeePerGas.toString(), 'gwei')
      this.maxFeeRecommended = parseUnits(maxFeePerGas.toString(), 'gwei')
    } catch (err) {
      console.log(`🔴 Gas Monitor: Error fetching data`, err)
    }
    setTimeout(this.updateRecommendedGasMainnet.bind(this), 1000)
  }

  private async updateRecommendedGasTestnet() {
    try {
      const provider = this.providerService.getProvider()
      const feeData = await provider.getFeeData()
      const maxFeePerGas = feeData.maxFeePerGas as BigNumber
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas as BigNumber
      this.priorityFeeRecommended = parseUnits(maxPriorityFeePerGas.toString(), 'gwei')
      this.maxFeeRecommended = parseUnits(maxFeePerGas.toString(), 'gwei')
    } catch (err) {
      console.log(`🔴 Gas Monitor: Error fetching data`, err)
    }
    setTimeout(this.updateRecommendedGasTestnet.bind(this), 1000)
  }

  getRecommended() {
    return {
      maxFee: this.maxFeeRecommended,
      priorityFee: this.priorityFeeRecommended,
    }
  }

  logGas() {
    console.log(`⛽️ Gas: Priority Fee: ${prettifyNumber(this.priorityFeeRecommended.div(GWEI))} gwei`)
    console.log(`⛽️ Gas: Max Fee: ${prettifyNumber(this.maxFeeRecommended.div(GWEI))} gwei`)
  }
}
