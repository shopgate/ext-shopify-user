const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const SGShopifyApi = require('../lib/shopify.api.class')
const FieldValidationError = require('../models/Errors/FieldValidationError')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = async function (context, input, cb) {
  // Check if there is a userId within the context.meta-data, if not the user is not logged
  if (Tools.isEmpty(context.meta.userId)) {
    context.log.error('User is not logged in')
    return cb(new UnauthorizedError('User is not logged in.'))
  }

  const userId = context.meta.userId

  // Validate some input values
  validateAddressInputs(input, cb)

  // Map the input address values to fit the Shopify specifications for the admin api endpoint
  const address = Object.assign(input.address)
  const newAddress = {
    address1: address.street1,
    address2: address.street2,
    city: address.city,
    company: address.company,
    first_name: address.firstName,
    last_name: address.lastName,
    phone: address.phone,
    province_code: address.province,
    zip: address.zipCode,
    name: address.firstName + ' ' + address.lastName,
    ...SGShopifyApi.mapCountry(address.country)
  }

  const shopify = new SGShopifyApi(context)

  return shopify.addAddress(userId, newAddress)
}

function validateAddressInputs (input, cb) {
  const validationError = new FieldValidationError()

  if (Tools.isEmpty(input.id)) {
    cb(new InvalidCallError('Address is missing'))
  }

  if (Tools.isEmpty(input.country) || input.country.length <= 1) {
    validationError.addValidationMessage('country', 'Country is required')
    cb(validationError)
  }
}
