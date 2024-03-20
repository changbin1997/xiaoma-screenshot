const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onResponse: (channel, listener) => {
    ipcRenderer.on(channel, listener);
  },
  'ipc-invoke': (channel, listener) => {
    ipcRenderer.invoke(channel, listener);
  }
});
