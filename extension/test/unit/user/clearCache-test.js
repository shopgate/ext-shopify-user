const sinon = require('sinon')
const clearCache = require('../../../user/clearCache')

describe('clearCache', () => {
  const storage = {
    del: async () => {}
  }
  const context = {
    storage: {
      user: storage
    }
  }

  it('should delete the userData from the user storage', async () => {
    const storageSetSpy = sinon.spy(context.storage.user, 'del')

    await clearCache(context)

    sinon.assert.calledWith(storageSetSpy, 'userData')
  })
})
