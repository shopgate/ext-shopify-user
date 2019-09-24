/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {string} input.customerAccessToken
 * @param {string} input.userId
 * @returns {Promise<void>}
 * @throws Error when saving the customer access token fails.
 */
module.exports = async (context, input) => {
  const oldCustomerAccessToken = await context.storage.user.get('customerAccessToken')
  await context.storage.user.set('customerAccessToken', input.customerAccessToken)
  await context.storage.extension.map.setItem('customerTokensByUserIds', input.userId, input.customerAccessToken)
  const newCustomerAccessToken = await context.storage.user.get('customerAccessToken')
  context.log.debug({
    oldCustomerAccessToken: JSON.stringify(oldCustomerAccessToken),
    inputCustomerAccessToken: JSON.stringify(input.customerAccessToken),
    newCustomerAccessToken: JSON.stringify(newCustomerAccessToken),
    userId: input.userId
  }, 'Replacing user token')
}
