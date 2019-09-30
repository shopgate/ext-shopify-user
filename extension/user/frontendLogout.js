const UnauthorizedError = require('../models/Errors/UnauthorizedError')

module.exports = async () => {
  throw new UnauthorizedError()
}
