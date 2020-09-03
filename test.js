var fs = require('fs')
var test = require('tape')
var ddrive = require('ddrive')
var ram = require('random-access-memory')
var dwebdiscovery = require('dwebdiscovery')
var pump = require('pump')

var networkSpeed = require('.')

var archive = ddrive(ram)
var swarm

archive.ready(function () {
  swarm = dwebdiscovery(archive)

  pump(fs.createReadStream('test.js'), archive.createWriteStream('test.js'), function (err) {
    if (err) throw err
    pump(fs.createReadStream('test.js'), archive.createWriteStream('test.js'), function (err) {
      if (err) throw err
      run()
    })
  })
})

function run () {
  test('tracks upload speed', function (t) {
    var speed = networkSpeed(archive)

    var archiveClient = ddrive(ram, archive.key)

    archiveClient.ready(function () {
      var swarmClient = dwebdiscovery(archiveClient)

      archive.content.once('upload', function () {
        t.ok(speed.uploadTotal && speed.uploadTotal > 0, 'has upload total')
        t.ok(speed.uploadSpeed && speed.uploadSpeed > 0, 'has upload speed')
        t.ok(Object.keys(speed).indexOf('uploadSpeed') > -1, 'uploadSpeed enumerable')
        swarmClient.close(function () {
          t.end()
        })
      })
    })
  })

  test('tracks download speed', function (t) {
    var archiveClient = ddrive(ram, archive.key)
    var speed = networkSpeed(archiveClient)

    archiveClient.ready(function () {
      var swarmClient = dwebdiscovery(archiveClient)

      archiveClient.once('content', function () {
        archiveClient.content.once('download', function () {
          t.ok(speed.downloadTotal && speed.downloadTotal > 0, 'has download total')
          t.ok(speed.downloadSpeed && speed.downloadSpeed > 0, 'has download speed')
          t.ok(Object.keys(speed).indexOf('downloadSpeed') > -1, 'downloadSpeed enumerable')
          swarmClient.close(function () {
            t.end()
          })
        })
      })
    })
  })

  test('zeros out speed after finishing', function (t) {
    var archiveClient = ddrive(ram, archive.key)
    var speedDown = networkSpeed(archiveClient)
    var stream = archiveClient.replicate({live: false})

    archiveClient.ready(function () {
      var swarmClient = dwebdiscovery(archiveClient, {stream: function () { return stream}})

      stream.once('close', function () {
        setTimeout(ondone, 300)
      })

      function ondone () {
        t.same(speedDown.downloadSpeed, 0, 'download speed zero')
        swarmClient.close(function () {
          t.end()
        })
      }
    })
  })

  test('zeros out speed after disconnection', function (t) {
    var archiveClient = ddrive(ram, archive.key)
    var speedDown = networkSpeed(archiveClient, {timeout: 250})
    var speedUp = networkSpeed(archive, {timeout: 250})

    archiveClient.ready(function () {
      var swarmClient = dwebdiscovery(archiveClient)
      archiveClient.metadata.once('download', function () {
        setTimeout(function () {
          t.same(speedUp.uploadSpeed, 0, 'upload speed zero')
          t.same(speedDown.downloadSpeed, 0, 'download speed zero')

          swarmClient.close(function () {
            swarm.close(function () {
              t.end()
            })
          })
        }, 500)
        swarmClient.leave(archive.key)
      })
    })
  })
}
