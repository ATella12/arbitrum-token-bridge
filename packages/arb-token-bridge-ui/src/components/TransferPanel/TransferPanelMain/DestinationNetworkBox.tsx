import { useMemo } from 'react'
import { constants } from 'ethers'
import Image from 'next/image'

import { useNetworks } from '../../../hooks/useNetworks'
import { NetworkContainer } from '../TransferPanelMain'
import { useNetworksRelationship } from '../../../hooks/useNetworksRelationship'
import { useAppState } from '../../../state'
import { useBalances } from '../../../hooks/useBalances'
import { CommonAddress } from '../../../util/CommonAddressUtils'
import { isNetwork } from '../../../util/networks'
import { EstimatedGas } from '../EstimatedGas'
import { useSelectedTokenBalances } from '../../../hooks/TransferPanel/useSelectedTokenBalances'
import { useNativeCurrency } from '../../../hooks/useNativeCurrency'
import { useDialog } from '../../common/Dialog'
import {
  NetworkButton,
  NetworkSelectionContainer
} from '../../common/NetworkSelectionContainer'
import { useNativeCurrencyBalances } from './useNativeCurrencyBalances'
import { useIsBatchTransferSupported } from '../../../hooks/TransferPanel/useIsBatchTransferSupported'
import { getBridgeUiConfigForChain } from '../../../util/bridgeUiConfig'
import { SafeImage } from '../../common/SafeImage'
import { useTokensFromLists, useTokensFromUser } from '../TokenSearchUtils'
import { formatAmount } from '../../../util/NumberUtils'
import { Loader } from '../../common/atoms/Loader'
import { useAmount2InputVisibility } from './SourceNetworkBox'
import { useArbQueryParams } from '../../../hooks/useArbQueryParams'

function BalanceRow({
  parentErc20Address,
  balance,
  symbolOverride
}: {
  parentErc20Address?: string
  balance: string | undefined
  symbolOverride?: string
}) {
  const [networks] = useNetworks()
  const { childChainProvider, isDepositMode } =
    useNetworksRelationship(networks)
  const nativeCurrency = useNativeCurrency({ provider: childChainProvider })

  const tokensFromLists = useTokensFromLists()
  const tokensFromUser = useTokensFromUser()

  const tokenLogoSrc = useMemo(() => {
    if (parentErc20Address) {
      return (
        tokensFromLists[parentErc20Address]?.logoURI ??
        tokensFromUser[parentErc20Address]?.logoURI
      )
    }

    return nativeCurrency.logoUrl
  }, [
    nativeCurrency.logoUrl,
    parentErc20Address,
    tokensFromLists,
    tokensFromUser
  ])

  const symbol = useMemo(() => {
    if (symbolOverride) {
      return symbolOverride
    }

    if (parentErc20Address) {
      return (
        tokensFromLists[parentErc20Address]?.symbol ??
        tokensFromUser[parentErc20Address]?.symbol
      )
    }

    return nativeCurrency.symbol
  }, [
    symbolOverride,
    nativeCurrency.symbol,
    parentErc20Address,
    tokensFromLists,
    tokensFromUser
  ])

  return (
    <div className="flex justify-between py-3 text-sm">
      <div className="flex items-center space-x-1.5">
        <SafeImage
          src={tokenLogoSrc}
          alt={`${symbol} logo`}
          className="h-4 w-4 shrink-0"
        />
        <span>{symbol}</span>
      </div>
      <div>
        <span>Balance: </span>
        <span
          aria-label={`${symbol} balance amount on ${
            isDepositMode ? 'childChain' : 'parentChain'
          }`}
        >
          {balance ? (
            balance
          ) : (
            <Loader wrapperClass="ml-2" size="small" color="white" />
          )}
        </span>
      </div>
    </div>
  )
}

