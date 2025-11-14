const { app, BrowserWindow, ipcMain } = require('electron/main')

if (require('electron-squirrel-startup')) app.quit();

const dotenv = require('dotenv')
dotenv.config()

const path = require('node:path')

const Store = require('electron-store')
const store = new Store()

let win;
let popupWindow;
let totalSeconds = 0
let initialDuration = 0
let userStopped = false

let selectedBell = store.get('selectedBell', 'tibetan');
let selectedTechnique = store.get('selectedTechnique', '5-4-3-2-1');


const createWindow = () => {
    win = new BrowserWindow({
        width: 760,
        height: 772,
        resizable: false,
        autoHideMenuBar: true,
        frame: false,
        titleBarStyle: "hidden",
        icon: path.join(__dirname, 'assets/icons/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'src/renderer/preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
        }
    })

    win.loadFile('src/renderer/index.html')

    ipcMain.on("window:minimize", () => win.minimize());
    ipcMain.on("window:maximize", () => {
        win.isMaximized() ? win.unmaximize() : win.maximize();
    });
    ipcMain.on("window:close", () => win.close());
}

app.whenReady().then(() => {
    createWindow()


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


function showPopupWindow() {
    popupWindow = new BrowserWindow({
        width: 500,
        height: 780,
        resizable: false,
        movable: true,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        frame: false,
        titleBarStyle: "hidden",
        icon: path.join(__dirname, 'assets/icons/icon.png'),
        webPreferences: {
          preload: path.join(__dirname, 'src/popup/popupPreload.js'),
          contextIsolation: true,
          nodeIntegration: false
        }
    });

    popupWindow.loadFile('src/popup/popup.html');

    ipcMain.on("win:minimize", () => popupWindow.minimize());
    ipcMain.on("win:maximize", () => {
        popupWindow.isMaximized() ? popupWindow.unmaximize() : popupWindow.maximize();
    });
    ipcMain.on("win:close", () => popupWindow.close());

    popupWindow.webContents.on('did-finish-load', async() => {
        popupWindow.webContents.send('popup-data', selectedTechnique);
    });

    popupWindow.on("closed", () => {
        if (!userStopped) startTimer(initialDuration);
    });
}

function startTimer(duration) {
    totalSeconds = duration;
    initialDuration = duration;
    isRunning = true;
    userStopped = false;

    timerInterval = setInterval(() => {
        totalSeconds--;
        win.webContents.send('timerUpdate', totalSeconds);

        if (totalSeconds <= 0) {
            clearInterval(timerInterval);

            win.webContents.send('playBell', selectedBell);
            win.webContents.send('timerEnd');

            showPopupWindow();
        }
    }, 1000);
}

function closePopupWindow() {
    if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.close();
        popupWindow = null;
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    userStopped = true;
    win.webContents.send('timerStopped');

    closePopupWindow();
}

ipcMain.on('send-feedback', async (event, feedbackText) => {
    const lastFeedbackTime = store.get('lastFeedbackTime');
    const now = Date.now();
    const timeLimit = 30 * 60 * 1000;

    if (lastFeedbackTime && (now - lastFeedbackTime < timeLimit)) {
      const remainingTime = Math.round((timeLimit - (now - lastFeedbackTime)) / 1000);
      event.sender.send('feedbackResponse', { status: 'rateLimit', message: `Please wait ${remainingTime} seconds before submitting again.` });
      return;
    }
  
    store.set('lastFeedbackTime', now);

    try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `📝 New Feedback:\n${feedbackText}`
            })
        });

        event.sender.send('feedbackResponse', { status: 'success' });
    } catch (error) {
        console.error(error);
        event.sender.send('feedbackResponse', { status: 'error' });
    }
});

ipcMain.on('start-timer', (event, duration) => startTimer(duration))
ipcMain.on('stop-timer', stopTimer)
ipcMain.on('set-bell', (event, bell) => { selectedBell = bell; store.set("selectedBell", bell); })
ipcMain.on('set-technique', (event, technique) => { selectedTechnique = technique; store.set("selectedTechnique", technique); })

// Save settings
ipcMain.handle('settings:set', (event, { key, value }) => {
    store.set(key, value);
  });
  
  // Get settings
  ipcMain.handle('settings:get', (event, {key, fallback}) => {
    console.log("key", key, "fallback", fallback)
    return store.get(key, fallback);
  });