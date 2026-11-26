const expect = require('chai').expect
const step = require('../../../user/getShopUrl')

describe('getShopUrl', () => {
  let context

  beforeEach(() => {
    context = { config: { shopifyShopAlias: 'customer-shop' }, meta: {} }
  })

  it('should return null as shop domain and the alias based URL when no shop domain is configured', async () => {
    const result = await step(context)
    expect(result).to.eql({ shopDomain: null, aliasUrl: 'https://customer-shop.myshopify.com' })
  })

  it('should return null as shop domain when the shop domain is configured empty', async () => {
    context.config.shopifyShopDomain = ''
    const result = await step(context)
    expect(result).to.eql({ shopDomain: null, aliasUrl: 'https://customer-shop.myshopify.com' })
  })

  it('should return the configured shop domain and the alias based URL when both are configured', async () => {
    context.config.shopifyShopDomain = 'https://www.customer-shop.com'
    const result = await step(context)
    expect(result).to.eql({ shopDomain: 'https://www.customer-shop.com', aliasUrl: 'https://customer-shop.myshopify.com' })
  })

  it('should remove a trailing slash from the configured shop domain', async () => {
    context.config.shopifyShopDomain = 'https://www.customer-shop.com/'
    const result = await step(context)
    expect(result.shopDomain).to.equal('https://www.customer-shop.com')
  })

  it('should return null as alias URL when no alias is configured', async () => {
    context.config = { shopifyShopDomain: 'https://www.customer-shop.com' }
    const result = await step(context)
    expect(result).to.eql({ shopDomain: 'https://www.customer-shop.com', aliasUrl: null })
  })

  it('should work for logged out users', async () => {
    context.meta.userId = null
    const result = await step(context)
    expect(result).to.eql({ shopDomain: null, aliasUrl: 'https://customer-shop.myshopify.com' })
  })
})
