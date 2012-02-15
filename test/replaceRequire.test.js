if ('undefined' === typeof describe) describe = function(){}
if ('undefined' === typeof it) it = function(){}
var execFile = require('child_process').execFile

if ('FORKED' in process.env) {
  require('../index').replaceRequire()
  require('./replaceRequire')
  process.exit()
}

//jsdev onlyWorkInRequiredFiles
describe('replaceRequire() method', function() {
  it('only work in further required files', function(done) {
    /*onlyWorkInRequiredFiles ('this').should.not.be.ok*/
    done()
  })
})

function execWithEnv(env, cb) {
  execFile(process.execPath, [__filename], { env: { FORKED: true, NODE_ENV: env }}, function(err, stdout, stderr) {
    cb && cb(stdout)
  })
}

describe('required file in different environment', function() {
  it('development: tag1 say:sayHi', function(done) {
    execWithEnv('development', function(stdout) {
      stdout.should.equal('tag1 opened\nHi, World!\n')
      done()
    })
  })
  it('test: tag2 say:sayHi', function(done) {
    execWithEnv('test', function(stdout) {
      stdout.should.equal('tag2 opened\nHello, World!\n')
      done()
    })
  })
  it('production: tag2', function(done) {
    execWithEnv('production', function(stdout) {
      stdout.should.equal('tag2 opened\n')
      done()
    })
  })
})
