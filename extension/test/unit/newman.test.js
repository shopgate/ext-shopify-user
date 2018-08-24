const newman = require('newman')

describe('Newman code coverage', () => {
  it('should run the postman test collection correctly', function (done) {
    this.timeout(600000);
    newman.run({
      collection: (require('../newman/collection.json')),
      globals: (require('../newman/globals.json')),
      environment: (require('../newman/environment-akraus.json')),
      reporters: 'cli'
    }, (err, summary) => {
      console.log(summary.run.failures.length);
      if (err) { return done(err); }
      done();
    });
  });
});
