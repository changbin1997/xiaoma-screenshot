const canvasEl = document.querySelector('#canvas');
const ctx = canvasEl.getContext('2d');
const img = document.querySelector('#img');
const overlayEl = document.querySelector('#overlay');  // 图片遮罩层
const toolbarEl = document.querySelector('#toolbar');  // 图片工具栏
const selectBoxEl = document.querySelector('#select-box');  // 图片选择框
const thicknessOptionsEl = document.querySelectorAll('#thickness-options .thickness');
let thickness = 2;  // 涂鸦的笔画粗细
let showThicknessOptions = false;  // 是否显示笔画设置
let showColorSelect = false;  // 是否显示颜色选择
let startGraffiti = false;  // 用来记录涂鸦的状态
let color = '#FF0000';  // 画笔颜色
let imgSelected = false;  // 图片区域选择完成
let screenshotCompleted = false;  // 成功截图
let moveSelectBox = false;  // 图片选择框移动
const mousePosition = {x: 0, y: 0};  // 记录鼠标在图片选择框里的位置

// 主进程截图完成
window.electronAPI.onResponse('screenshot', (ev, result) => {
  // 在 img 中显示图片
  const blob = new Blob([result], {type: 'image/png'});
  const imgUrl = URL.createObjectURL(blob);
  img.src = imgUrl;
});

let mouseActive = false;
const selectBoxPosition = {x: 0, y: 0};
// 图像显示区域鼠标按下
overlayEl.addEventListener('mousedown', ev => {
  if (!imgSelected) {
    // 显示图片区域选择框
    selectBoxEl.style.display = 'block';
    selectBoxEl.style.left = ev.clientX + 'px';
    selectBoxEl.style.top = ev.clientY + 'px';
    selectBoxEl.style.width = 0;
    selectBoxEl.style.height = 0;
    // 设置图片选择框的背景图片
    selectBoxEl.style.backgroundImage = `url(${img.src})`;
    selectBoxEl.style.backgroundPosition = `-${ev.clientX + 1}px -${ev.clientY + 1}px`;
    selectBoxPosition.x = ev.clientX;
    selectBoxPosition.y = ev.clientY;
    mouseActive = true;
  }
});

// 图像显示区域鼠标移动
document.addEventListener('mousemove', ev => {
  // 缩放截图区域
  if (!imgSelected && mouseActive) {
    // 横向缩放
    if (ev.clientX < selectBoxPosition.x) {
      selectBoxEl.style.left = ev.clientX + 'px';
      selectBoxEl.style.width = selectBoxPosition.x - ev.clientX + 'px';
      selectBoxEl.style.backgroundPosition = `-${selectBoxEl.offsetLeft + 1}px -${selectBoxEl.offsetTop + 1}px`;
    }else {
      selectBoxEl.style.width = ev.clientX - selectBoxPosition.x + 'px';
    }
    // 纵向缩放
    if (ev.clientY < selectBoxPosition.y) {
      selectBoxEl.style.top = ev.clientY + 'px';
      selectBoxEl.style.height = selectBoxPosition.y - ev.clientY + 'px';
      selectBoxEl.style.backgroundPosition = `-${selectBoxEl.offsetLeft + 1}px -${selectBoxEl.offsetTop + 1}px`;
    }else {
      selectBoxEl.style.height = ev.clientY - selectBoxPosition.y + 'px';
    }
  }
  // 图片选择框移动
  if (moveSelectBox && mouseActive) {
    // 移动图片选择框
    selectBoxEl.style.left = ev.clientX - mousePosition.x + 'px';
    selectBoxEl.style.top = ev.clientY - mousePosition.y + 'px';
    // 限制图片选择框的移动区域
    if (selectBoxEl.offsetLeft <= 0) selectBoxEl.style.left = 0;
    if (selectBoxEl.offsetTop <= 0) selectBoxEl.style.top = 0;
    if (selectBoxEl.offsetLeft + selectBoxEl.offsetWidth >= window.innerWidth) {
      selectBoxEl.style.left = window.innerWidth - selectBoxEl.offsetWidth + 'px';
    }
    if (selectBoxEl.offsetTop + selectBoxEl.offsetHeight >= window.innerHeight) {
      selectBoxEl.style.top = window.innerHeight - selectBoxEl.offsetHeight + 'px';
    }
    // 设置图片选择框内的图片
    selectBoxEl.style.backgroundPosition = `-${selectBoxEl.offsetLeft}px -${selectBoxEl.offsetTop}px`;
  }
});

