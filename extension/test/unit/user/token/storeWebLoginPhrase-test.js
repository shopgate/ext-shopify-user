const sinon = require('sinon')
const storeWebLoginPhrase = require('../../../../user/token/storeWebLoginPhrase')

describe('user / token / storeWebLoginPhrase', () => {
  const storage = {
    set: async () => {}
  }
  const context = {
    storage: {
      device: storage
    }
  }

  const input = {
    phrase: 'fancyPhrase'
  }

  it('should store the login phrase in the device storage', async () => {
    const storageSetSpy = sinon.spy(context.storage.device, 'set')

    await storeWebLoginPhrase(context, input)

    sinon.assert.calledWith(storageSetSpy, 'webLoginPhrase', input.phrase)
  })
})
