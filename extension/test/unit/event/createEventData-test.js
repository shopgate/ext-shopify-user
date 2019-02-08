const expect = require('chai').expect
const step = require('../../../event/createEventData')

const context = {}
const input = {
  mail: null
}

describe('Check if event data is passed', () => {
  beforeEach(() => {
    input.mail = 'test@test.com'
  })

  it('event data passed successfully', async () => {
    const result = await step(context, input)
    expect(result).to.eql({ eventData: { mail: 'test@test.com' } })
  })
})