// 图像显示区域鼠标放开
document.addEventListener('mouseup', () => {
  mouseActive = false;
  if (!imgSelected || moveSelectBox) {
    // 如果图片选择框大小 <= 2 就取消选择，可以避免只是点击就弹出图片工具栏
    if (!imgSelected && selectBoxEl.offsetWidth <= 2 || selectBoxEl.offsetHeight <= 2) {
      selectBoxEl.style.display = 'none';
      return false;
    }
    // 显示图片操作工具栏
    toolbarEl.style.display = 'flex';
    if (selectBoxEl.offsetTop + selectBoxEl.offsetHeight < window.innerHeight - 30) {
      toolbarEl.style.top = selectBoxEl.offsetTop + selectBoxEl.offsetHeight + 'px';
    }else if (selectBoxEl.offsetTop >= 30) {
      toolbarEl.style.top = selectBoxEl.offsetTop - 30 + 'px';
    }else {
      toolbarEl.style.top = selectBoxEl.offsetTop + selectBoxEl.offsetHeight - toolbarEl.offsetHeight + 'px';
    }
    // 设置图片工具栏的 left
    if (selectBoxEl.offsetLeft + selectBoxEl.offsetWidth - toolbarEl.offsetWidth >= 0) {
      toolbarEl.style.left = selectBoxEl.offsetLeft + selectBoxEl.offsetWidth - toolbarEl.offsetWidth + 'px';
    }else {
      toolbarEl.style.left = selectBoxEl.offsetLeft + 'px';
    }
  }
  if (!imgSelected) imgSelected = true;
  moveSelectBox = false;
});

// 图片选择框鼠标按下（拖拽移动）
selectBoxEl.addEventListener('mousedown', ev => {
  // 隐藏图片工具栏
  toolbarEl.style.display = 'none';
  // 获取鼠标在图片选择框内的位置
  mousePosition.x = ev.clientX - selectBoxEl.offsetLeft;
  mousePosition.y = ev.clientY - selectBoxEl.offsetTop;
  moveSelectBox = true;
  mouseActive = true;
});

// 取消截图按钮点击
document.querySelector('#clear-btn').addEventListener('click', () => {
  toolbarEl.style.display = 'none';
  canvasEl.style.display = 'none';
  imgSelected = false;
  screenshotCompleted = false;
  hideDialog();
  selectBoxEl.style.display = 'none';
  window.electronAPI['ipc-invoke']('hide');
});

// 保存图片点击
document.querySelector('#export-btn').addEventListener('click', async () => {
  // 截取图片
  if (!screenshotCompleted) {
    screenshot();
  }
  const imgData = canvasEl.toDataURL('image/png');
  // 把图片传给主进程
  await window.electronAPI['ipc-invoke']('export-img', imgData);
  imgSelected = false;
  screenshotCompleted = false;
  // 隐藏窗口
  hideDialog();
  document.querySelector('#clear-btn').click();
});

// 拷贝图片点击
document.querySelector('#copy-btn').addEventListener('click', async () => {
  // 截取图片
  if (!screenshotCompleted) {
    screenshot();
  }
  const imgData = canvasEl.toDataURL('image/png');
  await window.electronAPI['ipc-invoke']('copy-img', imgData);
  imgSelected = false;
  screenshotCompleted = false;
  // 隐藏窗口
  hideDialog();
  document.querySelector('#clear-btn').click();
});

// ESC 见隐藏窗口
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' || ev.keyCode === 27) {
    hideDialog();
    document.querySelector('#clear-btn').click();
  }
});

// 空白区域点击
overlayEl.addEventListener('click', () => {
  hideDialog();
});

// 笔画粗细选择
thicknessOptionsEl.forEach(el => {
  el.addEventListener('click', ev => {
    let targetEl = ev.target;
    if (ev.target.classList.item(0) === 'line') {
      targetEl = ev.target.parentNode;
    }
    thickness = Number(targetEl.getAttribute('data-px'));
    document.querySelector('#thickness-options .active').classList.remove('active');
    targetEl.classList.add('active');
    // 隐藏笔画选择
    hideThicknessOptions();
  });
});

// 调整笔画按钮点击
document.querySelector('#graffiti').addEventListener('click', () => {
  // 截取图片
  if (!screenshotCompleted) {
    screenshot();
  }
  if (showColorSelect) hideColorSelect();
  const thicknessBox = document.querySelector('#thickness-options');
  if (!showThicknessOptions) {
    // 把笔画颜色设置为当前使用的颜色
    document.querySelectorAll('#thickness-options .line').forEach(el => {
      el.style.background = color;
    });
    // 显示笔画设置
    thicknessBox.style.display = 'block';
    // 设置笔画设置对话框的位置
    if (toolbarEl.offsetTop > thicknessBox.offsetHeight) {
      thicknessBox.style.top = toolbarEl.offsetTop - thicknessBox.offsetHeight + 'px';
    }else {
      thicknessBox.style.top = toolbarEl.offsetTop + toolbarEl.offsetHeight + 'px';
    }
    thicknessBox.style.left = toolbarEl.offsetLeft + 'px';
    showThicknessOptions = true;
  }else {
    hideThicknessOptions();
  }
  return false;
});

