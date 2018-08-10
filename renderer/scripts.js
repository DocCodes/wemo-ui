const {shell, ipcRenderer} = require('electron')

var switches = {}
var btnReload = document.getElementById('btnReload')
var main = document.querySelector('main')
ipcRenderer.send('ipcReady') // Send back a ready signal

function clearDisplay () {
  main.innerHTML = ''
}
function displaySwitch (sw) {
  main.innerHTML += `
  <div data-switch="${sw.device.UDN}">
  <img class="switch-icon" src="http://${sw.ip}:${sw.port}/${sw.device.iconList.icon.url}">
  <h3 class="switch-data switch-name">${sw.device.friendlyName}</h3>
  <h5 class="switch-data switch-about">WeMo ${sw.device.modelName}</h5>
  <h5 class="switch-data switch-ip">${sw.ip}</h5>
  <h5 class="switch-data switch-setup" onclick="shell.openExternal('${sw.setupURL}')">Setup URL</h5>
  <img class="switch-power" src="images/power-que.svg" onclick="toggleBinaryState(this)">
  </div>
  `
  ipcRenderer.send('getBinaryState', sw.device.UDN)
}
function displaySwitches () {
  for (let k of Object.keys(switches)) {
    displaySwitch(switches[k])
  }
}

function scan () {
  console.log('Scanning for switches')
  clearDisplay()
  btnReload.src = 'images/loading.svg'
  setTimeout(() => {
    btnReload.src = 'images/reload.svg'
  }, 5000)
  ipcRenderer.send('scan')
}

function toggleBinaryState (sender) {
  let udn = sender.parentElement.dataset.switch
  ipcRenderer.send('toggleState', udn)
}

function updateDepiction (udn, state) {
  let tgtSw = document.querySelector(`div[data-switch="${udn}"] .switch-power`)
  if (tgtSw) {
    tgtSw.src = state ? 'images/power-on.svg' : 'images/power-off.svg'
  }
}

function load () {
  btnReload.addEventListener('click', () => { // When the switch button is clicked
    scan()
  })

  ipcRenderer.on('found', (sender, sw, setup) => { // When a new switch is found
    sw.device = setup.root.device
    switches[sw.device.UDN] = sw
    console.log('New switch')
    clearDisplay()
    displaySwitches()
  })

  ipcRenderer.on('getBinaryStateResponse', (sender, udn, state) => { updateDepiction(udn, state) })
  ipcRenderer.on('setBinaryStateResponse', (sender, udn, state) => { updateDepiction(udn, state) })
  ipcRenderer.on('toggleStateResponse', (sender, udn, state) => { updateDepiction(udn, state) })

  scan()
}

load()
