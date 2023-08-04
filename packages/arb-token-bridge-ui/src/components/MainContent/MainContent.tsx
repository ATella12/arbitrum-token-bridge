import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useLocalStorage from '@rehooks/local-storage'

import { TransferPanel } from '../TransferPanel/TransferPanel'
import { TransactionHistory } from '../TransactionHistory/TransactionHistory'
import { SidePanel } from '../common/SidePanel'
import { useAppContextActions, useAppContextState } from '../App/AppContext'
import { useAppState } from '../../state'
import { useDeposits, useDepositsTotalFetched } from '../../hooks/useDeposits'
import { PageParams } from '../TransactionHistory/TransactionsTable/TransactionsTable'
import {
  useWithdrawals,
  useWithdrawalsTotalFetched
} from '../../hooks/useWithdrawals'
import { TransactionStatusInfo } from '../TransactionHistory/TransactionStatusInfo'
import { ArbitrumStats, statsLocalStorageKey } from './ArbitrumStats'
import { PreferencesDialog } from '../common/PreferencesDialog'
import { useNetworksAndSigners } from '../../hooks/useNetworksAndSigners'

const TX_HISTORY_PAGE_SIZE = 10

const defaultTxHistoryPageParams: PageParams = {
  searchString: '',
  pageNumber: 0,
  pageSize: TX_HISTORY_PAGE_SIZE
}

export const motionDivProps = {
  layout: true,
  initial: {
    opacity: 0,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    scale: 1
  },
  exit: {
    opacity: 0,
    scale: 0.9
  }
}

export function MainContent() {
  const { address } = useAccount()
  const { resetDepositsTotalFetched } = useDepositsTotalFetched()
  const { resetWithdrawalsTotalFetched } = useWithdrawalsTotalFetched()
  const { l1, l2 } = useNetworksAndSigners()
  const { closeTransactionHistoryPanel } = useAppContextActions()
  const {
    layout: { isTransactionHistoryPanelVisible }
  } = useAppContextState()

  const [isArbitrumStatsVisible] =
    useLocalStorage<boolean>(statsLocalStorageKey)

  const {
    app: { arbTokenBridge }
  } = useAppState()

  const [depositsPageParams, setDepositsPageParams] = useState<PageParams>(
    defaultTxHistoryPageParams
  )

  const [withdrawalsPageParams, setWithdrawalsPageParams] =
    useState<PageParams>(defaultTxHistoryPageParams)

  const {
    data: depositsData = {
      deposits: [],
      pendingDeposits: [],
      transformedDeposits: []
    },
    isValidating: depositsLoading,
    error: depositsError
  } = useDeposits(depositsPageParams)

  const {
    data: withdrawalsData = {
      withdrawals: [],
      pendingWithdrawals: [],
      transformedWithdrawals: []
    },
    isValidating: withdrawalsLoading,
    error: withdrawalsError
  } = useWithdrawals(withdrawalsPageParams)

  useEffect(() => {
    // Go to Page 1 in tx history.
    setDepositsPageParams(defaultTxHistoryPageParams)
    setWithdrawalsPageParams(defaultTxHistoryPageParams)
    // Reset the fetched tx count storage.
    resetDepositsTotalFetched()
    resetWithdrawalsTotalFetched()
  }, [address, l1, l2, resetDepositsTotalFetched, resetWithdrawalsTotalFetched])

  useEffect(() => {
    // if pending deposits found, add them in the store - this will add them to pending div + start polling for their status
    arbTokenBridge?.transactions?.setDepositsInStore?.(
      depositsData.pendingDeposits
    )
  }, [JSON.stringify(depositsData.pendingDeposits)]) // only run side effect on value change, not reference (Call stack exceeded)

  useEffect(() => {
    // if pending withdrawals found, add them in the store - this will add them to pending div + start polling for their status
    arbTokenBridge?.setWithdrawalsInStore?.(withdrawalsData.pendingWithdrawals)
  }, [JSON.stringify(withdrawalsData.pendingWithdrawals)]) // only run side effect on value change, not reference (Call stack exceeded)

  return (
    <div className="flex w-full justify-center">
      <div className="main-panel w-full max-w-screen-lg flex-col space-y-6">
        <div className="hidden text-center text-5xl">Arbitrum Token Bridge</div>

        {/* if the user has some pending claim txns or retryables to redeem, show that banner here */}
        <TransactionStatusInfo deposits={depositsData.transformedDeposits} />

        <AnimatePresence>
          <motion.div
            key="transfer-panel"
            {...motionDivProps}
            className="relative z-10"
          >
            <TransferPanel />
          </motion.div>
        </AnimatePresence>
      </div>
      <SidePanel
        isOpen={isTransactionHistoryPanelVisible}
        heading="Transaction History"
        onClose={closeTransactionHistoryPanel}
      >
        {/* Transaction history - pending transactions + history table */}
        <TransactionHistory
          {...{
            depositsPageParams,
            withdrawalsPageParams,
            depositsData,
            depositsLoading,
            depositsError,
            withdrawalsData,
            withdrawalsLoading,
            withdrawalsError,
            setDepositsPageParams,
            setWithdrawalsPageParams
          }}
        />
      </SidePanel>

      {/* Preferences panel */}
      <PreferencesDialog />

      {/* Toggle-able Stats for nerds */}
      {isArbitrumStatsVisible && <ArbitrumStats />}
    </div>
  )
}
