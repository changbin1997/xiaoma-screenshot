const {app, BrowserWindow} = require('electron');
const path = require('path');
const App = require('./app/App');

let mainWindow = null; // 用来保存主窗口
const myApp = new App();

app.on('ready', async () => {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    autoHideMenuBar: true,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 如果是发行版，不显示菜单栏
  if (app.isPackaged) {
    mainWindow.setMenu(null);
  }

  // 加载 HTML
  await mainWindow.loadFile(path.join('assets', 'index.html'));

  // 关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 注册快捷键
  myApp.globalShortcut(mainWindow);

  // 注册托盘图标和菜单
  myApp.trayMenu(mainWindow);

  // 处理 ipc
  myApp.ipc(mainWindow);
});

app.on('will-quit', () => {
  myApp.globalShortcutUnregisterAll();
});