if ('undefined' === typeof describe) describe = function(){}
if ('undefined' === typeof it) it = function(){}
var execFile = require('child_process').execFile

if ('FORKED' in process.env) {
  var jsdev = require('../index')
  jsdev.replaceRequire('-tag2')

  require('./replaceRequire')
  process.exit()
}

function execWithEnv(env, cb) {
  execFile(process.execPath, [__filename], { env: { FORKED: true, NODE_ENV: env }}, function(err, stdout, stderr) {
    cb && cb(stdout)
  })
}

describe('required file in different environment with excludeTags', function() {
  it('development: tag1 say:sayHi', function(done) {
    execWithEnv('development', function(stdout) {
      stdout.should.equal('tag1 opened\nHi, World!\n')
      done()
    })
  })
  it('test: say:sayHi', function(done) {
    execWithEnv('test', function(stdout) {
      stdout.should.equal('Hello, World!\n')
      done()
    })
  })
  it('production: (none)', function(done) {
    execWithEnv('production', function(stdout) {
      stdout.should.equal('')
      done()
    })
  })
})
