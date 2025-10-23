const ApiFactory = require('../lib/ShopifyApiFactory')
const CustomerNotFoundError = require('../models/Errors/CustomerNotFoundError')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {string} input.strategy
 * @param {StorefrontApiCustomerAccessToken?} input.storefrontApiCustomerAccessToken
 * @param {CustomerAccountApiAccessToken?} input.customerAccountApiAccessToken
 * @param {string?} input.customerId
 * @param {SgxsMeta} input.sgxsMeta
 * @return {Promise<{userId: string}>}
 */
module.exports = async (context, input) => {
  let userId

  switch (input.strategy) {
    case 'web':
      if (!input.customerId) {
        context.log.error('No userId given on input strategy web')
        throw new CustomerNotFoundError()
      }

      userId = input.customerId.toString()
      break

    case 'basic': {
      const storefrontApi = ApiFactory.buildStorefrontApi(context, input.sgxsMeta)
      userId = (await storefrontApi.getCustomerByAccessToken(input.storefrontApiCustomerAccessToken.accessToken))
        .id.substring(23) // strip 'gid://shopify/Customer/'
      break
    }

    case 'shopifyHeadlessLogin':
      try {
        const customerAccountsApi = ApiFactory.buildCustomerAccountApi(context)
        const userDataResult = await customerAccountsApi.getCustomer(input.customerAccountApiAccessToken.accessToken)
        const userData = ((userDataResult || {}).data || {}).customer || {}
        userId = userData.id ? userData.id.substring(23) : null // strip 'gid://shopify/Customer/'
      } catch (err) {
        context.log.error({ errorMessage: err.message, statusCode: err.statusCode, code: err.code }, 'Error fetching user ID from Customer Account API')
        throw new UnauthorizedError()
      }
  }

  return { userId }
}
