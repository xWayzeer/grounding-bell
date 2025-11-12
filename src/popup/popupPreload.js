const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('popupRenderer', {
    closePopup: () => ipcRenderer.send('popup-closed'),
    onData: (callback) => ipcRenderer.on('popup-data', (event, value) => callback(value))
});