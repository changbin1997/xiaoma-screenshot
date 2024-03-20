const screenshotDesktop = require('screenshot-desktop');
const {dialog, nativeImage, clipboard, BrowserWindow, Notification} = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = class Screenshot {
  // 全屏截图
  fullScreen() {
    let fileName = os.homedir();
    // 检查用户目录里是否有存放图片的目录
    if (fs.existsSync(path.join(fileName, 'Pictures'))) {
      fileName = path.join(fileName, 'Pictures');
    }
    fileName = path.join(fileName, `${Math.round(new Date().getTime() / 1000)}.png`);
    // 截图
    screenshotDesktop({filename: fileName}).then(imgPath => {
      new Notification({
        title: '成功截图',
        body: `图片已成功保存到 ${imgPath}`
      }).show();
    }).catch(error => {
      dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
        message: error.message,
        type: 'error',
        buttons: ['关闭'],
        title: '截图出错'
      });
    });
  }

  // 截图
  screenshot() {
    return new Promise((resolve) => {
      screenshotDesktop().then(result => {
        resolve(result);
      }).catch(error => {
        dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
          message: error.message,
          type: 'error',
          buttons: ['关闭'],
          title: '截图出错'
        });
        resolve(false);
      })
    });
  }

  // 拷贝图片
  copyImg(base64Img) {
    const imgData = nativeImage.createFromDataURL(base64Img);
    clipboard.writeImage(imgData);
    return true;
  }

  // 导出图片
  export(base64Img) {
    // 默认文件名
    const defaultName = `${Math.round(new Date().getTime() / 1000)}.png`;
    // 显示文件对话框
    const fileName = dialog.showSaveDialogSync(BrowserWindow.getFocusedWindow(), {
      title: '保存位置选择',
      buttonLabel: '保存',
      defaultPath: path.join(process.cwd(), defaultName)
    });
    if (fileName === undefined) return false;
    // 替换图片文件的头信息
    const imgData = base64Img.replace(/^data:image\/png;base64,/, '');
    try {
      fs.writeFileSync(fileName, imgData, 'base64');
      return true;
    } catch (error) {
      dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
        message: error.message,
        type: 'error',
        buttons: ['关闭'],
        title: '保存图片出错'
      });
      return false;
    }
  }
}