const SSDPClient = require('node-ssdp').Client
const request = require('request-promise')
const EventEmitter = require('events')
const url = require('url')
const xmlbuilder = require('xmlbuilder')
const xml2js = require('xml2js')

class Switch {
  constructor (setupURL) {
    let parsedURL = url.parse(setupURL)
    this.setupURL = setupURL
    this.ip = parsedURL.hostname
    this.port = parsedURL.port
    this.url = `${parsedURL.protocol}//${parsedURL.host}/upnp/control/basicevent1`
  }

  getSetupData () {
    return new Promise((resolve, reject) => {
      request.get(this.setupURL).then((r) => {
        xml2js.parseString(r, { explicitArray: false }, (err, res) => {
          if (err) { reject(err) }
          resolve(res)
        })
      }).catch((err) => { reject(err) })
    })
  }
  getName () {
    return new Promise((resolve, reject) => {
      this.soapAction('GetFriendlyName').then((r) => {
        resolve(r.FriendlyName[0])
      }).catch((err) => { reject(err) })
    })
  }
  getState () {
    return new Promise((resolve, reject) => {
      this.soapAction('GetBinaryState').then((r) => {
        resolve(parseInt(r.BinaryState))
      }).catch((err) => { reject(err) })
    })
  }
  setState (st) {
    return new Promise((resolve, reject) => {
      this.soapAction('SetBinaryState', {
        BinaryState: st
      }).then((r) => {
        resolve(isNaN(parseInt(r.BinaryState)) ? st : parseInt(r.BinaryState))
      }).catch((err) => { reject(err) })
    })
  }
  toggle () {
    return new Promise((resolve, reject) => {
      this.getState().then((r) => {
        this.setState(r ? 0 : 1).then((r) => {
          resolve(r)
        }).catch((err) => { reject(err) })
      }).catch((err) => { reject(err) })
    })
  }

  soapAction (act, body) {
    var xml = xmlbuilder.create('s:Envelope', {
      version: '1.0',
      encoding: 'utf-8',
      allowEmpty: true
    })
    .att('xmlns:s', 'http://schemas.xmlsoap.org/soap/envelope/')
    .att('s:encodingStyle', 'http://schemas.xmlsoap.org/soap/encoding/')
    .ele('s:Body')
    .ele(`u:${act}`)
    .att('xmlns:u', 'urn:Belkin:service:basicevent:1')

    var options = {
      url: this.url,
      headers: {
        'SOAPACTION': `"urn:Belkin:service:basicevent:1#${act}"`,
        'Content-Type': 'text/xml; charset=utf-8'
      },
      body: (body ? xml.ele(body) : xml).end()
    }
    return new Promise((resolve, reject) => {
      request.post(options).then((r) => {
        xml2js.parseString(r, { explicitArray: false }, (err, res) => {
          if (err) { reject(err) }
          resolve(res['s:Envelope']['s:Body'][`u:${act}Response`])
        })
      })
    })
  }
}

class Client extends EventEmitter {
  constructor (options) {
    super()
    this.clients = {}
    this.options = Object.assign({
      timeout: 15000
    }, options)
  }

  loadSwitch (setupURL) {
    let sw = new Switch(setupURL)
    sw.getSetupData().then((r) => {
      let udn = r.root.device.UDN
      if (!Object.keys(this.clients).includes(udn)) {
        this.clients[udn] = sw
        this.emit('found', sw)
      }
    })
  }

  discover () {
    var ssdp = new SSDPClient()
    ssdp.removeAllListeners('response')
    ssdp.on('response', (msg) => {
      if (msg.ST && msg.ST === 'urn:Belkin:service:basicevent:1') {
        this.loadSwitch(msg.LOCATION)
      }
    })
    ssdp.search('urn:Belkin:service:basicevent:1')
    return new Promise((resolve, reject) => {
      setTimeout(resolve, this.options.timeout)
    })
  }
}

module.exports = {
  Client: Client,
  Switch: Switch
}
