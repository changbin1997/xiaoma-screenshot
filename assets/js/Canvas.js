import {canvasEl} from './DOM.js';

export default class Canvas {
  screenshotCompleted = false;  // 成功截图
  ctx;  // canvas上下文
  graffiti = false;  // 涂鸦状态
  thickness = 2;  // 笔画粗细
  color = '#FF0000';  // 颜色

  constructor() {
    this.ctx = canvasEl.getContext('2d');
  }

  // 放开鼠标停止涂鸦
  stopGraffiti() {
    // 停止当前路劲
    this.ctx.closePath();
    this.graffiti = false;
  }

  // 移动鼠标涂鸦
  moveGraffiti(ev) {
    if (!this.graffiti) return false;
    // 直线连接位置
    this.ctx.lineTo(ev.offsetX, ev.offsetY);
    this.ctx.stroke();
  }

  // 即将开始涂鸦
  startGraffiti(ev) {
    this.graffiti = true;
    // 开始一个新的路径
    this.ctx.beginPath();
    // 标记起点
    this.ctx.moveTo(ev.offsetX, ev.offsetY);
    // 设置线的宽度
    this.ctx.lineWidth = this.thickness;
    // 设置颜色
    this.ctx.strokeStyle = this.color;
  }

  // 获取图片数据
  getDataURL() {
    return canvasEl.toDataURL('image/png');
  }

  // 隐藏 canvas
  hideCanvas() {
    canvasEl.style.display = 'none';
  }

  // 截取图片
  screenshot(top, left, width, height, imgEl) {
    // 把图片截取到 canvas
    canvasEl.style.display = 'inline';
    canvasEl.width = width;
    canvasEl.height = height;
    canvasEl.style.top = top + 'px';
    canvasEl.style.left = left + 'px';
    this.ctx.drawImage(imgEl, left, top, width, height, 0, 0, canvasEl.width, canvasEl.height);
    this.screenshotCompleted = true;
    return true;
  }
}
