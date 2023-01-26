const { app, BrowserWindow } = require('electron');

const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        },
        width: 800,
        height: 600
    });

    win.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();
});

