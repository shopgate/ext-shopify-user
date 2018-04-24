const EUNKNOWN = 'EUNKNOWN'

class UnknownError extends Error {
  constructor () {
    super('An internal error occurred.')

    this.code = EUNKNOWN
    this.displayMessage = null
  }
}

module.exports = UnknownError
