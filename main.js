const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  ipcMain
} = require('electron');
const path = require('path');
const Screenshot = require('./app/Screenshot');

let mainWindow = null; // 用来保存主窗口
let tray = null; // 用来存放系统托盘

const screenshot = new Screenshot();

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

  // 创建系统托盘
  tray = new Tray(path.join(__dirname, 'assets', 'favicon.ico'));
  // 菜单模板
  const menu = [
    {
      label: '截图（F1）',
      click: async () => {
        const result = await screenshot.screenshot();
        if (!result) return false;
        mainWindow.webContents.send('screenshot', result);
        mainWindow.show();
      }
    },
    {
      label: '全屏截图（F2）',
      click: () => {
        screenshot.fullScreen();
      }
    },
    {
      label: '显示刚才的截图',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: '退出',
      role: 'quit'
    }
  ];
  // 给系统托盘设置菜单
  tray.setContextMenu(Menu.buildFromTemplate(menu));
  // 给托盘图标设置气球提示
  tray.setToolTip('截图');

  // 加载 HTML
  await mainWindow.loadFile(path.join('assets', 'index.html'));

  // 关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 注册 F1 快捷键
  globalShortcut.register('F1', async () => {
    const result = await screenshot.screenshot();
    if (!result) return false;
    mainWindow.webContents.send('screenshot', result);
    mainWindow.show();
  });

  // 注册 F2 快捷键
  globalShortcut.register('F2', () => {
    screenshot.fullScreen();
  });

  // 隐藏窗口的 IPC 请求
  ipcMain.handle('hide', () => {
    mainWindow.hide();
  });
});

// 导出图片请求
ipcMain.handle('export-img', (ev, args) => {
  return screenshot.export(args);
});

// 拷贝图片请求
ipcMain.handle('copy-img', (ev, args) => {
  return screenshot.copyImg(args);
});
