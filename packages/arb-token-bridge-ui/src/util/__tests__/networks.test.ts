import { constants, addCustomNetwork } from '@arbitrum/sdk'

import {
  ChainId,
  getBaseChainIdByChainId,
  getSupportedChainIds
} from '../networks'
import { orbitTestnets } from '../orbitChainsList'

const xaiTestnetChainId = 37714555429

beforeAll(() => {
  const xaiTestnet = orbitTestnets[xaiTestnetChainId]

  if (!xaiTestnet) {
    throw new Error(`Could not find Xai Testnet in the Orbit chains list.`)
  }

  // add local
  addCustomNetwork({
    customL1Network: {
      blockTime: 10,
      chainID: 1337,
      explorerUrl: '',
      isCustom: true,
      name: 'Ethereum Local',
      partnerChainIDs: [412346],
      isArbitrum: false
    },
    customL2Network: {
      chainID: 412346,
      partnerChainIDs: [
        // Orbit chains will go here
      ],
      confirmPeriodBlocks: 20,
      ethBridge: {
        bridge: '0x9B4477cAD544fB092B1Bc551d88465f7F13a443F',
        inbox: '0xa5d8d368c4Fc06D71724d91561d6F2a880FD4fD9',
        outbox: '0xbBaAB28Ad701e822148411376975cca7E02323d7',
        rollup: '0x9c14dfd8e5c262f9652e78f2b0a13389ee41d717',
        sequencerInbox: '0xD2B20a3B8C1d97A64eFA1120D3339d87841ccAE1'
      },
      explorerUrl: '',
      isArbitrum: true,
      isCustom: true,
      name: 'Arbitrum Local',
      partnerChainID: 1337,
      retryableLifetimeSeconds: 604800,
      nitroGenesisBlock: 0,
      nitroGenesisL1Block: 0,
      depositTimeout: 900000,
      blockTime: constants.ARB_MINIMUM_BLOCK_TIME_IN_SECONDS,
      tokenBridge: {
        l1CustomGateway: '0x1c924636933ceDE03245f19756662e92F851293D',
        l1ERC20Gateway: '0xeBef8abC1DF5853345f319D5ACcba1d01AECCBD8',
        l1GatewayRouter: '0x932Af0F51E02a8b371d00E7448Eb6e91c013274d',
        l1MultiCall: '0x4De74F7B2a30a1Ee39b374f6F11859c334234A79',
        l1ProxyAdmin: '0xFFB9cE193d5FE12360f47a93A97d72da65c35019',
        l1Weth: '0x525c2aBA45F66987217323E8a05EA400C65D06DC',
        l1WethGateway: '0x1990703B7C717008F34d5088C2838c07B6C6e97b',
        l2CustomGateway: '0xD53b0E696c16520308186bB7c64E3dE85be45Ab9',
        l2ERC20Gateway: '0x7e6C3A78da71Ed7d6f9D3f155C5756fB1129E19c',
        l2GatewayRouter: '0x614234364127E3D5De331A9f2cBeFaE6869168eB',
        l2Multicall: '0x96D1271Ef847568D22Ba78Af2E48bed6ca5D2539',
        l2ProxyAdmin: '0x1bd440c4b2361ac11c20b5CB2409e64cB82DDb30',
        l2Weth: '0x9ffAd12EE17abF43a060760f3d93932a3DE5EB72',
        l2WethGateway: '0xf2Ec70e05fab34580B26890544dF2fF04dc63521'
      }
    }
  })

  addCustomNetwork({
    customL2Network: xaiTestnet
  })
})

describe('getBaseChainIdByChainId', () => {
  describe('chainId is the id of a base chain', () => {
    it('should return the chainId', () => {
      expect(
        getBaseChainIdByChainId({
          chainId: ChainId.Ethereum
        })
      ).toBe(ChainId.Ethereum)
      expect(
        getBaseChainIdByChainId({
          chainId: ChainId.Sepolia
        })
      ).toBe(ChainId.Sepolia)
      expect(
        getBaseChainIdByChainId({
          chainId: ChainId.Local
        })
      ).toBe(ChainId.Local)
    })
  })

  describe('chainId is the id of an L2 chain', () => {
    it('should return the correct base chain', () => {
      expect(
        getBaseChainIdByChainId({
          chainId: ChainId.ArbitrumOne
        })
      ).toBe(ChainId.Ethereum)
      expect(
        getBaseChainIdByChainId({
          chainId: ChainId.ArbitrumNova
        })
      ).toBe(ChainId.Ethereum)
      expect(
        getBaseChainIdByChainId({
          chainId: ChainId.ArbitrumSepolia
        })
      ).toBe(ChainId.Sepolia)
      expect(
        getBaseChainIdByChainId({
          chainId: ChainId.ArbitrumLocal
        })
      ).toBe(ChainId.Local)
    })
  })

  describe('chainId is the id of an L3 Orbit chain', () => {
    it('should return the correct base chain', () => {
      expect(
        getBaseChainIdByChainId({
          chainId: xaiTestnetChainId
        })
      ).toBe(ChainId.Sepolia)

      expect(
        getBaseChainIdByChainId({
          chainId: ChainId.StylusTestnet
        })
      ).toBe(ChainId.Sepolia)
    })
  })

  describe('chainId is the id of an chain not added to the list of chains', () => {
    it('should return the chainId', () => {
      expect(
        getBaseChainIdByChainId({
          chainId: 2222
        })
      ).toBe(2222)
    })
  })
})

