# ddrive-network-speed

[![Travis](https://img.shields.io/travis/joehand/ddrive-network-speed.svg?style=flat-square)](https://travis-ci.org/joehand/ddrive-network-speed) [![npm](https://img.shields.io/npm/v/ddrive-network-speed.svg?style=flat-square)](https://npmjs.org/package/ddrive-network-speed)

Get upload and download speeds for a ddrive archive.

## Usage

```js
var archive = ddrive('.dwebx')
var swarm = dwebdiscovery(archive)
var speed = networkSpeed(archive, {timeout: 1000})

setInterval(function () {
  console.log('upload speed: ', speed.uploadSpeed)
  console.log('download speed: ', speed.downloadSpeed)
}, 500)
```

## API

### `var speed = networkSpeed(archive, [opts])`

* `archive` is a ddrive archive.
* `opts.timeout` is the only option. Speed will be reset to zero after the timeout.

#### `speed.uploadSpeed`

Archive upload speed across all peers.

#### `speed.downloadSpeed`

Archive download speed across all peers.

## License

MIT
