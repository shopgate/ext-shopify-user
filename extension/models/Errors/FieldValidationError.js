const EFIELDVALIDATION = 'EVALIDATION'

/**
 * @class FieldValidationError
 */
class FieldValidationError extends Error {
  constructor (message) {
    super()
    this.code = EFIELDVALIDATION
    this.message = message || 'There was an error with the request'
    this.validationErrors = []
  }

  /**
   * @param {string} path - path of the error of the field, e.g. firstName
   * @param {string} message - error message that pertains to path
   */
  addStorefrontValidationMessage (path, message) {
    this.validationErrors.push({ path: this.translatePath(path), message })
  }

  /**
   * Translates Shopify error fields into pipeline fields
   *
   * @private
   * @returns {string}
   */
  translatePath (path) {
    const translations = {
      signature: 'street1',
      address1: 'street1',
      address2: 'street2',
      first_name: 'firstName',
      last_name: 'lastName',
      province_code: 'province',
      zip: 'zipCode'
    }
    return translations[path] || path
  }
}

module.exports = FieldValidationError
