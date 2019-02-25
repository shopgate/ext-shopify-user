const expect = require('chai').expect
const step = require('../../../user/getRegistrationUrl')

const context = {}

describe('check registration url return', () => {
  beforeEach(() => {
    context.config = {}
  })

  it('when no registration url is provided', async () => {
    context.config.shopifyShopAlias = 'customer-shop'
    const result = await step(context)
    expect(result).to.eql({ url: 'https://customer-shop.myshopify.com/account/register' })
  })

  it('when a registration url is provided', async () => {
    context.config.shopifyShopAlias = 'customer-shop'
    context.config.userRegistrationUrl = 'https://some-other-url.myshopify.com/account/register'
    const result = await step(context)
    expect(result).to.eql({ url: 'https://some-other-url.myshopify.com/account/register' })
  })
})
