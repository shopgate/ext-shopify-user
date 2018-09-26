const moment = require('moment')
const UnauthorizedError = require('../models/Errors/UnauthorizedError')
const ApiFactory = require('../lib/shopify.api.factory')

/**
 * @param {SDKContext} context
 * @param {Object} input
 * @param {string} input.pipelineApiKey
 * @returns {Promise<void>}
 */
module.exports = async function (context, input) {
  if (!input.pipelineApiKey || input.pipelineApiKey !== await context.storage.extension.get('renewCustomerAccessTokenPipelineApiKey')) {
    throw new UnauthorizedError('Invalid pipeline API key provided.')
  }

  const tokensByUserIds = await context.storage.extension.map.get('customerTokensByUserIds')
  const updateUserIds = Object
    .keys(tokensByUserIds)
    .filter(userId => Date.parse(tokensByUserIds[userId].expiresAt) < moment(Date.now()).add(1, 'week'))

  if (!updateUserIds.length) {
    context.log.info('All customer access tokens up to date.')
    return
  }

  const summary = { successful: 0, failed: 0 }
  const api = ApiFactory.buildStorefrontApi(context, await context.storage.extension.get('storefrontAccessToken'))

  // update customer tokens; chunks of 5 in parallel
  for (let i = 0; i <= updateUserIds.length; i += 5) {
    await Promise.all(updateUserIds.slice(i, i + 5).map(async userId => {
      let response
      try {
        response = await api.renewCustomerAccessToken(tokensByUserIds[userId].accessToken)
      } catch (err) {
        summary.failed++
        context.log.error('Error renewing customer access token.', err)
        return
      }

      tokensByUserIds[userId] = response
      summary.successful++
    }))
  }

  context.log.info(`Updated a total of ${summary.successful + summary.failed} (${summary.successful} OK / ${summary.failed} failed).`)

  await context.storage.extension.map.set('customerTokensByUserIds', tokensByUserIds)
}
