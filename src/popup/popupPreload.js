const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('popupRenderer', {
    closePopup: () => ipcRenderer.send('popup-closed'),
    onData: (callback) => ipcRenderer.on('popup-data', (event, value) => callback(value)),

    minimize: () => ipcRenderer.send("win:minimize"),
    maximize: () => ipcRenderer.send("win:maximize"),
    close:    () => ipcRenderer.send("win:close"),
});