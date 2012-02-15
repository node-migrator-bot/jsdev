if ('undefined' === typeof describe) describe = function(){}
if ('undefined' === typeof it) it = function(){}
var execFile = require('child_process').execFile

if ('FORKED' in process.env) {
  var jsdev = require('../index')
  jsdev.replaceRequire('-say')

  require('./replaceRequire')
  process.exit()
}

function execWithEnv(env, cb) {
  execFile(process.execPath, [__filename], { env: { FORKED: true, NODE_ENV: env }}, function(err, stdout, stderr) {
    cb && cb(stdout)
  })
}

describe("replaceRequire('-say')", function() {
  it('development: tag1', function(done) {
    execWithEnv('development', function(stdout) {
      stdout.should.equal('tag1 opened\n')
      done()
    })
  })
  it('test: tag2', function(done) {
    execWithEnv('test', function(stdout) {
      stdout.should.equal('tag2 opened\n')
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
