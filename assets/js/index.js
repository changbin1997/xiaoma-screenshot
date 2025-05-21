import {
  imgEl,
  canvasEl,
  overlayEl,
  selectBoxEl,
  thicknessOptionsEl,
  clearBtnEl,
  exportBtnEl,
  copyBtnEl, graffitiBtnEl, colorBtnEl, colorListEl
} from "./DOM.js";
let mouseActive = false;

import Selection from './Selection.js';
import Toolbar from './Toolbar.js';
import Canvas from './Canvas.js';
import './DOM.js';

const selection = new Selection();
const toolbar = new Toolbar();
const canvas = new Canvas();

// 主进程截图完成
window.electronAPI.onResponse('screenshot', (ev, result) => {
  // 在 img 中显示图片
  const blob = new Blob([result], {type: 'image/png'});
  imgEl.src = URL.createObjectURL(blob);
});

// 图像显示区域鼠标按下
overlayEl.addEventListener('mousedown', ev => {
  if (!selection.imgSelected) {
    selection.startSelect(ev, imgEl.src);
    mouseActive = true;
  }
});

// 图像显示区域鼠标移动
document.addEventListener('mousemove', ev => {
  // 缩放截图区域
  if (!selection.imgSelected && mouseActive) selection.select(ev);
  // 图片选择框移动
  if (selection.moveSelectBox && mouseActive) selection.selectBoxMove(ev);
});

// 图像显示区域鼠标放开
document.addEventListener('mouseup', () => {
  mouseActive = false;
  if (!selection.imgSelected || selection.moveSelectBox) {
    // 如果图片选择框大小 <= 2 就取消选择，可以避免只是点击就弹出图片工具栏
    if (!selection.imgSelected && selectBoxEl.offsetWidth <= 2 || selectBoxEl.offsetHeight <= 2) {
      selectBoxEl.style.display = 'none';
      return false;
    }
    // 显示工具栏
    toolbar.showToolbar(selection.getSelectBoxPosition());
  }
  if (!selection.imgSelected) selection.imgSelected = true;  // 图片选择完成
  selection.moveSelectBox = false;  // 取消拖拽移动
});

// 图片选择框鼠标按下（拖拽移动）
selectBoxEl.addEventListener('mousedown', ev => {
  // 隐藏图片工具栏
  toolbar.hideToolbar();
  selection.selectBoxStartMove(ev);
  mouseActive = true;
});

// 取消截图按钮点击
clearBtnEl.addEventListener('click', () => {
  toolbar.hideToolbar();
  canvas.hideCanvas();
  selection.imgSelected = false;
  canvas.screenshotCompleted = false;
  toolbar.hideAllDialog();
  selectBoxEl.style.display = 'none';
  window.electronAPI['ipc-invoke']('hide');
});

// 保存图片点击
exportBtnEl.addEventListener('click', async () => {
  // 截取图片
  if (!canvas.screenshotCompleted) {
    const selectBoxPosition = selection.getSelectBoxPosition();
    canvas.screenshot(selectBoxPosition.top, selectBoxPosition.left, selectBoxPosition.width, selectBoxPosition.height, imgEl);
  }
  // 把图片传给主进程
  await window.electronAPI['ipc-invoke']('export-img', canvas.getDataURL());
  selection.imgSelected = false;
  canvas.screenshotCompleted = false;
  // 隐藏窗口
  toolbar.hideAllDialog();
  clearBtnEl.click();
});

// 拷贝图片点击
copyBtnEl.addEventListener('click', async () => {
  // 截取图片
  if (!canvas.screenshotCompleted) {
    const selectBoxPosition = selection.getSelectBoxPosition();
    canvas.screenshot(selectBoxPosition.top, selectBoxPosition.left, selectBoxPosition.width, selectBoxPosition.height, imgEl);
  }
  await window.electronAPI['ipc-invoke']('copy-img', canvas.getDataURL());
  selection.imgSelected = false;
  canvas.screenshotCompleted = false;
  // 隐藏窗口
  toolbar.hideAllDialog();
  clearBtnEl.click();
});

// ESC 见隐藏窗口
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' || ev.keyCode === 27) {
    toolbar.hideAllDialog();
    clearBtnEl.click();
  }
});

// 空白区域点击
overlayEl.addEventListener('click', () => {
  toolbar.hideAllDialog();
});

// 笔画粗细选择
thicknessOptionsEl.forEach(el => {
  el.addEventListener('click', ev => {
    let targetEl = ev.target;
    if (ev.target.classList.item(0) === 'line') {
      targetEl = ev.target.parentNode;
    }
    canvas.thickness = Number(targetEl.getAttribute('data-px'));
    document.querySelector('#thickness-options .active').classList.remove('active');
    targetEl.classList.add('active');
    // 隐藏笔画选择
    toolbar.hideThicknessOptions();
  });
});

// 涂鸦按钮点击，打开笔画选择
graffitiBtnEl.addEventListener('click', () => {
  // 截取图片
  if (!canvas.screenshotCompleted) {
    const selectBoxPosition = selection.getSelectBoxPosition();
    canvas.screenshot(selectBoxPosition.top, selectBoxPosition.left, selectBoxPosition.width, selectBoxPosition.height, img);
  }
  toolbar.showThicknessOptions(canvas.color);
});

// 涂鸦（鼠标按下）
canvasEl.addEventListener('mousedown', ev => {
  toolbar.hideAllDialog();
  canvas.startGraffiti(ev);
});

// 涂鸦（鼠标移动）
canvasEl.addEventListener('mousemove', ev => {
  canvas.moveGraffiti(ev);
});

// 涂鸦（鼠标松开）
canvasEl.addEventListener('mouseup', () => {
  canvas.stopGraffiti();
});

// 涂鸦时鼠标移出 canvas
canvasEl.addEventListener('mouseout', () => {
  if (canvas.graffiti) canvas.stopGraffiti();
});

// 颜色色块点击
colorListEl.addEventListener('click', ev => {
  if (ev.target.classList.item(0) !== 'color-item') return false;
  canvas.color = ev.target.getAttribute('data-color');
  document.querySelector('#color-selected').style.background = canvas.color;
  return false;
});

// 打开颜色选择器的按钮点击
colorBtnEl.addEventListener('click', () => {
  // 截取图片
  if (!canvas.screenshotCompleted) {
    const selectBoxPosition = selection.getSelectBoxPosition();
    canvas.screenshot(selectBoxPosition.top, selectBoxPosition.left, selectBoxPosition.width, selectBoxPosition.height, img);
  }
  // 打开颜色选择对话框
  toolbar.showColorSelect();
});

// 初始化颜色选择
toolbar.createColorList();