const passwordGenerator = require('generate-password')
const InvalidCredentialsError = require('../../models/Errors/InvalidCredentialsError')
const ApiFactory = require('../../lib/shopify.api.factory')
const InvalidCallError = require('../../models/Errors/InvalidCallError')
const ShopifyCustomer = require('./shared/ShopifyCustomer')
const ShopifyStorefront = require('./shared/ShopifyStorefront')

/**
 * Not implemented yet
 * @param {SDKContext} context The connect context.
 * @param {Object} input The step input.
 * @throws {InvalidCredentialsError}
 * @returns {Object}
 */
module.exports = async (context, input) => {
  if (input.strategy !== 'facebook') {
    return {}
  }

  // Check if the user is already logged in by checking if there is a userId set
  if (context.meta.userId) {
    context.log.error('Invalid pipeline call: User can\'t be logged in, because a user is already logged in.')
    //todo should this really be an error?
    // throw new InvalidCallError('The user is already logged in.')
  }

  const sampleInput = { strategy: 'facebook',
    parameters:
      { success: true,
        token:
          'EAAMCGSFzJh8BADlVfZChAihmErKfL4bMj5XOca6iGKKuSewZBZA0VjZBBhNLOsXNigpZCKsZADMnJmCDi96EZCM5LKban0CrWEKMZC4HMzVNCEpGd1K6ZCCp82lkLWhLDpwRNVRiHLtdYDxGUXCnr5IiugT4p1twYWxx2WIYQ7WaCB16r2iScq0vyifw7Fl9Ti2NkEHylNVid4y6QQZBV2QTevxCn7PD8HSqhNFPSbzcWCdQZDZD',
        tokenExpiryDate: 1551795528,
        profile:
          { id: '106275469969855',
            first_name: 'Szymon',
            last_name: 'Tester',
            email: 'szymon_atolgdm_tester@tfbnw.net' }
      }
  }

  const { parameters } = input

  if (!parameters.token || !parameters.success) {
    throw new InvalidCredentialsError()
  }

  // we're taking as given that the token received is valid (validation is done by ext-auth-facebook)

  const { profile } = parameters

  if (!profile || !profile.email) {
    throw new Error()
  }

  let result, customerAccessToken
  try {

    const adminApi =/**@type {AdminApi} */ ApiFactory.buildAdminApi(context)
    const storefrontAccessToken = await ShopifyStorefront.create(context).getAccessToken()
    const shopifyCustomer = new ShopifyCustomer(ApiFactory.buildStorefrontApi(context, storefrontAccessToken), adminApi)

    const customer = await shopifyCustomer.findByEmail(profile.email)
    // here within another story we need to reset the password for the user in order to log the user in later on
    // so there will be some additional refactoring needed as the following call fails in this case
    if (customer) {
      return {
        userId: customer.id.toString(),
        customerAccessToken: 'password needs to be reset'
      }
    }

    const password = passwordGenerator.generate({
      length: 16,
      numbers: true
    })

    result = await adminApi.post('/admin/customers.json', {
      customer: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        verified_email: true,
        password: password,
        password_confirmation: password,
        send_email_welcome: context.config.shouldSendWelcomeEmail,
        metafields: [
          {
            key: "fb_id",
            value: profile.id,
            value_type: 'string',
            namespace: 'global'
          }
        ]
      }
    })
    customerAccessToken = await shopifyCustomer.getAccessToken(profile.email, password)

  } catch (err) {
    context.log.error(err)
    throw new Error()
  }

  if (!result.customer || !result.customer.id) {
    context.log.error('Invalid shopify get customer response')
    throw new Error()
  }

  return {
    userId: result.customer.id.toString(),
    customerAccessToken
  }
}
