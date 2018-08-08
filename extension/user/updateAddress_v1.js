const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const InvalidCallError = require('../models/Errors/InvalidCallError')
const SGShopifyApi = require('../lib/shopify.api.class')
const FieldValidationError = require('../models/Errors/FieldValidationError')
const _ = require('lodash')

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

  // Validate country input to have at least more than 1 char
  if (!Tools.isEmpty(input.country) && input.country.length <= 1) {
    context.log.error('Country|CountryCode length <= 1')
    const validationError = new FieldValidationError()
    validationError.addValidationMessage('country', 'Country is required, at least minimum 2 chars')
    return cb(validationError)
  }

  const shopify = new SGShopifyApi(context)

  return shopify.updateAddress(context.meta.userId, input.id, createAddressObject(input))
}

/**
 * Map the input address values to fit the Shopify specifications for the admin api endpoint
 * @param {Object} input
 * @returns {Object}
 */
function createAddressObject (input) {
  const newAddress = {
    id: input.id,
    address1: input.street1,
    address2: input.street2,
    city: input.city,
    company: input.company,
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone,
    province_code: input.province,
    zip: input.zipCode,
    ...SGShopifyApi.mapCountry(input.country)
  }

  // Remove all empty or not set properties
  return _.omitBy(newAddress, _.isNil)
}
