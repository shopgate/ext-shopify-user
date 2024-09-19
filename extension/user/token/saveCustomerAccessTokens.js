/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {StorefrontApiCustomerAccessToken} input.storefrontApiCustomerAccessToken
 * @param {CustomerAccountApiAccessToken?} input.customerAccountApiAccessToken
 * @param {string} input.userId
 * @returns {Promise<void>}
 * @throws Error when saving the customer access token fails.
 */
module.exports = async (context, input) => {
  await context.storage.user.set('customerAccessToken', input.storefrontApiCustomerAccessToken)

  if (input.customerAccountApiAccessToken) {
    await context.storage.user.set('customerAccountApiAccessToken', input.customerAccountApiAccessToken)
  }
}
