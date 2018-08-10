const main = module.exports = {
  init,
  send,
  setProgress,
  setTitle,
  show,
  scan,
  getBinaryState,
  setBinaryState,
  toggleState,
  toggleDevTools,
  win: null
}

const {BrowserWindow} = require('electron')
const config = require('../config')
const wemo = require('./wemo')
var WemoClient = new wemo.Client({timeout: 5000})

async function init () {
  if (main.win) { return main.win.show() }
  var win = main.win = new BrowserWindow({
    backgroundColor: '#FFFFFF',
    darkTheme: false,
    icon: config.APP_ICON,
    resizable: false,
    width: config.WINDOW_WIDTH,
    height: config.WINDOW_HEIGHT,
    title: config.APP_WINDOW_TITLE,
    useContentSize: true,
    show: false
  })
  win.loadURL(config.WINDOW_MAIN)

  win.on('closed', () => {
    win = main.win = null
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  WemoClient.on('found', (sw) => {
    sw.getSetupData().then((r) => {
      main.win.webContents.send('found', sw, r)
    })
  })
}

function send (...args) {
  if (!main.win) { return }
  main.win.send(...args)
}

function setProgress (progress) {
  if (!main.win) { return }
  main.win.setProgressBar(progress)
}

function setTitle (title) {
  if (!main.win) { return }
  main.win.setTitle(title)
}

function show () {
  if (!main.win) { return }
  main.win.show()
}

function scan () {
  console.log('Scanning For Switches')
  WemoClient.clients = {}
  WemoClient.discover()
}

function getBinaryState (udn) {
  if (Object.keys(WemoClient.clients).includes(udn)) {
    let sw = WemoClient.clients[udn]
    sw.getState().then((r) => {
      main.win.webContents.send('getBinaryStateResponse', udn, r)
    }).catch((err) => { console.log(err) })
  } else {
    main.win.webContents.send('getBinaryStateResponse', udn, 0)
  }
}

function setBinaryState (udn, state) {
  if (Object.keys(WemoClient.clients).includes(udn)) {
    let sw = WemoClient.clients[udn]
    sw.setState(state).then((r) => {
      console.log('Send back')
      console.log(udn)
      console.log(r)
      main.win.webContents.send('setBinaryStateResponse', udn, r)
    }).catch((err) => { console.log(err) })
  } else {
    main.win.webContents.send('setBinaryStateResponse', udn, null)
  }
}

function toggleState (udn) {
  if (Object.keys(WemoClient.clients).includes(udn)) {
    let sw = WemoClient.clients[udn]
    sw.toggle().then((r) => {
      main.win.webContents.send('toggleStateResponse', udn, r)
    }).catch((err) => { console.log(err) })
  } else {
    main.win.webContents.send('toggleStateResponse', udn, null)
  }
}

function toggleDevTools () {
  if (!main.win) { return }
  if (main.win.webContents.isDevToolsOpened()) {
    main.win.webContents.closeDevTools()
  } else {
    main.win.webContents.openDevTools({mode: 'detach'})
  }
}
