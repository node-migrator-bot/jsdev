var originalCompile = module.constructor.prototype._compile
  , path = require('path')
  , fs = require('fs')
  , url = require('url')
  , util = require('util')
  , Stream = require('stream').Stream
  , JSDEV

JSDEV = exports = module.exports = require('./jsdev')
exports.JSDEV = JSDEV

var modifyContent = exports.modifyContent = function(content, othertags) {
  var jsdevtags = []
    , ENV = process.env.NODE_ENV || 'development'
  content.replace(/^\s*\/\/@jsdev(?:\(([^\)]+)\))?\s+([A-Za-z0-9_:\.\$\s]+)$/img, function(nonchange, envs, tags) {
    envs = (envs || 'development').split(/\s*,\s*/)
    if (!~envs.indexOf(ENV)) {
      return
    }
    tags.trim().split(/\s+/).forEach(function(tag) {
      tag && jsdevtags.push(tag)
    })
    return nonchange
  })
  if (othertags) {
    if ('string' === typeof othertags) {
      othertags = othertags.trim().split(/\s+/)
    }
    othertags.forEach(function(tag) {
      if (!/^[+-]?[A-Za-z0-9_:\.\$]+$/.test(tag)) {
        return
      }
      if ('-' === tag[0]) {
        tag = tag.slice(1)
        for (var i = jsdevtags.length-1; i >= 0; i--) {
          if (!jsdevtags[i].indexOf(tag) && (!jsdevtags[i][tag.length] || ':' === jsdevtags[i][tag.length])) {
            jsdevtags.splice(i, 1)
          }
        }
        delete jsdevtags[tag.slice(1)]
      } else {
        jsdevtags.push('+' === tag[0] ? tag.slice(1) : tag)
      }
    })
  }
  if (jsdevtags.length) {
    content = JSDEV(content, jsdevtags)
  }
  return content
}

exports.replaceRequire = function(othertags){
  module.constructor.prototype._compile = function(content, filename) {
    try {
      return originalCompile.call(this, modifyContent(content, othertags), filename)
    } catch(e) {
      console.log(filename);
      console.error(e)
    }
  }
}

exports.replaceStatic = function(othertags) {
  var ec = []
  try {
    ec.push(require('express'))
  } catch (e) {}
  try {
    ec.push(require('connect'))
  } catch (e) {}
  if (!ec.length) {
    throw new Error('there is no express nor connect module')
  }
  if (ec[0] === ec[1]) {
    ec.pop()
  }

  ec.forEach(function(c) {
    var oStatic = c['static']
      , mime = oStatic.mime
      , send = oStatic.send
      , cStatic = c['static'] = function(root, options) {
          options = options || {};
          options.getOnly = true;

          // root required
          if (!root) throw new Error('static() root path required');
          options.root = root;

          return function (req, res, next) {
            options.path = req.url
            var root = options.root ? path.normalize(options.root) : null
              , pathname
            if (!options.path) {
              throw new Error('path required')
            } else if ((pathname = url.parse(req.url).pathname).match(/\.js$/)) {
              var filePath = path.normalize(path.join(root, decodeURIComponent(pathname)))
              path.exists(filePath, function(exists) {
                if (!exists) {
                  return next()
                } else {
                  fs.readFile(filePath, 'utf8', function(err, content) {
                    var mc
                    try {
                      mc = modifyContent(content, othertags)
                    } catch(e) {
                      res.statusCode = 500
                      res.write('/* error:\n')
                      res.write(filePath)
                      res.write(e.toString())
                      res.write('\n*/')
                      res.end()
                    }
                    if (mc) {
                      res.setHeader('Content-Type', 'application/javascript; charset=utf-8')			
                      return res.end(mc)
                    }
                  })
                }
              })
            } else {
              send(req, res, next, options)
            }
          }
        }
    cStatic.mine = oStatic.mime
    cStatic.send = oStatic.send
  })

  /*
  function FakeRes(realRes) {
    if (!(this instanceof FakeRes)) {
      return new FakeRes(realRes)
    }
    this.realRes = realRes
    this.cache = {}
    this.writable = true
    util.inspect(realRes)
  }
  util.inherits(FakeRes, Stream)

  //proxy getter
  FakeRes.prototype.__defineGetter__('_headers', function() {
    return this.realRes._headers
  })
  FakeRes.prototype.__defineGetter__('headerSent', function() {
    return this.realRes.headerSent
  })
  FakeRes.prototype.getHeader = function () {
    return this.realRes.getHeader.apply(this.realRes, arguments)
  }

  //cache setter
  FakeRes.prototype.__defineSetter__('statusCode', function(value) {
    this.cache.statusCode = value
    return value
  })
  FakeRes.prototype.setHeader = function () {
    var headers = this.cache.headers || (this.cache.headers = [])
    headers.push(Array.prototype.slice.apply(arguments))
  }

  //cache body
  FakeRes.prototype.write = function(body) {
    this.cache.body = this.cache.body || []
    this.cache.body.push(body)
    return true
  }

  //apply all cached setter to real res object
  FakeRes.prototype.end = function (data) {
    if (this.cache.statusCode) {
      this.realRes.statusCode = this.cache.statusCode
    }
    if (this.cache.headers) {
      this.cache.headers.forEach(function(header) {
        this.realRes.setHeader.apply(this.realRes, header)
      }, this)
    }
    if (data) {
      this.write(data)
    }
    console.log(data);
    var body = ''
    console.log(this.cache);
    this.cache.body.forEach(function(str) {
      if ('string' === typeof str) {
        body = body + str
      } else if (str instanceof Buffer) {
        body = body + str.toString()
      }
    })
    console.log(body)
    console.log(modifyContent(body));
    this.realRes.write(modifyContent(body, othertags))
    return this.realRes.end.apply(this.realRes)
  }
  */
}
