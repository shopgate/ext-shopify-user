const crypto = require('crypto')
const BigApiTokenHandler = require('../lib/shopgate.bigapi.tokenhandler')
const BigApiClient = require('../lib/shopgate.bigapi.client')
let taskSchedulerUpdateRequired = true

/**
 * @param {SDKContext} context
 *
 * @returns {Promise<void>}
 */
module.exports = async function (context) {
  if (!taskSchedulerUpdateRequired) return

  // look up DB setting if local variable not initialized, yet
  let storageTaskSchedulerUpdateRequired
  try {
    storageTaskSchedulerUpdateRequired = (await context.storage.extension.get('taskSchedulerUpdateRequired'))
  } catch (err) {
    // don't break, just log
    context.log.error(err)
    return
  }
  if (storageTaskSchedulerUpdateRequired === false) {
    taskSchedulerUpdateRequired = false
    return
  }

  // todo: debugging, remove
  context.config.credentials.baseDomain = 'shopgatedev.services'

  // update task scheduler with a schedule for this app
  const tokenHandler = new BigApiTokenHandler(context.storage.extension, context.config.credentials, context.config.requestTimeout.token)
  const bigApiClient = new BigApiClient(context.config.credentials.baseDomain, tokenHandler, context.config.requestTimeout.bigApi)
  const pipelineApiKey = crypto.randomBytes(Math.floor(Math.random() * 10 + 20)).toString('base64')

  try {
    await bigApiClient.scheduleCustomerTokenRenew(context.config.stage, context.meta.appId, pipelineApiKey)
  } catch (err) {
    // don't break, just log
    context.log.error(err)
    return
  }

  try {
    await context.storage.extension.set('taskSchedulerUpdateRequired', false)
  } catch (err) {
    // don't break, just log
    context.log.error(err)
    return
  }

  try {
    await context.storage.extension.set('renewCustomerAccessTokenPipelineApiKey', pipelineApiKey)
  } catch (err) {
    // don't break, just log
    context.log.error(err)
    return
  }

  taskSchedulerUpdateRequired = false
}