describe('getSupportedChainIds', () => {
  describe('includeMainnets is true, includeTestnets is unset', () => {
    it('should return a list of chain ids that includes Mainnets', () => {
      expect(getSupportedChainIds({ includeMainnets: true })).toContain(
        ChainId.Ethereum
      )
      expect(getSupportedChainIds({ includeMainnets: true })).toContain(
        ChainId.ArbitrumOne
      )
      expect(getSupportedChainIds({ includeMainnets: true })).toContain(
        ChainId.ArbitrumNova
      )
    })
    it('should return a list of chain ids that does not include Testnets', () => {
      expect(getSupportedChainIds({ includeMainnets: true })).not.toContain(
        ChainId.Sepolia
      )
      expect(getSupportedChainIds({ includeMainnets: true })).not.toContain(
        ChainId.ArbitrumSepolia
      )
      expect(getSupportedChainIds({ includeMainnets: true })).not.toContain(
        ChainId.Local
      )
      expect(getSupportedChainIds({ includeMainnets: true })).not.toContain(
        ChainId.ArbitrumLocal
      )
      expect(getSupportedChainIds({ includeMainnets: true })).not.toContain(
        ChainId.StylusTestnet
      )
    })
  })
  describe('includeMainnets is true, includeTestnets is true', () => {
    it('should return a list of chain ids that includes Mainnets', () => {
      expect(
        getSupportedChainIds({ includeMainnets: true, includeTestnets: true })
      ).toContain(ChainId.Ethereum)
      expect(
        getSupportedChainIds({ includeMainnets: true, includeTestnets: true })
      ).toContain(ChainId.ArbitrumOne)
      expect(
        getSupportedChainIds({ includeMainnets: true, includeTestnets: true })
      ).toContain(ChainId.ArbitrumNova)
    })
    it('should return a list of chain ids that includes Testnets', () => {
      expect(
        getSupportedChainIds({ includeMainnets: true, includeTestnets: true })
      ).toContain(ChainId.Sepolia)
      expect(
        getSupportedChainIds({ includeMainnets: true, includeTestnets: true })
      ).toContain(ChainId.ArbitrumSepolia)
      expect(
        getSupportedChainIds({ includeMainnets: true, includeTestnets: true })
      ).toContain(ChainId.Local)
      expect(
        getSupportedChainIds({ includeMainnets: true, includeTestnets: true })
      ).toContain(ChainId.ArbitrumLocal)
      expect(
        getSupportedChainIds({ includeMainnets: true, includeTestnets: true })
      ).toContain(ChainId.StylusTestnet)
    })
  })
  describe('includeMainnets is unset, includeTestnets is true', () => {
    it('should return a list of chain ids that includes Mainnets', () => {
      expect(getSupportedChainIds({ includeTestnets: true })).toContain(
        ChainId.Ethereum
      )
      expect(getSupportedChainIds({ includeTestnets: true })).toContain(
        ChainId.ArbitrumOne
      )
      expect(getSupportedChainIds({ includeTestnets: true })).toContain(
        ChainId.ArbitrumNova
      )
    })
    it('should return a list of chain ids that includes Testnets', () => {
      expect(getSupportedChainIds({ includeTestnets: true })).toContain(
        ChainId.Sepolia
      )
      expect(getSupportedChainIds({ includeTestnets: true })).toContain(
        ChainId.ArbitrumSepolia
      )
      expect(getSupportedChainIds({ includeTestnets: true })).toContain(
        ChainId.Local
      )
      expect(getSupportedChainIds({ includeTestnets: true })).toContain(
        ChainId.ArbitrumLocal
      )
      expect(getSupportedChainIds({ includeTestnets: true })).toContain(
        ChainId.StylusTestnet
      )
    })
  })
  describe('includeMainnets is false, includeTestnets is false', () => {
    it('should return a list of chain ids that includes Mainnets', () => {
      expect(
        getSupportedChainIds({ includeMainnets: false, includeTestnets: false })
      ).toHaveLength(0)
    })
  })
})
