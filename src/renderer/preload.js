const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('renderer', {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close:    () => ipcRenderer.send("window:close"),

    set: (key, value) => ipcRenderer.invoke("settings:set", { key, value }),
    get: (key, fallback) => ipcRenderer.invoke("settings:get", {key, fallback}),

    startTimer: (duration) => ipcRenderer.send('start-timer', duration),
    stopTimer: () => ipcRenderer.send('stop-timer'),
    setBell: (bell) => ipcRenderer.send('set-bell', bell),
    setTechnique: (technique) => ipcRenderer.send('set-technique', technique),
    onTimerUpdate: (callback) => ipcRenderer.on('timerUpdate', (event, time) => callback(time)),
    onTimerEnd: (callback) => ipcRenderer.on('timerEnd', callback),
    onTimerStopped: (callback) => ipcRenderer.on('timerStopped', callback),
    onPlayBell: (callback) => ipcRenderer.on('playBell', (event, bell) => callback(bell)),

    sendFeedback: (feedback) => ipcRenderer.send('send-feedback', feedback),
    onFeedbackResponse: (callback) => ipcRenderer.on('feedbackResponse', (event, response) => callback(response))
})