const EFIELDVALIDATION = 'EVALIDATION'

/**
 * @class FieldValidationError
 */
class FieldValidationError extends Error {
  constructor (message) {
    super('Field validation error')
    this.code = EFIELDVALIDATION
    this.message = message || 'There was an error with the request'
    this.validationErrors = []
  }

  /**
   * @param {string} path - path of the error of the field, e.g. firstName
   * @param {string} message - error message that pertains to path
   * @param {string} [value] - passed down value if any
   */
  addValidationMessage (path, message, value) {
    path = this.translatePath(path)

    const capitalizedPath = path.charAt(0).toUpperCase() + path.substr(1)
    const main = value && !message.includes('required') ? value : capitalizedPath

    this.validationErrors.push({path, message: `"${main}" ${message}`})
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
