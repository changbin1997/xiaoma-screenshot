import {toolbarEl, colorSelectEl, colorListEl, thicknessBox} from "./DOM.js";

export default class Toolbar {
  colorSelect = false;  // 是否显示颜色选择
  thicknessOptions = false;  // 是否显示笔画设置

  // 隐藏所有对话框
  hideAllDialog() {
    this.hideColorSelect();
    this.hideThicknessOptions();
  }

  // 隐藏笔画设置
  hideThicknessOptions() {
    thicknessBox.style.display = 'none';
    this.thicknessOptions = false;
  }

  // 显示笔画设置
  showThicknessOptions(color) {
    // 如果开启了颜色选择对话框就关闭颜色选择
    if (this.colorSelect) this.hideColorSelect();
    if (!this.thicknessOptions) {
      // 把笔画颜色设置为当前使用的颜色
      thicknessBox.querySelectorAll('.line').forEach(el => {
        el.style.background = color;
      });
      // 显示笔画设置
      thicknessBox.style.display = 'block';
      // 设置笔画设置对话框的位置
      if (toolbarEl.offsetTop > thicknessBox.offsetHeight) {
        thicknessBox.style.top = `${toolbarEl.offsetTop - thicknessBox.offsetHeight}px`;
      }else {
        thicknessBox.style.top = `${toolbarEl.offsetTop + toolbarEl.offsetHeight}px`;
      }
      thicknessBox.style.left = `${toolbarEl.offsetLeft}px`;
      this.thicknessOptions = true;
    }else {
      this.hideThicknessOptions();
    }
    return false;
  }

  // 关闭颜色选择
  hideColorSelect() {
    colorSelectEl.style.display = 'none';
    this.colorSelect = false;
  }

  // 显示颜色选择
  showColorSelect() {
    // 如果开启了笔画设置就关闭笔画设置
    if (this.thicknessOptions) this.hideThicknessOptions();
    if (!this.colorSelect) {
      colorSelectEl.style.display = 'flex';
      // 设置颜色选择器的位置
      if (toolbarEl.offsetTop > colorSelectEl.offsetHeight) {
        colorSelectEl.style.top = `${toolbarEl.offsetTop - colorSelectEl.offsetHeight}px`;
      }else {
        colorSelectEl.style.top = `${toolbarEl.offsetTop + toolbarEl.offsetHeight}px`;
      }
      colorSelectEl.style.left = `${toolbarEl.offsetLeft}px`;
      this.colorSelect = true;
    }else {
      this.hideColorSelect();
    }
  }

  // 隐藏工具栏
  hideToolbar() {
    toolbarEl.style.display = 'none';
  }

  // 显示工具栏
  showToolbar(selectBoxPosition) {
    // 显示图片操作工具栏
    toolbarEl.style.display = 'flex';
    // 调整工具栏的位置
    if (selectBoxPosition.top + selectBoxPosition.height < window.innerHeight - 34) {
      toolbarEl.style.top = `${
        selectBoxPosition.top + selectBoxPosition.height + 4
      }px`;
    }else if (selectBoxPosition.top >= 34) {
      toolbarEl.style.top = `${selectBoxPosition.top - 34}px`;
    }else {
      toolbarEl.style.top = `${
        selectBoxPosition.top +
        selectBoxPosition.height -
        toolbarEl.offsetHeight - 4
      }px`;
    }
    // 设置图片工具栏的 left
    if (selectBoxPosition.left + selectBoxPosition.width - toolbarEl.offsetWidth >= 0) {
      toolbarEl.style.left = `${
        selectBoxPosition.left + selectBoxPosition.width - toolbarEl.offsetWidth
      }px`;
    }else {
      toolbarEl.style.left = `${selectBoxPosition.left}px`;
    }
  }

  // 生成颜色选择列表
  createColorList() {
    // 颜色
    const colors = [
      '#000000',
      '#000080',
      '#008000',
      '#008080',
      '#800000',
      '#800080',
      '#808000',
      '#C0C0C0',
      '#808080',
      '#0000FF',
      '#00FF00',
      '#00FFFF',
      '#FF0000',
      '#FF00FF',
      '#FFFF00',
      '#FFFFFF',
      '#8080FF',
      '#5830E0',
      '#80E000',
      '#00E080',
      '#C06000',
      '#FFA8FF',
      '#D8D800',
      '#ECECEC',
      '#9000FF',
      '#0088FF',
      '#80A080',
      '#0060C0',
      '#FF8000',
      '#FF5080',
      '#FF80C0',
      '#606060'
    ];
    // 生成颜色选择列表
    colors.forEach((val) => {
      const divEl = document.createElement('div');
      divEl.style.background = val;
      divEl.classList.add('color-item');
      divEl.setAttribute('data-color', val);
      colorListEl.appendChild(divEl);
    });
  }
}
