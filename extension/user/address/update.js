const Tools = require('../../lib/tools')
const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const FieldValidationError = require('../../models/Errors/FieldValidationError')
const AddressValidationError = require('../../models/Errors/AddressValidationError')
const { mapCustomAttributes } = require('../../lib/mapper')
const _ = require('lodash')
const ApiFactory = require('../../lib/shopify.api.factory')

/**
 * @param {SDKContext} context
 * @param {ShopgateAddress} input
 */
module.exports = async function (context, input) {
  if (Tools.isEmpty(context.meta.userId)) {
    throw new UnauthorizedError('User is not logged in.')
  }

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessToken = await context.storage.user.get('customerAccessToken')

  return storefrontApi.customerAddressUpdate(customerAccessToken.accessToken, input.id, createAddressUpdate(input)).then(result => {
    return { success: true }
  }).catch(errors => {
    const validationError = new FieldValidationError()
    if (Array.isArray(errors)) {
      errors.forEach(error => {
        const { message } = error
        if (Tools.propertyExists(error, 'problems')) {
          throw new AddressValidationError(message)
        }
        const { field } = error
        if (field[1]) {
          validationError.addStorefrontValidationMessage(field[1], message)
        }
      })
    }
    if (validationError.validationErrors.length > 0) {
      throw validationError
    }
  })

  /**
   * Map the input address values to fit the Shopify specifications for the admin api endpoint
   * @param {ShopgateAddress} input
   * @returns {Object}
   */
  function createAddressUpdate (input) {
    const newAddress = {
      address1: input.street1,
      address2: input.street2,
      city: input.city,
      firstName: input.firstName,
      lastName: input.lastName,
      province: input.province,
      zip: input.zipCode,
      country: input.country,
      ...mapCustomAttributes(input.customAttributes)
    }

    // Remove all empty or not set properties
    return _.omitBy(newAddress, _.isNil)
  }
}
