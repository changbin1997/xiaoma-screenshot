const {
  globalShortcut,
  Tray,
  Menu,
  ipcMain
} = require('electron');
const path = require('path');
const Screenshot = require('./Screenshot');

const screenshot = new Screenshot();

module.exports = class App {
  // 托盘图标菜单
  trayMenu(mainWindow) {
    // 创建系统托盘
    const icon = path.normalize(path.join(__dirname, '../assets/favicon.ico'));
    const tray = new Tray(icon);
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
        label: '打开全屏截图存放目录',
        click: () => {
          screenshot.openFullScreenDir();
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
  }

  // 全局快捷键
  globalShortcut(mainWindow) {
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
  }

  // 移除全局快捷键
  globalShortcutUnregisterAll() {
    globalShortcut.unregisterAll();
  }

  // 处理渲染进程的 ipc 请求
  ipc(mainWindow) {
    // 导出图片请求
    ipcMain.handle('export-img', (ev, args) => {
      return screenshot.export(args);
    });

    // 拷贝图片请求
    ipcMain.handle('copy-img', (ev, args) => {
      return screenshot.copyImg(args);
    });

    // 隐藏窗口的 IPC 请求
    ipcMain.handle('hide', () => {
      mainWindow.hide();
      return true;
    });
  }
};