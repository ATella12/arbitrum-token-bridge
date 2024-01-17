/* global JQuery */
import '@synthetixio/synpress/support/index.d.ts'
import {
  login,
  logout,
  openTransactionsPanel,
  resetCctpAllowance,
  fundUserUsdcTestnet,
  fundUserWalletEth
} from '../support/commands'
import { NetworkType } from '../support/common'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to connect MetaMask to the UI.
       * @example cy.login()
       */
      // eslint-disable-next-line no-unused-vars
      login(options: {
        networkType: NetworkType
        url?: string
        query?: { [s: string]: string }
      }): typeof login
      logout(): typeof logout
      openTransactionsPanel(): typeof openTransactionsPanel
      resetCctpAllowance: typeof resetCctpAllowance
      fundUserUsdcTestnet: typeof fundUserUsdcTestnet
      fundUserWalletEth: typeof fundUserWalletEth
      typeRecursively(text: string): Chainable<JQuery<HTMLElement>>
    }
  }
}
