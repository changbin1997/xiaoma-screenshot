import {selectBoxEl, topBtn, rightBtn, bottomBtn, leftBtn} from './DOM.js';

export default class Selection {
  selectBoxEl;
  // 记录鼠标在图片选择框里的位置
  x;
  y;
  moveSelectBox = false; // 是否在移动选择框
  // 鼠标位置
  mouseX;
  mouseY;
  imgSelected = false;  // 图片区域选择完成
  zoomActive = {top: false, left: false, right: false, bottom: false};  // 拖拽缩放的方向

  // 鼠标放开停止缩放
  stopZoom() {
    this.zoomActive.top = false;
    this.zoomActive.right = false;
    this.zoomActive.bottom = false;
    this.zoomActive.left = false;
  }

  // 鼠标移动缩放
  moveZoom(ev) {
    // 右侧缩放按钮移动
    if (this.zoomActive.right) {
      if (ev.clientX - selectBoxEl.offsetLeft - this.mouseX <= 5) return false;
      selectBoxEl.style.width = `${ev.clientX - selectBoxEl.offsetLeft - this.mouseX}px`;
      // 设置图片选择框内的图片
      selectBoxEl.style.backgroundPosition = `-${
        selectBoxEl.offsetLeft
      }px -${
        selectBoxEl.offsetTop
      }px`;
    }

    // 下方缩放按钮移动
    if (this.zoomActive.bottom) {
      if (ev.clientY - selectBoxEl.offsetTop - this.mouseY <= 5) return false;
      selectBoxEl.style.height = `${ev.clientY - selectBoxEl.offsetTop - this.mouseY}px`;
      // 设置图片选择框内的图片
      selectBoxEl.style.backgroundPosition = `-${
        selectBoxEl.offsetLeft
      }px -${
        selectBoxEl.offsetTop
      }px`;
    }

    // 左侧缩放按钮移动
    if (this.zoomActive.left) {
      if (this.x - ev.clientX + this.mouseX <= 5) return false;
      selectBoxEl.style.left = `${ev.clientX + this.mouseX}px`;
      selectBoxEl.style.width = `${this.x - ev.clientX + this.mouseX}px`;
      // 设置图片选择框内的图片
      selectBoxEl.style.backgroundPosition = `-${
        selectBoxEl.offsetLeft
      }px -${
        selectBoxEl.offsetTop
      }px`;
    }

    // 上方缩放按钮移动
    if (this.zoomActive.top) {
      if (this.y - ev.clientY + this.mouseY <= 5) return false;
      selectBoxEl.style.top = `${ev.clientY + this.mouseY}px`;
      selectBoxEl.style.height = `${this.y - ev.clientY + this.mouseY}px`;
      // 设置图片选择框内的图片
      selectBoxEl.style.backgroundPosition = `-${
        selectBoxEl.offsetLeft
      }px -${
        selectBoxEl.offsetTop
      }px`;
    }
  }

  // 鼠标按下，准备开始缩放
  startZoom(ev) {
    ev.stopPropagation();
    // 获取方向
    const direction = ev.target.getAttribute('data-direction');
    if (direction === 'top' || direction === 'left') {
      // 往左侧或上方缩放
      this.mouseX = selectBoxEl.offsetLeft - ev.clientX;
      this.mouseY = selectBoxEl.offsetTop - ev.clientY;
      this.x = selectBoxEl.offsetLeft + selectBoxEl.offsetWidth;
      this.y = selectBoxEl.offsetTop + selectBoxEl.offsetHeight;
    }else {
      // 往右侧或下方缩放
      this.mouseX = ev.clientX - selectBoxEl.offsetLeft - selectBoxEl.offsetWidth;
      this.mouseY = ev.clientY - selectBoxEl.offsetTop - selectBoxEl.offsetHeight;
    }
    this.zoomActive[direction] = true;
  }

  // 隐藏缩放按钮
  hideZoomBtn() {
    topBtn.style.display = 'none';
    rightBtn.style.display = 'none';
    bottomBtn.style.display = 'none';
    leftBtn.style.display = 'none';
  }

