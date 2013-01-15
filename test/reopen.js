require('tape')('test', function (t) {

var levelup = require('levelup')
var rimraf  = require('rimraf')
var delay   = require('delay-stream')
var Model   = require('scuttlebutt/model')

function create(path, cb) {
  rimraf(path, function (err) {
    if(err) return callback(err)
    levelup(path, {createIfMissing: true}, function (err, db) {
      if(err) throw err
      cb(null, db)
    })
  })
}

var A, B

create('/tmp/level-scuttlebutt-test-A', function (err, db) {

  require('..')(db, 'test1', {
    test: function () {
      return Model()
    }
  })

  var m = new Model()

  m.name = 'test-model'

  m.set('x', Math.random())
  m.set('y', Math.random())
  m.set('z', Math.random())

  db.scuttlebutt._open(m, function () {
    console.log('reopened')

    db.scuttlebutt(m.name, function (err, _m) {

      t.notStrictEqual(_m, m)
      t.deepEqual(_m.history(), m.history())
      t.end()
    })
  })

})

})
