const ECONFLICT = 'ECONFLICT'

class AddressValidationError extends Error {
  constructor () {
    super('An internal error occurred.')

    this.code = ECONFLICT
    this.displayMessage = null
  }

  /**
   * @param {string} message
   */
  addValidationMessage (message) {
    this.displayMessage = message
    this.message = message
  }
}

module.exports = AddressValidationError
