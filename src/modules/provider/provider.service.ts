import { providers } from 'ethers'
import { Injectable } from '@nestjs/common'
import { BaseProvider } from '@ethersproject/providers'

@Injectable()
export class ProviderService {
  private readonly provider: BaseProvider

  constructor() {
    this.provider = new providers.WebSocketProvider(
      `wss://eth-${process.env.NETWORK}.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      process.env.NETWORK,
    )
  }

  getProvider() {
    return this.provider
  }
}
