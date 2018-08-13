const Tools = require('../lib/tools')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const SGShopifyApi = require('../lib/shopify.api.class')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = async function (context, input, cb) {
  // Check if there is a userId within the context.meta-data, if not the user is not logged in
  if (Tools.isEmpty(context.meta.userId)) {
    context.log.error('User is not logged in')
    return cb(new UnauthorizedError('Unauthorized user'))
  }

  await new SGShopifyApi(context)
    .getAddresses(context.meta.userId)
    .then(shopifyAddresses => {
      const addresses = []
      shopifyAddresses.forEach(address => {
        const customerAddress = {
          id: address.id,
          street1: address.address1,
          street2: address.address2,
          city: address.city,
          company: address.company,
          firstName: address.first_name,
          lastName: address.last_name,
          phone: address.phone,
          province: address.province,
          province_code: address.province_code,
          zipCode: address.zip,
          country: address.country,
          country_code: address.country_code,
          tags: []
        }

        if (address.default === true) {
          customerAddress.tags.push('default')
        }

        addresses.push(customerAddress)
      })

      return cb(null, {addresses})
    })
    .catch(err => {
      return cb(err)
    })
}
