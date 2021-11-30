export default () => {
  return {
    mainnet: 'https://relay.flashbots.net',
    goerli: 'https://relay-goerli.flashbots.net',
  }[process.env.NETWORK as string]
}
