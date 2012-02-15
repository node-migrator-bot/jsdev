var util = require('util')
function sayHi (str) {
  util.puts('Hi, '+str+'!');
}
function sayHello (str) {
  util.puts('Hello, '+str+'!');
}
//@jsdev tag1 say:sayHi
//@jsdev(test) say:sayHello
//@jsdev(test,production) tag2
/*tag1 util.puts('tag1 opened')*/
/*tag2 util.puts('tag2 opened')*/
/*say 'World'*/

