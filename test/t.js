var connect = require('connect')
require('../index').replaceStatic()
connect(
  connect['static'](__dirname)
).listen(8899)
