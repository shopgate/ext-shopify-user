const ETOKENRENEW = 'ETOKENRENEW'

class TokenRenewError extends Error {
  constructor (displayMessage) {
    super('Error renewing customer access token.')
    this.code = ETOKENRENEW

    this.displayMessage = null
    if (displayMessage !== null && displayMessage !== undefined) {
      this.displayMessage = displayMessage
    }
  }
}

module.exports = TokenRenewError
