const EUNKNOWN = 'EUNKNOWN'

/**
 * Use this class for errors that happen in the pipeline
 * or passing information around the extension and between steps
 *
 * @param {string} [message=An internal error occurred.]
 * @default An internal error occurred.
 */
class UnknownError extends Error {
  constructor (message) {
    super()
    this.code = EUNKNOWN
    this.message = message || 'An internal error occurred.'
  }
}

module.exports = UnknownError