  // 显示拖拽缩放按钮
  showZoomBtn() {
    // 生成上方的拖拽缩放按钮
    topBtn.style.top = '-4px';
    topBtn.style.left = '50%';
    topBtn.style.transform = 'translate(-50%, 0)';
    topBtn.style.display = 'block';

    // 生成下方的拖拽缩放按钮
    bottomBtn.style.bottom = '-4px';
    bottomBtn.style.left = '50%';
    bottomBtn.style.transform = 'translate(-50%, 0)';
    bottomBtn.style.display = 'block';

    // 生成左侧的拖拽缩放按钮
    leftBtn.style.left = '-4px';
    leftBtn.style.top = '50%';
    leftBtn.style.transform = 'translate(0, -50%)';
    leftBtn.style.display = 'block';

    // 生成右侧的拖拽缩放按钮
    rightBtn.style.right = '-4px';
    rightBtn.style.top = '50%';
    rightBtn.style.transform = 'translate(0, -50%)';
    rightBtn.style.display = 'block';

    this.zoomActive.top = false;
    this.zoomActive.left = false;
    this.zoomActive.bottom = false;
    this.zoomActive.right = false;
  }

  // 拖拽移动选择框
  selectBoxMove(ev) {
    // 移动图片选择框
    selectBoxEl.style.left = `${ev.clientX - this.mouseX}px`;
    selectBoxEl.style.top = `${ev.clientY - this.mouseY}px`;
    // 限制图片选择框的移动区域
    if (selectBoxEl.offsetLeft <= 0) selectBoxEl.style.left = 0;
    if (selectBoxEl.offsetTop <= 0) selectBoxEl.style.top = 0;
    if (
      selectBoxEl.offsetLeft + selectBoxEl.offsetWidth >=
      window.innerWidth
    ) {
      selectBoxEl.style.left = `${
        window.innerWidth - selectBoxEl.offsetWidth
      }px`;
    }
    if (
      selectBoxEl.offsetTop + selectBoxEl.offsetHeight >=
      window.innerHeight
    ) {
      selectBoxEl.style.top = `${
        window.innerHeight - selectBoxEl.offsetHeight
      }px`;
    }
    // 设置图片选择框内的图片
    selectBoxEl.style.backgroundPosition = `-${
      selectBoxEl.offsetLeft
    }px -${
      selectBoxEl.offsetTop
    }px`;
  }

  // 即将开始移动选择框
  selectBoxStartMove(ev) {
    const selectBoxPosition = this.getSelectBoxPosition();
    // 获取鼠标在图片选择框内的位置
    this.mouseX = ev.clientX - selectBoxPosition.left;
    this.mouseY = ev.clientY - selectBoxPosition.top;
    this.moveSelectBox = true;
  }

  // 获取图片选择框的位置
  getSelectBoxPosition() {
    return {
      width: selectBoxEl.offsetWidth,
      height: selectBoxEl.offsetHeight,
      left: selectBoxEl.offsetLeft,
      top: selectBoxEl.offsetTop
    };
  }

  // 鼠标移动选择截图区域
  select(ev) {
    // 横向缩放
    if (ev.clientX < this.x) {
      selectBoxEl.style.left = `${ev.clientX}px`;
      selectBoxEl.style.width = `${this.x - ev.clientX}px`;
      selectBoxEl.style.backgroundPosition = `-${
        selectBoxEl.offsetLeft + 1
      }px -${selectBoxEl.offsetTop + 1}px`;
    } else {
      selectBoxEl.style.width = `${ev.clientX - this.x}px`;
    }
    // 纵向缩放
    if (ev.clientY < this.y) {
      selectBoxEl.style.top = `${ev.clientY}px`;
      selectBoxEl.style.height = `${this.y - ev.clientY}px`;
      selectBoxEl.style.backgroundPosition = `-${
        selectBoxEl.offsetLeft + 1
      }px -${selectBoxEl.offsetTop + 1}px`;
    } else {
      selectBoxEl.style.height = `${ev.clientY - this.y}px`;
    }
  }

  // 即将开始选择区域
  startSelect(ev, imgUrl) {
    // 显示图片区域选择框
    selectBoxEl.style.display = 'block';
    selectBoxEl.style.left = ev.clientX + 'px';
    selectBoxEl.style.top = ev.clientY + 'px';
    selectBoxEl.style.width = 0;
    selectBoxEl.style.height = 0;
    // 设置图片选择框的背景图片
    selectBoxEl.style.backgroundImage = `url(${imgUrl})`;
    selectBoxEl.style.backgroundPosition = `-${ev.clientX + 1}px -${
      ev.clientY + 1
    }px`;
    this.x = ev.clientX;
    this.y = ev.clientY;
  }
}
