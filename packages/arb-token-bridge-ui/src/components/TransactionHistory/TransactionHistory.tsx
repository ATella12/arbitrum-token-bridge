import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import { Tab } from '@headlessui/react'
import { create } from 'zustand'

import { useTransactionHistory } from '../../hooks/useTransactionHistory'
import { TransactionHistoryTable } from './TransactionHistoryTable'
import { TransactionStatusInfo } from '../TransactionHistory/TransactionStatusInfo'
import {
  isTxClaimable,
  isTxCompleted,
  isTxExpired,
  isTxFailed,
  isTxPending
} from './helpers'
import { MergedTransaction } from '../../state/app/state'
import { TabButton } from '../common/Tab'
import { TransactionsTableDetails } from './TransactionsTableDetails'
import { useAccount } from 'wagmi'

const tabClasses =
  'text-white px-3 mr-2 border-b-2 ui-selected:border-white ui-not-selected:border-transparent ui-not-selected:text-white/80 arb-hover'

type TxDetailsStore = {
  tx: MergedTransaction | null
  isOpen: boolean
  open: (tx: MergedTransaction) => void
  close: () => void
  reset: () => void
}

export const useTxDetailsStore = create<TxDetailsStore>(set => ({
  tx: null,
  isOpen: false,
  open: (tx: MergedTransaction) => {
    set(() => ({
      tx
    }))
    // this is so that we can trigger transition when opening the panel
    setTimeout(() => {
      set(() => ({
        isOpen: true
      }))
    }, 0)
  },
  close: () => set({ isOpen: false }),
  reset: () => set({ tx: null })
}))

function useTransactionHistoryProps() {
  const { address } = useAccount()

  const transactionHistoryProps = useTransactionHistory(address, {
    runFetcher: true
  })

  const { transactions, updatePendingTransaction } = transactionHistoryProps

  const pendingTransactions = useMemo(() => {
    return transactions.filter(isTxPending)
  }, [transactions])

  useEffect(() => {
    const interval = setInterval(() => {
      pendingTransactions.forEach(updatePendingTransaction)
    }, 10_000)

    return () => clearInterval(interval)
  }, [pendingTransactions, updatePendingTransaction])

  return transactionHistoryProps
}

export const TransactionHistory = () => {
  const props = useTransactionHistoryProps()
  const { transactions } = props

  const { address } = useAccount()

  const oldestTxTimeAgoString = useMemo(() => {
    return dayjs(transactions[transactions.length - 1]?.createdAt).toNow(true)
  }, [transactions])

  const groupedTransactions = useMemo(
    () =>
      transactions.reduce(
        (acc, tx) => {
          if (isTxCompleted(tx) || isTxExpired(tx)) {
            acc.settled.push(tx)
          }
          if (isTxPending(tx)) {
            acc.pending.push(tx)
          }
          if (isTxClaimable(tx)) {
            acc.claimable.push(tx)
          }
          if (isTxFailed(tx)) {
            acc.failed.push(tx)
          }
          return acc
        },
        {
          settled: [] as MergedTransaction[],
          pending: [] as MergedTransaction[],
          claimable: [] as MergedTransaction[],
          failed: [] as MergedTransaction[]
        }
      ),
    [transactions]
  )

  const pendingTransactions = [
    ...groupedTransactions.failed,
    ...groupedTransactions.pending,
    ...groupedTransactions.claimable
  ]

  const settledTransactions = groupedTransactions.settled

  return (
    <div className="m-auto w-full max-w-[1000px] rounded border border-white/30 bg-[#191919] p-4">
      <TransactionStatusInfo />

      <Tab.Group
        key={address}
        as="div"
        className="h-full overflow-hidden rounded"
      >
        <Tab.List className="mb-4 flex border-b border-white/30">
          <TabButton
            aria-label="show pending transactions"
            className={tabClasses}
          >
            <span className="text-xs md:text-base">Pending transactions</span>
          </TabButton>
          <TabButton
            aria-label="show settled transactions"
            className={tabClasses}
          >
            <span className="text-xs md:text-base">Settled transactions</span>
          </TabButton>
        </Tab.List>

        <Tab.Panels className="h-full w-full overflow-hidden">
          <Tab.Panel className="h-full w-full">
            <TransactionHistoryTable
              {...props}
              address={address}
              transactions={pendingTransactions}
              selectedTabIndex={0}
              oldestTxTimeAgoString={oldestTxTimeAgoString}
            />
          </Tab.Panel>
          <Tab.Panel className="h-full w-full">
            <TransactionHistoryTable
              {...props}
              address={address}
              transactions={settledTransactions}
              selectedTabIndex={1}
              oldestTxTimeAgoString={oldestTxTimeAgoString}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <TransactionsTableDetails address={address} />
    </div>
  )
}
