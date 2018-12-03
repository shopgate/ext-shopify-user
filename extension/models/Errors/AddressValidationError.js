const ECONFLICT = 'ECONFLICT'

class AddressValidationError extends Error {
  constructor (displayMessage) {
    super()
    this.code = ECONFLICT
    if (displayMessage !== null) {
      this.message = displayMessage
      this.displayMessage = displayMessage
    }
  }
}

module.exports = AddressValidationError
