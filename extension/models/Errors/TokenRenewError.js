const ETOKENRENEW = 'ETOKENRENEW'
	
	class TokenRenewError extends Error {
	  constructor () {
	    super('Error renewing customer access token.')
	    this.code = ETOKENRENEW
	  }
	}
	
	module.exports = TokenRenewError
  