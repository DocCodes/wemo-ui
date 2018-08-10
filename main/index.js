console.time('app')
console.time('init')

// <region> Variables
const {app} = require('electron')
const ipc = require('./ipc')
var main
// </region>

// <region> App Handling
ipc.init() // Start the interprocess communcator
app.on('ready', () => { // When the Electron app is ready to load
  console.timeEnd('app')
  const menu = require('./menu')
  main = require('./window')

  main.init() // Start the main window
  menu.init() // Start the taskbar menu
})

app.on('window-all-closed', () => { // Close app for not macs
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => { // Reopen for macs
  if (main === undefined) {
    main.init()
  } else {
    main = require('./window')
    main.init()
  }
})

app.once('ipcReady', () => {
  console.timeEnd('init')
})
// </region>
