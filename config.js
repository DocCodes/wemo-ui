var appConfig = require('application-config')('WemoUI')
var path = require('path')

var APP_NAME = 'Wemo UI'
var APP_TEAM = 'Evan Elias Young'
var APP_VERSION = require('./package.json').version

module.exports = {
  APP_COPYRIGHT: `Copyright © 2018 ${APP_TEAM}`,
  APP_NAME: APP_NAME,
  APP_TEAM: APP_TEAM,
  APP_VERSION: APP_VERSION,
  APP_WINDOW_TITLE: APP_NAME,
  APP_ICON: path.join(__dirname, 'assets', 'icons', 'png', '1024x1024.png'),

  CONFIG_PATH: path.dirname(appConfig.filePath),

  GITHUB_URL: 'https://github.com/DocCodes/wemoui',
  GITHUB_URL_ISSUES: 'https://github.com/DocCodes/wemoui/issues',
  GITHUB_URL_RAW: 'https://raw.githubusercontent.com/DocCodes/wemoui',

  ROOT_PATH: __dirname,

  WINDOW_MAIN: `file://${path.join(__dirname, 'renderer', 'index.html')}`,
  WINDOW_WIDTH: 300,
  WINDOW_HEIGHT: (80 * 4) + (8 * 3) + (16 + 100) // (switch height * switches) + (switch margin * switches - 1) + (padding + header)
}
