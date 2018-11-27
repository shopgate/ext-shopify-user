const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const FieldValidationError = require('../models/Errors/FieldValidationError')
const AddressValidationError = require('../models/Errors/AddressValidationError')
const ApiFactory = require('../lib/shopify.api.factory')
const { mapCustomAttributes } = require('../lib/mapper')

/**
 * @param {SDKContext} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  if (Tools.isEmpty(context.meta.userId)) {
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

  return storefrontApi.customerAddressCreate(customerAccessToken.accessToken, newAddress).then(customerAddress => {
    return { id: customerAddress.id }
  }).catch(errors => {
    const validationError = new FieldValidationError()
    const addressValidationError = new AddressValidationError()
    errors.forEach(error => {
      const { field, message } = error
      if (field[1]) {
        validationError.addValidationMessage(field[1], message)
      } else {
        addressValidationError.addValidationMessage(message)
      }
    })

    if (validationError.validationErrors.length > 0) {
      throw validationError
    }

    throw addressValidationError
  })
}
