import {selectBoxEl} from './DOM.js';

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
        window.innerHeight - selectBoxEl.offsetH
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
