const InvalidCallError = require('../../models/Errors/InvalidCallError')
const FieldValidationError = require('../../models/Errors/FieldValidationError')

/**
 * @typedef {Object} PrepareLoginInput
 * @property {string} username - currently logged-in user
 * @property {string} oldPassword - currently active password
 */
/**
 * @param {SDKContext} context
 * @param {PrepareLoginInput} input
 */
module.exports = async (context, input) => {
  if (!input.username) {
    throw new InvalidCallError()
  }

  if (!input.oldPassword) {
    const validationError = new FieldValidationError()
    validationError.addStorefrontValidationMessage('oldPassword', 'user.errors.blank')
    throw validationError
  }

  return {
    strategy: 'basic',
    parameters: {
      login: input.username,
      password: input.oldPassword
    }
  }
}
