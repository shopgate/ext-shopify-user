const ApiFactory = require('../../lib/shopify.api.factory')
const ShopifyCustomer = require('./shared/ShopifyCustomer')
const ShopifyStorefront = require('./shared/ShopifyStorefront')
const InvalidCredentialsError = require('../../models/Errors/InvalidCredentialsError')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {string} input.strategy
 * @param {Object} input.parameters
 * @param {Object} input.parameters.login
 * @param {string} input.parameters.login.login The customer's login (i.e. email address) when using strategy "basic".
 * @param {Object} input.parameters.login.password The customer's password when using strategy "basic".
 * @param {string} input.parameters.customerId The customer's ID sent by app when using strategy "web".
 * @param {string} input.parameters.payload Encrypted login data sent by app when using strategy "web".
 * @returns {Promise<{[customerAccessToken]: string, [userId]: string}>}
 */
module.exports = async function (context, input) {
  // strategy is not supported
  if (input.strategy !== 'basic') {
    return {}
  }

  if (!input.parameters.login || !input.parameters.password) {
    throw new InvalidCredentialsError()
  }

  const storefrontAccessToken = await ShopifyStorefront.create(context).getAccessToken()

  const shopifyCustomer = new ShopifyCustomer(ApiFactory.buildStorefrontApi(context, storefrontAccessToken))
  const customerAccessToken = await shopifyCustomer.getAccessToken(input.parameters.login, input.parameters.password)

  return {
    userId: await shopifyCustomer.getIdByToken(customerAccessToken),
    customerAccessToken
  }
}
