require('../index').replaceStatic('-tag2')
var connect = require('connect')
  , request = require('request')

describe("replaceStatic('-tag2')", function() {
  describe('development', function() {
    var app = connect()
    before(function() {
      app
        .use(connect['static'](__dirname))
        .listen(8899)
    })
    it('ok', function(done) {
      request('http://127.0.0.1:8899/replaceRequire.js', function(err, res, body) {
        body
          .should.include("{util.puts('tag1 opened')}")
          .and.include("/*tag2 util.puts('tag2 opened')*/")
          .and.include("{sayHi('World');}")
        done()
      })
    })
    after(function() {
      app.close()
    })
  })

  var origEnv = process.env.NODE_ENV

  describe('test', function() {
    var app = connect()
    before(function() {
      process.env.NODE_ENV = 'test'
      app
        .use(connect['static'](__dirname))
        .listen(8899)
    })
    it('ok', function(done) {
      request('http://127.0.0.1:8899/replaceRequire.js', function(err, res, body) {
        body
          .should.include("/*tag1 util.puts('tag1 opened')*/")
          .and.include("/*tag2 util.puts('tag2 opened')*/")
          .and.include("{sayHello('World');}")
        done()
      })
    })
    after(function() {
      process.env.NODE_ENV = origEnv
      app.close()
    })
  })

  describe('production', function() {
    var app = connect()
    before(function() {
      process.env.NODE_ENV = 'production'
      app
        .use(connect['static'](__dirname))
        .listen(8899)
    })
    it('ok', function(done) {
      request('http://127.0.0.1:8899/replaceRequire.js', function(err, res, body) {
        body
          .should.include("/*tag1 util.puts('tag1 opened')*/")
          .and.include("/*tag2 util.puts('tag2 opened')*/")
          .and.include("/*say 'World'*/")
        done()
      })
    })
    after(function() {
      process.env.NODE_ENV = origEnv
      app.close()
    })
  })
})