function BalancesContainer({
  showUsdcSpecificInfo
}: {
  showUsdcSpecificInfo: boolean
}) {
  const {
    app: { selectedToken }
  } = useAppState()
  const [networks] = useNetworks()
  const { childChain, childChainProvider, isDepositMode } =
    useNetworksRelationship(networks)
  const nativeCurrency = useNativeCurrency({ provider: childChainProvider })
  const { isArbitrumOne } = isNetwork(childChain.id)

  const isBatchTransferSupported = useIsBatchTransferSupported()
  const { isAmount2InputVisible } = useAmount2InputVisibility()

  const { erc20ChildBalances } = useBalances()
  const nativeCurrencyBalances = useNativeCurrencyBalances()
  const selectedTokenBalances = useSelectedTokenBalances()

  const selectedTokenDestinationBalance = isDepositMode
    ? selectedTokenBalances.childBalance
    : selectedTokenBalances.parentBalance

  const selectedTokenOrNativeCurrencyBalance = selectedToken
    ? selectedTokenDestinationBalance
    : nativeCurrencyBalances.destinationBalance

  return (
    <div
      className="rounded px-3 text-white [&>*+*]:border-t [&>*+*]:border-gray-600"
      style={{ backgroundColor: '#00000050' }}
    >
      {showUsdcSpecificInfo && isDepositMode && (
        <BalanceRow
          parentErc20Address={
            isArbitrumOne
              ? CommonAddress.Ethereum.USDC
              : CommonAddress.ArbitrumOne.USDC
          }
          balance={formatAmount(
            (isArbitrumOne
              ? erc20ChildBalances?.[CommonAddress.ArbitrumOne.USDC]
              : erc20ChildBalances?.[CommonAddress.ArbitrumSepolia.USDC]) ??
              constants.Zero,
            {
              decimals: selectedToken?.decimals
            }
          )}
          symbolOverride="USDC"
        />
      )}
      <BalanceRow
        parentErc20Address={selectedToken?.address}
        balance={
          selectedTokenOrNativeCurrencyBalance
            ? formatAmount(selectedTokenOrNativeCurrencyBalance, {
                decimals: selectedToken
                  ? selectedToken.decimals
                  : nativeCurrency.decimals
              })
            : undefined
        }
        symbolOverride={showUsdcSpecificInfo ? 'USDC.e' : undefined}
      />
      {isBatchTransferSupported && isAmount2InputVisible && (
        <BalanceRow
          balance={
            nativeCurrencyBalances.destinationBalance
              ? formatAmount(nativeCurrencyBalances.destinationBalance, {
                  decimals: nativeCurrency.decimals
                })
              : undefined
          }
        />
      )}
    </div>
  )
}

export function DestinationNetworkBox({
  showUsdcSpecificInfo
}: {
  showUsdcSpecificInfo: boolean
}) {
  const [networks] = useNetworks()
  const [{ destinationAddress }] = useArbQueryParams()
  const [
    destinationNetworkSelectionDialogProps,
    openDestinationNetworkSelectionDialog
  ] = useDialog()
  const {
    network: { logo: networkLogo }
  } = getBridgeUiConfigForChain(networks.destinationChain.id)

  return (
    <>
      <NetworkContainer
        network={networks.destinationChain}
        customAddress={destinationAddress}
      >
        <div className="flex justify-between">
          <NetworkButton
            type="destination"
            onClick={openDestinationNetworkSelectionDialog}
          />
          <div className="relative h-[44px] w-[44px]">
            <Image
              src={networkLogo}
              alt={`${networks.destinationChain.name} logo`}
              layout={'fill'}
              objectFit={'contain'}
            />
          </div>
        </div>
        <BalancesContainer showUsdcSpecificInfo={showUsdcSpecificInfo} />
        <EstimatedGas chainType="destination" />
      </NetworkContainer>
      <NetworkSelectionContainer
        {...destinationNetworkSelectionDialogProps}
        type="destination"
      />
    </>
  )
}
