const sinon = require('sinon')
const saveCustomerAccessToken = require('../../../../user/token/saveCustomerAccessToken')

describe('user / token / saveCustomerAccessToken', () => {
  const storage = {
    set: async () => {}
  }
  const context = {
    storage: {
      user: storage,
      extension: storage
    }
  }

  const input = {
    customerAccessToken: 'fancyAccessToken',
    userId: 1
  }

  it('should store the login phrase in the device storage', async () => {
    const storageSetSpy = sinon.spy(context.storage.user, 'set')

    await saveCustomerAccessToken(context, input)

    sinon.assert.calledWith(storageSetSpy, 'customerAccessToken', input.customerAccessToken)
  })
})
