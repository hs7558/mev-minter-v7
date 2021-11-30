import intToHex from 'src/utils/intToHex'
import getChainId from 'src/utils/getChainId'
import bufferToHex from 'src/utils/bufferToHex'
import { TransactionFactory } from '@ethereumjs/tx'
import { Transaction } from 'src/types/Transaction'

export default (tx: Transaction) => {
  return bufferToHex(
    TransactionFactory.fromTxData({
      v: tx.v,
      r: tx.r,
      s: tx.s,
      to: tx.to,
      data: tx.input,
      type: intToHex(tx.type),
      nonce: intToHex(tx.nonce),
      value: intToHex(tx.value),
      gasLimit: intToHex(tx.gas),
      chainId: intToHex(getChainId()),
      maxFeePerGas: intToHex(tx.maxFeePerGas),
      maxPriorityFeePerGas: intToHex(tx.maxPriorityFeePerGas),
    }).serialize(),
  )
}