// 涂鸦（鼠标按下）
canvasEl.addEventListener('mousedown', ev => {
  hideDialog();
  startGraffiti = true;
  // 开始一个新的路径
  ctx.beginPath();
  // 标记起点
  ctx.moveTo(ev.offsetX, ev.offsetY);
  // 设置线的宽度
  ctx.lineWidth = thickness;
  // 设置颜色
  ctx.strokeStyle = color;
});

// 涂鸦（鼠标移动）
canvasEl.addEventListener('mousemove', ev => {
  if (!startGraffiti) return false;
  // 直线连接位置
  ctx.lineTo(ev.offsetX, ev.offsetY);
  ctx.stroke();
});

// 涂鸦（鼠标松开）
canvasEl.addEventListener('mouseup', () => {
  startGraffiti = false;
  // 停止当前路劲
  ctx.closePath();
});

// 涂鸦时鼠标移出 canvas
canvasEl.addEventListener('mouseout', () => {
  if (startGraffiti) {
    // 停止画线
    startGraffiti = false;
    ctx.closePath();
  }
});

// 颜色色块点击
document.querySelector('#color-list').addEventListener('click', ev => {
  if (ev.target.classList.item(0) !== 'color-item') return false;
  color = ev.target.getAttribute('data-color');
  document.querySelector('#color-selected').style.background = color;
  return false;
});

// 打开颜色选择器的按钮点击
document.querySelector('#color-btn').addEventListener('click', () => {
  // 截取图片
  if (!screenshotCompleted) {
    screenshot();
  }
  if (showThicknessOptions) hideThicknessOptions();
  const colorSelectEl = document.querySelector('#color-select');
  if (!showColorSelect) {
    colorSelectEl.style.display = 'flex';
    // 设置颜色选择器的位置
    if (toolbarEl.offsetTop > colorSelectEl.offsetHeight) {
      colorSelectEl.style.top = toolbarEl.offsetTop - colorSelectEl.offsetHeight + 'px';
    }else {
      colorSelectEl.style.top = toolbarEl.offsetTop + toolbarEl.offsetHeight + 'px';
    }
    colorSelectEl.style.left = toolbarEl.offsetLeft + 'px';
    showColorSelect = true;
  }else {
    hideColorSelect();
  }
});

// 把图片截取到 canvas
function screenshot() {
  // 获取选择框的位置和尺寸
  const sX = selectBoxEl.offsetLeft;
  const sY = selectBoxEl.offsetTop;
  const sW = selectBoxEl.offsetWidth;
  const sH = selectBoxEl.offsetHeight;
  // 把图片截取到 canvas
  canvasEl.style.display = 'inline';
  canvasEl.width = sW;
  canvasEl.height = sH;
  canvasEl.style.top = selectBoxEl.offsetTop + 'px';
  canvasEl.style.left = selectBoxEl.offsetLeft + 'px';
  selectBoxEl.style.display = 'none';
  ctx.drawImage(img, sX, sY, sW, sH, 0, 0, canvasEl.width, canvasEl.height);
  screenshotCompleted = true;
}

// 关闭颜色选择和笔画设置
function hideDialog() {
  if (showThicknessOptions) hideThicknessOptions();
  if (showColorSelect) hideColorSelect();
}

// 关闭笔画设置
function hideThicknessOptions() {
  document.querySelector('#thickness-options').style.display = 'none';
  showThicknessOptions = false;
}

// 关闭颜色选择
function hideColorSelect() {
  document.querySelector('#color-select').style.display = 'none';
  showColorSelect = false;
}

// 初始化颜色选择
createColorList();

// 生成颜色选择列表
function createColorList() {
  // 颜色
  const colors = [
    '#000000', '#000080','#008000', '#008080', '#800000', '#800080',
    '#808000', '#C0C0C0', '#808080', '#0000FF', '#00FF00', '#00FFFF',
    '#FF0000', '#FF00FF', '#FFFF00', '#FFFFFF', '#8080FF', '#5830E0',
    '#80E000', '#00E080', '#C06000', '#FFA8FF', '#D8D800', '#ECECEC',
    '#9000FF', '#0088FF', '#80A080', '#0060C0', '#FF8000', '#FF5080',
    '#FF80C0', '#606060'
  ];
  // 生成颜色选择列表
  colors.forEach(val => {
    const divEl = document.createElement('div');
    divEl.style.background = val;
    divEl.classList.add('color-item');
    divEl.setAttribute('data-color', val);
    document.querySelector('#color-list').appendChild(divEl);
  });
}