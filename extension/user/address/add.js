const UnauthorizedError = require('../../models/Errors/UnauthorizedError')
const FieldValidationError = require('../../models/Errors/FieldValidationError')
const AddressValidationError = require('../../models/Errors/AddressValidationError')
const ApiFactory = require('../../lib/shopify.api.factory')
const { mapCustomAttributes } = require('../../lib/mapper')

/**
 * @param {SDKContext} context
 * @param {Object} input
 */
module.exports = async (context, input) => {
  if (!context.meta.userId) {
    throw new UnauthorizedError('User is not logged in.')
  }

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

  const storeFrontAccessToken = await context.storage.extension.get('storefrontAccessToken')
  const storefrontApi = ApiFactory.buildStorefrontApi(context, storeFrontAccessToken)
  const customerAccessToken = await context.storage.user.get('customerAccessToken')

  try {
    return await storefrontApi.customerAddressCreate(customerAccessToken.accessToken, newAddress)
  } catch (errors) {
    const validationError = new FieldValidationError()
    errors.forEach(error => {
      const { field, message } = error
      if (field[1]) {
        validationError.addStorefrontValidationMessage(field[1], message)
      } else {
        throw new AddressValidationError(message)
      }
    })

    if (validationError.validationErrors.length > 0) {
      throw validationError
    }
  }
}
