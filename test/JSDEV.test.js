var JSDEV = require('../index').JSDEV
describe('JSDEV', function() {
  it('work with tag', function() {
    JSDEV("/*hello console.log('hello')*/\n/*say 'world'*/\n/*say('world'===name) 'Hello, World!'*/", ['hello', 'say:util.log'])
      .should.include("{console.log('hello')}")
      .and.include("{util.log('world');}")
      .and.match(/if \('world'===name\)\s*\{\s*util.log\('Hello, World!'\)/)
  })
  it('add comments', function() {
    JSDEV('', [], ['a comment line', 'another comment line'])
      .should.match(/\/\/ a comment line$/m)
      .and.match(/\/\/ another comment line$/m)
  })
})

