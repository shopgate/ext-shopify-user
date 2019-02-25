const EINVALIDRESPONSE = 'EINVALIDRESPONSE'

class InvalidResponseError extends Error {
  constructor (message) {
    super((message !== null && message !== undefined)
      ? message
      : 'The given response is invalid.'
    )

    this.code = EINVALIDRESPONSE
    this.displayMessage = null
  }
}

module.exports = InvalidResponseError
