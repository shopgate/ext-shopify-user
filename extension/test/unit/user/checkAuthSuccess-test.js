const assert = require('assert')
const expect = require('chai').expect
const step = require('../../../user/checkAuthSuccess')

/** @var {SDKContext} */
const context = {
  log: {
    error: () => {}
  }
}
const input = {
  authSuccess: null,
  authType: null
}

describe('check authorization success', () => {
  beforeEach(() => {
    input.authSuccess = true
  })

  it('authorization succeeds', async () => {
    const result = await step(context, input)
    expect(result).to.eql({})
  })

  it('authorization fails', async () => {
    input.authSuccess = false
    try {
      await step(context, input)
    } catch (err) {
      return assert.strictEqual(err.code, 'EUNKNOWN')
    }
    assert.fail('Expected an error to be thrown.')
  })
})
