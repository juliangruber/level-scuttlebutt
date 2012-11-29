require('tape')('test', function (t) {

var levelup = require('levelup')
var rimraf  = require('rimraf')
var delay   = require('delay-stream')

function create(path, cb) {
  rimraf(path, function (err) {
    if(err) return callback(err)
    levelup(path, {createIfMissing: true}, function (err, db) {
      if(err) throw err
      require('..')(db)
      cb(null, db)
    })
  })
}

var A, B

function randomData(db, id, cb) {
  require('..')(id)(db)

  var emitter = db.scuttlebutt('test1')
  var l = 5
  while(l --> 0)
    emitter.update('Date: ' + new Date())

  setTimeout(cb, 1000)
}

create('/tmp/level-scuttlebutt-test-A', function (err, db) {
  randomData(A = db, 'A', next)
})

create('/tmp/level-scuttlebutt-test-B', function (err, db) {
  randomData(B = db, 'B', next)
})

function next() {
  if(!(A && B)) return

  var streamA = A.scuttlebutt.createStream({tail: false})
  var streamB = B.scuttlebutt.createStream({tail: false})

  streamA.pipe(delay(100)).pipe(streamB).pipe(delay(100)).pipe(streamA)
  
  var n = 2, vecA, vecB

  streamA.on('end', function () {
    console.log('END A')
    A.scuttlebutt.vectorClock(function (err, vec) {
      vecA = vec; next()
    })
  })

  streamB.on('end', function () {
    console.log('END B')
    A.scuttlebutt.vectorClock(function (err, vec) {
      vecB = vec; next()
    })
  })

  function next() {
    if(--n) return
    console.log(vecA, vecB)
    t.deepEqual(vecA, vecB)
    t.end()
  }
}

})