const Unauthorized = require('../models/Errors/UnauthorizedError')

module.exports = async () => {
  throw new Unauthorized()
}
