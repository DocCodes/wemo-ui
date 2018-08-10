module.exports = {
  init
}

const {app, ipcMain} = require('electron')
const main = require('./window')

async function init () {
  ipcMain.once('ipcReady', (e) => {
    app.ipcReady = true
    app.emit('ipcReady')
  })

  ipcMain.on('setProgress', (e, ...args) => main.setProgress(...args)) // Set task bar progress
  ipcMain.on('setTitle', (e, ...args) => main.setTitle(...args)) // Set the app title
  ipcMain.on('show', () => main.show()) // Show the main window
  ipcMain.on('scan', () => main.scan()) // Scan for switches
  ipcMain.on('getBinaryState', (e, udn) => main.getBinaryState(udn)) // Get the state
  ipcMain.on('setBinaryState', (e, udn, state) => { main.setBinaryState(udn, state) }) // Set the state
  ipcMain.on('toggleState', (e, udn) => { main.toggleState(udn) }) // Toggle the state
}
