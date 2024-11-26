import { providers } from 'ethers'
import { Chain, ChainProviderFn } from 'wagmi'

import { ChainId } from './networks'

// custom implementation based on https://github.com/wevm/wagmi/blob/wagmi%400.12.13/packages/core/src/providers/infura.ts
// with multiple infura keys support
export function customInfuraProvider<TChain extends Chain>(): ChainProviderFn<
  TChain,
  providers.InfuraProvider,
  providers.InfuraWebSocketProvider
> {
  return function (chain) {
    // Retrieve the API key for the current chain's network
    const infuraKey = chainIdToInfuraKey(chain.id)

    if (!infuraKey) return null
    if (!chain.rpcUrls.infura?.http[0]) return null

    return {
      chain: {
        ...chain,
        rpcUrls: {
          ...chain.rpcUrls,
          default: {
            http: [`${chain.rpcUrls.infura.http[0]}/${infuraKey}`]
          }
        }
      } as TChain,
      provider: () => {
        const provider = new providers.InfuraProvider(
          {
            chainId: chain.id,
            name: chain.network,
            ensAddress: chain.contracts?.ensRegistry?.address
          },
          infuraKey
        )
        return Object.assign(provider)
      },
      webSocketProvider: () =>
        new providers.InfuraWebSocketProvider(
          {
            chainId: chain.id,
            name: chain.network,
            ensAddress: chain.contracts?.ensRegistry?.address
          },
          infuraKey
        )
    }
  }
}

export function chainIdToInfuraKey(chainId: ChainId) {
  const defaultInfuraKey = process.env.NEXT_PUBLIC_INFURA_KEY

  switch (chainId) {
    case ChainId.Ethereum:
      return process.env.NEXT_PUBLIC_INFURA_KEY_ETHEREUM || defaultInfuraKey
    case ChainId.Sepolia:
      return process.env.NEXT_PUBLIC_INFURA_KEY_SEPOLIA || defaultInfuraKey
    case ChainId.ArbitrumOne:
      return process.env.NEXT_PUBLIC_INFURA_KEY_ARBITRUM_ONE || defaultInfuraKey
    case ChainId.Base:
      return process.env.NEXT_PUBLIC_INFURA_KEY_BASE || defaultInfuraKey
    case ChainId.ArbitrumSepolia:
      return (
        process.env.NEXT_PUBLIC_INFURA_KEY_ARBITRUM_SEPOLIA || defaultInfuraKey
      )
    case ChainId.BaseSepolia:
      return process.env.NEXT_PUBLIC_INFURA_KEY_BASE_SEPOLIA || defaultInfuraKey

    default:
      return defaultInfuraKey
  }
}

export function chainIdToInfuraUrl(chainId: ChainId) {
  const infuraKey = chainIdToInfuraKey(chainId)

  switch (chainId) {
    case ChainId.Ethereum:
      return `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
    case ChainId.Sepolia:
      return `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`
    case ChainId.ArbitrumOne:
      return `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`
    case ChainId.Base:
      return `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`
    case ChainId.ArbitrumSepolia:
      return `https://arb-sepolia.g.alchemy.com/v2/${alchemyKey}`
    case ChainId.BaseSepolia:
      return `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`
    default:
      return undefined
  }
}
